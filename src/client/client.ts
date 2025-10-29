import "colors";
import { FullPacketParser, Serializer } from "protodef";
import { config } from "../config/config";
import { Events } from '../Events';
import { keyExchange } from "../handshake/keyExchange";
import login from "../handshake/login";
import loginVerify from "../handshake/loginVerify";
import { NethernetClient } from "../nethernet";
import type { InputFlag } from "../packets/InputFlag";
import type { ClientMovementPredictionSyncPacket } from "../packets/packet_client_movement_prediction_sync";
import type { MovePlayerPacket } from "../packets/packet_move_player";
import type { NetworkStackLatencyPacket } from "../packets/packet_network_stack_latency";
import type { StartGamePacket } from "../packets/packet_start_game";
import type { TickSyncPacket } from "../packets/packet_tick_sync";
import { RaknetClient } from "../rak";
import { createDeserializer, createSerializer } from "../transforms/serializer";
import { ClientOptions, clientStatus } from "../types";
import { authenticate, AuthenticationType } from "./auth";
import { Connection } from "./connection";

export class Client extends Connection {
    connection!: RaknetClient | NethernetClient;

    public features: any;
    public options: ClientOptions;
    public deserializer!: FullPacketParser;
    public serializer!: Serializer;
    public startGameData: any;
    public clientRuntimeId: any;
    public tick = 0n;

    public connectTimeout!: NodeJS.Timeout;
    public viewDistance = 10;
    public accessToken!: string;
    public clientIdentityChain!: string;
    public clientUserChain!: string;
    public nethernet: any;

    public start: number = Date.now();
    public end: number = Date.now();
    public difference: number = 0;

    private reconnectTimer: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private manualDisconnect = false;
    private autoReconnect: boolean;
    private authInputInterval: NodeJS.Timeout | null = null;
    private currentPosition: { x: number; y: number; z: number; } | null = null;
    private currentRotation: { pitch: number; yaw: number; headYaw: number; } | null = null;
    private selfRuntimeId: number | null = null;

    override on<K extends keyof Events>(event: K, listener: Events[K]): this {
        return super.on(event, listener);
    }

    override once<K extends keyof Events>(event: K, listener: Events[K]): this {
        return super.once(event, listener);
    }

    constructor(options: ClientOptions) {
        super();
        this.options = options;

        this.startGameData = {};
        this.clientRuntimeId = null;
        this.viewDistance = options.viewDistance ?? 10;
        this.autoReconnect = options.autoReconnect ?? (options.transport === "nethernet");

        if (this.options.transport === "nethernet") {
            this.nethernet = {};
        }

        this.on('tick_sync', this.handleTickSyncPacket);
        this.on('network_stack_latency', this.handleNetworkStackLatencyPacket);
        this.on('start_game', this.handleStartGamePacket);
        this.on('move_player', this.handleMovePlayerPacket);
        this.on('client_movement_prediction_sync', this.handleClientMovementPredictionSyncPacket);

        if (!options.delayedInit) {
            this.init();
        };
    };

    // Exhaustive Logging
    public setStatus(value: number) {
        if (this.options.debug) console.log(`[Atomic] > Status Update: ${this.status} -> ${value}`);
        this.status = value;
    }

    public connect() {
        if (!this.connection) throw new Error('Connect not currently allowed');
        this.once('session', this._connect);

        authenticate(this, this.options);

        this.sendQ = [];
        this.loop = setInterval(this.onTick, 20);
    };

    public disconnect(reason: string, hide: any = false) {
        if (this.status === clientStatus.Disconnected) return;
        this.manualDisconnect = true;
        this.clearReconnectTimer();
        this.write('disconnect', {
            hide_disconnect_screen: hide,
            message: reason,
            filtered_message: ''
        });
        this.close(true);
    };

    public close(manual: boolean = true) {
        if (manual) {
            this.manualDisconnect = true;
            this.autoReconnect = false;
        }
        this.stopAuthInputLoop();
        this.clearReconnectTimer();
        if (this.status !== clientStatus.Disconnected) this.emit('close');
        clearInterval(this.loop);
        clearTimeout(this.connectTimeout);
        this.sendQ = [];
        this.connection?.close();
        //this.removeAllListeners();
        this.setStatus(clientStatus.Disconnected);
    };

    public init() {
        this.manualDisconnect = false;
        this.clearReconnectTimer();
        this.stopAuthInputLoop();
        this.currentPosition = null;
        this.currentRotation = null;
        this.selfRuntimeId = null;
        this.tick = 0n;
        if (this.options.autoReconnect !== undefined) {
            this.autoReconnect = this.options.autoReconnect;
        } else if (this.options.transport === "nethernet") {
            this.autoReconnect = true;
        }
        if (this.options.protocolVersion !== config.protocol) throw Error(`Unsupported protocol version: ${this.options.protocolVersion}`);
        this.serializer = createSerializer();
        this.deserializer = createDeserializer();

        keyExchange(this);
        login(this, this.options);
        loginVerify(this);

        const host = this.options.host;
        const port = this.options.port;

        const networkId = this.options.networkId;

        if (this.options.transport === 'nethernet') {
            this.connection = new NethernetClient({ networkId });
            this.batchHeader = null;
            this.disableEncryption = true;
        } else if (this.options.transport === 'raknet') {
            this.connection = new RaknetClient({ useWorkers: true, host, port });
            this.batchHeader = 0xfe;
            this.disableEncryption = false;
        }

        this.emit('connect_allowed');
    };

    get entityId() {
        return this.startGameData.runtime_entity_id;
    };

    private onEncapsulated = (encapsulated: any, _inetAddr: any) => {
        const buffer = Buffer.from(encapsulated.buffer);
        process.nextTick(() => this.handle(buffer));
    };

    public readPacket(packet: any) {
        const des = this.deserializer.parsePacketBuffer(packet) as unknown as { data: { name: string, params: any; }; };
        const pakData = { name: des.data.name, params: des.data.params };

        //Startup
        switch (des.data.name) {
            case 'server_to_client_handshake':
                this.emit('client.server_handshake', des.data.params);
                break;
            case "network_settings":
                this.start = Date.now();
                this.compressionAlgorithm = packet.compression_algorithm || 'deflate';
                this.compressionThreshold = packet.compression_threshold;
                this.compressionReady = true;
                if (this.status === clientStatus.Connecting) this.sendLogin();
                break;
            case 'disconnect':
                this.emit(des.data.name, des.data.params);
                this.onDisconnectRequest(des.data.params);
                break;
            case 'start_game':
                this.startGameData = pakData.params;
            case 'item_registry':
                const shield = pakData.params.itemstates?.find((entry: any) => entry.name === "minecraft:shield");
                if (shield) {
                    //@ts-ignore
                    this.serializer.proto.setVariable('ShieldItemID', shield.runtime_id);
                    //@ts-ignore
                    this.deserializer.proto.setVariable('ShieldItemID', shield.runtime_id);
                }
                break;
            case 'play_status':
                if (this.status === clientStatus.Authenticating) {
                    this.end = Date.now();
                    this.difference = this.end - this.start;
                    this.emit('join');
                    this.setStatus(clientStatus.Initializing);
                }
                this.onPlayStatus(pakData.params);
                break;
            default:
                if (this.status !== clientStatus.Initializing && this.status !== clientStatus.Initialized) {
                    console.error(`Can't accept ${des.data.name}, client not authenticated yet : ${this.status}`);
                    break;
                }
        }

        //Required Client Emits
        switch (des.data.name) {
            case "resource_packs_info": this.emit("resource_packs_info", des.data.params); break;
            case "resource_pack_stack": this.emit("resource_pack_stack", des.data.params); break;
        }

        // 1. Emit all packets if array is ommitted
        // 2. Emit only specific packets specified in the array
        if (!this.options.packets?.length) {
            this.emit(des.data.name, des.data.params);
        } else if (this.options.packets?.includes(des.data.name)) {
            this.emit(des.data.name, des.data.params);
        }
    };

    _connect = async () => {
        this.connection.onConnected = () => {
            this.reconnectAttempts = 0;
            this.manualDisconnect = false;
            this.setStatus(clientStatus.Connecting);
            this.queue('request_network_settings', { client_protocol: Number(config.protocol) });
        };
        this.connection.onCloseConnection = (reason: any) => {
            if (this.status === clientStatus.Disconnected && config.debug) console.log(`Server closed connection: ${reason}`);
            const wasManual = this.manualDisconnect;
            this.close(wasManual);
            if (!wasManual && this.autoReconnect) {
                const delay = Math.min(30000, 2000 * Math.max(1, ++this.reconnectAttempts));
                if (config.debug) console.log(`<DEBUG> Scheduling Nethernet reconnect in ${delay}ms`);
                this.scheduleReconnect(delay);
            }
        };

        this.connection.onEncapsulated = this.onEncapsulated;

        this.connection.connect();
        this.connectTimeout = setTimeout(() => {
            if (this.status === clientStatus.Disconnected) {
                this.connection.close();
                this.emit('error', Error('connect timed out'));
            };
        }, this.options.connectTimeout || config.connectTimeout);
    };

    sendLogin() {
        this.setStatus(clientStatus.Authenticating);

        //@ts-ignore
        this.createClientChain(null, this.options.offline);

        // Removed "MC-Data Feature" - Unnecessary Backwards Compatibility
        const authType = AuthenticationType.Full;
        const chain = [this.clientIdentityChain, ...this.accessToken];

        const encodedLoginPayload = JSON.stringify({
            AuthenticationType: authType,
            Token: '',
            Certificate: JSON.stringify({ chain })
        });

        //@ts-ignore
        this.write('login', {
            protocol_version: config.protocol,
            tokens: {
                identity: encodedLoginPayload,
                client: this.clientUserChain
            }
        });
    };


    onDisconnectRequest(packet: any) {
        this.emit('kick', packet);
        this.close(true);
    };

    onPlayStatus(statusPacket: { status: string; }) {
        if (this.status === clientStatus.Initializing && statusPacket.status === 'player_spawn') {
            this.setStatus(clientStatus.Initialized);
            if (this.entityId) this.on('start_game', () => this.write('set_local_player_as_initialized', { runtime_entity_id: this.entityId }));
            else this.write('set_local_player_as_initialized', { runtime_entity_id: this.entityId });
            this.startAuthInputLoop();
        };
    };

    private scheduleReconnect(delay: number) {
        if (this.reconnectTimer || this.manualDisconnect || !this.autoReconnect) return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (this.manualDisconnect) return;
            try {
                if (config.debug) console.log(`<DEBUG> Attempting Nethernet reconnect (attempt ${this.reconnectAttempts})`);
                this.init();
            } catch (err) {
                this.emit('error', err as Error);
                const nextDelay = Math.min(30000, delay * 2);
                this.scheduleReconnect(nextDelay);
            }
        }, delay);
    }

    private clearReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private handleTickSyncPacket = (packet: TickSyncPacket) => {
        this.queue('tick_sync', {
            request_time: packet.request_time,
            response_time: Date.now()
        });
    };

    private handleNetworkStackLatencyPacket = (packet: NetworkStackLatencyPacket) => {
        if (packet.needs_response) {
            this.queue('network_stack_latency', {
                timestamp: packet.timestamp,
                needs_response: 0
            });
        }
    };

    private handleStartGamePacket = (packet: StartGamePacket) => {
        this.selfRuntimeId = this.extractRuntimeId(packet.runtime_entity_id);
        this.currentPosition = {
            x: packet.player_position.x,
            y: packet.player_position.y,
            z: packet.player_position.z
        };
        this.currentRotation = {
            pitch: packet.rotation.x,
            yaw: (packet.rotation as any).y,
            headYaw: (packet.rotation as any).y
        };
        if (typeof packet.current_tick === "number") {
            this.tick = BigInt(packet.current_tick);
        } else {
            this.tick = 0n;
        }
    };

    private handleMovePlayerPacket = (packet: MovePlayerPacket) => {
        if (this.selfRuntimeId === null) return;
        const runtimeId = this.extractRuntimeId((packet as any).runtime_id ?? (packet as any).runtime_entity_id);
        if (runtimeId === null || runtimeId !== this.selfRuntimeId) return;
        this.currentPosition = {
            x: packet.position.x,
            y: packet.position.y,
            z: packet.position.z
        };
        this.currentRotation = {
            pitch: packet.pitch,
            yaw: packet.yaw,
            headYaw: packet.head_yaw
        };
        if ((packet as any).mode === 'teleport') {
            this.sendPlayerState({ handled_teleport: true });
        }
    };

    private handleClientMovementPredictionSyncPacket = (packet: ClientMovementPredictionSyncPacket) => {
        const runtime = this.extractRuntimeId((packet as any).entity_runtime_id);
        if (runtime !== null) {
            this.selfRuntimeId = runtime;
        }
        this.sendPlayerState({ received_server_data: true });
    };

    private extractRuntimeId(value: any): number | null {
        if (value === undefined || value === null) return null;
        if (typeof value === "number") return value;
        if (typeof value === "bigint") return Number(value);
        if (typeof value === "object") {
            if (typeof value.low === "number" && typeof value.high === "number") {
                return Number((BigInt(value.high >>> 0) << 32n) | BigInt(value.low >>> 0));
            }
            if ("value" in value) {
                return this.extractRuntimeId((value as any).value);
            }
        }
        const numeric = Number(value);
        return Number.isNaN(numeric) ? null : numeric;
    }

    private startAuthInputLoop() {
        if (this.authInputInterval) return;
        this.authInputInterval = setInterval(() => this.sendIdlePlayerInput(), 100);
    }

    private stopAuthInputLoop() {
        if (this.authInputInterval) {
            clearInterval(this.authInputInterval);
            this.authInputInterval = null;
        }
    }

    private sendIdlePlayerInput() {
        this.sendPlayerState();
    }

    private sendPlayerState(flags: Partial<InputFlag> = {}) {
        if (this.status !== clientStatus.Initialized) return;
        if (!this.currentPosition || !this.currentRotation) return;

        const tickValue = this.tick;
        this.tick += 1n;

        const yaw = this.currentRotation.yaw ?? 0;
        const pitch = this.currentRotation.pitch ?? 0;
        const headYaw = this.currentRotation.headYaw ?? yaw;

        const zeroVec2 = { x: 0, y: 0 };
        const zeroVec3 = { x: 0, y: 0, z: 0 };

        this.queue('player_auth_input', {
            pitch,
            yaw,
            position: { ...this.currentPosition },
            move_vector: zeroVec2,
            head_yaw: headYaw,
            input_data: { ...config.inputFlags, ...flags },
            input_mode: 'mouse',
            play_mode: 'normal',
            interaction_model: 'classic',
            interact_rotation: { x: pitch, y: yaw },
            tick: tickValue,
            delta: zeroVec3,
            analogue_move_vector: zeroVec2,
            camera_orientation: { x: pitch, y: yaw, z: 0 },
            raw_move_vector: zeroVec2
        });

        this.queue('player_input', {
            motion_x: 0,
            motion_z: 0,
            jumping: Boolean(flags.start_jumping || flags.jump_pressed_raw || flags.jump_current_raw),
            sneaking: Boolean(flags.sneaking || flags.sneak_current_raw)
        });
    }
};

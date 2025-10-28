import "colors";
import { FullPacketParser, Serializer } from "protodef";
import { config } from "../config/config";
import { Events } from '../Events';
import { keyExchange } from "../handshake/keyExchange";
import login from "../handshake/login";
import loginVerify from "../handshake/loginVerify";
import { NethernetClient } from "../nethernet";
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

};

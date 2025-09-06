import 'colors';
import { FullPacketParser, Serializer } from "protodef";
import { config } from "../config/config";
import { keyExchange } from "../handshake/keyExchange";
import login from "../handshake/login";
import loginVerify from "../handshake/loginVerify";
import { RaknetClient } from "../rak";
import { createDeserializer, createSerializer } from "../transforms/serializer";
import { ClientOptions, clientStatus, Events } from "../types";
import { authenticate, AuthenticationType } from "./auth";
import { Connection } from "./connection";

export class Client extends Connection {
    connection!: RaknetClient;

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

    on<K extends keyof Events>(event: K, listener: Events[K]) {
        return super.on(event, listener);
    }

    constructor(options: ClientOptions) {
        super();
        this.options = options;

        this.startGameData = {};
        this.clientRuntimeId = null;
        this.viewDistance = options.viewDistance ?? 10;

        if (!options.delayedInit) {
            this.init();
        };
    };

    public connect() {
        if (!this.connection) throw new Error('Connect not currently allowed');
        this.once('session', this._connect);

        authenticate(this, this.options);

        this.sendQ = [];
        this.loop = setInterval(this.onTick, 20);
    };

    public disconnect(reason: string, hide: any = false) {
        if (this.status === clientStatus.Disconnected) return;
        this.write('disconnect', {
            hide_disconnect_screen: hide,
            message: reason,
            filtered_message: ''
        });
        this.close();
    };

    public close() {
        if (this.status !== clientStatus.Disconnected) this.emit('close');
        clearInterval(this.loop);
        clearTimeout(this.connectTimeout);
        this.sendQ = [];
        this.connection.close();
        //this.removeAllListeners();
        this.status = clientStatus.Disconnected;
    };

    public init() {
        if (!this.options.host || this.options.port == null) throw Error('invalid host/port');
        if (this.options.protocolVersion !== config.protocol) throw Error(`unsupported protocol version: ${this.options.protocolVersion}`);
        this.serializer = createSerializer();
        this.deserializer = createDeserializer();

        keyExchange(this);
        login(this, this.options);
        loginVerify(this);

        this.connection = new RaknetClient({ host: this.options.host, port: Number(this.options.port) });

        this.emit('connect_allowed');
    };

    get entityId() {
        return this.startGameData.runtime_entity_id;
    };

    private onEncapsulated = (encapsulated: any, inetAddr: any) => {
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
                    this.emit('join');
                    this.status = clientStatus.Initializing;
                }
                this.onPlayStatus(pakData.params);
                break;
            default:
                if (this.status !== clientStatus.Initializing && this.status !== clientStatus.Initialized) {
                    console.log(`Can't accept ${des.data.name}, client not authenticated yet : ${this.status}`);
                    break;
                }
        }

        //Client Emits
        switch (des.data.name) {
            case "resource_packs_info": this.emit("resource_packs_info", des.data.params); break;
            case "resource_pack_stack": this.emit("resource_pack_stack", des.data.params); break;
        }

        if ((this.options.packets ?? [])?.includes(des.data.name)) {
            this.emit(des.data.name, des.data.params);
        }
    };

    _connect = async () => {
        this.connection.onConnected = () => {
            this.status = clientStatus.Connecting;
            this.queue('request_network_settings', { client_protocol: Number(config.protocol) });
        };
        this.connection.onCloseConnection = (reason: any) => {
            if (this.status === clientStatus.Disconnected && config.debug) console.log(`Server closed connection: ${reason}`);
            this.close();
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
        this.status = clientStatus.Authenticating;

        //@ts-ignore
        this.createClientChain(null, this.options.offline);

        const useNewLogin = true; // TODO: mcdata feature
        let encodedLoginPayload: string;

        if (useNewLogin) {
            const authType = AuthenticationType.Full;

            const chain = [this.clientIdentityChain, ...this.accessToken];

            encodedLoginPayload = JSON.stringify({
                AuthenticationType: authType,
                Token: '',
                Certificate: JSON.stringify({ chain }) // Deprecated legacy certificate chain
            });

            //@ts-ignore
        } else {
            const chain = [this.clientIdentityChain, ...this.accessToken];
            const encodedChain = JSON.stringify({ chain });

            //@ts-ignore
            encodedLoginPayload = encodedChain;
        }

        //@ts-ignore
        this.write('login', {
            protocol_version: config.protocol,
            tokens: {
                identity: encodedLoginPayload,
                //@ts-ignore
                client: this.clientUserChain
            }
        });
    };


    onDisconnectRequest(packet: any) {
        this.emit('kick', packet);
        this.close();
    };

    onPlayStatus(statusPacket: { status: string; }) {
        if (this.status === clientStatus.Initializing && statusPacket.status === 'player_spawn') {
            this.status = clientStatus.Initialized;
            if (this.entityId) this.on('start_game', () => this.write('set_local_player_as_initialized', { runtime_entity_id: this.entityId }));
            else this.write('set_local_player_as_initialized', { runtime_entity_id: this.entityId });
        };
    };

};
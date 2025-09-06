import { EventEmitter } from 'events';
import { Client, PacketPriority, PacketReliability } from 'raknet-native';

interface Encapsulated {
    buffer: Buffer;
    address: string;
}

export class RaknetClient extends EventEmitter {
    connected: boolean;
    onConnected: () => void;
    onCloseConnection: (reason: any) => void;
    onEncapsulated: (buffer: any, address: any) => void;
    raknet: Client;

    constructor(options: any) {
        super();
        this.connected = false;
        this.onConnected = () => { };
        this.onCloseConnection = () => { };
        this.onEncapsulated = () => { };

        this.raknet = new Client(options.host, Number(options.port), {
            protocolVersion: 11
        });

        this.raknet.on("encapsulated", (packet: any) => {
            if (this.connected) {
                this.onEncapsulated(packet.buffer, packet.address);
            }
        });

        this.raknet.on("connect", () => {
            this.connected = true;
            this.onConnected();
        });

        this.raknet.on("disconnect", (packet: any) => {
            this.connected = false;
            this.onCloseConnection(packet.reason);
        });
    };

    async ping(timeout: number = 1000) {
        this.raknet.ping();
        return new Promise((resolve, reject) => {
            const onTimeout = setTimeout(() => {
                this.raknet.off("pong", onPong);
                reject(new Error("ping timeout"));
            }, timeout);

            const onPong = (ret: any) => {
                clearTimeout(onTimeout);
                this.raknet.off("pong", onPong);
                resolve(ret?.extra ? ret.extra.toString() : null);
            };
            this.raknet.on("pong", onPong);
        });
    };

    connect() {
        this.raknet.connect();
    };

    /**
     * Closes the Raknet connection.
     * 
     * This sets the `connected` flag to false and schedules the closing of the 
     * Raknet client after 40 milliseconds. Any errors during the close operation
     * are silently caught.
     * 
     * FATAL - free(): invalid pointer error caused by Raknet occasionally.
     * https://github.com/PrismarineJS/bedrock-protocol/issues/591
     */
    close() {
        try {
            this.connected = false;
            setTimeout(() => this.raknet.close(), 40);
        } catch { }
    };

    sendReliable(buffer: Buffer, immediate: boolean) {
        if (!this.connected) return;
        const priority = immediate ? PacketPriority.IMMEDIATE_PRIORITY : PacketPriority.MEDIUM_PRIORITY;

        return this.raknet.send(buffer, priority, PacketReliability.RELIABLE_ORDERED, 0);
    };
};
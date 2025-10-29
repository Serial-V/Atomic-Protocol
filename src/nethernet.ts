import { PeerConnection } from "node-datachannel";
import { Client, Connection, SignalStructure, SignalType } from "node-nethernet";

const NETTHERNET_MAX_MESSAGE_SIZE = 10_000;
const NETTHERNET_MAX_PAYLOAD_SIZE = NETTHERNET_MAX_MESSAGE_SIZE - 1;

function patchNethernetConnection() {
    const proto = (Connection as any)?.prototype;
    if (!proto || proto.__atomicPatchedSendNow) return;

    Object.defineProperty(proto, "__atomicPatchedSendNow", {
        value: true,
        configurable: false,
        enumerable: false,
        writable: false
    });

    const originalSendNow = proto.sendNow;

    proto.sendNow = function patchedSendNow(this: any, input: Buffer | string | Uint8Array): number {
        let data: Buffer;
        if (Buffer.isBuffer(input)) {
            data = input;
        } else if (typeof input === "string") {
            data = Buffer.from(input);
        } else if (input instanceof Uint8Array) {
            data = Buffer.from(input);
        } else if (input) {
            data = Buffer.from(input as any);
        } else {
            return 0;
        }

        if (data.length === 0) return 0;
        if (!this.reliable || typeof this.reliable.sendMessageBinary !== "function") {
            if (typeof originalSendNow === "function") {
                return originalSendNow.call(this, data);
            }
            throw new Error("Reliable channel unavailable while sending");
        }

        let sent = 0;

        for (let offset = 0; offset < data.length; offset += NETTHERNET_MAX_PAYLOAD_SIZE) {
            const end = Math.min(offset + NETTHERNET_MAX_PAYLOAD_SIZE, data.length);
            const frag = data.subarray(offset, end);
            const remainingBytes = data.length - end;
            const headerByte = remainingBytes > 0
                ? Math.ceil(remainingBytes / NETTHERNET_MAX_PAYLOAD_SIZE)
                : 0;

            const message = Buffer.allocUnsafe(frag.length + 1);
            message[0] = headerByte;
            frag.copy(message, 1);

            this.reliable.sendMessageBinary(message);
            sent += frag.length;
        }

        return sent;
    };
}

patchNethernetConnection();

export class NethernetClient {
    connected: boolean;
    onConnected: () => void;
    onCloseConnection: (reason: any) => void;
    onEncapsulated: (buffer: any, address: any) => void;
    nethernet: Client;

    constructor(options = {} as any) {
        this.connected = false;
        this.onConnected = () => { };
        this.onCloseConnection = () => { };
        this.onEncapsulated = () => { };

        this.nethernet = new Client(options.networkId);

        this.nethernet.on('connected', (client: Connection) => {
            //@ts-ignore
            this.onConnected(client);
            this.connected = true;
        });

        this.nethernet.on('disconnect', (reason: any) => {
            this.onCloseConnection(reason);
            this.connected = false;
        });

        this.nethernet.on('encapsulated', (data: Buffer, address: BigInt) => {
            if (this.connected) {
                this.onEncapsulated({ buffer: data }, address);
            }
        });
    }

    async connect() {
        await this.nethernet.connect();
    }

    sendReliable(data: any) {
        this.nethernet.send(data);
    }

    set credentials(value: any) {
        (this.nethernet as any).credentials = value;
    }

    get credentials(): any {
        return (this.nethernet as any).credentials;
    }

    set signalHandler(handler: (signal: any) => void) {
        (this.nethernet as any).signalHandler = handler;
    }

    handleSignal(signal: any) {
        (this.nethernet as any).handleSignal(signal);
    }

    handleRemoteOffer(signal: SignalStructure) {
        const internal = this.nethernet as any;

        try { internal.connection?.close(); } catch { }
        try { internal.rtcConnection?.close(); } catch { }

        internal.running = true;
        internal.connection = null;
        internal.rtcConnection = null;
        internal.connectionId = signal.connectionId;

        const rtc = new PeerConnection("client", { iceServers: this.credentials });
        internal.rtcConnection = rtc;
        internal.connection = new (Connection as any)(internal, signal.connectionId, rtc);

        const respond = (out: SignalStructure) => {
            const handler = (this as any).signalHandler || internal.signalHandler;
            if (typeof handler === "function") handler(out);
        };

        rtc.onLocalDescription((desc: string) => {
            respond(new SignalStructure(SignalType.ConnectResponse, signal.connectionId, desc, signal.networkId));
        });

        rtc.onLocalCandidate((candidate: string) => {
            respond(new SignalStructure(SignalType.CandidateAdd, signal.connectionId, candidate, signal.networkId));
        });

        rtc.onDataChannel((channel: any) => {
            if (channel.getLabel() === "ReliableDataChannel") {
                internal.connection.setChannels(channel);
            } else if (channel.getLabel() === "UnreliableDataChannel") {
                internal.connection.setChannels(null, channel);
            }
        });

        rtc.onStateChange((state: string) => {
            if (state === "connected") {
                this.connected = true;
                internal.emit("connected", internal.connection);
            } else if (state === "closed" || state === "disconnected" || state === "failed") {
                this.connected = false;
                internal.emit("disconnect", signal.connectionId, "disconnected");
            }
        });

        rtc.setRemoteDescription(signal.data, "offer");
    }

    async ping(timeout = 10000) {
        this.nethernet.ping();
        return waitFor((done: any) => {
            this.nethernet.once('pong', (ret: any) => { done(ret.data); });
        }, timeout, () => {
            throw new Error('Ping timed out');
        });
    }

    close() {
        this.nethernet.close("");
    }

    restart() {
        const internal = this.nethernet as any;
        try {
            internal.connection?.close();
        } catch { }
        try {
            internal.rtcConnection?.close();
        } catch { }
        internal.connection = null;
        internal.rtcConnection = null;
        if (typeof internal.createOffer === "function") {
            Promise.resolve(internal.createOffer()).catch(() => { });
        }
    }
}

async function waitFor(cb: any, withTimeout: any, onTimeout: any) {
    let t;
    const ret = await Promise.race([
        new Promise((resolve, reject) => cb(resolve, reject)),
        new Promise(resolve => { t = setTimeout(() => resolve('timeout'), withTimeout); })
    ]);
    clearTimeout(t);
    if (ret === 'timeout') await onTimeout();
    return ret;
}

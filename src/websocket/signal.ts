import { SignalStructure } from "node-nethernet";
import { EventEmitter, once } from "node:events";
import { WebSocket } from "ws";
import { config } from "../config/config";

const MessageType = {
    RequestPing: 0,
    Signal: 1,
    Credentials: 2
};

export class NethernetSignal extends EventEmitter {
    public networkId: any;
    public authflow: any;
    public version: any;
    public ws: WebSocket | null;
    public credentials: any;
    public pingInterval: any;
    public retryCount: number;

    constructor(networkId: any, authflow: any, version: any) {
        super();

        this.networkId = networkId;
        this.authflow = authflow;
        this.version = version;
        this.ws = null;
        this.credentials = null;
        this.pingInterval = null;
        this.retryCount = 0;
    }

    async connect() {
        if (this.ws?.readyState === WebSocket.OPEN) throw new Error('Already connected signaling server');
        await this.init();

        await once(this, 'credentials');
    }

    async destroy(resume = false) {
        if (config.debug) console.log("<DEBUG>".gray + 'Disconnecting from Signal');

        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }

        if (this.ws) {
            this.ws.onmessage = null;
            this.ws.onclose = null;

            const shouldClose = this.ws.readyState === WebSocket.OPEN;

            if (shouldClose) {
                let outerResolve;

                const promise = new Promise((resolve) => {
                    outerResolve = resolve;
                });

                //@ts-ignore
                this.ws.onclose = outerResolve;
                this.ws.close(1000, 'Normal Closure');

                await promise;
            }

            this.ws.onerror = null;
        }

        if (resume) {
            return this.init();
        }
    }

    async init() {
        const xbl = await this.authflow.getMinecraftBedrockServicesToken({ version: this.version });

        if (config.debug) console.log("<DEBUG>".gray + 'Fetched XBL Token', xbl);

        const address = `wss://signal.franchise.minecraft-services.net/ws/v1.0/signaling/${this.networkId}`;

        if (config.debug) console.log("<DEBUG>".gray + 'Connecting to Signal', address);

        const ws = new WebSocket(address, {
            headers: { Authorization: xbl.mcToken }
        });

        this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ Type: MessageType.RequestPing }));
            }
        }, 5000);

        ws.onopen = () => {
            this.onOpen();
        };

        ws.onclose = (event) => {
            this.onClose(event.code, event.reason);
        };

        ws.onerror = (event) => {
            this.onError(event);
        };

        ws.onmessage = (event: any) => {
            this.onMessage(event.data);
        };

        this.ws = ws;
    }

    onOpen() {
        if (config.debug) console.log("<DEBUG>".gray + 'Connected to Signal');
    }

    onError(err: any) {
        if (config.debug) console.log("<DEBUG>".gray + 'Signal Error', err);
    }

    onClose(code: number, reason: string) {
        if (config.debug) console.log("<DEBUG>".gray + `Signal Disconnected with code ${code} and reason ${reason}`);

        if (code === 1006) {
            if (config.debug) console.log("<DEBUG>".gray + 'Signal Connection Closed Unexpectedly');

            if (this.retryCount < 5) {
                this.retryCount++;
                this.destroy(true);
            } else {
                this.destroy();
                throw new Error('Signal Connection Closed Unexpectedly');
            }
        }
    }

    onMessage(res: Response) {
        if (!(typeof res === 'string')) return console.log("<DEBUG>".gray + 'Received non-string message', res);

        const message = JSON.parse(res);

        if (config.debug) console.log("<DEBUG>".gray + 'Recieved message', message);

        switch (message.Type) {
            case MessageType.Credentials: {
                if (message.From !== 'Server') {
                    if (config.debug) console.log("<DEBUG>".gray + 'Received credentials from non-Server', 'message', message);
                    return;
                }

                this.credentials = parseTurnServers(message.Message);

                this.emit('credentials', this.credentials);

                break;
            }
            case MessageType.Signal: {
                const signal = SignalStructure.fromString(message.Message);

                signal.networkId = message.From;

                this.emit('signal', signal);
                break;
            }
            case MessageType.RequestPing: {
                if (config.debug) console.log("<DEBUG>".gray + 'Signal Pinged');
            }
        }
    }

    write(signal: SignalStructure) {
        if (!this.ws) throw new Error('WebSocket not connected');

        const message = JSON.stringify({ Type: MessageType.Signal, To: signal.networkId, Message: signal.toString() });

        if (config.debug) console.log("<DEBUG>".gray + 'Sending Signal', message);

        this.ws.send(message);
    }
}

function parseTurnServers(dataString: string) {
    const servers: any = [];

    const data = JSON.parse(dataString);

    if (!data.TurnAuthServers) return servers;

    for (const server of data.TurnAuthServers) {
        if (!server.Urls) continue;

        for (const url of server.Urls) {
            const match = url.match(/(stun|turn):([^:]+):(\d+)/);
            if (match) {
                servers.push({
                    hostname: match[2],
                    port: parseInt(match[3], 10),
                    username: server.Username || undefined,
                    password: server.Password || undefined
                });
            }
        }
    }

    return servers;
}

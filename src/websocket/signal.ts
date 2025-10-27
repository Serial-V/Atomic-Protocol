import { SignalStructure } from "node-nethernet";
import { EventEmitter, once } from "node:events";
import { RawData, WebSocket } from "ws";
import { config } from "../config/config";

const MessageType = {
    RequestPing: 0,
    Signal: 1,
    Credentials: 2
};

type MessageEnvelope =
    | { Type: 0; } // RequestPing from server
    | { Type: 1; From: string; Message: string; } // Signal
    | { Type: 2; From: "Server"; Message: string; };

type TurnServer = {
    hostname: string;
    port: number;
    username?: string;
    password?: string;
};

type AuthflowLike = {
    getMinecraftBedrockServicesToken(args: { version: string; }): Promise<{ mcToken: string; }>;
};

const MAX_RETRIES = 5;
const PING_INTERVAL_MS = 2000;
const PING_TIMEOUT_MS = 7000;
const CREDENTIALS_TIMEOUT_MS = 15000;

export class NethernetSignal extends EventEmitter {
    public networkId: string;
    public authflow: AuthflowLike;
    public version: string;
    public ws: WebSocket | null = null;
    public credentials: TurnServer[] | null = null;

    private pingInterval: NodeJS.Timeout | null = null;
    private retryCount = 0;
    private destroyed = false;
    private lastLiveness = 0;

    constructor(networkId: string, authflow: AuthflowLike, version: string) {
        super();
        this.networkId = networkId;
        this.authflow = authflow;
        this.version = version;
    }

    async connect() {
        if (this.ws?.readyState === WebSocket.OPEN) throw new Error('Already connected signaling server');
        this.destroyed = false;

        await this.init();
        await Promise.race([
            once(this, "credentials"),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timed out waiting for credentials")), CREDENTIALS_TIMEOUT_MS)
            )
        ]);
    }

    async destroy(resume = false) {
        if (config.debug) console.log("<DEBUG>".gray + 'Disconnecting from Signal');

        this.destroyed = !resume;

        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }

        const ws = this.ws;
        this.ws = null;

        if (ws) {
            // Remove listeners to avoid leaks
            ws.removeAllListeners("open");
            ws.removeAllListeners("close");
            ws.removeAllListeners("error");
            ws.removeAllListeners("message");

            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                await new Promise<void>((resolve) => {
                    const done = () => resolve();
                    ws.once("close", done);
                    try {
                        ws.close(1000, "Normal Closure");
                    } catch {
                        resolve();
                    }
                });
            }
        }

        if (resume) {
            return this.reconnectWithBackoff();
        }
    }

    private async reconnectWithBackoff() {
        if (this.retryCount >= MAX_RETRIES) {
            if (config.debug) console.log("<DEBUG>".gray + "Max retries reached for Signal");
            this.emit("error", new Error("Signal reconnection failed after max retries"));
            return;
        }

        const base = 500;
        const delay = Math.min(1000 * 10, base * 2 ** this.retryCount);
        const jitter = Math.floor(Math.random() * 200);
        if (config.debug)
            console.log("<DEBUG>".gray + `Signal reconnect attempt #${this.retryCount + 1} in ${delay + jitter}ms`);

        await new Promise((r) => setTimeout(r, delay + jitter));

        try {
            await this.init();
        } catch (e) {
            if (config.debug) console.log("<DEBUG>".gray + "Signal init failed on reconnect", e);
        }
    }

    async init() {
        const xbl = await this.authflow.getMinecraftBedrockServicesToken({ version: this.version });
        if (config.debug) console.log("<DEBUG>".gray + 'Fetched XBL Token', xbl);

        const address = `wss://signal.franchise.minecraft-services.net/ws/v1.0/signaling/${this.networkId}`;
        if (config.debug) console.log("<DEBUG>".gray + 'Connecting to Signal', address);

        const ws = new WebSocket(address, { headers: { Authorization: xbl.mcToken } });
        this.ws = ws;
        this.lastLiveness = Date.now();

        ws.on("open", () => this.onOpen());
        ws.on("close", (code, reason) => this.onClose(code, reason.toString()));
        ws.on("error", (err) => this.onError(err as Error));
        ws.on("message", (data) => this.onMessage(data as any));

        if (!this.pingInterval) {
            this.pingInterval = setInterval(() => {
                if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

                try {
                    this.ws.send(JSON.stringify({ Type: MessageType.RequestPing }));
                } catch { }

                if (Date.now() - this.lastLiveness > PING_TIMEOUT_MS) {
                    if (config.debug) console.log("<DEBUG>".gray + "Signal liveness timeout; forcing reconnect");
                    try {
                        this.ws.terminate?.();
                    } catch { }
                }
            }, PING_INTERVAL_MS);
        }
    }

    private onOpen() {
        this.retryCount = 0;
        if (config.debug) console.log("<DEBUG>".gray + "Connected to Signal");
        this.lastLiveness = Date.now();
    }

    private onError(err: any) {
        if (config.debug) console.log("<DEBUG>".gray + "Signal Error", err);
    }

    private async onClose(code: number, reason: string) {
        if (config.debug) console.log("<DEBUG>".gray + `Signal Disconnected code=${code} reason=${reason}`);

        if (this.ws === null && this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }

        if (this.destroyed) return;

        // 1006 is abnormal closure; treat as retryable
        // 1011 internal error; retryable
        // 4401 unauthorized; fetch new token on next init
        const retryable = [1006, 1011, 4401].includes(code) || code === 0;

        if (retryable && this.retryCount < MAX_RETRIES) {
            this.retryCount++;
            await this.destroy(true);
        } else {
            await this.destroy(false);
            this.emit("error", new Error(`Signal closed: ${code} ${reason}`));
        }
    }

    private onMessage(res: RawData) {
        this.lastLiveness = Date.now();

        let message: MessageEnvelope | null = null;

        if (typeof res === "string") {
            try {
                message = JSON.parse(res) as MessageEnvelope;
            } catch (e) {
                if (config.debug) console.log("<DEBUG>".gray + "Failed to parse message", e);
                return;
            }
        } else if (res instanceof Buffer) {
            try {
                message = JSON.parse(res.toString("utf8")) as MessageEnvelope;
            } catch (e) {
                if (config.debug) console.log("<DEBUG>".gray + "Failed to parse binary message", e);
                return;
            }
        } else {
            if (config.debug) console.log("<DEBUG>".gray + "Received non-text message", typeof res);
            return;
        }

        if (config.debug) console.log("<DEBUG>".gray + "Received message", message);

        switch (message.Type) {
            case MessageType.Credentials: {
                if ((message as any).From !== "Server") {
                    if (config.debug)
                        console.log("<DEBUG>".gray + "Ignoring credentials from non-Server", message);
                    return;
                }
                this.credentials = parseTurnServers((message as any).Message);
                this.emit("credentials", this.credentials);
                break;
            }
            case MessageType.Signal: {
                const m = message as Extract<MessageEnvelope, { Type: 1; }>;
                try {
                    const signal = SignalStructure.fromString(m.Message);
                    signal.networkId = m.From;
                    this.emit("signal", signal);
                } catch (e) {
                    if (config.debug) console.log("<DEBUG>".gray + "Failed to parse Signal", e);
                }
                break;
            }
            case MessageType.RequestPing: {
                try {
                    this.ws?.send(JSON.stringify({ Type: MessageType.RequestPing }));
                } catch { }
                break;
            }
            default:
                break;
        }
    }

    write(signal: SignalStructure) {
        if (!this.ws) throw new Error('WebSocket not connected');

        const message = JSON.stringify({
            Type: MessageType.Signal,
            To: signal.networkId,
            Message: signal.toString()
        });

        if (config.debug) console.log("<DEBUG>".gray + "Sending Signal", message);
        this.ws.send(message);
    }
}

function parseTurnServers(dataString: string): TurnServer[] {
    const servers: TurnServer[] = [];
    try {
        const data = JSON.parse(dataString);
        if (config.debug) console.log("<DEBUG>".gray + "Parsed Turn Servers", data);

        const list = Array.isArray(data?.TurnAuthServers) ? data.TurnAuthServers : [];
        for (const server of list) {
            const urls = Array.isArray(server?.Urls) ? server.Urls : [];
            for (const url of urls) {
                const m = String(url).match(/^(stun|turns?|stuns?):([^:\/?#]+):(\d+)/i);
                if (m) {
                    servers.push({
                        hostname: m[2],
                        port: parseInt(m[3], 10),
                        username: server?.Username || undefined,
                        password: server?.Password || undefined
                    });
                }
            }
        }
    } catch (e) {
        if (config.debug) console.log("<DEBUG>".gray + "Failed to parse TURN servers", e);
    }
    return servers;
}
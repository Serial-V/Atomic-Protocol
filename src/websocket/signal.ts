import { SignalStructure } from "node-nethernet";
import { EventEmitter, once } from "node:events";
import { RawData, WebSocket } from "ws";
import { config } from "../config/config";
import { Logger } from "../utils/logger";

const MessageType = {
    RequestPing: 0,
    Signal: 1,
    Credentials: 2
};

type MessageEnvelope =
    | { Type: 0; } // RequestPing from server
    | { Type: 1; From: string; Message: string; } // Signal
    | { Type: 2; From: "Server"; Message: string; };

type IceServerConfig = {
    hostname: string;
    port: number;
    username?: string;
    password?: string;
    relayType?: "TurnUdp" | "TurnTcp" | "TurnTls";
};

type AuthflowLike = {
    getMinecraftBedrockServicesToken(args: { version: string; }): Promise<{ mcToken: string; }>;
};

const MAX_RETRIES = 5;
const PING_INTERVAL_MS = 2000;
const PING_TIMEOUT_MS = 60000;
const CREDENTIALS_TIMEOUT_MS = 15000;

export class NethernetSignal extends EventEmitter {
    public networkId: string;
    public authflow: AuthflowLike;
    public version: string;
    public ws: WebSocket | null = null;
    public credentials: any[] = [];

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
        Logger.debug('Disconnecting from Signal', config.debug)

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
            Logger.debug("Max retries reached for Signal", config.debug)
            this.emit("error", new Error("Signal reconnection failed after max retries"));
            return;
        }

        const base = 500;
        const delay = Math.min(1000 * 10, base * 2 ** this.retryCount);
        const jitter = Math.floor(Math.random() * 200);
        Logger.debug(`Signal reconnect attempt #${this.retryCount + 1} in ${delay + jitter}ms`, config.debug)

        await new Promise((r) => setTimeout(r, delay + jitter));

        try {
            await this.init();
        } catch (e) {
            Logger.debug(`Signal init failed on reconnect: ${String(e)}`, config.debug)
        }
    }

    async init() {
        const xbl = await this.authflow.getMinecraftBedrockServicesToken({ version: this.version });
        Logger.debug('Fetched XBL Token', config.debug)

        const address = `wss://signal.franchise.minecraft-services.net/ws/v1.0/signaling/${this.networkId}`;
        Logger.debug(`Connecting to Signal ${address}`, config.debug)

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
                    Logger.debug("Signal liveness timeout; forcing reconnect", config.debug)
                    try {
                        this.ws.terminate?.();
                    } catch { }
                }
            }, PING_INTERVAL_MS);
        }
    }

    private onOpen() {
        this.retryCount = 0;
        Logger.debug("Connected to Signal", config.debug)
        this.lastLiveness = Date.now();
    }

    private onError(err: any) {
        Logger.debug(`Signal Error: ${JSON.stringify(err, null, 2)}`, config.debug)
    }

    private async onClose(code: number, reason: string) {
        Logger.debug(`Signal Disconnected code=${code} reason=${reason}`, config.debug)

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
                Logger.debug(`Failed to parse message: ${String(e)}`, config.debug)
                return;
            }
        } else if (res instanceof Buffer) {
            try {
                message = JSON.parse(res.toString("utf8")) as MessageEnvelope;
            } catch (e) {
                Logger.debug(`Failed to parse binary message: ${String(e)}`, config.debug)
                return;
            }
        } else {
            Logger.debug(`Received non-text message ${typeof res}`, config.debug)
            return;
        }

        Logger.debug(`Received message ${JSON.stringify(message)}`, config.debug)

        switch (message.Type) {
            case MessageType.Credentials: {
                if ((message as any).From !== "Server") {
                    Logger.debug(`Ignoring credentials from non-Server ${JSON.stringify(message)}`, config.debug)
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
                    Logger.debug(`Failed to parse Signal: ${String(e)}`, config.debug)
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

        Logger.debug(`Sending Signal ${message}`, config.debug)
        this.ws.send(message);
    }
}

function parseTurnServers(dataString: string): any[] {
    const iceServers: any[] = [];
    try {
        const data = JSON.parse(dataString);
        Logger.debug("Parsed Turn Servers payload", config.debug)

        const list = Array.isArray(data?.TurnAuthServers) ? data.TurnAuthServers : [];
        for (const server of list) {
            const urls = Array.isArray(server?.Urls) ? server.Urls : [];

            for (const rawUrl of urls) {
                if (typeof rawUrl !== "string") continue;
                const parsed = parseIceUrl(rawUrl);
                if (!parsed) continue;

                const base: any = {
                    hostname: parsed.hostname,
                    port: parsed.port
                };

                if (parsed.isTurn) {
                    base.username = server?.Username || undefined;
                    base.password = server?.Password || server?.Credential || undefined;
                    base.relayType = parsed.relayType;
                }

                iceServers.push(base);

                // Add conservative fallbacks: try TCP and TLS variants as well
                if (parsed.isTurn) {
                    // Prefer also trying TCP on same port if original was UDP
                    if (parsed.relayType === "TurnUdp") {
                        iceServers.push({ ...base, relayType: "TurnTcp" });
                    }
                    // Also try TLS on 5349 if not already provided
                    if (parsed.relayType !== "TurnTls") {
                        iceServers.push({ ...base, port: 5349, relayType: "TurnTls" });
                    }
                }
            }
        }
    } catch (e) {
        Logger.debug(`Failed to parse TURN servers: ${String(e)}`, config.debug)
    }
    return iceServers;
}

function parseIceUrl(url: string): { hostname: string; port: number; relayType?: IceServerConfig["relayType"]; isTurn: boolean; } | null {
    const match = url.trim().match(/^(?<scheme>stuns?|turns?)(?::\/\/|:)?(?<host>[^:?\s]+)(?::(?<port>\d+))?(?:\?(?<query>.*))?$/i);
    if (!match || !match.groups) {
        return null;
    }

    const scheme = match.groups.scheme.toLowerCase();
    const hostname = match.groups.host;
    const port = match.groups.port ? parseInt(match.groups.port, 10) : defaultPortForScheme(scheme);
    if (!hostname || Number.isNaN(port)) {
        return null;
    }

    let relayType: IceServerConfig["relayType"];
    const isTurn = scheme.startsWith("turn");
    if (scheme.startsWith("turn")) {
        const params = new URLSearchParams(match.groups.query ?? "");
        const transport = params.get("transport")?.toLowerCase();

        if (scheme === "turns") {
            relayType = "TurnTls";
        } else if (transport === "tcp") {
            relayType = "TurnTcp";
        } else {
            relayType = "TurnUdp";
        }
    }

    return { hostname, port, relayType, isTurn };
}

function defaultPortForScheme(scheme: string): number {
    switch (scheme) {
        case "stuns":
        case "turns":
            return 5349;
        default:
            return 3478;
    }
}

import { Client } from "node-nethernet";

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

        this.nethernet.on('connected', (client) => {
            //@ts-ignore
            this.onConnected(client);
            this.connected = true;
        });

        this.nethernet.on('disconnect', (reason) => {
            this.onCloseConnection(reason);
            this.connected = false;
        });

        this.nethernet.on('encapsulated', (data, address) => {
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

    async ping(timeout = 10000) {
        this.nethernet.ping();
        return waitFor((done: any) => {
            this.nethernet.once('pong', (ret) => { done(ret.data); });
        }, timeout, () => {
            throw new Error('Ping timed out');
        });
    }

    close() {
        this.nethernet.close();
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
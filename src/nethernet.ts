//@ts-ignore
import { Client } from "node-nethernet";
import { NethernetOptions } from "./types";

export class NethernetClient {
    onConnected: () => void;
    onCloseConnection: () => void;
    onEncapsulated: () => void;

    nethernet: Client;

    constructor(options: NethernetOptions) {
        this.onConnected = () => { };
        this.onCloseConnection = () => { };
        this.onEncapsulated = () => { };

        this.nethernet = new Client(options.networkId);

        this.nethernet.on("connected", (client: any) => {
            this.onConnected();
        });

        this.nethernet.on("disconnect", (reason: any) => {
            this.onCloseConnection();
        });

        this.nethernet.on("encapsulated", (data: any, address: any) => {
            //@ts-ignore
            this.onEncapsulated({ buffer: data }, address);
        });
    };

    // TODO: add connection timeout/resolve
    async connect() {
        await this.nethernet.connect();
    };

    async ping(timeout: number) {
        this.nethernet.ping();
        return await new Promise((resolve, reject) => {
            setTimeout(() => {
                this.nethernet.off("pong", onPong);
                reject(new Error("ping timeout"));
            }, timeout);

            const onPong = (ret: any) => {
                this.nethernet.off("pong", onPong);
                resolve(ret?.extra ? ret.extra.toString() : null);
            };

            this.nethernet.on("pong", onPong);
        });
    };

    close() {
        this.nethernet.close();
    };
};
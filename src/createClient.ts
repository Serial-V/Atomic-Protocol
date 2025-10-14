import assert from "assert";
import { realmAuth } from "./client/auth";
import { Client } from "./client/client";
import { config } from "./config/config";
import { NethernetClient } from "./nethernet";
import { RaknetClient } from "./rak";
import { ClientOptions } from "./types";
import { convert } from "./utils/convert";
import { sleep } from "./utils/utilities";
import { NethernetSignal } from "./websocket/signal";

export const createClient = (options: ClientOptions) => {
    assert(options);
    const client = new Client({ port: 19132, delayedInit: true, followPort: !options.realmId, protocolVersion: config.protocol, version: config.minecraftVersion, ...options });

    config.debug = options.debug ?? false;

    if (options.realmId) realmAuth(client.options).then(onServerInfo).catch((e) => client.emit('error', e));
    else onServerInfo();

    function onServerInfo() {
        client.on("connect_allowed", () => connect(client));
        if (options.skipPing) client.init();
        else {
            ping({ host: client.options.host, networkId: client.options.networkId, port: client.options.port }).then((ad) => {
                if (client.options.transport === "nethernet") return client.init();

                if (ad.portV4 && client.options.followPort) client.options.port = ad.portV4;
                if (config.debug) console.log(`Connecting to ${client.options.host}:${client.options.port} ${ad.motd} (${ad.levelName}), version ${ad.version} ${config.minecraftVersion}`);
                client.init();
            }).catch((e) => {
                if (!client.options.useSignalling) {
                    client.emit("error", e);
                } else {
                    if (config.debug) console.log(`Could not ping server through local signalling, trying to connect over franchise signally instead`);
                    client.init();
                }
            });
        }
    }

    return client;
};

async function connect(client: Client) {
    if (client.options.transport === "nethernet") {
        if (client.options.useSignalling) {
            //@ts-ignore
            client.nethernet.signalling = new NethernetSignal(client.connection.nethernet.networkId, client.options.authflow, client.options.version);

            //@ts-ignore
            await client.nethernet.signalling.connect();

            //@ts-ignore
            client.connection.nethernet.credentials = client.nethernet.signalling.credentials;
            //@ts-ignore
            client.connection.nethernet.signalHandler = client.nethernet.signalling.write.bind(client.nethernet.signalling);
            //@ts-ignore
            client.nethernet.signalling.on('signal', signal => client.connection.nethernet.handleSignal(signal));
        } else {
            await client.connection.ping();
        }
    }

    client.connect();

    client.once("resource_packs_info", () => {
        client.write('resource_pack_client_response', {
            response_status: 'completed',
            resourcepackids: []
        });

        client.once('resource_pack_stack', () => {
            client.write('resource_pack_client_response', {
                response_status: 'completed',
                resourcepackids: []
            });
        });

        client.queue('client_cache_status', { enabled: false });

        sleep(500).then(() => {
            client.queue('request_chunk_radius', { chunk_radius: 1, max_radius: 10 });
        });
    });
}

interface PingOptions {
    host?: string;
    port?: number;
    networkId?: any;
}

async function ping({ host, port, networkId }: PingOptions) {
    if (networkId) {
        const con = new NethernetClient({ networkId });

        try {
            //@ts-ignore
            return nethernetConvert(Buffer.from(await con.ping()));
        } finally {
            con.close();
        }
    }

    const con = new RaknetClient({ host, port });

    try {
        const value = await con.ping();
        const serverInfo = convert(value);
        return serverInfo;
    } finally {
        con.close();
    }
}
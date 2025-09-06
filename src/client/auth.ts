import { config } from "../config/config";
import { ClientOptions } from "../types";
import { Client } from "./client";

export enum AuthenticationType {
    Full = 0,
    Guest = 1,
    SelfSigned = 2
}
export const realmAuth = async (options: ClientOptions) => {
    return new Promise(async (resolve, reject) => { // Added try/catch v3.6.1 due to: TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator)) ~ NoVa
        try {
            const auth = options.authflow ? await options.authflow.getXboxToken(config.parties.realm, true) : { ...options.auth };

            const getAddress = async (realmId: number) => {
                const fetchResponse = await fetch(config.endpoints.address(realmId), {
                    method: "GET",
                    headers: {
                        Authorization: `XBL3.0 x=${auth.userHash};${auth.XSTSToken}`,
                        ...config.realmHeaders
                    }
                });

                if (!fetchResponse.ok) reject({ error: `Couldn't compelete the request; ${fetchResponse.status} ${fetchResponse.statusText}` });

                const json = await fetchResponse.json();
                const [host, port] = json.address.split(":");
                return { host, port };
            };
            const { host, port } = await getAddress(options.realmId!);
            if (!host || !port) reject({ error: 'Couldn\'t find a Realm to connect to. Invalid Host/Port' });

            options.host = host;
            options.port = Number(port);
            resolve(null);
        } catch (e) { reject(e); };
    });
};

interface Profile {
    name: string;
    uuid: string;
    xuid: number;
}

export const authenticate = async (client: Client, options: ClientOptions) => {
    try {
        const authflow = options.authflow;

        //@ts-ignore
        const chains = await authflow.getMinecraftBedrockToken(client.clientX509).catch((e: any) => {
            throw e;
        });

        const jwt = chains[1];
        const [_, payload, __] = jwt.split('.').map((k: any) => Buffer.from(k, 'base64'));
        const xboxProfile = JSON.parse(String(payload));

        const profile: Profile = {
            name: xboxProfile?.extraData?.displayName || 'Reclipsed Client',
            uuid: xboxProfile?.extraData?.identity || "dfcf5ca-206c-404a-aec4-f59fff264c9b",
            xuid: xboxProfile?.extraData?.XUID || 0
        };

        return postAuthenticate(client, profile, chains);
    } catch (e) {
        console.error(e);
        client.emit('error', e);
    }
};

function postAuthenticate(client: any, profile: Profile, chains: string) {
    client.profile = profile;
    client.username = profile.name;
    client.accessToken = chains;
    client.emit('session');
}
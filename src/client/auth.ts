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
            await OptIn(options)

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
                const [host, port] = json?.address?.split(":");
                return { host, port };
            };

            const { host, port } = await getAddress(options.realmId!);
            if (!host || !port) reject({ error: 'Couldn\'t find a Realm to connect to. Invalid Host/Port' });

            options.host = host;
            options.port = Number(port);
            resolve(null);
        } catch (e) {
            console.log(e)
            reject(e);
        };
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

export async function OptIn(options: any) {
    const auth = options.authflow ? await options.authflow.getXboxToken(config.parties.realm, true) : { ...options.auth };
    let attempt = 0;

    while (true) {
        attempt++;

        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 10 * 1000);
        let resp: Response;
        try {
            resp = await fetch(`https://bedrock.frontendlegacy.realms.minecraft-services.net/worlds/${options.realmId}/stories/settings`, {
                method: "POST",
                headers: {
                    ...config.realmHeaders,
                    Authorization: `XBL3.0 x=${auth.userHash};${auth.XSTSToken}`,
                },
                body: JSON.stringify({
                    autostories: true,
                    coordinates: false,
                    notifications: false,
                    optInRequired: true,
                    playerOptIn: "OPT_IN",
                    realmOptIn: "OPT_IN",
                    timeline: true,
                }),
                signal: ctrl.signal
            });
        } catch (err: any) {
            clearTimeout(to);
            if (err?.name === "AbortError" && attempt <= 2 + 1) {
                await new Promise(r => setTimeout(r, 250 + (attempt - 1) * (attempt - 1) * 250));
                continue;
            }
            throw err;
        } finally {
            clearTimeout(to);
        }

        if (resp.status === 204) return { ok: true, status: 204 };
        if ((resp.status === 429 || (resp.status >= 500 && resp.status <= 599)) && attempt <= 2 + 1) {
            await new Promise(r => setTimeout(r, 250 + (attempt - 1) * (attempt - 1) * 250));
            continue;
        }

        let text: string | undefined;
        try { text = await resp.text(); } catch { }
        return { ok: false, status: resp.status, body: text };
    }
}
import * as crypto from "crypto";
import { JwtPayload, verify } from "jsonwebtoken";
import { config } from "../config/config";
import { Logger } from "../utils/logger";
import { PUBLIC_KEY } from "../types";

export = (client: any) => {
    const getDER = (b64: any) => crypto.createPublicKey({ key: Buffer.from(b64, 'base64'), format: 'der', type: 'spki' });

    client.decodeLoginJWT = (authTokens: string[], skinTokens: string) => {
        const { key, data } = verifyAuth(authTokens);
        const pubKey = getDER(key);
        const skinData = verify(skinTokens, pubKey, { algorithms: ['ES384'] });
        return { key, userData: data, skinData };
    };

    client.encodeLoginJWT = (localChain: string, mojangChain: string[]) => {
        const chains = [];
        chains.push(localChain);
        for (const chain of mojangChain) {
            chains.push(chain);
        }
        return chains;
    };

    function verifyAuth(chain: string[]) {
        let data: any = {};
        let didVerify = false;
        let pubKey = getDER(getX5U(chain[0]));
        let finalKey = null;

        for (const token of chain) {
            const decoded = verify(token, pubKey, { algorithms: ['ES384'] }) as JwtPayload;

            const x5u = getX5U(token);
            if (x5u === PUBLIC_KEY && !data.extraData?.XUID) {
                didVerify = true;
    Logger.debug(`Verified Client With Mojang Key: ${x5u}`, config.debug);
            }

            pubKey = decoded.identityPublicKey ? getDER(decoded.identityPublicKey) : x5u;
            finalKey = decoded.identityPublicKey || finalKey; // non pem
            data = { ...data, ...decoded };
        }

        if (!didVerify) client.disconnect('disconnectionScreen.notAuthenticated');
        return { key: finalKey, data };
    }
};

function getX5U(token: string) {
    const [header] = token.split('.');
    const hdec = Buffer.from(header, 'base64').toString('utf-8');
    const hjson = JSON.parse(hdec);
    return hjson.x5u;
}

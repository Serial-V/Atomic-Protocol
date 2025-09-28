import "colors";
import * as crypto from "crypto";
import { config } from "../config/config";
import { clientStatus } from "../types";

const curve = 'secp384r1';
const pem = { format: 'pem', type: 'sec1' };
const der = { format: 'der', type: 'spki' };

export const keyExchange = (client: any) => {
    client.ecdhKeyPair = crypto.generateKeyPairSync('ec', { namedCurve: curve });
    client.publicKeyDER = client.ecdhKeyPair.publicKey.export(der);
    client.privateKeyPEM = client.ecdhKeyPair.privateKey.export(pem);
    client.clientX509 = client.publicKeyDER.toString('base64');

    function startServerboundEncryption(token: { token: string; }) {
        if (config.debug) console.log("<DEBUG>".gray + "- ENCRYPT - Starting Serverbound Encryption ", token);

        const jwt = token?.token;
        if (!jwt) throw Error('Server did not return a valid JWT, cannot start encryption');

        const [header, payload] = jwt.split('.').map(k => Buffer.from(k, 'base64'));
        const head = JSON.parse(String(header));
        const body = JSON.parse(String(payload));

        //@ts-ignore
        const pubKeyDer = crypto.createPublicKey({ key: Buffer.from(head.x5u, 'base64'), ...der });

        client.sharedSecret = crypto.diffieHellman({ privateKey: client.ecdhKeyPair.privateKey, publicKey: pubKeyDer });

        const salt = Buffer.from(body.salt, 'base64');
        const secretHash = crypto.createHash('sha256');
        secretHash.update(salt);
        secretHash.update(client.sharedSecret);

        client.secretKeyBytes = secretHash.digest();
        const iv = client.secretKeyBytes.slice(0, 16);
        client.startEncryption(iv);

        client.write('client_to_server_handshake', {});

        //@ts-ignore
        this.emit('join');
        client.setStatus(clientStatus.Initializing);
    }

    client.once('client.server_handshake', startServerboundEncryption);
};

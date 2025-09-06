import * as crypto from "crypto";
import { deflateRawSync, inflateRawSync } from "zlib";

export const createDecryptor = (client: any, iv: Buffer) => {
    const decipher = createDecipher(client.secretKeyBytes, iv);

    client.receiveCounter = client.receiveCounter || 0n;
    decipher.on('data', verify);

    return (blob: Buffer) => {
        decipher.write(blob);
    };

    function verify(chunk: Buffer) {
        const packet = chunk.slice(0, chunk.length - 8);
        const checksum = chunk.slice(chunk.length - 8, chunk.length);

        const computedCheckSum = computeCheckSum(packet, client.receiveCounter, client.secretKeyBytes);
        client.receiveCounter++;

        if (!checksum.equals(computedCheckSum)) {
            client.emit('error', Error(`Checksum mismatch ${checksum.toString('hex')} != ${computedCheckSum.toString('hex')}`));
            client.disconnect('disconnectionScreen.badPacket');
            return;
        }

        let buffer;
        try {
            switch (packet[0]) {
                case 0:
                    try {
                        buffer = inflateRawSync(packet.slice(1), { chunkSize: 512000 });
                        break;
                    } catch (e) {
                        client.emit('error', e as Error);
                        client.disconnect('disconnectionScreen.badPacket');
                        return;
                    }
                case 255:
                    buffer = packet.slice(1);
                    break;
                default:
                    try {
                        client.emit('error', Error(`Unsupported compressor: ${packet[0]}`));
                    } catch (e) {
                        client.emit('error', e as Error);
                        client.disconnect('disconnectionScreen.badPacket');
                        return;
                    }
            }
        } catch (e) {
            client.emit("error", e as Error);
            client.disconnect("disconnectionScreen.badPacket");
            return;
        }

        client.onDecryptedPacket(buffer);
    }
};

export const createEncryptor = (client: any, iv: Buffer) => {
    const cipher = createCipher(client.secretKeyBytes, iv.slice(0, 12));

    client.sendCounter = client.sendCounter || 0n;

    cipher.on('data', client.onEncryptedPacket);

    return (blob: any) => {
        process(blob);
    };

    function process(chunk: Buffer) {
        let compressed: Buffer;
        try {
            compressed = deflateRawSync(chunk, { level: client.compressionLevel });
        } catch (e) {
            client.emit('error', e as Error);
            return;
        }

        const buffer = Buffer.concat([Buffer.from([0]), compressed]);

        const checksum = computeCheckSum(buffer, client.sendCounter, client.secretKeyBytes);
        const packet = Buffer.concat([buffer, checksum]);

        client.sendCounter++;
        cipher.write(packet);
    }

};

function createDecipher(secret: any, initialValue: any) {
    return crypto.createDecipheriv('aes-256-gcm', secret, initialValue.slice(0, 12));
}

function createCipher(secret: any, initialValue: any) {
    return crypto.createCipheriv('aes-256-gcm', secret, initialValue.slice(0, 12));
}

function computeCheckSum(packetPlaintext: Buffer, sendCounter: bigint, secretKeyBytes: Buffer) {
    const digest = crypto.createHash('sha256');
    const counter = Buffer.alloc(8);
    counter.writeBigInt64LE(sendCounter, 0);
    digest.update(counter);
    digest.update(packetPlaintext);
    digest.update(secretKeyBytes);
    const hash = digest.digest();
    return hash.slice(0, 8);
}

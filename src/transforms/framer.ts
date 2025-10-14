import * as zlib from "zlib";
import { Connection } from "../client/connection";
import { readVarInt, sizeOfVarInt, writeVarInt } from "../utils/varints";

export default class Framer {
    packets: Array<Buffer>;
    batchHeader: number;
    compressor: string;
    compressionLevel: number;
    compressionThreshold: number;
    compressionHeader: number;
    writeCompressor: boolean;

    constructor(client: Connection) {
        this.packets = [];
        this.batchHeader = client.batchHeader!;
        this.compressor = client.compressionAlgorithm || 'none';
        this.compressionLevel = client.compressionLevel;
        this.compressionThreshold = client.compressionThreshold;
        this.compressionHeader = client.compressionHeader || 0;
        this.writeCompressor = client.compressionReady;
    }

    reset(client: Connection) {
        this.packets = [];
        this.batchHeader = client.batchHeader!;
        this.compressor = client.compressionAlgorithm || 'none';
        this.compressionLevel = client.compressionLevel;
        this.compressionThreshold = client.compressionThreshold;
        this.compressionHeader = client.compressionHeader || 0;
        this.writeCompressor = client.compressionReady;
    }

    compress(buffer: Buffer) {
        switch (this.compressor) {
            case 'deflate': return zlib.deflateRawSync(buffer, { level: this.compressionLevel });
            case 'snappy': throw Error('Snappy compression not implemented');
            case 'none': return buffer;
            default: return buffer;
        }
    }

    static decompress(algorithm: any, buffer: Buffer) {
        switch (algorithm) {
            case 0:
            case 'deflate':
                return zlib.inflateRawSync(buffer, { chunkSize: 512000 });
            case 1:
            case 'snappy':
                throw Error('Snappy compression not implemented');
            case 'none':
            case 255:
                return buffer;
            default: throw Error('Unknown compression type ' + algorithm);
        }
    }

    static decode(client: Connection, buf: Buffer) {
        //Changed batchHeader from "this.batchHeader" to "client.batchHeader" & added a ? 1 : 0 check

        //@ts-ignore
        if (client.batchHeader && buf[0] !== client.batchHeader) throw Error(`bad batch packet header, received: ${buf[0]}, expected: ${this.batchHeader}`);
        const buffer = buf.slice(client.batchHeader ? 1 : 0);

        let decompressed;

        //@ts-ignore
        if (client.compressionReady) {
            try {
                decompressed = Framer.decompress(buffer[0], buffer.slice(1));
            } catch (e) {
                //Fallback
                client.emit?.("error", e as Error);
                return [];
            }
        } else {
            try {
                decompressed = Framer.decompress(client.compressionAlgorithm, buffer);
            } catch (e) {
                decompressed = buffer;
            }
        }



        return Framer.getPackets(decompressed);
    }

    encode() {
        const buf = Buffer.concat(this.packets);
        const shouldCompress = buf.length > this.compressionThreshold;
        const header = this.batchHeader ? [this.batchHeader] : [];

        if (this.writeCompressor) {
            header.push(shouldCompress ? this.compressionHeader : 255);
        }

        return Buffer.concat([Buffer.from(header), shouldCompress ? this.compress(buf) : buf]);
    }

    addEncodedPacket(chunk: Buffer) {
        const varIntSize = sizeOfVarInt(chunk.byteLength);
        const buffer = Buffer.allocUnsafe(varIntSize + chunk.byteLength);
        writeVarInt(chunk.length, buffer, 0);
        chunk.copy(buffer, varIntSize);
        this.packets.push(buffer);
    }

    addEncodedPackets(packets: Buffer[]) {
        let allocSize = 0;
        for (const packet of packets) {
            allocSize += sizeOfVarInt(packet.byteLength);
            allocSize += packet.byteLength;
        }
        const buffer = Buffer.allocUnsafe(allocSize);
        let offset = 0;
        for (const chunk of packets) {
            offset = writeVarInt(chunk.length, buffer, offset);
            offset += chunk.copy(buffer, offset, 0);
        }

        this.packets.push(buffer);
    }

    getBuffer() {
        return Buffer.concat(this.packets);
    }

    static getPackets(buffer: Buffer) {
        const maxPacket = 2 * 1024 * 1024;
        const packets: Buffer[] = [];
        let offset = 0;

        while (offset < buffer.byteLength) {
            const { value, size } = readVarInt(buffer, offset);
            if (value < 0 || value > maxPacket) {
                throw new Error(`Packet too large/invalid (${value} bytes)`);
            }

            if (offset + size + value > buffer.byteLength) {
                throw new Error("Truncated packet payload");
            }

            const dec = Buffer.allocUnsafe(value);
            offset += size;
            offset += buffer.copy(dec, 0, offset, offset + value);
            packets.push(dec);
        }

        return packets;
    }
}

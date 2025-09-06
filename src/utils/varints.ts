import { Buffer } from "buffer";

export function readVarInt(buffer: Buffer, offset: number) {
    let result = 0;
    let shift = 0;
    let cursor = offset;

    while (true) {
        if (cursor >= buffer.length) throw new Error('Unexpected buffer end while reading VarInt');
        const byte = buffer.readUInt8(cursor);
        result |= (byte & 0x7F) << shift; // Add the bits, excluding the MSB
        cursor++;
        if (!(byte & 0x80)) { // If MSB is not set, return result
            return { value: result, size: cursor - offset };
        }
        shift += 7;
        if (shift > 64) throw new Error(`varint is too big: ${shift}`); // Make sure our shift don't overflow.
    }
}

export function sizeOfVarInt(value: number) {
    let cursor = 0;
    while (value & ~0x7F) {
        value >>>= 7;
        cursor++;
    }
    return cursor + 1;
}

export function writeVarInt(value: number, buffer: Buffer, offset: number) {
    let cursor = 0;
    while (value & ~0x7F) {
        buffer.writeUInt8((value & 0xFF) | 0x80, offset + cursor);
        cursor++;
        value >>>= 7;
    }
    buffer.writeUInt8(value, offset + cursor);
    return offset + cursor + 1;
}
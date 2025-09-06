import nbt from 'prismarine-nbt';
import UUID from 'uuid-1345';

const protoLE = nbt.protos.little;
const ptrotoLEV = nbt.protos.littleVarint;

// UUID

function readUUID(buffer: Buffer, offset: number) {
    if (offset + 16 > buffer.length) { throw new Error('reached end of buffer'); };
    return {
        value: UUID.stringify(buffer.slice(offset, 16 + offset)),
        size: 16
    };
};

function writeUUID(value: any, buffer: Buffer, offset: number) {
    const buf = UUID.parse(value);
    buf.copy(buffer, offset);
    return offset + 16;
};

// NBT

function readNbt(buffer: Buffer, offset: number) {
    return ptrotoLEV.read(buffer, offset, 'nbt');
};

function writeNbt(value: any, buffer: Buffer, offset: number) {
    return ptrotoLEV.write(value, buffer, offset, 'nbt');
};

function sizeOfNbt(value: any) {
    return ptrotoLEV.sizeOf(value, 'nbt');
};

// NBT Little Endian

function readNbtLE(buffer: Buffer, offset: number) {
    const r = protoLE.read(buffer, offset, 'nbt');
    if (r.value.type === 'end') return { value: r.value, size: 1 };
    return r;
};

function writeNbtLE(value: any, buffer: Buffer, offset: number) {
    if (value.type === 'end') {
        buffer.writeInt8(0, offset);
        return offset + 1;
    };
    return protoLE.write(value, buffer, offset, 'nbt');
};

function sizeOfNbtLE(value: any) {
    if (value.type === 'end') return 1;
    return protoLE.sizeOf(value, 'nbt');
};

// Entity Metadata

function readEntityMetadata(buffer: Buffer, offset: number, _ref: any) {
    const type = _ref.type;
    const endVal = _ref.endVal;
    const metadata = [];

    let cursor = offset;
    let item;
    while (true) {
        if (offset + 1 > buffer.length) throw new Error('reached end of buffer');
        item = buffer.readUInt8(cursor);
        if (item === endVal) {
            return {
                value: metadata,
                size: cursor + 1 - offset
            };
        }
        //@ts-ignore
        const results = this.read(buffer, cursor, type, {});
        metadata.push(results.value);
        cursor += results.size;
    };
};

function writeEntityMetadata(value: any, buffer: Buffer, offset: number, _ref2: any) {
    const type = _ref2.type;
    const endVal = _ref2.endVal;
    //@ts-ignore
    const self = this;
    value.forEach(function (item: any) {
        offset = self.write(item, buffer, offset, type, {});
    });
    buffer.writeUInt8(endVal, offset);
    return offset += 1;
};

function sizeOfEntityMetadata(value: any, _ref3Z: any) {
    const type = _ref3Z.type;
    let size = 1;
    for (let i = 0; i < value.length; ++i) {
        //@ts-ignore
        size += this.sizeOf(value[i], type, {});
    };
    return size;
};

// Address

function readIpAddress(buffer: Buffer, offset: number) {
    const address = buffer[offset] + '.' + buffer[offset + 1] + '.' + buffer[offset + 2] + '.' + buffer[offset + 3];
    return {
        size: 4,
        value: address
    };
};

function writeIpAddress(value: any, buffer: Buffer, offset: number) {
    const address = value.split('.');
    address.forEach(function (b: any) {
        buffer[offset] = parseInt(b);
        offset++;
    });
    return offset;
};

function readEndOfArray(buffer: Buffer, offset: number, typeArgs: any) {
    const type = typeArgs.type;
    let cursor = offset;
    const elements = [];
    while (cursor < buffer.length) {
        //@ts-ignore
        const results = this.read(buffer, cursor, type, {});
        elements.push(results.size);
        cursor += results.size;
    };
    return {
        value: elements,
        size: cursor - offset
    };
};

function writeEndOfArray(value: any, buffer: Buffer, offset: number, typeArgs: any) {
    const type = typeArgs.type;
    //@ts-ignore
    const self = this;
    value.forEach(function (item: any) {
        offset = self.write(item, buffer, offset, type, {});
    });
    return offset;
};

function sizeOfEndOfArray(value: any, typeArgs: any) {
    const type = typeArgs.type;
    let size = 0;
    for (let i = 0; i < value.length; i++) {
        //@ts-ignore
        size += this.sizeOf(value[i], type, {});
    };
    return size;
};

export = {
    uuid: [readUUID, writeUUID, 16],
    nbt: [readNbt, writeNbt, sizeOfNbt],
    lnbt: [readNbtLE, writeNbtLE, sizeOfNbtLE],
    entityMetadataLoop: [readEntityMetadata, writeEntityMetadata, sizeOfEntityMetadata],
    ipAddress: [readIpAddress, writeIpAddress, 4],
    endOfArray: [readEndOfArray, writeEndOfArray, sizeOfEndOfArray]
};

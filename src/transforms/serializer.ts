import { Compiler, FullPacketParser, Serializer } from "protodef";
import protocol from "../config/protocol.json";
import { config } from "../config/config";

class RingBufferPool {
    private buffers: Buffer[];
    private index = 0;

    constructor(poolSize = 128, bufferSize = 65536) {
        this.buffers = Array.from({ length: poolSize }, () => Buffer.allocUnsafe(bufferSize));
    }

    next(len: number) {
        const buf = this.buffers[this.index];
        this.index = (this.index + 1) % this.buffers.length;
        return buf.subarray(0, len);
    }

    rawNext() {
        const buf = this.buffers[this.index];
        this.index = (this.index + 1) % this.buffers.length;
        return buf;
    }
}

const bufferPool = new RingBufferPool(128, 65536);

class Parser extends FullPacketParser {
    verify(deserialized: any, serializer: Serializer) {
        if (!config.debug) return;
        const { name, params } = deserialized.data;
        const oldBuffer = deserialized.fullBuffer;
        const newBuffer = serializer.createPacketBuffer({ name, params });

        if (!newBuffer.equals(oldBuffer)) console.warn("Packet Mismatch", name);
    }
}


class CustomCompiler extends Compiler.ProtoDefCompiler {
    public addTypesToCompilePublic(types: any) {
        this.addTypesToCompile(types);
    }
}

let cachedCompiledProto: any = null;
let cachedSerializer: Serializer | null = null;
let cachedDeserializer: Parser | null = null;

const getCompiledProto = () => {
    if (!cachedCompiledProto) {
        const compiler = new CustomCompiler();
        compiler.addTypesToCompilePublic(protocol.types);
        compiler.addTypes(require("../datatypes/compiler").default);
        cachedCompiledProto = compiler.compileProtoDefSync();
    }
    return cachedCompiledProto;
};

export const createSerializer = () => {
    if (!cachedSerializer) {
        cachedSerializer = new Serializer(getCompiledProto(), "mcpe_packet");
    }
    return cachedSerializer;
};

export const createDeserializer = () => {
    if (!cachedDeserializer) {
        cachedDeserializer = new Parser(getCompiledProto(), "mcpe_packet");
    }
    return cachedDeserializer;
};

export const serializeWithPool = (serializer: Serializer, packet: any) => {
    const result = serializer.createPacketBuffer(packet);
    const buf = bufferPool.rawNext();

    result.copy(buf, 0, 0, result.length);
    return buf.subarray(0, result.length);
};
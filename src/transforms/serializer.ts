import { Compiler, FullPacketParser, Serializer } from "protodef";
import protocol from "../config/protocol.json";
import { config } from "../config/config";

class BufferPool {
    private pool: Buffer[] = [];
    constructor(private size: number = 65536) { }

    alloc(len: number) {
        if (this.pool.length) return this.pool.pop()!.slice(0, len);
        return Buffer.allocUnsafe(len);
    }

    free(buf: Buffer) {
        this.pool.push(buf);
    }
}

const bufferPool = new BufferPool(65536);

class Parser extends FullPacketParser {
    verify(deserialized: any, serializer: Serializer) {
        if (!config.debug) return;

        const { name, params } = deserialized.data;
        const oldBuffer = deserialized.fullBuffer;

        const newBuffer = serializer.createPacketBuffer({ name, params });
        if (!newBuffer.equals(oldBuffer)) {
            console.warn("Packet Mismatch", name);
        }
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
    const buf = bufferPool.alloc(65536);
    const result = serializer.createPacketBuffer(packet);
    bufferPool.free(buf);
    return result;
};



// import { Compiler, FullPacketParser, Serializer } from "protodef";

// import protocol from "../config/protocol.json";
// import { config } from "../config/config";

// class Parser extends FullPacketParser {
//     verify(deserialized: any, serializer: Serializer) {
//         const { name, params } = deserialized.data;

//         const oldBuffer = deserialized.fullBuffer;
//         if (config.debug) {
//             const newBuffer = serializer.createPacketBuffer({ name, params });
//             if (!newBuffer.equals(oldBuffer)) {
//                 console.warn('Packet Mismatch', name);
//             }
//         }
//     }
// }

// class CustomCompiler extends Compiler.ProtoDefCompiler {
//     public addTypesToCompilePublic(types: any) {
//         this.addTypesToCompile(types);
//     }
// }

// let cachedCompiledProto: any = null;
// let cachedSerializer: Serializer | null = null;
// let cachedDeserializer: Parser | null = null;

// const getCompiledProto = () => {
//     if (!cachedCompiledProto) {
//         const compiler = new CustomCompiler();
//         compiler.addTypesToCompilePublic(protocol.types);
//         compiler.addTypes(require("../datatypes/compiler").default);
//         cachedCompiledProto = compiler.compileProtoDefSync();
//     }
//     return cachedCompiledProto;
// };

// export const createSerializer = () => {
//     if (!cachedSerializer) {
//         cachedSerializer = new Serializer(getCompiledProto(), "mcpe_packet");
//     }
//     return cachedSerializer;
// };

// export const createDeserializer = () => {
//     if (!cachedDeserializer) {
//         cachedDeserializer = new Parser(getCompiledProto(), "mcpe_packet");
//     }
//     return cachedDeserializer;
// };
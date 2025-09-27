import { Compiler, FullPacketParser, Serializer } from "protodef";

import protocol from "../config/protocol.json";

class Parser extends FullPacketParser {
    verify(deserialized: any, serializer: Serializer) {
        const { name, params } = deserialized.data;

        const oldBuffer = deserialized.fullBuffer;
        const newBuffer = serializer.createPacketBuffer({ name, params });
        if (!newBuffer.equals(oldBuffer)) {
            console.warn('Failed to re-encode', name);
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
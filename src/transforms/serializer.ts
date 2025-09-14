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

export const createSerializer = () => {
    const compiler = new CustomCompiler();
    compiler.addTypesToCompilePublic(protocol.types);
    compiler.addTypes(require("../datatypes/compiler"));

    const compiledProto = compiler.compileProtoDefSync();
    return new Serializer(compiledProto, "mcpe_packet");
};

export const createDeserializer = () => {
    const protocol = require("../config/protocol.json") as { types: any; };

    const compiler = new CustomCompiler();
    compiler.addTypesToCompilePublic(protocol.types);
    compiler.addTypes(require("../datatypes/compiler"));

    const compiledProto = compiler.compileProtoDefSync();
    return new Parser(compiledProto as any, 'mcpe_packet');
};
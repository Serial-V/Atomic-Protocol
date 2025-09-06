import { Compiler } from "protodef";

const beNbtJson = JSON.stringify(require('./nbt.json'));
const leNbtJson = beNbtJson.replace(/([iuf][0-7]+)/g, 'l$1');
const varintJson = JSON.stringify(require('./nbt-varint.json')).replace(/([if][0-7]+)/g, 'l$1');

function addTypesToCompiler(type: string, compiler: any) {
    compiler.addTypes(require('./compiler-compound'));
    compiler.addTypes(require('./compiler-tagname'));
    compiler.addTypes(require('./optional').compiler);
    let proto = beNbtJson;
    if (type === 'littleVarint') proto = varintJson;
    else if (type === 'little') proto = leNbtJson;
    compiler.addTypesToCompile(JSON.parse(proto));
}

function createProto(type: string) {
    const compiler = new Compiler.ProtoDefCompiler();
    addTypesToCompiler(type, compiler);
    return compiler.compileProtoDefSync();
}

const protoBE = createProto('big');
const protoLE = createProto('little');
const protoVarInt = createProto('littleVarint');

export const protos = {
    big: protoBE,
    little: protoLE,
    littleVarint: protoVarInt
};

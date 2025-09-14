import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";

const PROTOCOL = path.resolve(__dirname, "..", "config", "protocol.json");
const GEN_DIR = path.resolve(__dirname, "..", "packets");
const EVENTS_FILE = path.resolve(__dirname, "..", "Events.d.ts");

const protocol = JSON.parse(fs.readFileSync(PROTOCOL, "utf8"));
const types: Record<string, any> = protocol.types ?? {};

if (!fs.existsSync(GEN_DIR)) fs.mkdirSync(GEN_DIR, { recursive: true });

const toPascal = (name: string) =>
    name
        .split(/[_\s]+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join("");

const toPacketName = (name: string) =>
    toPascal(name.replace(/^packet_/, "")) + "Packet";

const toEventKey = (packetName: string) => packetName.replace(/^packet_/, "");

const mapPrimitive = (t: string): string => {
    switch (t) {
        case "i8":
        case "i16":
        case "i32":
        case "i64":
        case "u8":
        case "u16":
        case "u32":
        case "u64":
        case "varint":
        case "zigzag32":
        case "zigzag64":
        case "li8":
        case "li16":
        case "li32":
        case "li64":
        case "lu8":
        case "lu16":
        case "lu32":
        case "lu64":
            return "number";
        case "f32":
        case "f64":
        case "lf32":
        case "lf64":
            return "number";
        case "bool":
            return "boolean";
        case "string":
        case "uuid":
            return "string";
        case "buffer":
            return "Buffer";
        case "void":
            return "void";
        case "native":
            return "any";
        default:
            return toPascal(t);
    }
};

const PRIMITIVES = new Set([
    "i8", "i16", "i32", "i64", "u8", "u16", "u32", "u64",
    "varint", "zigzag32", "zigzag64",
    "li8", "li16", "li32", "li64", "lu8", "lu16", "lu32", "lu64",
    "f32", "f64", "lf32", "lf64",
    "bool", "string", "uuid", "buffer", "void", "native"
]);

function collectReferences(node: any, acc: Set<string>) {
    if (typeof node === "string") {
        if (!PRIMITIVES.has(node)) acc.add(node);
        return;
    }
    if (Array.isArray(node)) {
        const [kind, def] = node;
        switch (kind) {
            case "container":
                (def || []).forEach((f: any) => collectReferences(f.type, acc));
                break;
            case "array":
                collectReferences(def.type, acc);
                break;
            case "option":
                collectReferences(def, acc);
                break;
            case "switch":
                Object.values(def.fields || {}).forEach((c: any) =>
                    collectReferences(c, acc)
                );
                break;
            case "mapper":
                break;
            case "bitflags":
                break;
        }
    } else if (node && typeof node === "object" && node.type) {
        collectReferences([node.type, node], acc);
    }
}

function tsType(node: any): string {
    if (typeof node === "string") {
        return mapPrimitive(node);
    }
    if (Array.isArray(node)) {
        const [kind, def] = node;
        return handleKind(kind, def);
    }
    if (node && typeof node === "object" && node.type) {
        return handleKind(node.type, node);
    }
    return "any";
}

function handleKind(kind: string, def: any): string {
    switch (kind) {
        case "container":
            return `{${(def || []).map((f: any) => `  ${f.name}: ${tsType(f.type)};`).join("\n")}}`;
        case "array":
            return `${tsType(def.type)}[]`;
        case "option":
            return `${tsType(def)} | null`;
        case "switch":
            return (Object.values(def.fields || {}).map((c: any) => tsType(c)).join(" | ") || "any");
        case "mapper":
            return (Object.values(def.mappings || {}).map((v: any) => JSON.stringify(v)).join(" | ") || "string");
        case "bitflags": {
            const flags = Array.isArray(def) ? def : Array.isArray(def.flags) ? def.flags : [];
            return `{${flags.map((flag: string) => `  ${flag}: boolean;`).join("\n")}}`;
        }
        default:
            return "any";
    }
}

for (const [typeName, def] of Object.entries(types)) {
    const ifaceName = typeName.startsWith("packet_")
        ? toPacketName(typeName)
        : toPascal(typeName);

    const refs = new Set<string>();
    collectReferences(def, refs);
    const importLines = [...refs]
        .filter(r => r !== typeName)
        .map(r => {
            const refIface = r.startsWith("packet_") ? toPacketName(r) : toPascal(r);
            return `import type { ${refIface} } from "./${r}";`;
        });

    const importsBlock = importLines.length > 0 ? importLines.join("\n") + "\n\n" : "";


    let body: string;

    if (
        (Array.isArray(def) && def[0] === "container") ||
        (def && def.type === "container")
    ) {
        const fields = (Array.isArray(def) ? def[1] : def.fields) || [];
        body = fields
            .map((f: any) => `  ${f.name}: ${tsType(f.type)};`)
            .join("\n");
        body = `export interface ${ifaceName} {\n${body}\n}`;
    } else {
        body = `export type ${ifaceName} = ${tsType(def)};`;
    }

    const content = `
${importsBlock}${body}
`;

    const filePath = path.join(GEN_DIR, `${typeName}.ts`);
    fs.writeFileSync(filePath, content.trimEnd() + "\n");
}

const packets = Object.keys(types).filter(k => k.startsWith("packet_"));

const imports = packets
    .map(name => {
        const ifaceName = toPacketName(name);
        return `import type { ${ifaceName} } from "./packets/${name}";`;
    })
    .join("\n");

const entries = packets
    .map(name => {
        const eventKey = toEventKey(name);
        const ifaceName = toPacketName(name);
        return `  "${eventKey}": (packet: ${ifaceName}) => void;`;
    })
    .join("\n");

const eventsContent = `${imports}

export interface Events {
${entries}
  "session": () => void;
  "close": () => void;
  "error": () => void;
  "disconnect": () => void;
}
`;

(async () => {
    await writeFormatted(EVENTS_FILE, eventsContent);
})();

async function writeFormatted(filePath: string, source: string) {
    const formatted = await prettier.format(source, { parser: "typescript" });
    fs.writeFileSync(filePath, formatted, "utf8");
}


console.log(`Generated ${packets.length} packet event bindings.`);
console.log(`Generated ${Object.keys(types).length} type files in ./generated.`);

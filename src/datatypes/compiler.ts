import UUID from 'uuid-1345';
import minecraft from "./minecraft";

declare const ctx: any;

export interface OperationTuple {
    0: 'native' | 'parametrizable' | 'context';
    1: any;
};

const Read: Record<string, OperationTuple> = {};
const Write: Record<string, OperationTuple> = {};
const SizeOf: Record<string, OperationTuple> = {};

// --------------- UUID ---------------
Read.uuid = ['native', (buffer: Buffer, offset: number) => {
    return {
        value: UUID.stringify(buffer.slice(offset, 16 + offset)),
        size: 16
    };
}
];

Write.uuid = ['native', (value: string, buffer: Buffer, offset: number) => {
    const buf = UUID.parse(value);
    buf.copy(buffer, offset);
    return offset + 16;
}
];

SizeOf.uuid = ['native', 16];

// --------------- Buffer ---------------

Read.restBuffer = ['native', (buffer: Buffer, offset: number) => {
    return {
        value: buffer.slice(offset),
        size: buffer.length - offset
    };
}
];

Write.restBuffer = ['native', (value: Buffer, buffer: Buffer, offset: number) => {
    value.copy(buffer, offset);
    return offset + value.length;
}
];

SizeOf.restBuffer = ['native', (value: Buffer) => {
    return value.length;
}
];

// --------------- Encapsulated ---------------

Read.encapsulated = ['parametrizable', (compiler: any, { lengthType, type }: { lengthType: string; type: string; }) => {
    return compiler.wrapCode(
        `
              const payloadSize = ${compiler.callType(lengthType, "offset")}
              const { value, size } = ctx.${type}(buffer, offset + payloadSize.size)
              return { value, size: size + payloadSize.size }
            `.trim()
    );
}
];

Write.encapsulated = ['parametrizable', (compiler: any, { lengthType, type }: { lengthType: string; type: string; }) => {
    return compiler.wrapCode(
        `
          const buf = Buffer.allocUnsafe(buffer.length - offset)
          const payloadSize = ctx.${type}(value, buf, 0)
          let size = ctx.${lengthType}(payloadSize, buffer, offset)
          size += buf.copy(buffer, size, 0, payloadSize)
          return size
        `.trim()
    );
},
];

SizeOf.encapsulated = ['parametrizable', (compiler: any, { lengthType, type }: { lengthType: string; type: string; }) => {
    return compiler.wrapCode(
        `
          const payloadSize = ctx.${type}(value)
          return ctx.${lengthType}(payloadSize) + payloadSize
        `.trim()
    );
},
];

// --------------- NBT Loop ---------------

Read.nbtLoop = ["context", (buffer: Buffer, offset: number) => {
    const values: any[] = [];
    while (buffer[offset] != 0) {
        const n = ctx.nbt(buffer, offset);
        values.push(n.value);
        offset += n.size;
    };
    return { value: values, size: buffer.length - offset };
}
];

Write.nbtLoop = ['context', (value: any, buffer: Buffer, offset: number) => {
    value.forEach((val: any) => {
        offset = ctx.nbt(val, buffer, offset);
    });
    buffer.writeUint8(0, offset);
    return offset + 1;
}
];

SizeOf.nbtLoop = ['context', (value: any, buffer: Buffer, offset: number) => {
    let size = 1;
    value.forEach((val: any) => {
        size += ctx.nbt(val, buffer, offset);
    });
    return size;
}
];

// --------------- Byte Rotation ---------------

Read.byterot = ['context', (buffer: Buffer, offset: number) => {
    const val = buffer.readUint8(offset);
    return { value: val * (360 / 256), size: 1 };
}
];

Write.byterot = ['context', (value: number, buffer: Buffer, offset: number) => {
    const val = value / (360 / 256);
    buffer.writeUint8(val, offset);
    return offset + 1;
}
];

SizeOf.byterot = ['context', (value: number, buffer: Buffer, offset: number) => {
    return 1;
}
];

// --------------- Module ---------------

const mc = minecraft;

Read.nbt = ['native', mc.nbt[0]];
Write.nbt = ['native', mc.nbt[1]];
SizeOf.nbt = ['native', mc.nbt[2]];

Read.lnbt = ['native', mc.lnbt[0]];
Write.lnbt = ['native', mc.lnbt[1]];
SizeOf.lnbt = ['native', mc.lnbt[2]];

// --------------- Enum Size ---------------

// values are undefined in bedrock-protocol/src/datatypes/compiler-minecraft.js line 123

Read.enum_size_based_on_values_len = ['parametrizable', (compiler: any) => {
    return compiler.wrapCode(
        js(() => {
            //@ts-ignore
            if (values_len <= 0xff) return { value: 'byte', size: 0 };
            //@ts-ignore
            if (values_len <= 0xffff) return { value: 'short', size: 0 };
            //@ts-ignore
            if (values_len <= 0xffffff) return { value: 'int', size: 0 };
        })
    );
}
];

Write.enum_size_based_on_values_len = ['parametrizable', (compiler: any) => {
    return str(() => {
        //@ts-ignore
        if (value.values_len <= 0xff) _enum_type = 'byte';
        //@ts-ignore
        else if (value.values_len <= 0xffff) _enum_type = 'short';
        //@ts-ignore
        else if (value.values_len <= 0xffffff) _enum_type = 'int';
        //@ts-ignore
        return offset;
    });
}
];

SizeOf.enum_size_based_on_values_len = ["parametrizable", (compiler: any) => {
    return str(() => {
        //@ts-ignore
        if (value.values_len <= 0xff) _enum_type = "byte";
        //@ts-ignore
        else if (value.values_len <= 0xffff) _enum_type = "short";
        //@ts-ignore
        else if (value.values_len <= 0xffffff) _enum_type = "int";
        return 0;
    });
},
];

function js(fn: Function): string {
    return fn.toString().split("\n").slice(1, -1).join("\n").trim();
};

function str(fn: Function): string {
    return fn.toString() + ")();(()=>{}";
}

export default { Read, SizeOf, Write };

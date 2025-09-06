
export = {
    Read: {
        compound: ['context', (buffer: Buffer, offset: number) => {
            const results = {
                value: {} as { type: any; value: any; },
                size: 0
            };
            while (offset !== buffer.length) {
                //@ts-ignore
                const typ = ctx.i8(buffer, offset);
                if (typ.value === 0) {
                    results.size += typ.size;
                    break;
                }

                if (typ.value > 20) {
                    throw new Error(`Invalid tag: ${typ.value} > 20`);
                }

                //@ts-ignore
                const readResults = ctx.nbt(buffer, offset);
                offset += readResults.size;
                results.size += readResults.size;
                results.value[readResults.value.name as keyof typeof results.value] = {
                    type: readResults.value.type,
                    value: readResults.value.value
                };
            }
            return results;
        }]
    },

    Write: {
        compound: ['context', (value: Array<{ type: any; value: any; }>, buffer: Buffer, offset: number) => {
            for (const key in value) {
                //@ts-ignore
                offset = ctx.nbt({
                    name: key,
                    type: value[key].type,
                    value: value[key].value
                }, buffer, offset);
            }
            //@ts-ignore
            offset = ctx.i8(0, buffer, offset);
            return offset;
        }]
    },

    SizeOf: {
        compound: ['context', (value: Array<{ type: any; value: any; }>) => {
            let size = 1;
            for (const key in value) {
                //@ts-ignore
                size += ctx.nbt({
                    name: key,
                    type: value[key].type,
                    value: value[key].value
                });
            }
            return size;
        }]
    }
};
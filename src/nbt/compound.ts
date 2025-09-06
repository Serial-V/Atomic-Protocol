
export function readCompound(buffer: Buffer, offset: number, typeArgs: any, rootNode: any) {
    const results = {
        value: {} as { type: any; value: any; },
        size: 0
    };
    while (true) {
        //@ts-ignore
        const typ = this.read(buffer, offset, 'i8', rootNode);
        if (typ.value === 0) {
            offset += typ.size;
            results.size += typ.size;
            break;
        }

        //@ts-ignore
        const readResults = this.read(buffer, offset, 'nbt', rootNode);
        offset += readResults.size;
        results.size += readResults.size;
        results.value[readResults.value.name as keyof typeof results.value] = {
            type: readResults.value.type,
            value: readResults.value.value
        };
    }
    return results;
}

export function writeCompound(value: any, buffer: Buffer, offset: number, typeArgs: any, rootNode: any) {
    //@ts-ignore
    const self = this;
    Object.keys(value).forEach(function (key) {
        offset = self.write({
            name: key,
            type: value[key].type,
            value: value[key].value
        }, buffer, offset, 'nbt', rootNode);
    });
    //@ts-ignore
    offset = this.write(0, buffer, offset, 'i8', rootNode);

    return offset;
}

export function sizeOfCompound(value: any, typeArgs: any, rootNode: any) {
    //@ts-ignore
    const self = this;
    const size = Object.keys(value).reduce(function (size, key) {
        return size + self.sizeOf({
            name: key,
            type: value[key].type,
            value: value[key].value
        }, 'nbt', rootNode);
    }, 0);
    return 1 + size;
}

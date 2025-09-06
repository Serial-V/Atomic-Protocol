
export function readPString(buffer: Buffer, offset: number) {
    //@ts-ignore
    const { value, size } = ctx.shortString(buffer, offset);
    for (const c of value) {
        if (c === '\0') throw new Error('unexpected tag end');
    }
    return { value, size };
}

export function writePString(...args: string[]) {
    //@ts-ignore
    return ctx.shortString(...args);
}

export function sizeOfPString(...args: string[]) {
    //@ts-ignore
    return ctx.shortString(...args);
}
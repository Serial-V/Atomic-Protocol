export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export function getRandomUint64(): bigint {
    const bytes = new Uint8Array(8);

    crypto.getRandomValues(bytes);

    let value = 0n;
    for (let i = 0; i < 8; i++) {
        value = (value << 8n) | BigInt(bytes[i]);
    }

    return value;
}

export const config = {
    debug: false,
    protocol: 827,
    minecraftVersion: "1.21.100",
    deviceModel: "ReclipsedTS",
    connectTimeout: 9000,
    autoInitPlayer: true,

    parties: {
        xbox: "http://xboxlive.com",
        realm: "https://pocket.realms.minecraft.net/"
    },
    realmHeaders: {
        "Cache-Control": "no-cache",
        Charset: "utf-8",
        "Content-Type": "application/json",
        "Client-Version": "1.21.80",
        "User-Agent": "MCPE/UWP",
        "Accept-Language": "en-US",
        "Accept-Encoding": "gzip, deflate, br",
        Host: "pocket.realms.minecraft.net",
    },
    endpoints: {
        worlds: "https://pocket.realms.minecraft.net/worlds",
        address: (realmId: number) => `https://pocket.realms.minecraft.net/worlds/${realmId}/join`
    }
};

export const defaultOptions = {
    version: config.minecraftVersion,
    autoInitPlayer: true,
    connectTimeout: 9000,
    packets: []
};
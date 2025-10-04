
export const config = {
    debug: false,
    protocol: 844,
    minecraftVersion: "1.21.111",
    deviceModel: "AtomicTS",
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
        "Client-Version": "1.21.111",
        "User-Agent": "MCPE/UWP",
        "Accept-Language": "en-US",
        "Accept-Encoding": "gzip, deflate, br",
        Host: "pocket.realms.minecraft.net",
    },
    endpoints: {
        worlds: "https://pocket.realms.minecraft.net/worlds",
        address: (realmId: number) => `https://pocket.realms.minecraft.net/worlds/${realmId}/join`,
        acceptInvite: (code: string) => `https://bedrock.frontendlegacy.realms.minecraft-services.net/invites/v1/link/accept/${code}`
    }
};

export const defaultOptions = {
    version: config.minecraftVersion,
    autoInitPlayer: true,
    connectTimeout: 9000,
    packets: []
};
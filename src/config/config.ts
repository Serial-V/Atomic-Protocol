
export const config = {
    debug: false,
    protocol: 827,
    minecraftVersion: "1.21.101",
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
        "Client-Version": "1.21.101",
        "User-Agent": "MCPE/UWP",
        "Accept-Language": "en-US",
        "Accept-Encoding": "gzip, deflate, br",
        Host: "pocket.realms.minecraft.net",
    },
    endpoints: {
        worlds: "https://pocket.realms.minecraft.net/worlds",
        address: (realmId: number) => `https://pocket.realms.minecraft.net/worlds/${realmId}/join`,
        acceptInvite: (realmId: number) => `https://bedrock.frontendlegacy.realms.minecraft-services.net/invites/v1/link/accept/${realmId}`
    }
};

export const defaultOptions = {
    version: config.minecraftVersion,
    autoInitPlayer: true,
    connectTimeout: 9000,
    packets: []
};
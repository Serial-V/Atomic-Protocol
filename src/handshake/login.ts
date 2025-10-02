import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { nextUUID } from "../lib/functions";
import { ClientOptions, PUBLIC_KEY } from "../types";

export = (client: any, options: ClientOptions) => {
    const skinData = require("../config/steve.json");

    client.createClientChain = () => {
        const privateKey = client.ecdhKeyPair.privateKey;

        client.clientIdentityChain = sign({
            identityPublicKey: PUBLIC_KEY,
            certificateAuthority: true
        }, privateKey, {
            algorithm: 'ES384',
            header: { x5u: client.clientX509, alg: "ES384" }
        });
        client.createClientUserChain(privateKey);
    };

    client.createClientUserChain = (privateKey: string) => {
        let payload = {
            ...skinData,
            ClientRandomId: Date.now(),
            CurrentInputMode: 1,
            DefaultInputMode: 1,
            DeviceId: nextUUID(),
            DeviceModel: config.deviceModel,
            DeviceOS: client.session?.deviceOS || 7,
            GameVersion: config.minecraftVersion,
            GuiScale: -1,
            LanguageCode: 'en_GB',
            GraphicsMode: 1,

            PlatformOfflineId: '',
            PlatformOnlineId: '',
            PlayFabId: nextUUID().replace(/-/g, '').slice(0, 16).toLowerCase(),
            SelfSignedId: nextUUID(),
            ServerAddress: `${options.host}:${options.port}`,

            ThirdPartyName: client.profile.name,
            ThirdPartyNameOnly: undefined,

            UIProfile: 0,
            IsEditorMode: false,
            TrustedSkin: false,
            OverrideSkin: false,
            CompatibleWithClientSideChunkGen: false,
            MaxViewDistance: 0,
            MemoryTier: 0,
            PlatformType: 0
        };

        const customPayload = options.skinData || {};
        payload = { ...payload, ...customPayload };
        payload.ServerAddress = `${options.host}:${options.port}`;

        client.clientUserChain = sign(payload, privateKey, {
            algorithm: "ES384",
            header: {
                x5u: client.clientX509,
                alg: "ES384",
            },
            noTimestamp: true
        });
    };
};
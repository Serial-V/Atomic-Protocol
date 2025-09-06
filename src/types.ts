
//@ts-ignore
import { Authflow } from "prismarine-auth";
import { AddPlayerPacket } from "./packets/addPlayer";
import { EmotePacket } from "./packets/emote";
import { PlayerlistPacket } from "./packets/playerlist";
import { PlayerSkinPacket } from "./packets/playerSkin";
import { TextPacket } from "./packets/text";

//Consts

export const clientStatus = {
    Disconnected: 0,
    Connecting: 1,
    Authenticating: 2,
    Initializing: 3,
    Initialized: 4
};

export const PUBLIC_KEY = 'MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAECRXueJeTDqNRRgJi/vlRufByu/2G0i2Ebt6YMar5QX/R0DIIyrJMcUpruK4QveTfJSTp3Shlq4Gk34cD/4GUWwkv0DVuzeuB+tXija7HBxii03NHDbPAD0AKnLr2wdAp';

//Interfaces

export interface ClientOptions {
    host?: string;
    port?: number;
    realmId?: number;
    authflow?: Authflow;
    auth?: {
        XSTSToken: string;
        userHash: string;
    };

    protocolVersion?: number;
    version?: string;

    debug?: boolean;
    connectTimeout?: number;
    skinData?: any;

    delayedInit?: boolean;
    followPort?: boolean;
    viewDistance?: number;
    skipPing?: boolean;

    packets: string[];
}

//Packets

export interface Events {
    session: () => void;
    start_game: () => void;
    connect_allowed: () => void;

    //Packets

    player_list: (packet: PlayerlistPacket) => void;
    player_skin: (packet: PlayerSkinPacket) => void;
    add_player: (packet: AddPlayerPacket) => void;
    text: (packet: TextPacket) => void;
    close: () => void;
    error: () => void;
    disconnect: () => void;
    emote: (packet: EmotePacket) => void;
}

export interface NethernetOptions {
    networkId: string;
};
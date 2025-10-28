
//@ts-ignore
import { Authflow } from "prismarine-auth";
import { AddPlayerPacket } from "./packets/packet_add_player";
import { EmotePacket } from "./packets/packet_emote";
import { PlayerListPacket } from "./packets/packet_player_list";
import { PlayerSkinPacket } from "./packets/packet_player_skin";
import { TextPacket } from "./packets/packet_text";
import { TickSyncPacket } from "./packets/packet_tick_sync";

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
    inviteCode?: string;
    authflow: Authflow;

    protocolVersion?: number;
    version?: string;

    debug?: boolean;
    connectTimeout?: number;
    skinData?: any;

    delayedInit?: boolean;
    followPort?: boolean;
    viewDistance?: number;
    skipPing?: boolean;

    packets?: string[];

    username?: string;
    profilesFolder?: string;

    //Nethernet
    networkId?: bigint;
    transport?: string;
    useSignalling?: boolean;
    autoReconnect?: boolean;

}

export enum CompressionAlgorithm {
    None = "none",
    Zlib = "zlib",
    Gzip = "gzip"
}

//Packets

export interface Events {
    session: () => void;
    start_game: () => void;
    connect_allowed: () => void;
    tick_sync: (packet: TickSyncPacket) => void;

    //Packets

    player_list: (packet: PlayerListPacket) => void;
    player_skin: (packet: PlayerSkinPacket) => void;
    add_player: (packet: AddPlayerPacket) => void;
    text: (packet: TextPacket) => void;
    close: () => void;
    error: () => void;
    disconnect: () => void;
    emote: (packet: EmotePacket) => void;
}

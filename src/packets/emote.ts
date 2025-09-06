export interface EmotePacket {
    entity_id: BigInt,
    emote_id: string,
    emote_length_ticks: number,
    xuid: string,
    platform_id: string,
    flags: string;
}
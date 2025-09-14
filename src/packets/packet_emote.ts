
import type { Varint64 } from "./varint64";

export interface EmotePacket {
  entity_id: Varint64;
  emote_id: string;
  emote_length_ticks: number;
  xuid: string;
  platform_id: string;
  flags: "server_side" | "mute_chat";
}

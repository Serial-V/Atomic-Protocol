
import type { Varint64 } from "./varint64";

export interface EmoteListPacket {
  player_id: Varint64;
  emote_pieces: string[];
}

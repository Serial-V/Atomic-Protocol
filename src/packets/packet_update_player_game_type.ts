
import type { GameMode } from "./GameMode";
import type { Varint64 } from "./varint64";

export interface UpdatePlayerGameTypePacket {
  gamemode: GameMode;
  player_unique_id: number;
  tick: Varint64;
}

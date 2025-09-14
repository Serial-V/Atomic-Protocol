
import type { ByteArray } from "./ByteArray";

export interface DebugInfoPacket {
  player_unique_id: number;
  data: ByteArray;
}

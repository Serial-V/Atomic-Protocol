
import type { NbtLoop } from "./nbtLoop";

export interface LevelEventGenericPacket {
  event_id: number;
  nbt: NbtLoop;
}

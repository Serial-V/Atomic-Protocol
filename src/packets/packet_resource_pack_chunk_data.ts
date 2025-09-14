
import type { ByteArray } from "./ByteArray";

export interface ResourcePackChunkDataPacket {
  pack_id: string;
  chunk_index: number;
  progress: number;
  payload: ByteArray;
}


import type { BlockUpdate } from "./BlockUpdate";

export interface UpdateSubchunkBlocksPacket {
  x: number;
  y: number;
  z: number;
  blocks: BlockUpdate[];
  extra: BlockUpdate[];
}

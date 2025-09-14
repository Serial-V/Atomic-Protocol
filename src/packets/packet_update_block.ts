
import type { BlockCoordinates } from "./BlockCoordinates";
import type { UpdateBlockFlags } from "./UpdateBlockFlags";

export interface UpdateBlockPacket {
  position: BlockCoordinates;
  block_runtime_id: number;
  flags: UpdateBlockFlags;
  layer: number;
}

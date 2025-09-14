
import type { BlockCoordinates } from "./BlockCoordinates";
import type { UpdateBlockFlags } from "./UpdateBlockFlags";

export interface UpdateBlockSyncedPacket {
  position: BlockCoordinates;
  block_runtime_id: number;
  flags: UpdateBlockFlags;
  layer: number;
  entity_unique_id: number;
  transition_type: "entity" | "create" | "destroy";
}

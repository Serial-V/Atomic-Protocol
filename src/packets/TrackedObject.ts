
import type { BlockCoordinates } from "./BlockCoordinates";

export interface TrackedObject {
  type: "entity" | "block";
  entity_unique_id: number;
  block_position: BlockCoordinates;
}

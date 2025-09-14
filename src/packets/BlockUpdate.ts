
import type { BlockCoordinates } from "./BlockCoordinates";

export interface BlockUpdate {
  position: BlockCoordinates;
  runtime_id: number;
  flags: number;
  entity_unique_id: number;
  transition_type: "entity" | "create" | "destroy";
}

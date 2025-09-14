
import type { Varint64 } from "./varint64";
import type { Action } from "./Action";
import type { BlockCoordinates } from "./BlockCoordinates";

export interface PlayerActionPacket {
  runtime_entity_id: Varint64;
  action: Action;
  position: BlockCoordinates;
  result_position: BlockCoordinates;
  face: number;
}

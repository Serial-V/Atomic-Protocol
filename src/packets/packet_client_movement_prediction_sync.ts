
import type { Varint128 } from "./varint128";
import type { Varint64 } from "./varint64";

export interface ClientMovementPredictionSyncPacket {
  data_flags: Varint128;
  bounding_box: {  scale: number;
  width: number;
  height: number;};
  movement_speed: number;
  underwater_movement_speed: number;
  lava_movement_speed: number;
  jump_strength: number;
  health: number;
  hunger: number;
  entity_runtime_id: Varint64;
  is_flying: boolean;
}

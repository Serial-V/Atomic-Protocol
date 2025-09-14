
import type { Varint64 } from "./varint64";
import type { DeltaMoveFlags } from "./DeltaMoveFlags";

export interface MoveEntityDeltaPacket {
  runtime_entity_id: Varint64;
  flags: DeltaMoveFlags;
  x: number;
  y: number;
  z: number;
  rot_x: number;
  rot_y: number;
  rot_z: number;
}

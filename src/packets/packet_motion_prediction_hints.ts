
import type { Varint64 } from "./varint64";
import type { Vec3f } from "./vec3f";

export interface MotionPredictionHintsPacket {
  entity_runtime_id: Varint64;
  velocity: Vec3f;
  on_ground: boolean;
}

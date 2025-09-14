
import type { Varint64 } from "./varint64";
import type { Vec3f } from "./vec3f";

export interface SetEntityMotionPacket {
  runtime_entity_id: Varint64;
  velocity: Vec3f;
  tick: Varint64;
}

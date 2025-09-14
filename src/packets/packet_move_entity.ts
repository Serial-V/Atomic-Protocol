
import type { Varint64 } from "./varint64";
import type { Vec3f } from "./vec3f";
import type { Rotation } from "./Rotation";

export interface MoveEntityPacket {
  runtime_entity_id: Varint64;
  flags: number;
  position: Vec3f;
  rotation: Rotation;
}

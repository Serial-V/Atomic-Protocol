
import type { Vec3f } from "./vec3f";
import type { Varint64 } from "./varint64";

export interface RespawnPacket {
  position: Vec3f;
  state: number;
  runtime_entity_id: Varint64;
}

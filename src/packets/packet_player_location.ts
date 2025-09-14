
import type { Varint64 } from "./varint64";
import type { Vec3f } from "./vec3f";

export interface PlayerLocationPacket {
  type: "coordinates" | "type_hide";
  entity_unique_id: Varint64;
  position: Vec3f;
}

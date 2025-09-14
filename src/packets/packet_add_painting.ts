
import type { Varint64 } from "./varint64";
import type { Vec3f } from "./vec3f";

export interface AddPaintingPacket {
  entity_id_self: number;
  runtime_entity_id: Varint64;
  coordinates: Vec3f;
  direction: number;
  title: string;
}

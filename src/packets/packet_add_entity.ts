
import type { Varint64 } from "./varint64";
import type { Vec3f } from "./vec3f";
import type { EntityAttributes } from "./EntityAttributes";
import type { MetadataDictionary } from "./MetadataDictionary";
import type { EntityProperties } from "./EntityProperties";
import type { Links } from "./Links";

export interface AddEntityPacket {
  unique_id: number;
  runtime_id: Varint64;
  entity_type: string;
  position: Vec3f;
  velocity: Vec3f;
  pitch: number;
  yaw: number;
  head_yaw: number;
  body_yaw: number;
  attributes: EntityAttributes;
  metadata: MetadataDictionary;
  properties: EntityProperties;
  links: Links;
}

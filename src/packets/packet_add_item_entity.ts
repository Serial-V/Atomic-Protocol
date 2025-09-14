
import type { Varint64 } from "./varint64";
import type { Item } from "./Item";
import type { Vec3f } from "./vec3f";
import type { MetadataDictionary } from "./MetadataDictionary";

export interface AddItemEntityPacket {
  entity_id_self: number;
  runtime_entity_id: Varint64;
  item: Item;
  position: Vec3f;
  velocity: Vec3f;
  metadata: MetadataDictionary;
  is_from_fishing: boolean;
}

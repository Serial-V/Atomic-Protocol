
import type { Varint64 } from "./varint64";
import type { MetadataDictionary } from "./MetadataDictionary";
import type { EntityProperties } from "./EntityProperties";

export interface SetEntityDataPacket {
  runtime_entity_id: Varint64;
  metadata: MetadataDictionary;
  properties: EntityProperties;
  tick: Varint64;
}


import type { Varint64 } from "./varint64";
import type { Item } from "./Item";

export interface MobArmorEquipmentPacket {
  runtime_entity_id: Varint64;
  helmet: Item;
  chestplate: Item;
  leggings: Item;
  boots: Item;
  body: Item;
}

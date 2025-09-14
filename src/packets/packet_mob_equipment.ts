
import type { Varint64 } from "./varint64";
import type { Item } from "./Item";
import type { WindowID } from "./WindowID";

export interface MobEquipmentPacket {
  runtime_entity_id: Varint64;
  item: Item;
  slot: number;
  selected_slot: number;
  window_id: WindowID;
}

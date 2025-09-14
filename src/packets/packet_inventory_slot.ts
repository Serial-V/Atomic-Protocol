
import type { WindowIDVarint } from "./WindowIDVarint";
import type { FullContainerName } from "./FullContainerName";
import type { Item } from "./Item";

export interface InventorySlotPacket {
  window_id: WindowIDVarint;
  slot: number;
  container: FullContainerName;
  storage_item: Item;
  item: Item;
}

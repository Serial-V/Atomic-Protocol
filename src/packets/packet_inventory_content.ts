
import type { WindowIDVarint } from "./WindowIDVarint";
import type { ItemStacks } from "./ItemStacks";
import type { FullContainerName } from "./FullContainerName";
import type { Item } from "./Item";

export interface InventoryContentPacket {
  window_id: WindowIDVarint;
  input: ItemStacks;
  container: FullContainerName;
  storage_item: Item;
}

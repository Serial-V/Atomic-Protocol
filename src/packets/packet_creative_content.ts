
import type { ItemLegacy } from "./ItemLegacy";

export interface CreativeContentPacket {
  groups: {  category: "all" | "construction" | "nature" | "equipment" | "items" | "item_command_only";
  name: string;
  icon_item: ItemLegacy;}[];
  items: {  entry_id: number;
  item: ItemLegacy;
  group_index: number;}[];
}

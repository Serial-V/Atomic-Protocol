
import type { WindowID } from "./WindowID";
import type { Item } from "./Item";

export interface CraftingEventPacket {
  window_id: WindowID;
  recipe_type: "inventory" | "crafting" | "workbench";
  recipe_id: string;
  input: Item[];
  result: Item[];
}


import type { WindowIDVarint } from "./WindowIDVarint";
import type { Item } from "./Item";

export type TransactionActions = {  source_type: "container" | "global" | "world_interaction" | "creative" | "craft_slot" | "craft";
  undefined: {  inventory_id: WindowIDVarint;} | {  action: number;} | {  flags: number;} | {  action: number;};
  slot: number;
  old_item: Item;
  new_item: Item;}[];

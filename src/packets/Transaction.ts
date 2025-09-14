
import type { TransactionLegacy } from "./TransactionLegacy";
import type { TransactionActions } from "./TransactionActions";
import type { TransactionUseItem } from "./TransactionUseItem";
import type { Varint64 } from "./varint64";
import type { Item } from "./Item";
import type { Vec3f } from "./vec3f";

export interface Transaction {
  legacy: TransactionLegacy;
  transaction_type: "normal" | "inventory_mismatch" | "item_use" | "item_use_on_entity" | "item_release";
  actions: TransactionActions;
  transaction_data: void | void | TransactionUseItem | {  entity_runtime_id: Varint64;
  action_type: "interact" | "attack";
  hotbar_slot: number;
  held_item: Item;
  player_pos: Vec3f;
  click_pos: Vec3f;} | {  action_type: "release" | "consume";
  hotbar_slot: number;
  held_item: Item;
  head_pos: Vec3f;};
}

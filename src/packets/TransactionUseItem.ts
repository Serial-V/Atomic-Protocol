
import type { BlockCoordinates } from "./BlockCoordinates";
import type { Item } from "./Item";
import type { Vec3f } from "./vec3f";

export interface TransactionUseItem {
  action_type: "click_block" | "click_air" | "break_block";
  trigger_type: "unknown" | "player_input" | "simulation_tick";
  block_position: BlockCoordinates;
  face: number;
  hotbar_slot: number;
  held_item: Item;
  player_pos: Vec3f;
  click_pos: Vec3f;
  block_runtime_id: number;
  client_prediction: "failure" | "success";
}

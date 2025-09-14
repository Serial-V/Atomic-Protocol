
import type { StackRequestSlotInfo } from "./StackRequestSlotInfo";
import type { RecipeIngredient } from "./RecipeIngredient";
import type { ItemLegacy } from "./ItemLegacy";

export interface ItemStackRequest {
  request_id: number;
  actions: {  type_id: "take" | "place" | "swap" | "drop" | "destroy" | "consume" | "create" | "place_in_container" | "take_out_container" | "lab_table_combine" | "beacon_payment" | "mine_block" | "craft_recipe" | "craft_recipe_auto" | "craft_creative" | "optional" | "craft_grindstone_request" | "craft_loom_request" | "non_implemented" | "results_deprecated";
  undefined: {  count: number;
  source: StackRequestSlotInfo;
  destination: StackRequestSlotInfo;} | {  count: number;
  source: StackRequestSlotInfo;
  destination: StackRequestSlotInfo;} | {  count: number;
  source: StackRequestSlotInfo;
  destination: StackRequestSlotInfo;} | {  count: number;
  source: StackRequestSlotInfo;
  destination: StackRequestSlotInfo;} | {  source: StackRequestSlotInfo;
  destination: StackRequestSlotInfo;} | {  count: number;
  source: StackRequestSlotInfo;
  randomly: boolean;} | {  count: number;
  source: StackRequestSlotInfo;} | {  count: number;
  source: StackRequestSlotInfo;} | {  result_slot_id: number;} | {  primary_effect: number;
  secondary_effect: number;} | {  hotbar_slot: number;
  predicted_durability: number;
  network_id: number;} | {  recipe_network_id: number;
  times_crafted: number;} | {  recipe_network_id: number;
  times_crafted_2: number;
  times_crafted: number;
  ingredients: RecipeIngredient[];} | {  item_id: number;
  times_crafted: number;} | {  recipe_network_id: number;
  filtered_string_index: number;} | {  recipe_network_id: number;
  times_crafted: number;
  cost: number;} | {  pattern: string;
  times_crafted: number;} | void | {  result_items: ItemLegacy[];
  times_crafted: number;};}[];
  custom_names: string[];
  cause: "chat_public" | "chat_whisper" | "sign_text" | "anvil_text" | "book_and_quill_text" | "command_block_text" | "block_actor_data_text" | "join_event_text" | "leave_event_text" | "slash_command_chat" | "cartography_text" | "kick_command" | "title_command" | "summon_command";
}

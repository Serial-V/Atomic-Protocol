
export interface CompletedUsingItemPacket {
  used_item_id: number;
  use_method: "equip_armor" | "eat" | "attack" | "consume" | "throw" | "shoot" | "place" | "fill_bottle" | "fill_bucket" | "pour_bucket" | "use_tool" | "interact" | "retrieved" | "dyed" | "traded" | "brushing_completed" | "opened_vault";
}

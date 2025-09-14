
export interface UnlockedRecipesPacket {
  unlock_type: "empty" | "initially_unlocked" | "newly_unlocked" | "remove_unlocked" | "remove_all_unlocked";
  recipes: string[];
}

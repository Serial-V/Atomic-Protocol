
import type { RecipeIngredient } from "./RecipeIngredient";

export interface RecipeUnlockingRequirement {
  context: "none" | "always_unlocked" | "player_in_water" | "player_has_many_items";
  ingredients: RecipeIngredient[];
}

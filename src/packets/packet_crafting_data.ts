
import type { Recipes } from "./Recipes";
import type { PotionTypeRecipes } from "./PotionTypeRecipes";
import type { PotionContainerChangeRecipes } from "./PotionContainerChangeRecipes";
import type { MaterialReducer } from "./MaterialReducer";

export interface CraftingDataPacket {
  recipes: Recipes;
  potion_type_recipes: PotionTypeRecipes;
  potion_container_recipes: PotionContainerChangeRecipes;
  material_reducers: MaterialReducer[];
  clear_recipes: boolean;
}

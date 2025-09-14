
export interface RecipeIngredient {
  type: "invalid" | "int_id_meta" | "molang" | "item_tag" | "string_id_meta" | "complex_alias";
  undefined: {  network_id: number;
  metadata: void;} | {  expression: string;
  version: number;} | {  tag: string;} | {  name: string;
  metadata: number;} | {  name: string;};
  count: number;
}

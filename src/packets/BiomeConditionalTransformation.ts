
import type { BiomeWeight } from "./BiomeWeight";

export interface BiomeConditionalTransformation {
  weighted_biomes: BiomeWeight[];
  condition_json: number;
  min_passing_neighbours: number;
}


import type { BiomeWeight } from "./BiomeWeight";
import type { BiomeConditionalTransformation } from "./BiomeConditionalTransformation";
import type { BiomeTemperatureWeight } from "./BiomeTemperatureWeight";

export interface BiomeOverworldRules {
  hills_transformations: BiomeWeight[];
  mutate_transformations: BiomeWeight[];
  river_transformations: BiomeWeight[];
  shore_transformations: BiomeWeight[];
  pre_hills_edge_transformations: BiomeConditionalTransformation[];
  post_shore_edge_transformations: BiomeConditionalTransformation[];
  climate_transformations: BiomeTemperatureWeight[];
}

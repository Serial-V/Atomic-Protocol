
import type { BiomeChunkGeneration } from "./BiomeChunkGeneration";

export interface BiomeDefinition {
  name_index: number;
  biome_id: number;
  temperature: number;
  downfall: number;
  red_spore_density: number;
  blue_spore_density: number;
  ash_density: number;
  white_ash_density: number;
  depth: number;
  scale: number;
  map_water_colour: number;
  rain: boolean;
  tags: number[] | null;
  chunk_generation: BiomeChunkGeneration | null;
}

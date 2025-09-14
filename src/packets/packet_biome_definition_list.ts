
import type { BiomeDefinition } from "./BiomeDefinition";

export interface BiomeDefinitionListPacket {
  biome_definitions: BiomeDefinition[];
  string_list: string[];
}

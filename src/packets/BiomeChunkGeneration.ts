
import type { BiomeClimate } from "./BiomeClimate";
import type { BiomeConsolidatedFeature } from "./BiomeConsolidatedFeature";
import type { BiomeMountainParameters } from "./BiomeMountainParameters";
import type { BiomeElementData } from "./BiomeElementData";
import type { BiomeSurfaceMaterial } from "./BiomeSurfaceMaterial";
import type { BiomeMesaSurface } from "./BiomeMesaSurface";
import type { BiomeCappedSurface } from "./BiomeCappedSurface";
import type { BiomeOverworldRules } from "./BiomeOverworldRules";
import type { BiomeMultiNoiseRules } from "./BiomeMultiNoiseRules";
import type { BiomeConditionalTransformation } from "./BiomeConditionalTransformation";
import type { BiomeReplacementData } from "./BiomeReplacementData";

export interface BiomeChunkGeneration {
  climate: BiomeClimate | null;
  consolidated_features: BiomeConsolidatedFeature[] | null;
  mountain_parameters: BiomeMountainParameters | null;
  surface_material_adjustments: BiomeElementData[] | null;
  surface_materials: BiomeSurfaceMaterial | null;
  has_default_overworld_surface: boolean | null;
  has_swamp_surface: boolean;
  has_frozen_ocean_surface: boolean;
  has_end_surface: boolean;
  mesa_surface: BiomeMesaSurface | null;
  capped_surface: BiomeCappedSurface | null;
  overworld_rules: BiomeOverworldRules | null;
  multi_noise_rules: BiomeMultiNoiseRules | null;
  legacy_rules: BiomeConditionalTransformation[] | null;
  replacement_data: BiomeReplacementData | null;
}

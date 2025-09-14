
import type { BiomeSurfaceMaterial } from "./BiomeSurfaceMaterial";

export interface BiomeElementData {
  noise_frequency_scale: number;
  noise_lower_bound: number;
  noise_upper_bound: number;
  height_min_type: number;
  height_min: number;
  height_max_type: number;
  height_max: number;
  adjusted_materials: BiomeSurfaceMaterial;
}

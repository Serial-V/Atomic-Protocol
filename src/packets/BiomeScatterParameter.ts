
import type { BiomeCoordinate } from "./BiomeCoordinate";

export interface BiomeScatterParameter {
  coordinates: BiomeCoordinate[];
  evaluation_order: "xyz" | "xzy" | "yxz" | "yzx" | "zxy" | "zyx";
  chance_percent_type: number;
  chance_percent: number;
  chance_numerator: number;
  chance_denominator: number;
  iterations_type: number;
  iterations: number;
}


import type { BiomeScatterParameter } from "./BiomeScatterParameter";

export interface BiomeConsolidatedFeature {
  scatter: BiomeScatterParameter;
  feature: number;
  identifier: number;
  pass: number;
  can_use_internal: boolean;
}

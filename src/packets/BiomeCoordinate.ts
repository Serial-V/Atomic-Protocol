
export interface BiomeCoordinate {
  min_value_type: number;
  min_value: number;
  max_value_type: number;
  max_value: number;
  grid_offset: number;
  grid_step_size: number;
  distribution: "single_valued" | "uniform" | "gaussian" | "inverse_gaussian" | "fixed_grid" | "jittered_grid" | "triangle";
}

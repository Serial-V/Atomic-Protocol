
import type { BlockCoordinates } from "./BlockCoordinates";
import type { Vec3f } from "./vec3f";

export interface StructureBlockSettings {
  palette_name: string;
  ignore_entities: boolean;
  ignore_blocks: boolean;
  non_ticking_players_and_ticking_areas: boolean;
  size: BlockCoordinates;
  structure_offset: BlockCoordinates;
  last_editing_player_unique_id: number;
  rotation: "none" | "90_deg" | "180_deg" | "270_deg";
  mirror: "none" | "x_axis" | "z_axis" | "both_axes";
  animation_mode: "none" | "layers" | "blocks";
  animation_duration: number;
  integrity: number;
  seed: number;
  pivot: Vec3f;
}

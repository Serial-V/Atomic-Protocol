
import type { Vec3fopts } from "./Vec3fopts";
import type { Vec2fopts } from "./Vec2fopts";
import type { Vec2f } from "./vec2f";
import type { Vec3f } from "./vec3f";

export interface CameraPresets {
  name: string;
  parent: string;
  position: Vec3fopts;
  rotation: Vec2fopts;
  rotation_speed: number | null;
  snap_to_target: boolean | null;
  horizontal_rotation_limit: Vec2f | null;
  vertical_rotation_limit: Vec2f | null;
  continue_targeting: boolean | null;
  tracking_radius: number | null;
  offset: Vec2f | null;
  entity_offset: Vec3f | null;
  radius: number | null;
  yaw_limit_min: number | null;
  yaw_limit_max: number | null;
  audio_listener: number | null;
  player_effects: boolean | null;
  aim_assist: {  preset_id: string | null;
  target_mode: "angle" | "distance" | null;
  angle: Vec2f | null;
  distance: number | null;} | null;
  control_scheme: "locked_player_relative_strafe" | "camera_relative" | "camera_relative_strafe" | "player_relative" | "player_relative_strafe" | null;
}

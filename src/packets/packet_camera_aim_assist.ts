
import type { Vec2f } from "./vec2f";

export interface CameraAimAssistPacket {
  preset_id: string;
  view_angle: Vec2f;
  distance: number;
  target_mode: "angle" | "distance";
  action: "set" | "clear";
  show_debug_render: boolean;
}

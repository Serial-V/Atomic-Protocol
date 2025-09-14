
import type { Vec3f } from "./vec3f";
import type { Vec2f } from "./vec2f";

export interface CameraInstructionPacket {
  instruction_set: {  runtime_id: number;
  ease_data: {  type: "Linear" | "Spring" | "InQuad" | "OutQuad" | "InOutQuad" | "InCubic" | "OutCubic" | "InOutCubic" | "InQuart" | "OutQuart" | "InOutQuart" | "InQuint" | "OutQuint" | "InOutQuint" | "InSine" | "OutSine" | "InOutSine" | "InExpo" | "OutExpo" | "InOutExpo" | "InCirc" | "OutCirc" | "InOutCirc" | "InBounce" | "OutBounce" | "InOutBounce" | "InBack" | "OutBack" | "InOutBack" | "InElastic" | "OutElastic" | "InOutElastic";
  duration: number;} | null;
  position: Vec3f | null;
  rotation: Vec2f | null;
  facing: Vec3f | null;
  offset: Vec2f | null;
  entity_offset: Vec3f | null;
  default: boolean | null;
  remove_ignore_starting_values: boolean;} | null;
  clear: boolean | null;
  fade: {  fade_in_duration: number;
  wait_duration: number;
  fade_out_duration: number;
  color_rgb: Vec3f;} | null;
  target: {  offset: Vec3f | null;
  entity_unique_id: number;} | null;
  remove_target: boolean | null;
}

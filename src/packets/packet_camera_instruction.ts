
import type { EaseType } from "./EaseType";
import type { Vec3f } from "./vec3f";
import type { Vec2f } from "./vec2f";
import type { CameraSplineInstruction } from "./CameraSplineInstruction";
import type { CameraAttachToEntityInstruction } from "./CameraAttachToEntityInstruction";

export interface CameraInstructionPacket {
  instruction_set: {  runtime_id: number;
  ease_data: {  type: EaseType;
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
  fov: {  field_of_view: number;
  ease_time: number;
  ease_type: EaseType;
  clear: boolean;} | null;
  spline_instruction: CameraSplineInstruction | null;
  attach_instruction: CameraAttachToEntityInstruction | null;
  detach_from_entity: boolean | null;
}

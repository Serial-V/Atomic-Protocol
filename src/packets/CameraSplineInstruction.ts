import type { CameraSplineType } from "./CameraSplineType";
import type { Vec3f } from "./vec3f";
import type { Vec2f } from "./vec2f";
import type { CameraSplineRotationOption } from "./CameraSplineRotationOption";

export interface CameraSplineInstruction {
  total_time: number;
  type: CameraSplineType;
  curve: Vec3f[];
  progress_key_frames: Vec2f[];
  rotation_option: CameraSplineRotationOption[];
}

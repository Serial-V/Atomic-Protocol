
import type { Vec3f } from "./vec3f";

export interface DebugRendererPacket {
  type: "clear" | "add_cube";
  undefined: void | {  text: string;
  position: Vec3f;
  red: number;
  green: number;
  blue: number;
  alpha: number;
  duration: number;};
}


import type { Vec3i } from "./vec3i";

export interface LabTablePacket {
  action_type: "combine" | "react" | "reset";
  position: Vec3i;
  reaction_type: number;
}

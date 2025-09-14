
import type { Vec3i } from "./vec3i";

export interface LecternUpdatePacket {
  page: number;
  page_count: number;
  position: Vec3i;
}

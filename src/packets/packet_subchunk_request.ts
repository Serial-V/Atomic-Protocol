
import type { Vec3i } from "./vec3i";

export interface SubchunkRequestPacket {
  dimension: number;
  origin: Vec3i;
  requests: {  dx: number;
  dy: number;
  dz: number;}[];
}


import type { Vec3f } from "./vec3f";

export interface ChangeDimensionPacket {
  dimension: number;
  position: Vec3f;
  respawn: boolean;
  loading_screen_id: number | null;
}


import type { UpdateMapFlags } from "./UpdateMapFlags";
import type { Vec3i } from "./vec3i";
import type { TrackedObject } from "./TrackedObject";
import type { MapDecoration } from "./MapDecoration";

export interface ClientboundMapItemDataPacket {
  map_id: number;
  update_flags: UpdateMapFlags;
  dimension: number;
  locked: boolean;
  origin: Vec3i;
  included_in: number[];
  scale: number;
  tracked: {  objects: TrackedObject[];
  decorations: MapDecoration[];};
  texture: {  width: number;
  height: number;
  x_offset: number;
  y_offset: number;
  pixels: number[];};
}


import type { Vec3i } from "./vec3i";
import type { SubChunkEntryWithCaching } from "./SubChunkEntryWithCaching";
import type { SubChunkEntryWithoutCaching } from "./SubChunkEntryWithoutCaching";

export interface SubchunkPacket {
  cache_enabled: boolean;
  dimension: number;
  origin: Vec3i;
  entries: SubChunkEntryWithCaching | SubChunkEntryWithoutCaching;
}

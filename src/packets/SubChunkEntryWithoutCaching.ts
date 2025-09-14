
import type { ByteArray } from "./ByteArray";
import type { HeightMapDataType } from "./HeightMapDataType";

export type SubChunkEntryWithoutCaching = {  dx: number;
  dy: number;
  dz: number;
  result: "undefined" | "success" | "chunk_not_found" | "invalid_dimension" | "player_not_found" | "y_index_out_of_bounds" | "success_all_air";
  payload: ByteArray;
  heightmap_type: HeightMapDataType;
  heightmap: any;
  render_heightmap_type: HeightMapDataType;
  render_heightmap: any;}[];

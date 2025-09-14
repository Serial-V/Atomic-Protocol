
import type { ByteArray } from "./ByteArray";

export interface ResourcePackDataInfoPacket {
  pack_id: string;
  max_chunk_size: number;
  chunk_count: number;
  size: number;
  hash: ByteArray;
  is_premium: boolean;
  pack_type: "addon" | "cached" | "copy_protected" | "behavior" | "persona_piece" | "resources" | "skins" | "world_template";
}

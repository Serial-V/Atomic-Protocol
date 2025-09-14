
import type { Varint64 } from "./varint64";

export interface AnimateEntityPacket {
  animation: string;
  next_state: string;
  stop_condition: string;
  stop_condition_version: number;
  controller: string;
  blend_out_time: number;
  runtime_entity_ids: Varint64[];
}

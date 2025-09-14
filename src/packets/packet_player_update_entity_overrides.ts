
import type { Varint64 } from "./varint64";

export interface PlayerUpdateEntityOverridesPacket {
  runtime_id: Varint64;
  property_index: number;
  type: "clear_all" | "remove" | "set_int" | "set_float";
  value: number | number;
}

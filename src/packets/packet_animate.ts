
import type { Varint64 } from "./varint64";

export interface AnimatePacket {
  action_id: "none" | "swing_arm" | "unknown" | "wake_up" | "critical_hit" | "magic_critical_hit" | "row_right" | "row_left";
  runtime_entity_id: Varint64;
  undefined: {  boat_rowing_time: number;} | {  boat_rowing_time: number;};
}

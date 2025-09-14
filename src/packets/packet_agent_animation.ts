
import type { Varint64 } from "./varint64";

export interface AgentAnimationPacket {
  animation: "arm_swing" | "shrug";
  entity_runtime_id: Varint64;
}

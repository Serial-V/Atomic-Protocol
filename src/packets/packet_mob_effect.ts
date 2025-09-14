
import type { Varint64 } from "./varint64";

export interface MobEffectPacket {
  runtime_entity_id: Varint64;
  event_id: "add" | "update" | "remove";
  effect_id: number;
  amplifier: number;
  particles: boolean;
  duration: number;
  tick: Varint64;
}

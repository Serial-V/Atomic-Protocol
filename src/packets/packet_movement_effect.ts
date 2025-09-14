
import type { Varint64 } from "./varint64";
import type { MovementEffectType } from "./MovementEffectType";

export interface MovementEffectPacket {
  runtime_id: Varint64;
  effect_type: MovementEffectType;
  effect_duration: number;
  tick: Varint64;
}

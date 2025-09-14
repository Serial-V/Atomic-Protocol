
import type { Vec3f } from "./vec3f";
import type { Vec2f } from "./vec2f";
import type { Varint64 } from "./varint64";

export interface CorrectPlayerMovePredictionPacket {
  prediction_type: "player" | "vehicle";
  position: Vec3f;
  delta: Vec3f;
  rotation: Vec2f;
  angular_velocity: number | null;
  on_ground: boolean;
  tick: Varint64;
}

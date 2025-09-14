
import type { Vec3f } from "./vec3f";
import type { LegacyEntityType } from "./LegacyEntityType";
import type { Varint64 } from "./varint64";

export interface MovePlayerPacket {
  runtime_id: number;
  position: Vec3f;
  pitch: number;
  yaw: number;
  head_yaw: number;
  mode: "normal" | "reset" | "teleport" | "rotation";
  on_ground: boolean;
  ridden_runtime_id: number;
  teleport: {  cause: "unknown" | "projectile" | "chorus_fruit" | "command" | "behavior";
  source_entity_type: LegacyEntityType;};
  tick: Varint64;
}

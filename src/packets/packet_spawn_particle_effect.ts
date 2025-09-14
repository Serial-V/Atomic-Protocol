
import type { Vec3f } from "./vec3f";

export interface SpawnParticleEffectPacket {
  dimension: number;
  entity_id: number;
  position: Vec3f;
  particle_name: string;
  molang_variables: string | null;
}

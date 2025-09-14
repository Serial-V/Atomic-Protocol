
import type { Vec3f } from "./vec3f";

export interface LevelSoundEventV2Packet {
  sound_id: number;
  position: Vec3f;
  block_id: number;
  entity_type: string;
  is_baby_mob: boolean;
  is_global: boolean;
}

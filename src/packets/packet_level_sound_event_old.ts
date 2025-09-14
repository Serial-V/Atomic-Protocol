
import type { Vec3f } from "./vec3f";

export interface LevelSoundEventOldPacket {
  sound_id: number;
  position: Vec3f;
  block_id: number;
  entity_type: number;
  is_baby_mob: boolean;
  is_global: boolean;
}

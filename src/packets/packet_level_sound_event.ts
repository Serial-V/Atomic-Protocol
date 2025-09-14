
import type { SoundType } from "./SoundType";
import type { Vec3f } from "./vec3f";

export interface LevelSoundEventPacket {
  sound_id: SoundType;
  position: Vec3f;
  extra_data: number;
  entity_type: string;
  is_baby_mob: boolean;
  is_global: boolean;
  entity_unique_id: number;
}

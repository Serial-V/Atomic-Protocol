
import type { ArmorDamageType } from "./ArmorDamageType";

export interface PlayerArmorDamagePacket {
  type: ArmorDamageType;
  helmet_damage: number;
  chestplate_damage: number;
  leggings_damage: number;
  boots_damage: number;
  body_damage: number;
}

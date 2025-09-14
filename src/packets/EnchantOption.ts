
import type { Enchant } from "./Enchant";

export interface EnchantOption {
  cost: number;
  slot_flags: number;
  equip_enchants: Enchant[];
  held_enchants: Enchant[];
  self_enchants: Enchant[];
  name: string;
  option_id: number;
}


import type { Lnbt } from "./lnbt";
import type { ShortString } from "./ShortString";

export interface ItemExtraDataWithBlockingTick {
  has_nbt: "false" | "true";
  nbt: {  version: number;
  nbt: Lnbt;};
  can_place_on: ShortString[];
  can_destroy: ShortString[];
  blocking_tick: number;
}

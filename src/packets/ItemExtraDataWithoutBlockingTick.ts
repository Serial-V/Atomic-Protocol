
import type { Lnbt } from "./lnbt";
import type { ShortString } from "./ShortString";

export interface ItemExtraDataWithoutBlockingTick {
  has_nbt: "false" | "true";
  nbt: {  version: number;
  nbt: Lnbt;};
  can_place_on: ShortString[];
  can_destroy: ShortString[];
}

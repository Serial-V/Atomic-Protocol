
import type { WindowID } from "./WindowID";
import type { WindowType } from "./WindowType";
import type { Nbt } from "./nbt";

export interface UpdateEquipmentPacket {
  window_id: WindowID;
  window_type: WindowType;
  size: number;
  entity_id: number;
  inventory: Nbt;
}

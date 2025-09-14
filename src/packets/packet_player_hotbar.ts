
import type { WindowID } from "./WindowID";

export interface PlayerHotbarPacket {
  selected_slot: number;
  window_id: WindowID;
  select_slot: boolean;
}

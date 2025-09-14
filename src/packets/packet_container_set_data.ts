
import type { WindowID } from "./WindowID";

export interface ContainerSetDataPacket {
  window_id: WindowID;
  property: number;
  value: number;
}


import type { WindowID } from "./WindowID";
import type { WindowType } from "./WindowType";

export interface ContainerClosePacket {
  window_id: WindowID;
  window_type: WindowType;
  server: boolean;
}


import type { DisconnectFailReason } from "./DisconnectFailReason";

export interface DisconnectPacket {
  reason: DisconnectFailReason;
  hide_disconnect_reason: boolean;
  undefined: void;
}

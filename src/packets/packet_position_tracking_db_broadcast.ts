
import type { Nbt } from "./nbt";

export interface PositionTrackingDbBroadcastPacket {
  broadcast_action: "update" | "destory" | "not_found";
  tracking_id: number;
  nbt: Nbt;
}

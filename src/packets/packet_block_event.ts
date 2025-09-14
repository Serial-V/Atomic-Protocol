
import type { BlockCoordinates } from "./BlockCoordinates";

export interface BlockEventPacket {
  position: BlockCoordinates;
  type: "sound" | "change_state";
  data: number;
}

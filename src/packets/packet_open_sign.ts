
import type { BlockCoordinates } from "./BlockCoordinates";

export interface OpenSignPacket {
  position: BlockCoordinates;
  is_front: boolean;
}

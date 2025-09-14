
import type { BlockCoordinates } from "./BlockCoordinates";

export interface AnvilDamagePacket {
  damage: number;
  position: BlockCoordinates;
}

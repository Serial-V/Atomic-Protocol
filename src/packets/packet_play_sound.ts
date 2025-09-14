
import type { BlockCoordinates } from "./BlockCoordinates";

export interface PlaySoundPacket {
  name: string;
  coordinates: BlockCoordinates;
  volume: number;
  pitch: number;
}

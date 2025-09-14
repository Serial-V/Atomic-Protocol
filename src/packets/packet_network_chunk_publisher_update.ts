
import type { BlockCoordinates } from "./BlockCoordinates";

export interface NetworkChunkPublisherUpdatePacket {
  coordinates: BlockCoordinates;
  radius: number;
  saved_chunks: {  x: number;
  z: number;}[];
}

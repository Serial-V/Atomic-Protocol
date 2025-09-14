
import type { BlockCoordinates } from "./BlockCoordinates";
import type { Nbt } from "./nbt";

export interface BlockEntityDataPacket {
  position: BlockCoordinates;
  nbt: Nbt;
}

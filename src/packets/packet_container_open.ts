
import type { WindowID } from "./WindowID";
import type { WindowType } from "./WindowType";
import type { BlockCoordinates } from "./BlockCoordinates";

export interface ContainerOpenPacket {
  window_id: WindowID;
  window_type: WindowType;
  coordinates: BlockCoordinates;
  runtime_entity_id: number;
}

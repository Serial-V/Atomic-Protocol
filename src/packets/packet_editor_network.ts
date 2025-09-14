
import type { Nbt } from "./nbt";

export interface EditorNetworkPacket {
  route_to_manager: boolean;
  payload: Nbt;
}

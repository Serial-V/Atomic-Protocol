
import type { Skin } from "./Skin";

export interface PlayerSkinPacket {
  uuid: string;
  skin: Skin;
  skin_name: string;
  old_skin_name: string;
  is_verified: boolean;
}

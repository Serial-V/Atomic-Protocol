
import type { TexturePackInfos } from "./TexturePackInfos";

export interface ResourcePacksInfoPacket {
  must_accept: boolean;
  has_addons: boolean;
  has_scripts: boolean;
  disable_vibrant_visuals: boolean;
  world_template: {  uuid: string;
  version: string;};
  texture_packs: TexturePackInfos;
}

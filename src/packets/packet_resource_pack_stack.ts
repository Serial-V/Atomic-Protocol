
import type { ResourcePackIdVersions } from "./ResourcePackIdVersions";
import type { Experiments } from "./Experiments";

export interface ResourcePackStackPacket {
  must_accept: boolean;
  behavior_packs: ResourcePackIdVersions;
  resource_packs: ResourcePackIdVersions;
  game_version: string;
  experiments: Experiments;
  experiments_previously_used: boolean;
  has_editor_packs: boolean;
}

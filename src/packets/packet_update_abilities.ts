
import type { PermissionLevel } from "./PermissionLevel";
import type { CommandPermissionLevel } from "./CommandPermissionLevel";
import type { AbilityLayers } from "./AbilityLayers";

export interface UpdateAbilitiesPacket {
  entity_unique_id: number;
  permission_level: PermissionLevel;
  command_permission: CommandPermissionLevel;
  abilities: AbilityLayers[];
}

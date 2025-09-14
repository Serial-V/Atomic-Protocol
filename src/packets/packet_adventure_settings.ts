
import type { AdventureFlags } from "./AdventureFlags";
import type { CommandPermissionLevelVarint } from "./CommandPermissionLevelVarint";
import type { ActionPermissions } from "./ActionPermissions";
import type { PermissionLevel } from "./PermissionLevel";

export interface AdventureSettingsPacket {
  flags: AdventureFlags;
  command_permission: CommandPermissionLevelVarint;
  action_permissions: ActionPermissions;
  permission_level: PermissionLevel;
  custom_stored_permissions: number;
  user_id: number;
}

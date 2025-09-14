
import type { PermissionLevel } from "./PermissionLevel";
import type { RequestPermissions } from "./RequestPermissions";

export interface RequestPermissionsPacket {
  entity_unique_id: number;
  permission_level: PermissionLevel;
  requested_permissions: RequestPermissions;
}

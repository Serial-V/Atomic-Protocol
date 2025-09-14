
import type { Varint64 } from "./varint64";
import type { Vec3f } from "./vec3f";
import type { Item } from "./Item";
import type { GameMode } from "./GameMode";
import type { MetadataDictionary } from "./MetadataDictionary";
import type { EntityProperties } from "./EntityProperties";
import type { PermissionLevel } from "./PermissionLevel";
import type { CommandPermissionLevel } from "./CommandPermissionLevel";
import type { AbilityLayers } from "./AbilityLayers";
import type { Links } from "./Links";
import type { DeviceOS } from "./DeviceOS";

export interface AddPlayerPacket {
  uuid: string;
  username: string;
  runtime_id: Varint64;
  platform_chat_id: string;
  position: Vec3f;
  velocity: Vec3f;
  pitch: number;
  yaw: number;
  head_yaw: number;
  held_item: Item;
  gamemode: GameMode;
  metadata: MetadataDictionary;
  properties: EntityProperties;
  unique_id: number;
  permission_level: PermissionLevel;
  command_permission: CommandPermissionLevel;
  abilities: AbilityLayers[];
  links: Links;
  device_id: string;
  device_os: DeviceOS;
}

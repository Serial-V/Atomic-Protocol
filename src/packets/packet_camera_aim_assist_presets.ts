
export interface CameraAimAssistPresetsPacket {
  categories: {  name: string;
  entity_priorities: {  id: string;
  priority: number;}[];
  block_priorities: {  id: string;
  priority: number;}[];
  entity_default: number | null;
  block_default: number | null;}[];
  presets: {  id: string;
  exclude_blocks: string[];
  target_liquids: string[];
  item_settings: {  id: string;
  category: string;}[];
  default_item_settings: string | null;
  hand_settings: string | null;}[];
  operation: "set" | "add_to_existing";
}

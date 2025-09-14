
import type { BlockCoordinates } from "./BlockCoordinates";
import type { StructureBlockSettings } from "./StructureBlockSettings";

export interface StructureBlockUpdatePacket {
  position: BlockCoordinates;
  structure_name: string;
  filtered_structure_name: string;
  data_field: string;
  include_players: boolean;
  show_bounding_box: boolean;
  structure_block_type: number;
  settings: StructureBlockSettings;
  redstone_save_mode: number;
  should_trigger: boolean;
  water_logged: boolean;
}

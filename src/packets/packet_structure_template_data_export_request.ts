
import type { BlockCoordinates } from "./BlockCoordinates";
import type { StructureBlockSettings } from "./StructureBlockSettings";

export interface StructureTemplateDataExportRequestPacket {
  name: string;
  position: BlockCoordinates;
  settings: StructureBlockSettings;
  request_type: "export_from_save" | "export_from_load" | "query_saved_structure" | "import_from_save";
}


import type { Nbt } from "./nbt";

export interface StructureTemplateDataExportResponsePacket {
  name: string;
  success: boolean;
  nbt: Nbt;
  response_type: "export" | "query" | "import";
}

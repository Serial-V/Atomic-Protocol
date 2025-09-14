
export interface DimensionDataPacket {
  definitions: {  id: string;
  max_height: number;
  min_height: number;
  generator: "legacy" | "overworld" | "flat" | "nether" | "end" | "void";}[];
}

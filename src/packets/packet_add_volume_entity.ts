
import type { Varint64 } from "./varint64";
import type { Nbt } from "./nbt";
import type { BlockCoordinates } from "./BlockCoordinates";

export interface AddVolumeEntityPacket {
  runtime_id: Varint64;
  nbt: Nbt;
  encoding_identifier: string;
  instance_name: string;
  bounds: {  min: BlockCoordinates;
  max: BlockCoordinates;};
  dimension: number;
  engine_version: string;
}

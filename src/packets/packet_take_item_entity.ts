
import type { Varint64 } from "./varint64";

export interface TakeItemEntityPacket {
  runtime_entity_id: Varint64;
  target: number;
}

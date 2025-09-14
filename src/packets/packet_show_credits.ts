
import type { Varint64 } from "./varint64";

export interface ShowCreditsPacket {
  runtime_entity_id: Varint64;
  status: number;
}

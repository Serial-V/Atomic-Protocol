
import type { Varint64 } from "./varint64";
import type { PlayerAttributes } from "./PlayerAttributes";

export interface UpdateAttributesPacket {
  runtime_entity_id: Varint64;
  attributes: PlayerAttributes;
  tick: Varint64;
}

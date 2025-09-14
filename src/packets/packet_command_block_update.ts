
import type { BlockCoordinates } from "./BlockCoordinates";
import type { Varint64 } from "./varint64";

export interface CommandBlockUpdatePacket {
  is_block: boolean;
  undefined: {  position: BlockCoordinates;
  mode: "impulse" | "repeat" | "chain";
  needs_redstone: boolean;
  conditional: boolean;} | {  minecart_entity_runtime_id: Varint64;};
  command: string;
  last_output: string;
  name: string;
  filtered_name: string;
  should_track_output: boolean;
  tick_delay: number;
  execute_on_first_tick: boolean;
}

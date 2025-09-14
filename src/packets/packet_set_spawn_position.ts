
import type { BlockCoordinates } from "./BlockCoordinates";

export interface SetSpawnPositionPacket {
  spawn_type: "player" | "world";
  player_position: BlockCoordinates;
  dimension: number;
  world_position: BlockCoordinates;
}

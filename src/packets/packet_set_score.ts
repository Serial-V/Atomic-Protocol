
export interface SetScorePacket {
  action: "change" | "remove";
  entries: {  scoreboard_id: number;
  objective_name: string;
  score: number;
  undefined: {  entry_type: "player" | "entity" | "fake_player";
  entity_unique_id: number | number;
  custom_name: string;};}[];
}

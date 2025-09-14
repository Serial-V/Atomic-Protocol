
export interface SetScoreboardIdentityPacket {
  action: "register_identity" | "clear_identity";
  entries: {  scoreboard_id: number;
  entity_unique_id: number;}[];
}

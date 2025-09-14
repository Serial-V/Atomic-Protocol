
export interface CommandOrigin {
  type: "player" | "block" | "minecart_block" | "dev_console" | "test" | "automation_player" | "client_automation" | "dedicated_server" | "entity" | "virtual" | "game_argument" | "entity_server" | "precompiled" | "game_director_entity_server" | "script" | "executor";
  uuid: string;
  request_id: string;
  player_entity_id: {  player_entity_id: number;} | {  player_entity_id: number;};
}


export interface BossEventPacket {
  boss_entity_id: number;
  type: "show_bar" | "register_player" | "hide_bar" | "unregister_player" | "set_bar_progress" | "set_bar_title" | "update_properties" | "texture" | "query";
  undefined: {  title: string;
  filtered_title: string;
  progress: number;
  screen_darkening: number;
  color: number;
  overlay: number;} | {  player_id: number;} | {  player_id: number;} | {  player_id: number;} | {  progress: number;} | {  title: string;
  filtered_title: string;} | {  screen_darkening: number;
  color: number;
  overlay: number;} | {  color: number;
  overlay: number;};
}

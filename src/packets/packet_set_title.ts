
export interface SetTitlePacket {
  type: "clear" | "reset" | "set_title" | "set_subtitle" | "action_bar_message" | "set_durations" | "set_title_json" | "set_subtitle_json" | "action_bar_message_json";
  text: string;
  fade_in_time: number;
  stay_time: number;
  fade_out_time: number;
  xuid: string;
  platform_online_id: string;
  filtered_message: string;
}

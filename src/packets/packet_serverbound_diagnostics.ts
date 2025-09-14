
export interface ServerboundDiagnosticsPacket {
  average_frames_per_second: number;
  average_server_sim_tick_time: number;
  average_client_sim_tick_time: number;
  average_begin_frame_time: number;
  average_input_time: number;
  average_render_time: number;
  average_end_frame_time: number;
  average_remainder_time_percent: number;
  average_unaccounted_time_percent: number;
}


export interface VideoStreamConnectPacket {
  server_uri: string;
  frame_send_frequency: number;
  action: "none" | "close";
  resolution_x: number;
  resolution_y: number;
}

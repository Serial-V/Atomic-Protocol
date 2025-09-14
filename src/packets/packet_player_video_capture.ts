
export interface PlayerVideoCapturePacket {
  action: "stop" | "start";
  undefined: {  frame_rate: number;
  file_prefix: string;};
}

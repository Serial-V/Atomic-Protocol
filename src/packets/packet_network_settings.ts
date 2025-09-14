
export interface NetworkSettingsPacket {
  compression_threshold: number;
  compression_algorithm: "deflate" | "snappy";
  client_throttle: boolean;
  client_throttle_threshold: number;
  client_throttle_scalar: number;
}


export interface CameraShakePacket {
  intensity: number;
  duration: number;
  type: number;
  action: "add" | "stop";
}


export interface ClientCameraAimAssistPacket {
  preset_id: string;
  action: "set_from_camera_preset" | "clear";
  allow_aim_assist: boolean;
}

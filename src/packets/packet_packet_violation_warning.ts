
export interface PacketViolationWarningPacket {
  violation_type: "malformed";
  severity: "warning" | "final_warning" | "terminating";
  packet_id: number;
  reason: string;
}

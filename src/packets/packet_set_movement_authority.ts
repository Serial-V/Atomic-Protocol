
export interface SetMovementAuthorityPacket {
  movement_authority: "client" | "server" | "server_with_rewind";
}

export interface DisconnectPacket {
    reason: "server_id_conflict" | "unexpected_packet" | "unrecoverable_error" | "server_full" | "kicked";
    hide_disconnect_reason: boolean;
    message: string;
    filtered_message: string;
}

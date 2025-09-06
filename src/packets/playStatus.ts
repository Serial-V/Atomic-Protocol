type StatusStrings = "login_success" | "player_spawn" | "failed_client" | "failed_spawn";

export interface PlayStatusPacket {
    status: StatusStrings;
}
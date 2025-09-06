export interface AddPlayerPacket {
    uuid: string;
    username: string;
    runtime_id: BigInt;
    platform_chat_id: string;
    position: {
        x: number;
        y: number;
        z: number;
    },
    velocity: {
        x: number;
        y: number;
        z: number;
    },
    pitch: number;
    yaw: number;
    head_yaw: number;
    held_item: null;
    gamemode: string;
    metadata: null;
    links: [];
    device_id: string;
    device_os: string;
    permission_level: string;
}
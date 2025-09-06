export interface PlayerlistPacket {
    records: Records;
}

interface AddRecord {
    uuid: string;
    entity_unique_id: BigInt;
    username: string;
    xbox_user_id: string;
    platform_chat_id: string;
    build_platform: number;
    skin_data: {
        skin_id: string;
        play_fab_id: string;
        skin_resource_pack: string;
        skin_data: {
            width: number;
            height: number;
            data: Buffer;
        },
        animations: null;
        cape_data: null;
        geometry_data: string;
        geometry_data_version: string;
        animation_data: string;
        cape_id: string;
        full_skin_id: string;
        arm_size: string;
        skin_color: string;
        personal_pieces: null;
        premium: boolean;
        persona: boolean;
        cape_on_classic: boolean;
        primary_user: boolean;
        overriding_player_appearance: boolean;
    };
    is_teacher: boolean;
    is_host: boolean;
    is_subclient: boolean;
    player_color: number;
}

interface RemoveRecord {
    uuid: string;
}

interface AddRecords {
    type: "add";
    records_count: number;
    records: AddRecord[];
}

interface RemoveRecords {
    type: "remove";
    records_count: number;
    records: RemoveRecord[];
}

type Records = AddRecords | RemoveRecords;
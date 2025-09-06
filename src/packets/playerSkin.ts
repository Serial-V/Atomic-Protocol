export interface PlayerSkinPacket {
    uuid: string;
    skin: {
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
    },
    skin_name: string;
    old_skin_name: string;
    is_verified: boolean;
}
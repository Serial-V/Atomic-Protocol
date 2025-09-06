export interface CommandPacket {
    origin: {
        type: string;
        uuid: string;
        request_id: string;
        player_entity_id: undefined;
    };
    output_type: string;
    success_count: number;
    output: {
        success: boolean;
        message_id: string;
        parameters: [];
    }[];
    data_set: undefined;
}
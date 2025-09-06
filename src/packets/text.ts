export interface TextPacket {
    type: "chat" | "json" | "announcement" | "json_whisper" | "whisper" | "translation";
    needs_translation: boolean;
    source_name: string;
    message: string;
    parameters: Array<string> | undefined,
    xuid: string;
    platform_chat_id: string;
    filtered_message: string;
}
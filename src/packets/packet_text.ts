
export interface TextPacket {
  type: "raw" | "chat" | "translation" | "popup" | "jukebox_popup" | "tip" | "system" | "whisper" | "announcement" | "json_whisper" | "json" | "json_announcement";
  needs_translation: boolean;
  undefined: {  source_name: string;
  message: string;} | {  source_name: string;
  message: string;} | {  source_name: string;
  message: string;} | {  message: string;} | {  message: string;} | {  message: string;} | {  message: string;} | {  message: string;} | {  message: string;} | {  message: string;
  parameters: string[];} | {  message: string;
  parameters: string[];} | {  message: string;
  parameters: string[];};
  xuid: string;
  platform_chat_id: string;
  filtered_message: string;
}

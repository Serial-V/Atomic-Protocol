
import type { Skin } from "./Skin";

export interface PlayerRecords {
  type: "add" | "remove";
  records_count: number;
  records: {  uuid: string;
  entity_unique_id: number;
  username: string;
  xbox_user_id: string;
  platform_chat_id: string;
  build_platform: number;
  skin_data: Skin;
  is_teacher: boolean;
  is_host: boolean;
  is_subclient: boolean;
  player_color: number;} | {  uuid: string;}[];
  verified: boolean[];
}

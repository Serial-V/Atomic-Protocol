
import type { CommandOrigin } from "./CommandOrigin";

export interface CommandOutputPacket {
  origin: CommandOrigin;
  output_type: "last" | "silent" | "all" | "data_set";
  success_count: number;
  output: {  success: boolean;
  message_id: string;
  parameters: string[];}[];
  data_set: string;
}

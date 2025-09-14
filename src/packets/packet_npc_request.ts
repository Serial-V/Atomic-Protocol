
import type { Varint64 } from "./varint64";

export interface NpcRequestPacket {
  runtime_entity_id: Varint64;
  request_type: "set_actions" | "execute_action" | "execute_closing_commands" | "set_name" | "set_skin" | "set_interaction_text" | "execute_opening_commands";
  command: string;
  action_type: "set_actions" | "execute_action" | "execute_closing_commands" | "set_name" | "set_skin" | "set_interact_text" | "execute_opening_commands";
  scene_name: string;
}

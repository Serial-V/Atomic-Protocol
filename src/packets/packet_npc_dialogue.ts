
export interface NpcDialoguePacket {
  entity_id: number;
  action_type: "open" | "close";
  dialogue: string;
  screen_name: string;
  npc_name: string;
  action_json: string;
}

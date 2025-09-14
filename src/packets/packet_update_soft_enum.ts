
export interface UpdateSoftEnumPacket {
  enum_type: string;
  options: string[];
  action_type: "add" | "remove" | "update";
}

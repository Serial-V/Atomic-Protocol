
export interface CodeBuilderSourcePacket {
  operation: "none" | "get" | "set" | "reset";
  category: "none" | "code_status" | "instantiation";
  code_status: "none" | "not_started" | "in_progress" | "paused" | "error" | "succeeded";
}

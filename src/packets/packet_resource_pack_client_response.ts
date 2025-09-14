
import type { ResourcePackIds } from "./ResourcePackIds";

export interface ResourcePackClientResponsePacket {
  response_status: "none" | "refused" | "send_packs" | "have_all_packs" | "completed";
  resourcepackids: ResourcePackIds;
}

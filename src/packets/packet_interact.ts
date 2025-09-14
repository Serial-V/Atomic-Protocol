
import type { Varint64 } from "./varint64";
import type { Vec3f } from "./vec3f";

export interface InteractPacket {
  action_id: "leave_vehicle" | "mouse_over_entity" | "npc_open" | "open_inventory";
  target_entity_id: Varint64;
  position: Vec3f | Vec3f;
}

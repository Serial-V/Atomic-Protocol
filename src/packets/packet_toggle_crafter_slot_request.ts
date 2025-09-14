
import type { Vec3li } from "./vec3li";

export interface ToggleCrafterSlotRequestPacket {
  position: Vec3li;
  slot: number;
  disabled: boolean;
}

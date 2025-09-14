
import type { InputLockFlags } from "./InputLockFlags";
import type { Vec3f } from "./vec3f";

export interface UpdateClientInputLocksPacket {
  locks: InputLockFlags;
  position: Vec3f;
}

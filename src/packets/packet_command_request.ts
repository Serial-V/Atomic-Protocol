
import type { CommandOrigin } from "./CommandOrigin";

export interface CommandRequestPacket {
  command: string;
  origin: CommandOrigin;
  internal: boolean;
  version: number;
}

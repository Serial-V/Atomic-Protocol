
import type { FullContainerName } from "./FullContainerName";

export interface StackRequestSlotInfo {
  slot_type: FullContainerName;
  slot: number;
  stack_id: number;
}

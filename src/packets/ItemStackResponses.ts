
import type { FullContainerName } from "./FullContainerName";

export type ItemStackResponses = {  status: "ok" | "error";
  request_id: number;
  undefined: {  containers: {  slot_type: FullContainerName;
  slots: {  slot: number;
  hotbar_slot: number;
  count: number;
  item_stack_id: number;
  custom_name: string;
  filtered_custom_name: string;
  durability_correction: number;}[];}[];};}[];

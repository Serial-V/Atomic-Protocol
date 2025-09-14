
import type { Nbt } from "./nbt";

export type Itemstates = {  name: string;
  runtime_id: number;
  component_based: boolean;
  version: "legacy" | "data_driven" | "none";
  nbt: Nbt;}[];

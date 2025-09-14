
export type PlayerAttributes = {  min: number;
  max: number;
  current: number;
  default_min: number;
  default_max: number;
  default: number;
  name: string;
  modifiers: {  id: string;
  name: string;
  amount: number;
  operation: number;
  operand: number;
  serializable: boolean;}[];}[];

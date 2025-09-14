
export interface GameRule {
  name: string;
  editable: boolean;
  type: "bool" | "int" | "float";
  value: boolean | number | number;
}

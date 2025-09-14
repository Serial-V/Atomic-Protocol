
import type { CommandFlags } from "./CommandFlags";

export interface AvailableCommandsPacket {
  values_len: number;
  _enum_type: any;
  enum_values: string[];
  chained_subcommand_values: string[];
  suffixes: string[];
  enums: {  name: string;
  values: number | number | number[];}[];
  chained_subcommands: {  name: string;
  values: {  index: number;
  value: number;}[];}[];
  command_data: {  name: string;
  description: string;
  flags: number;
  permission_level: number;
  alias: number;
  chained_subcommand_offsets: number[];
  overloads: {  chaining: boolean;
  parameters: {  parameter_name: string;
  value_type: "int" | "float" | "value" | "wildcard_int" | "operator" | "command_operator" | "target" | "wildcard_target" | "file_path" | "integer_range" | "equipment_slots" | "string" | "block_position" | "position" | "message" | "raw_text" | "json" | "block_states" | "command";
  enum_type: "valid" | "enum" | "suffixed" | "soft_enum";
  optional: boolean;
  options: CommandFlags;}[];}[];}[];
  dynamic_enums: {  name: string;
  values: string[];}[];
  enum_constraints: {  value_index: number;
  enum_index: number;
  constraints: {  constraint: "cheats_enabled" | "operator_permissions" | "host_permissions";}[];}[];
}

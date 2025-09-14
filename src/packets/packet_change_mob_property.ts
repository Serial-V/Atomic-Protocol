
export interface ChangeMobPropertyPacket {
  entity_unique_id: number;
  property: string;
  bool_value: boolean;
  string_value: string;
  int_value: number;
  float_value: number;
}

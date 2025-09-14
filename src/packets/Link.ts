
export interface Link {
  ridden_entity_id: number;
  rider_entity_id: number;
  type: number;
  immediate: boolean;
  rider_initiated: boolean;
  angular_velocity: number;
}

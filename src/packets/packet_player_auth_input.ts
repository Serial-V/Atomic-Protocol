
import type { Vec3f } from "./vec3f";
import type { Vec2f } from "./vec2f";
import type { InputFlag } from "./InputFlag";
import type { Varint64 } from "./varint64";
import type { TransactionLegacy } from "./TransactionLegacy";
import type { TransactionActions } from "./TransactionActions";
import type { TransactionUseItem } from "./TransactionUseItem";
import type { ItemStackRequest } from "./ItemStackRequest";
import type { Action } from "./Action";
import type { Vec3i } from "./vec3i";

export interface PlayerAuthInputPacket {
  pitch: number;
  yaw: number;
  position: Vec3f;
  move_vector: Vec2f;
  head_yaw: number;
  input_data: InputFlag;
  input_mode: "unknown" | "mouse" | "touch" | "game_pad" | "motion_controller";
  play_mode: "normal" | "teaser" | "screen" | "viewer" | "reality" | "placement" | "living_room" | "exit_level" | "exit_level_living_room" | "num_modes";
  interaction_model: "touch" | "crosshair" | "classic";
  interact_rotation: Vec2f;
  tick: Varint64;
  delta: Vec3f;
  transaction: {  legacy: TransactionLegacy;
  actions: TransactionActions;
  data: TransactionUseItem;};
  item_stack_request: ItemStackRequest;
  undefined: {  vehicle_rotation: Vec2f;
  predicted_vehicle: number;};
  block_action: {  action: Action;
  undefined: {  position: Vec3i;
  face: number;} | {  position: Vec3i;
  face: number;} | {  position: Vec3i;
  face: number;} | {  position: Vec3i;
  face: number;} | {  position: Vec3i;
  face: number;};}[];
  analogue_move_vector: Vec2f;
  camera_orientation: Vec3f;
  raw_move_vector: Vec2f;
}

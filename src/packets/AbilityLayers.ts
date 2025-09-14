
import type { AbilitySet } from "./AbilitySet";

export interface AbilityLayers {
  type: "cache" | "base" | "spectator" | "commands" | "editor" | "loading_screen";
  allowed: AbilitySet;
  enabled: AbilitySet;
  fly_speed: number;
  vertical_fly_speed: number;
  walk_speed: number;
}

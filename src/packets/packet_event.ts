
import type { Varint64 } from "./varint64";
import type { RestBuffer } from "./restBuffer";

export interface EventPacket {
  runtime_id: Varint64;
  event_type: "achievement_awarded" | "entity_interact" | "portal_built" | "portal_used" | "mob_killed" | "cauldron_used" | "player_death" | "boss_killed" | "agent_command" | "agent_created" | "banner_pattern_removed" | "command_executed" | "fish_bucketed" | "mob_born" | "pet_died" | "cauldron_block_used" | "composter_block_used" | "bell_block_used" | "actor_definition" | "raid_update" | "player_movement_anomaly" | "player_movement_corrected" | "honey_harvested" | "target_block_hit" | "piglin_barter" | "waxed_or_unwaxed_copper" | "code_builder_runtime_action" | "code_builder_scoreboard" | "strider_ridden_in_lava_in_overworld" | "sneak_close_to_sculk_sensor" | "careful_restoration" | "item_used";
  use_player_id: number;
  event_data: RestBuffer;
}

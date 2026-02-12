# Runtime Symbol Manifest (WL1 Runtime Path)

Authoritative symbol checklist for full runtime-complete WL1 parity.

## Status

- Current state: `frozen`
- Source of truth: deterministic oracle symbol trace outputs from Phase R2
- Trace scenarios: 10 (WL1 asset-backed)
- Deterministic menu-trace digest: `3960187756`
- Refresh command: `pnpm runtime:manifest:extract`

## Buckets

### required-runtime

Symbols exercised by deterministic runtime trace scenarios.

| File | Function | Status | Notes |
| :--- | :--- | :--- | :--- |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_init | `done` | runtime bootstrap entrypoint; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_reset | `done` | restores boot snapshot; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_step | `done` | runtime tick loop entrypoint; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_snapshot_hash | `done` | snapshot hash API; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_render_frame_hash | `done` | frame-hash API; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_set_state | `done` | deserialize/state restore API; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_map_lo | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_map_hi | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_xq8 | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_yq8 | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_angle_deg | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_health | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_ammo | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_cooldown | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_flags | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_tick | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | ClipMove | `done` | called via real_wl_agent_clip_move_apply shim; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | TryMove | `done` | called via oracle_real_wl_agent_try_move shim; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | ControlMovement | `done` | called via real_wl_agent_control_movement_apply shim; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | TakeDamage | `done` | called via real_wl_agent_take_damage_apply shim; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_DRAW.C | WallRefresh | `done` | called via oracle_wl_draw_wall_refresh_hash from runtime render hash; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_DRAW.C | ThreeDRefresh | `done` | called via oracle_wl_draw_three_d_refresh_hash from runtime render hash; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_STATE.C | CheckLine | `done` | called via oracle_real_wl_state_check_line from runtime sight probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_STATE.C | CheckSight | `done` | called via oracle_real_wl_state_check_sight from runtime sight probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_STATE.C | MoveObj | `done` | called via oracle_real_wl_state_move_obj_hash from runtime chase probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_STATE.C | SelectChaseDir | `done` | called via oracle_real_wl_state_select_chase_dir_hash from runtime chase probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_PLAY.C | PlayLoop | `done` | called via oracle_wl_play_play_loop_hash from runtime loop probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_GAME.C | GameLoop | `done` | called via oracle_wl_game_game_loop_hash from runtime loop probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_INTER.C | CheckHighScore | `done` | called via oracle_wl_inter_check_high_score_hash from runtime score probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_STATE.C | FirstSighting | `done` | called via oracle_wl_state_first_sighting_hash from runtime ai probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_STATE.C | SightPlayer | `done` | called via oracle_wl_state_sight_player_hash from runtime ai probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_ACT2.C | T_Chase | `done` | called via oracle_wl_act2_t_chase_hash from runtime ai probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_ACT2.C | T_Path | `done` | called via oracle_wl_act2_t_path_hash from runtime ai probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_ACT2.C | T_Shoot | `done` | called via oracle_wl_act2_t_shoot_hash from runtime ai probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_ACT2.C | T_Bite | `done` | called via oracle_wl_act2_t_bite_hash from runtime ai probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_ACT2.C | T_DogChase | `done` | called via oracle_wl_act2_t_dogchase_hash from runtime ai probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_ACT2.C | T_Projectile | `done` | called via oracle_wl_act2_t_projectile_hash from runtime ai probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_ACT1.C | OpenDoor | `done` | called via oracle_wl_act1_open_door_hash from runtime door probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_ACT1.C | CloseDoor | `done` | called via oracle_wl_act1_close_door_hash from runtime door probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_ACT1.C | OperateDoor | `done` | called via oracle_wl_act1_operate_door_hash from runtime door probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_ACT1.C | MoveDoors | `done` | called via oracle_wl_act1_move_doors_hash from runtime door probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | GetBonus | `done` | called via oracle_wl_agent_get_bonus_hash from runtime bonus probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | GiveAmmo | `done` | called via oracle_wl_agent_give_ammo_hash from runtime bonus probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | GivePoints | `done` | called via oracle_wl_agent_give_points_hash from runtime bonus probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | HealSelf | `done` | called via oracle_wl_agent_heal_self_hash from runtime bonus probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | Cmd_Fire | `done` | called via oracle_wl_agent_cmd_fire_hash from runtime player probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | Cmd_Use | `done` | called via oracle_wl_agent_cmd_use_hash from runtime player probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | T_Player | `done` | called via oracle_wl_agent_t_player_hash from runtime player probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | Thrust | `done` | called via oracle_wl_agent_thrust_hash from runtime player probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_ACT1.C | SpawnDoor | `done` | called via oracle_wl_act1_spawn_door_hash from runtime game-state probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_ACT1.C | PushWall | `done` | called via oracle_wl_act1_push_wall_hash from runtime game-state probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | TakeDamage | `done` | called via oracle_wl_agent_take_damage_hash from runtime game-state probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_INTER.C | LevelCompleted | `done` | called via oracle_wl_inter_level_completed_hash from runtime game-state probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_INTER.C | Victory | `done` | called via oracle_wl_inter_victory_hash from runtime game-state probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_GAME.C | SetSoundLoc | `done` | called via oracle_wl_game_set_sound_loc_hash from runtime audio probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_GAME.C | UpdateSoundLoc | `done` | called via oracle_wl_game_update_sound_loc_hash from runtime audio probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_GAME.C | PlaySoundLocGlobal | `done` | called via oracle_wl_game_play_sound_loc_global_hash from runtime audio probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_IN.C | IN_ReadControl | `done` | called via oracle_id_in_read_control_hash from runtime input probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_IN.C | IN_UserInput | `done` | called via oracle_id_in_user_input from runtime input probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_SD.C | SD_SetSoundMode | `done` | called via oracle_id_sd_sd_set_sound_mode_hash from runtime audio probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_SD.C | SD_SetMusicMode | `done` | called via oracle_id_sd_sd_set_music_mode_hash from runtime audio probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_SD.C | SD_PlaySound | `done` | called via oracle_id_sd_sd_play_sound_hash from runtime audio probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_SD.C | SD_StopSound | `done` | called via oracle_id_sd_sd_stop_sound_hash from runtime audio probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |

### excluded-non-runtime

Symbols known to the runtime trace map but not hit by current deterministic trace scenarios.

| File | Function | Reason |
| :--- | :--- | :--- |
| _none_ | _none_ | all traced symbols are currently required-runtime |

## Rules

1. No symbol may move from `required-runtime` to `excluded-non-runtime` without trace evidence and commit note.
2. Phase R4 completion requires all `required-runtime` symbols marked `done` with parity tests.
3. Any new trace that hits an excluded symbol must reopen the manifest and add it to required.

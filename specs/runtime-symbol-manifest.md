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
| ID_CA.C | CAL_SetupAudioFile | `done` | called via oracle_id_ca_cal_setup_audio_file_hash from runtime audio-cache probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_CA.C | CA_CacheAudioChunk | `done` | called via oracle_id_ca_ca_cache_audio_chunk_hash from runtime audio-cache probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_US_1.C | US_Print | `done` | called via oracle_id_us_1_us_print_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_US_1.C | US_CPrint | `done` | called via oracle_id_us_1_us_cprint_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_US_1.C | US_DrawWindow | `done` | called via oracle_id_us_1_us_draw_window_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_MENU.C | US_ControlPanel | `done` | called via oracle_wl_menu_us_control_panel_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_MENU.C | DrawMainMenu | `done` | called via oracle_wl_menu_draw_main_menu_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_MENU.C | DrawMenu | `done` | called via oracle_wl_menu_draw_menu_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_MENU.C | CP_NewGame | `done` | called via oracle_wl_menu_cp_new_game_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_MENU.C | CP_ViewScores | `done` | called via oracle_wl_menu_cp_view_scores_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_MENU.C | CP_Sound | `done` | called via oracle_wl_menu_cp_sound_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_MENU.C | CP_Control | `done` | called via oracle_wl_menu_cp_control_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_MENU.C | Message | `done` | called via oracle_wl_menu_message_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_TEXT.C | HelpScreens | `done` | called via oracle_wl_text_help_screens_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_TEXT.C | EndText | `done` | called via oracle_wl_text_end_text_hash from runtime menu/text probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_DRAW.C | FixedByFrac | `done` | called via oracle_wl_draw_fixed_by_frac from runtime render-math probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_MAIN.C | BuildTables | `done` | called via oracle_wl_main_build_tables_hash from runtime render-math probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_MAIN.C | CalcProjection | `done` | called via oracle_wl_main_calc_projection_hash from runtime render-math probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_DRAW.C | TransformActor | `done` | called via oracle_wl_draw_transform_actor_hash from runtime ray probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_DRAW.C | TransformTile | `done` | called via oracle_wl_draw_transform_tile_hash from runtime ray probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_DRAW.C | CalcHeight | `done` | called via oracle_wl_draw_calc_height from runtime ray probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_DRAW.C | HitVertWall | `done` | called via oracle_wl_draw_hit_vert_wall_hash from runtime ray probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_DRAW.C | HitHorizWall | `done` | called via oracle_wl_draw_hit_horiz_wall_hash from runtime ray probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_SCALE.C | SetupScaling | `done` | called via oracle_wl_scale_setup_scaling_hash from runtime scale probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_SCALE.C | ScaleShape | `done` | called via oracle_wl_scale_scale_shape_hash from runtime scale probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_SCALE.C | SimpleScaleShape | `done` | called via oracle_wl_scale_simple_scale_shape_hash from runtime scale probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_GAME.C | DrawPlayScreen | `done` | called via oracle_wl_game_draw_play_screen_hash from runtime hud probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_STATE.C | SelectDodgeDir | `done` | called via oracle_wl_state_select_dodge_dir_hash from runtime ai probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_STATE.C | DamageActor | `done` | called via oracle_wl_state_damage_actor_hash from runtime ai probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | TryMove | `done` | called via oracle_wl_agent_try_move_hash from runtime movement probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | ClipMove | `done` | called via oracle_wl_agent_clip_move_hash from runtime movement probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | ControlMovement | `done` | called via oracle_wl_agent_control_movement_hash from runtime movement probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_CA.C | CarmackExpand | `done` | called via oracle_id_ca_carmack_expand_hash from runtime map probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_CA.C | RLEWExpand | `done` | called via oracle_id_ca_rlew_expand_hash from runtime map probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_CA.C | SetupMapFile | `done` | called via oracle_id_ca_setup_map_file_hash from runtime map probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_CA.C | CacheMap | `done` | called via oracle_id_ca_cache_map_hash from runtime map probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_GAME.C | SetupGameLevel | `done` | called via oracle_wl_game_setup_game_level_hash from runtime map probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_MM.C | MM_GetPtr | `done` | called via oracle_id_mm_mm_get_ptr_hash from runtime memory probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_MM.C | MM_FreePtr | `done` | called via oracle_id_mm_mm_free_ptr_hash from runtime memory probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_MM.C | MM_SetPurge | `done` | called via oracle_id_mm_mm_set_purge_hash from runtime memory probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_MM.C | MM_SetLock | `done` | called via oracle_id_mm_mm_set_lock_hash from runtime memory probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_MM.C | MM_SortMem | `done` | called via oracle_id_mm_mm_sort_mem_hash from runtime memory probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_PM.C | PM_CheckMainMem | `done` | called via oracle_id_pm_pm_check_main_mem_hash from runtime page probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_PM.C | PM_GetPageAddress | `done` | called via oracle_id_pm_pm_get_page_address_hash from runtime page probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_PM.C | PM_GetPage | `done` | called via oracle_id_pm_pm_get_page_hash from runtime page probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_PM.C | PM_NextFrame | `done` | called via oracle_id_pm_pm_next_frame_hash from runtime page probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_PM.C | PM_Reset | `done` | called via oracle_id_pm_pm_reset_hash from runtime page probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VW_MeasurePropString | `done` | called via oracle_id_vh_vw_measure_prop_string_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VWB_DrawPic | `done` | called via oracle_id_vh_vwb_draw_pic_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VWB_Bar | `done` | called via oracle_id_vh_vwb_bar_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_Bar | `done` | called via oracle_id_vl_vl_bar_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_MemToScreen | `done` | called via oracle_id_vl_vl_mem_to_screen_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_LatchToScreen | `done` | called via oracle_id_vl_vl_latch_to_screen_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_FadeIn | `done` | called via oracle_id_vl_vl_fade_in_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_FadeOut | `done` | called via oracle_id_vl_vl_fade_out_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_Plot | `done` | called via oracle_id_vl_vl_plot_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_Hlin | `done` | called via oracle_id_vl_vl_hlin_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VWB_Plot | `done` | called via oracle_id_vh_vwb_plot_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VWB_Hlin | `done` | called via oracle_id_vh_vwb_hlin_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VWB_Vlin | `done` | called via oracle_id_vh_vwb_vlin_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VWL_MeasureString | `done` | called via oracle_id_vh_vwl_measure_string_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VWB_DrawPropString | `done` | called via oracle_id_vh_vwb_draw_prop_string_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_Vlin | `done` | called via oracle_id_vl_vl_vlin_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_ScreenToScreen | `done` | called via oracle_id_vl_vl_screen_to_screen_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_MaskedToScreen | `done` | called via oracle_id_vl_vl_masked_to_screen_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_MemToLatch | `done` | called via oracle_id_vl_vl_mem_to_latch_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_ClearVideo | `done` | called via oracle_id_vl_vl_clear_video_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VW_DrawPropString | `done` | called via oracle_id_vh_vw_draw_prop_string_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VW_DrawColorPropString | `done` | called via oracle_id_vh_vw_draw_color_prop_string_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VW_MeasureMPropString | `done` | called via oracle_id_vh_vw_measure_mprop_string_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VWB_DrawTile8 | `done` | called via oracle_id_vh_vwb_draw_tile8_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VWB_DrawTile8M | `done` | called via oracle_id_vh_vwb_draw_tile8m_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_SetColor | `done` | called via oracle_id_vl_vl_set_color_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_GetColor | `done` | called via oracle_id_vl_vl_get_color_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_SetPalette | `done` | called via oracle_id_vl_vl_set_palette_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_GetPalette | `done` | called via oracle_id_vl_vl_get_palette_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_FillPalette | `done` | called via oracle_id_vl_vl_fill_palette_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VW_MarkUpdateBlock | `done` | called via oracle_id_vh_vw_mark_update_block_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VW_UpdateScreen | `done` | called via oracle_id_vh_vw_update_screen_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | LatchDrawPic | `done` | called via oracle_id_vh_latch_draw_pic_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | LoadLatchMem | `done` | called via oracle_id_vh_load_latch_mem_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VH.C | VL_MungePic | `done` | called via oracle_id_vh_vl_munge_pic_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_SetLineWidth | `done` | called via oracle_id_vl_vl_set_line_width_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_SetSplitScreen | `done` | called via oracle_id_vl_vl_set_split_screen_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_SetVGAPlaneMode | `done` | called via oracle_id_vl_vl_set_vga_plane_mode_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_SetTextMode | `done` | called via oracle_id_vl_vl_set_text_mode_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| ID_VL.C | VL_ColorBorder | `done` | called via oracle_id_vl_vl_color_border_hash from runtime video probe; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |

### excluded-non-runtime

Symbols known to the runtime trace map but not hit by current deterministic trace scenarios.

| File | Function | Reason |
| :--- | :--- | :--- |
| _none_ | _none_ | all traced symbols are currently required-runtime |

## Rules

1. No symbol may move from `required-runtime` to `excluded-non-runtime` without trace evidence and commit note.
2. Phase R4 completion requires all `required-runtime` symbols marked `done` with parity tests.
3. Any new trace that hits an excluded symbol must reopen the manifest and add it to required.

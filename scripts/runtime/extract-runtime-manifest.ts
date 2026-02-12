import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WolfsrcOraclePort } from '../../src/oracle/runtimeOracle';
import { OracleBridge } from '../../src/oracle/bridge';
import type { RuntimeConfig, RuntimeInput } from '../../src/runtime/contracts';

const AREATILE = 107;

type TraceSymbol = {
  id: number;
  file: string;
  func: string;
  notes: string;
};

type Plane0Map = {
  mapIndex: number;
  mapName: string;
  width: number;
  height: number;
  plane0: Uint16Array;
};

type TraceScenario = {
  mapIndex: number;
  mapName: string;
  seed: number;
  config: RuntimeConfig;
  steps: RuntimeInput[];
};

type SymbolParityCoverage = {
  status: 'done' | 'todo';
  parity: string;
};

const TRACE_SYMBOLS: TraceSymbol[] = [
  { id: 1, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_init', notes: 'runtime bootstrap entrypoint' },
  { id: 2, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_reset', notes: 'restores boot snapshot' },
  { id: 3, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_step', notes: 'runtime tick loop entrypoint' },
  { id: 4, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_snapshot_hash', notes: 'snapshot hash API' },
  { id: 5, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_render_frame_hash', notes: 'frame-hash API' },
  { id: 6, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_set_state', notes: 'deserialize/state restore API' },
  { id: 7, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_map_lo', notes: 'snapshot readout' },
  { id: 8, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_map_hi', notes: 'snapshot readout' },
  { id: 9, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_xq8', notes: 'snapshot readout' },
  { id: 10, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_yq8', notes: 'snapshot readout' },
  { id: 11, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_angle_deg', notes: 'snapshot readout' },
  { id: 12, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_health', notes: 'snapshot readout' },
  { id: 13, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_ammo', notes: 'snapshot readout' },
  { id: 14, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_cooldown', notes: 'snapshot readout' },
  { id: 15, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_flags', notes: 'snapshot readout' },
  { id: 16, file: 'runtime/wolfsrc_runtime_oracle.c', func: 'oracle_runtime_get_tick', notes: 'snapshot readout' },
  { id: 17, file: 'WL_AGENT.C', func: 'ClipMove', notes: 'called via real_wl_agent_clip_move_apply shim' },
  { id: 18, file: 'WL_AGENT.C', func: 'TryMove', notes: 'called via oracle_real_wl_agent_try_move shim' },
  { id: 19, file: 'WL_AGENT.C', func: 'ControlMovement', notes: 'called via real_wl_agent_control_movement_apply shim' },
  { id: 20, file: 'WL_AGENT.C', func: 'TakeDamage', notes: 'called via real_wl_agent_take_damage_apply shim' },
  { id: 21, file: 'WL_DRAW.C', func: 'WallRefresh', notes: 'called via oracle_wl_draw_wall_refresh_hash from runtime render hash' },
  { id: 22, file: 'WL_DRAW.C', func: 'ThreeDRefresh', notes: 'called via oracle_wl_draw_three_d_refresh_hash from runtime render hash' },
  { id: 23, file: 'WL_STATE.C', func: 'CheckLine', notes: 'called via oracle_real_wl_state_check_line from runtime sight probe' },
  { id: 24, file: 'WL_STATE.C', func: 'CheckSight', notes: 'called via oracle_real_wl_state_check_sight from runtime sight probe' },
  { id: 25, file: 'WL_STATE.C', func: 'MoveObj', notes: 'called via oracle_real_wl_state_move_obj_hash from runtime chase probe' },
  { id: 26, file: 'WL_STATE.C', func: 'SelectChaseDir', notes: 'called via oracle_real_wl_state_select_chase_dir_hash from runtime chase probe' },
  { id: 27, file: 'WL_PLAY.C', func: 'PlayLoop', notes: 'called via oracle_wl_play_play_loop_hash from runtime loop probe' },
  { id: 28, file: 'WL_GAME.C', func: 'GameLoop', notes: 'called via oracle_wl_game_game_loop_hash from runtime loop probe' },
  { id: 29, file: 'WL_INTER.C', func: 'CheckHighScore', notes: 'called via oracle_wl_inter_check_high_score_hash from runtime score probe' },
  { id: 30, file: 'WL_STATE.C', func: 'FirstSighting', notes: 'called via oracle_wl_state_first_sighting_hash from runtime ai probe' },
  { id: 31, file: 'WL_STATE.C', func: 'SightPlayer', notes: 'called via oracle_wl_state_sight_player_hash from runtime ai probe' },
  { id: 32, file: 'WL_ACT2.C', func: 'T_Chase', notes: 'called via oracle_wl_act2_t_chase_hash from runtime ai probe' },
  { id: 33, file: 'WL_ACT2.C', func: 'T_Path', notes: 'called via oracle_wl_act2_t_path_hash from runtime ai probe' },
  { id: 34, file: 'WL_ACT2.C', func: 'T_Shoot', notes: 'called via oracle_wl_act2_t_shoot_hash from runtime ai probe' },
  { id: 35, file: 'WL_ACT2.C', func: 'T_Bite', notes: 'called via oracle_wl_act2_t_bite_hash from runtime ai probe' },
  { id: 36, file: 'WL_ACT2.C', func: 'T_DogChase', notes: 'called via oracle_wl_act2_t_dogchase_hash from runtime ai probe' },
  { id: 37, file: 'WL_ACT2.C', func: 'T_Projectile', notes: 'called via oracle_wl_act2_t_projectile_hash from runtime ai probe' },
  { id: 38, file: 'WL_ACT1.C', func: 'OpenDoor', notes: 'called via oracle_wl_act1_open_door_hash from runtime door probe' },
  { id: 39, file: 'WL_ACT1.C', func: 'CloseDoor', notes: 'called via oracle_wl_act1_close_door_hash from runtime door probe' },
  { id: 40, file: 'WL_ACT1.C', func: 'OperateDoor', notes: 'called via oracle_wl_act1_operate_door_hash from runtime door probe' },
  { id: 41, file: 'WL_ACT1.C', func: 'MoveDoors', notes: 'called via oracle_wl_act1_move_doors_hash from runtime door probe' },
  { id: 42, file: 'WL_AGENT.C', func: 'GetBonus', notes: 'called via oracle_wl_agent_get_bonus_hash from runtime bonus probe' },
  { id: 43, file: 'WL_AGENT.C', func: 'GiveAmmo', notes: 'called via oracle_wl_agent_give_ammo_hash from runtime bonus probe' },
  { id: 44, file: 'WL_AGENT.C', func: 'GivePoints', notes: 'called via oracle_wl_agent_give_points_hash from runtime bonus probe' },
  { id: 45, file: 'WL_AGENT.C', func: 'HealSelf', notes: 'called via oracle_wl_agent_heal_self_hash from runtime bonus probe' },
  { id: 46, file: 'WL_AGENT.C', func: 'Cmd_Fire', notes: 'called via oracle_wl_agent_cmd_fire_hash from runtime player probe' },
  { id: 47, file: 'WL_AGENT.C', func: 'Cmd_Use', notes: 'called via oracle_wl_agent_cmd_use_hash from runtime player probe' },
  { id: 48, file: 'WL_AGENT.C', func: 'T_Player', notes: 'called via oracle_wl_agent_t_player_hash from runtime player probe' },
  { id: 49, file: 'WL_AGENT.C', func: 'Thrust', notes: 'called via oracle_wl_agent_thrust_hash from runtime player probe' },
  { id: 50, file: 'WL_ACT1.C', func: 'SpawnDoor', notes: 'called via oracle_wl_act1_spawn_door_hash from runtime game-state probe' },
  { id: 51, file: 'WL_ACT1.C', func: 'PushWall', notes: 'called via oracle_wl_act1_push_wall_hash from runtime game-state probe' },
  { id: 52, file: 'WL_AGENT.C', func: 'TakeDamage', notes: 'called via oracle_wl_agent_take_damage_hash from runtime game-state probe' },
  { id: 53, file: 'WL_INTER.C', func: 'LevelCompleted', notes: 'called via oracle_wl_inter_level_completed_hash from runtime game-state probe' },
  { id: 54, file: 'WL_INTER.C', func: 'Victory', notes: 'called via oracle_wl_inter_victory_hash from runtime game-state probe' },
  { id: 55, file: 'WL_GAME.C', func: 'SetSoundLoc', notes: 'called via oracle_wl_game_set_sound_loc_hash from runtime audio probe' },
  { id: 56, file: 'WL_GAME.C', func: 'UpdateSoundLoc', notes: 'called via oracle_wl_game_update_sound_loc_hash from runtime audio probe' },
  { id: 57, file: 'WL_GAME.C', func: 'PlaySoundLocGlobal', notes: 'called via oracle_wl_game_play_sound_loc_global_hash from runtime audio probe' },
  { id: 58, file: 'ID_IN.C', func: 'IN_ReadControl', notes: 'called via oracle_id_in_read_control_hash from runtime input probe' },
  { id: 59, file: 'ID_IN.C', func: 'IN_UserInput', notes: 'called via oracle_id_in_user_input from runtime input probe' },
  { id: 60, file: 'ID_SD.C', func: 'SD_SetSoundMode', notes: 'called via oracle_id_sd_sd_set_sound_mode_hash from runtime audio probe' },
  { id: 61, file: 'ID_SD.C', func: 'SD_SetMusicMode', notes: 'called via oracle_id_sd_sd_set_music_mode_hash from runtime audio probe' },
  { id: 62, file: 'ID_SD.C', func: 'SD_PlaySound', notes: 'called via oracle_id_sd_sd_play_sound_hash from runtime audio probe' },
  { id: 63, file: 'ID_SD.C', func: 'SD_StopSound', notes: 'called via oracle_id_sd_sd_stop_sound_hash from runtime audio probe' },
  { id: 64, file: 'ID_CA.C', func: 'CAL_SetupAudioFile', notes: 'called via oracle_id_ca_cal_setup_audio_file_hash from runtime audio-cache probe' },
  { id: 65, file: 'ID_CA.C', func: 'CA_CacheAudioChunk', notes: 'called via oracle_id_ca_ca_cache_audio_chunk_hash from runtime audio-cache probe' },
  { id: 66, file: 'ID_US_1.C', func: 'US_Print', notes: 'called via oracle_id_us_1_us_print_hash from runtime menu/text probe' },
  { id: 67, file: 'ID_US_1.C', func: 'US_CPrint', notes: 'called via oracle_id_us_1_us_cprint_hash from runtime menu/text probe' },
  { id: 68, file: 'ID_US_1.C', func: 'US_DrawWindow', notes: 'called via oracle_id_us_1_us_draw_window_hash from runtime menu/text probe' },
  { id: 69, file: 'WL_MENU.C', func: 'US_ControlPanel', notes: 'called via oracle_wl_menu_us_control_panel_hash from runtime menu/text probe' },
  { id: 70, file: 'WL_MENU.C', func: 'DrawMainMenu', notes: 'called via oracle_wl_menu_draw_main_menu_hash from runtime menu/text probe' },
  { id: 71, file: 'WL_MENU.C', func: 'DrawMenu', notes: 'called via oracle_wl_menu_draw_menu_hash from runtime menu/text probe' },
  { id: 72, file: 'WL_MENU.C', func: 'CP_NewGame', notes: 'called via oracle_wl_menu_cp_new_game_hash from runtime menu/text probe' },
  { id: 73, file: 'WL_MENU.C', func: 'CP_ViewScores', notes: 'called via oracle_wl_menu_cp_view_scores_hash from runtime menu/text probe' },
  { id: 74, file: 'WL_MENU.C', func: 'CP_Sound', notes: 'called via oracle_wl_menu_cp_sound_hash from runtime menu/text probe' },
  { id: 75, file: 'WL_MENU.C', func: 'CP_Control', notes: 'called via oracle_wl_menu_cp_control_hash from runtime menu/text probe' },
  { id: 76, file: 'WL_MENU.C', func: 'Message', notes: 'called via oracle_wl_menu_message_hash from runtime menu/text probe' },
  { id: 77, file: 'WL_TEXT.C', func: 'HelpScreens', notes: 'called via oracle_wl_text_help_screens_hash from runtime menu/text probe' },
  { id: 78, file: 'WL_TEXT.C', func: 'EndText', notes: 'called via oracle_wl_text_end_text_hash from runtime menu/text probe' },
  { id: 79, file: 'WL_DRAW.C', func: 'FixedByFrac', notes: 'called via oracle_wl_draw_fixed_by_frac from runtime render-math probe' },
  { id: 80, file: 'WL_MAIN.C', func: 'BuildTables', notes: 'called via oracle_wl_main_build_tables_hash from runtime render-math probe' },
  { id: 81, file: 'WL_MAIN.C', func: 'CalcProjection', notes: 'called via oracle_wl_main_calc_projection_hash from runtime render-math probe' },
  { id: 82, file: 'WL_DRAW.C', func: 'TransformActor', notes: 'called via oracle_wl_draw_transform_actor_hash from runtime ray probe' },
  { id: 83, file: 'WL_DRAW.C', func: 'TransformTile', notes: 'called via oracle_wl_draw_transform_tile_hash from runtime ray probe' },
  { id: 84, file: 'WL_DRAW.C', func: 'CalcHeight', notes: 'called via oracle_wl_draw_calc_height from runtime ray probe' },
  { id: 85, file: 'WL_DRAW.C', func: 'HitVertWall', notes: 'called via oracle_wl_draw_hit_vert_wall_hash from runtime ray probe' },
  { id: 86, file: 'WL_DRAW.C', func: 'HitHorizWall', notes: 'called via oracle_wl_draw_hit_horiz_wall_hash from runtime ray probe' },
  { id: 87, file: 'WL_SCALE.C', func: 'SetupScaling', notes: 'called via oracle_wl_scale_setup_scaling_hash from runtime scale probe' },
  { id: 88, file: 'WL_SCALE.C', func: 'ScaleShape', notes: 'called via oracle_wl_scale_scale_shape_hash from runtime scale probe' },
  { id: 89, file: 'WL_SCALE.C', func: 'SimpleScaleShape', notes: 'called via oracle_wl_scale_simple_scale_shape_hash from runtime scale probe' },
  { id: 90, file: 'WL_GAME.C', func: 'DrawPlayScreen', notes: 'called via oracle_wl_game_draw_play_screen_hash from runtime hud probe' },
  { id: 91, file: 'WL_STATE.C', func: 'SelectDodgeDir', notes: 'called via oracle_wl_state_select_dodge_dir_hash from runtime ai probe' },
  { id: 92, file: 'WL_STATE.C', func: 'DamageActor', notes: 'called via oracle_wl_state_damage_actor_hash from runtime ai probe' },
  { id: 93, file: 'WL_AGENT.C', func: 'TryMove', notes: 'called via oracle_wl_agent_try_move_hash from runtime movement probe' },
  { id: 94, file: 'WL_AGENT.C', func: 'ClipMove', notes: 'called via oracle_wl_agent_clip_move_hash from runtime movement probe' },
  { id: 95, file: 'WL_AGENT.C', func: 'ControlMovement', notes: 'called via oracle_wl_agent_control_movement_hash from runtime movement probe' },
  { id: 96, file: 'ID_CA.C', func: 'CarmackExpand', notes: 'called via oracle_id_ca_carmack_expand_hash from runtime map probe' },
  { id: 97, file: 'ID_CA.C', func: 'RLEWExpand', notes: 'called via oracle_id_ca_rlew_expand_hash from runtime map probe' },
  { id: 98, file: 'ID_CA.C', func: 'SetupMapFile', notes: 'called via oracle_id_ca_setup_map_file_hash from runtime map probe' },
  { id: 99, file: 'ID_CA.C', func: 'CacheMap', notes: 'called via oracle_id_ca_cache_map_hash from runtime map probe' },
  { id: 100, file: 'WL_GAME.C', func: 'SetupGameLevel', notes: 'called via oracle_wl_game_setup_game_level_hash from runtime map probe' },
  { id: 101, file: 'ID_MM.C', func: 'MM_GetPtr', notes: 'called via oracle_id_mm_mm_get_ptr_hash from runtime memory probe' },
  { id: 102, file: 'ID_MM.C', func: 'MM_FreePtr', notes: 'called via oracle_id_mm_mm_free_ptr_hash from runtime memory probe' },
  { id: 103, file: 'ID_MM.C', func: 'MM_SetPurge', notes: 'called via oracle_id_mm_mm_set_purge_hash from runtime memory probe' },
  { id: 104, file: 'ID_MM.C', func: 'MM_SetLock', notes: 'called via oracle_id_mm_mm_set_lock_hash from runtime memory probe' },
  { id: 105, file: 'ID_MM.C', func: 'MM_SortMem', notes: 'called via oracle_id_mm_mm_sort_mem_hash from runtime memory probe' },
  { id: 106, file: 'ID_PM.C', func: 'PM_CheckMainMem', notes: 'called via oracle_id_pm_pm_check_main_mem_hash from runtime page probe' },
  { id: 107, file: 'ID_PM.C', func: 'PM_GetPageAddress', notes: 'called via oracle_id_pm_pm_get_page_address_hash from runtime page probe' },
  { id: 108, file: 'ID_PM.C', func: 'PM_GetPage', notes: 'called via oracle_id_pm_pm_get_page_hash from runtime page probe' },
  { id: 109, file: 'ID_PM.C', func: 'PM_NextFrame', notes: 'called via oracle_id_pm_pm_next_frame_hash from runtime page probe' },
  { id: 110, file: 'ID_PM.C', func: 'PM_Reset', notes: 'called via oracle_id_pm_pm_reset_hash from runtime page probe' },
  { id: 111, file: 'ID_VH.C', func: 'VW_MeasurePropString', notes: 'called via oracle_id_vh_vw_measure_prop_string_hash from runtime video probe' },
  { id: 112, file: 'ID_VH.C', func: 'VWB_DrawPic', notes: 'called via oracle_id_vh_vwb_draw_pic_hash from runtime video probe' },
  { id: 113, file: 'ID_VH.C', func: 'VWB_Bar', notes: 'called via oracle_id_vh_vwb_bar_hash from runtime video probe' },
  { id: 114, file: 'ID_VL.C', func: 'VL_Bar', notes: 'called via oracle_id_vl_vl_bar_hash from runtime video probe' },
  { id: 115, file: 'ID_VL.C', func: 'VL_MemToScreen', notes: 'called via oracle_id_vl_vl_mem_to_screen_hash from runtime video probe' },
  { id: 116, file: 'ID_VL.C', func: 'VL_LatchToScreen', notes: 'called via oracle_id_vl_vl_latch_to_screen_hash from runtime video probe' },
  { id: 117, file: 'ID_VL.C', func: 'VL_FadeIn', notes: 'called via oracle_id_vl_vl_fade_in_hash from runtime video probe' },
  { id: 118, file: 'ID_VL.C', func: 'VL_FadeOut', notes: 'called via oracle_id_vl_vl_fade_out_hash from runtime video probe' },
  { id: 119, file: 'ID_VL.C', func: 'VL_Plot', notes: 'called via oracle_id_vl_vl_plot_hash from runtime video probe' },
  { id: 120, file: 'ID_VL.C', func: 'VL_Hlin', notes: 'called via oracle_id_vl_vl_hlin_hash from runtime video probe' },
  { id: 121, file: 'ID_VH.C', func: 'VWB_Plot', notes: 'called via oracle_id_vh_vwb_plot_hash from runtime video probe' },
  { id: 122, file: 'ID_VH.C', func: 'VWB_Hlin', notes: 'called via oracle_id_vh_vwb_hlin_hash from runtime video probe' },
  { id: 123, file: 'ID_VH.C', func: 'VWB_Vlin', notes: 'called via oracle_id_vh_vwb_vlin_hash from runtime video probe' },
  { id: 124, file: 'ID_VH.C', func: 'VWL_MeasureString', notes: 'called via oracle_id_vh_vwl_measure_string_hash from runtime video probe' },
  { id: 125, file: 'ID_VH.C', func: 'VWB_DrawPropString', notes: 'called via oracle_id_vh_vwb_draw_prop_string_hash from runtime video probe' },
  { id: 126, file: 'ID_VL.C', func: 'VL_Vlin', notes: 'called via oracle_id_vl_vl_vlin_hash from runtime video probe' },
  { id: 127, file: 'ID_VL.C', func: 'VL_ScreenToScreen', notes: 'called via oracle_id_vl_vl_screen_to_screen_hash from runtime video probe' },
  { id: 128, file: 'ID_VL.C', func: 'VL_MaskedToScreen', notes: 'called via oracle_id_vl_vl_masked_to_screen_hash from runtime video probe' },
  { id: 129, file: 'ID_VL.C', func: 'VL_MemToLatch', notes: 'called via oracle_id_vl_vl_mem_to_latch_hash from runtime video probe' },
  { id: 130, file: 'ID_VL.C', func: 'VL_ClearVideo', notes: 'called via oracle_id_vl_vl_clear_video_hash from runtime video probe' },
  { id: 131, file: 'ID_VH.C', func: 'VW_DrawPropString', notes: 'called via oracle_id_vh_vw_draw_prop_string_hash from runtime video probe' },
  { id: 132, file: 'ID_VH.C', func: 'VW_DrawColorPropString', notes: 'called via oracle_id_vh_vw_draw_color_prop_string_hash from runtime video probe' },
  { id: 133, file: 'ID_VH.C', func: 'VW_MeasureMPropString', notes: 'called via oracle_id_vh_vw_measure_mprop_string_hash from runtime video probe' },
  { id: 134, file: 'ID_VH.C', func: 'VWB_DrawTile8', notes: 'called via oracle_id_vh_vwb_draw_tile8_hash from runtime video probe' },
  { id: 135, file: 'ID_VH.C', func: 'VWB_DrawTile8M', notes: 'called via oracle_id_vh_vwb_draw_tile8m_hash from runtime video probe' },
  { id: 136, file: 'ID_VL.C', func: 'VL_SetColor', notes: 'called via oracle_id_vl_vl_set_color_hash from runtime video probe' },
  { id: 137, file: 'ID_VL.C', func: 'VL_GetColor', notes: 'called via oracle_id_vl_vl_get_color_hash from runtime video probe' },
  { id: 138, file: 'ID_VL.C', func: 'VL_SetPalette', notes: 'called via oracle_id_vl_vl_set_palette_hash from runtime video probe' },
  { id: 139, file: 'ID_VL.C', func: 'VL_GetPalette', notes: 'called via oracle_id_vl_vl_get_palette_hash from runtime video probe' },
  { id: 140, file: 'ID_VL.C', func: 'VL_FillPalette', notes: 'called via oracle_id_vl_vl_fill_palette_hash from runtime video probe' },
  { id: 141, file: 'ID_VH.C', func: 'VW_MarkUpdateBlock', notes: 'called via oracle_id_vh_vw_mark_update_block_hash from runtime video probe' },
  { id: 142, file: 'ID_VH.C', func: 'VW_UpdateScreen', notes: 'called via oracle_id_vh_vw_update_screen_hash from runtime video probe' },
  { id: 143, file: 'ID_VH.C', func: 'LatchDrawPic', notes: 'called via oracle_id_vh_latch_draw_pic_hash from runtime video probe' },
  { id: 144, file: 'ID_VH.C', func: 'LoadLatchMem', notes: 'called via oracle_id_vh_load_latch_mem_hash from runtime video probe' },
  { id: 145, file: 'ID_VH.C', func: 'VL_MungePic', notes: 'called via oracle_id_vh_vl_munge_pic_hash from runtime video probe' },
  { id: 146, file: 'ID_VL.C', func: 'VL_SetLineWidth', notes: 'called via oracle_id_vl_vl_set_line_width_hash from runtime video probe' },
  { id: 147, file: 'ID_VL.C', func: 'VL_SetSplitScreen', notes: 'called via oracle_id_vl_vl_set_split_screen_hash from runtime video probe' },
  { id: 148, file: 'ID_VL.C', func: 'VL_SetVGAPlaneMode', notes: 'called via oracle_id_vl_vl_set_vga_plane_mode_hash from runtime video probe' },
  { id: 149, file: 'ID_VL.C', func: 'VL_SetTextMode', notes: 'called via oracle_id_vl_vl_set_text_mode_hash from runtime video probe' },
  { id: 150, file: 'ID_VL.C', func: 'VL_ColorBorder', notes: 'called via oracle_id_vl_vl_color_border_hash from runtime video probe' },
];

const TRACE_SYMBOL_MAP = new Map<number, TraceSymbol>(TRACE_SYMBOLS.map((entry) => [entry.id, entry]));

const SYMBOL_PARITY_COVERAGE = new Map<number, SymbolParityCoverage>([
  [1, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [2, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [3, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [4, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [5, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [6, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [7, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [8, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [9, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [10, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [11, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [12, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [13, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [14, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [15, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [16, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [17, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [18, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [19, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [20, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [21, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [22, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [23, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [24, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [25, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [26, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [27, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [28, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [29, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [30, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [31, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [32, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [33, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [34, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [35, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [36, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [37, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [38, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [39, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [40, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [41, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [42, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [43, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [44, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [45, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [46, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [47, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [48, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [49, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [50, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [51, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [52, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [53, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [54, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [55, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [56, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [57, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [58, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [59, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [60, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [61, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [62, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [63, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [64, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [65, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [66, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [67, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [68, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [69, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [70, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [71, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [72, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [73, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [74, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [75, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [76, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [77, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [78, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [79, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [80, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [81, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [82, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [83, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [84, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [85, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [86, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [87, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [88, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [89, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [90, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [91, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [92, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [93, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [94, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [95, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [96, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [97, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [98, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [99, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [100, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [101, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [102, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [103, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [104, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [105, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [106, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [107, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [108, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [109, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [110, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [111, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [112, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [113, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [114, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [115, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [116, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [117, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [118, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [119, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [120, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [121, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [122, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [123, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [124, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [125, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [126, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [127, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [128, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [129, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [130, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [131, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [132, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [133, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [134, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [135, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [136, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [137, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [138, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [139, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [140, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [141, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [142, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [143, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [144, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [145, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [146, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [147, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [148, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [149, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
  [150, { status: 'done', parity: 'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity' }],
]);

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function readU16(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || offset + 1 >= bytes.length) {
    return 0;
  }
  return ((bytes[offset]! | (bytes[offset + 1]! << 8)) & 0xffff) >>> 0;
}

function readS32(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || offset + 3 >= bytes.length) {
    return -1;
  }
  const value =
    (bytes[offset]!) |
    (bytes[offset + 1]! << 8) |
    (bytes[offset + 2]! << 16) |
    (bytes[offset + 3]! << 24);
  return value | 0;
}

function decodeAsciiName(bytes: Uint8Array): string {
  let end = bytes.length;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) {
      end = i;
      break;
    }
  }
  return new TextDecoder().decode(bytes.subarray(0, end)).trim();
}

function idCaCarmackExpandWords(sourceBytes: Uint8Array, expandedLengthBytes: number): Uint16Array {
  const NEARTAG = 0xa7;
  const FARTAG = 0xa8;
  const outWords = Math.max(0, expandedLengthBytes | 0) >>> 1;
  const out = new Uint16Array(outWords);

  let src = 0;
  let dst = 0;
  while (dst < outWords) {
    const ch = readU16(sourceBytes, src);
    src += 2;
    const chHigh = (ch >>> 8) & 0xff;
    const count = ch & 0xff;

    if (chHigh === NEARTAG) {
      if (count === 0) {
        const low = src < sourceBytes.length ? sourceBytes[src]! : 0;
        src += 1;
        out[dst++] = ((ch & 0xff00) | low) & 0xffff;
        continue;
      }
      const offset = src < sourceBytes.length ? sourceBytes[src]! : 0;
      src += 1;
      for (let i = 0; i < count && dst < outWords; i++) {
        const copyIndex = dst - offset;
        out[dst++] = copyIndex >= 0 && copyIndex < dst ? out[copyIndex]! : 0;
      }
      continue;
    }

    if (chHigh === FARTAG) {
      if (count === 0) {
        const low = src < sourceBytes.length ? sourceBytes[src]! : 0;
        src += 1;
        out[dst++] = ((ch & 0xff00) | low) & 0xffff;
        continue;
      }
      const offset = readU16(sourceBytes, src);
      src += 2;
      for (let i = 0; i < count && dst < outWords; i++) {
        const copyIndex = offset + i;
        out[dst++] = copyIndex >= 0 && copyIndex < dst ? out[copyIndex]! : 0;
      }
      continue;
    }

    out[dst++] = ch & 0xffff;
  }
  return out;
}

function idCaRlewExpandWords(sourceWords: Uint16Array, expandedLengthBytes: number, rlewTag: number): Uint16Array {
  const outWords = Math.max(0, expandedLengthBytes | 0) >>> 1;
  const out = new Uint16Array(outWords);
  const tag = rlewTag & 0xffff;

  let src = 0;
  let dst = 0;
  while (dst < outWords) {
    const value = src < sourceWords.length ? (sourceWords[src++]! & 0xffff) : 0;
    if (value !== tag) {
      out[dst++] = value;
      continue;
    }
    const count = src < sourceWords.length ? (sourceWords[src++]! & 0xffff) : 0;
    const repeated = src < sourceWords.length ? (sourceWords[src++]! & 0xffff) : 0;
    if (count === 0) {
      out[dst++] = tag;
      continue;
    }
    for (let i = 0; i < count && dst < outWords; i++) {
      out[dst++] = repeated;
    }
  }
  return out;
}

function extractPlane0Map(gamemapsBytes: Uint8Array, mapheadBytes: Uint8Array, mapIndex: number): Plane0Map | null {
  const rlewTag = readU16(mapheadBytes, 0);
  const headerOffset = readS32(mapheadBytes, 2 + mapIndex * 4);
  if (headerOffset < 0 || headerOffset + 38 > gamemapsBytes.length) {
    return null;
  }

  const planeStart = [
    readS32(gamemapsBytes, headerOffset),
    readS32(gamemapsBytes, headerOffset + 4),
    readS32(gamemapsBytes, headerOffset + 8),
  ];
  const planeLength = [
    readU16(gamemapsBytes, headerOffset + 12),
    readU16(gamemapsBytes, headerOffset + 14),
    readU16(gamemapsBytes, headerOffset + 16),
  ];
  const width = readU16(gamemapsBytes, headerOffset + 18);
  const height = readU16(gamemapsBytes, headerOffset + 20);
  const name = decodeAsciiName(gamemapsBytes.subarray(headerOffset + 22, headerOffset + 38)) || `MAP${mapIndex}`;

  if (width <= 0 || height <= 0) {
    return null;
  }
  const p0Start = planeStart[0] | 0;
  const p0Len = planeLength[0] | 0;
  if (p0Start < 0 || p0Len <= 2 || p0Start + p0Len > gamemapsBytes.length) {
    return null;
  }

  const source = gamemapsBytes.subarray(p0Start, p0Start + p0Len);
  const expanded = readU16(source, 0);
  const carmack = idCaCarmackExpandWords(source.subarray(2), expanded);
  const rlewSource = carmack.subarray(carmack.length > 0 ? 1 : 0);
  const plane0 = idCaRlewExpandWords(rlewSource, width * height * 2, rlewTag);
  return { mapIndex, mapName: name, width, height, plane0 };
}

function wallInPlane(plane0: Uint16Array, width: number, height: number, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return true;
  }
  return (plane0[y * width + x] ?? 0) < AREATILE;
}

function buildMapBitsFromPlane(plane: Plane0Map, seed: number): { mapLo: number; mapHi: number; startXQ8: number; startYQ8: number } {
  const maxX0 = Math.max(0, plane.width - 8);
  const maxY0 = Math.max(0, plane.height - 8);
  const x0 = maxX0 === 0 ? 0 : ((seed >>> 1) % (maxX0 + 1));
  const y0 = maxY0 === 0 ? 0 : ((seed >>> 5) % (maxY0 + 1));

  let lo = 0;
  let hi = 0;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const border = x === 0 || y === 0 || x === 7 || y === 7;
      const wall = border || wallInPlane(plane.plane0, plane.width, plane.height, x0 + x, y0 + y);
      if (!wall) continue;
      const bit = y * 8 + x;
      if (bit < 32) lo |= 1 << bit;
      else hi |= 1 << (bit - 32);
    }
  }

  let startTileX = 3;
  let startTileY = 3;
  let found = false;
  for (let y = 1; y <= 6 && !found; y++) {
    for (let x = 1; x <= 6; x++) {
      const bit = y * 8 + x;
      const isWall = bit < 32 ? ((lo >>> bit) & 1) === 1 : ((hi >>> (bit - 32)) & 1) === 1;
      if (!isWall) {
        startTileX = x;
        startTileY = y;
        found = true;
        break;
      }
    }
  }

  return {
    mapLo: lo >>> 0,
    mapHi: hi >>> 0,
    startXQ8: startTileX * 256 + 128,
    startYQ8: startTileY * 256 + 128,
  };
}

function buildScenarioSteps(seed: number, count: number): RuntimeInput[] {
  const steps: RuntimeInput[] = [];
  let s = seed | 0;
  for (let i = 0; i < count; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    steps.push({
      inputMask: s & 0xff,
      tics: (s >>> 8) & 0x7,
      rng: s ^ Math.imul(i + 1, 1103515245),
    });
  }
  return steps;
}

async function loadWl1Scenarios(root: string): Promise<TraceScenario[]> {
  const assetsDir = path.join(root, 'assets', 'wl1');
  const mapheadBytes = new Uint8Array(await readFile(path.join(assetsDir, 'MAPHEAD.WL1')));
  const gamemapsBytes = new Uint8Array(await readFile(path.join(assetsDir, 'GAMEMAPS.WL1')));

  const scenarios: TraceScenario[] = [];
  for (let mapIndex = 0; mapIndex < 100; mapIndex++) {
    const plane = extractPlane0Map(gamemapsBytes, mapheadBytes, mapIndex);
    if (!plane) {
      continue;
    }
    const seed = (Math.imul(mapIndex + 1, 0x45d9f3b) ^ 0x9e3779b9) >>> 0;
    const mapBits = buildMapBitsFromPlane(plane, seed);
    scenarios.push({
      mapIndex,
      mapName: plane.mapName,
      seed,
      config: {
        mapLo: mapBits.mapLo,
        mapHi: mapBits.mapHi,
        startXQ8: mapBits.startXQ8,
        startYQ8: mapBits.startYQ8,
        startAngleDeg: (mapIndex * 37) % 360,
        startHealth: 45 + (mapIndex % 40),
        startAmmo: 8 + (mapIndex % 12),
      },
      steps: buildScenarioSteps(seed | 0, 64),
    });
  }
  return scenarios;
}

function formatManifest(
  scenarioCount: number,
  menuTraceDigest: number,
  requiredSymbols: TraceSymbol[],
  excludedSymbols: TraceSymbol[],
): string {
  const requiredRows = requiredSymbols
    .map((entry) => {
      const coverage = SYMBOL_PARITY_COVERAGE.get(entry.id);
      const status = coverage?.status ?? 'todo';
      const notes = coverage ? `${entry.notes}; parity: ${coverage.parity}` : `${entry.notes}; parity: pending`;
      return `| ${entry.file} | ${entry.func} | \`${status}\` | ${notes} |`;
    })
    .join('\n');
  const excludedRows = excludedSymbols
    .map((entry) => `| ${entry.file} | ${entry.func} | not hit by deterministic runtime-trace harness |`)
    .join('\n');

  return `# Runtime Symbol Manifest (WL1 Runtime Path)

Authoritative symbol checklist for full runtime-complete WL1 parity.

## Status

- Current state: \`frozen\`
- Source of truth: deterministic oracle symbol trace outputs from Phase R2
- Trace scenarios: ${scenarioCount} (WL1 asset-backed)
- Deterministic menu-trace digest: \`${menuTraceDigest >>> 0}\`
- Refresh command: \`pnpm runtime:manifest:extract\`

## Buckets

### required-runtime

Symbols exercised by deterministic runtime trace scenarios.

| File | Function | Status | Notes |
| :--- | :--- | :--- | :--- |
${requiredRows || '| _pending_ | _pending_ | `todo` | Generated in Phase R2 |'}

### excluded-non-runtime

Symbols known to the runtime trace map but not hit by current deterministic trace scenarios.

| File | Function | Reason |
| :--- | :--- | :--- |
${excludedRows || '| _none_ | _none_ | all traced symbols are currently required-runtime |'}

## Rules

1. No symbol may move from \`required-runtime\` to \`excluded-non-runtime\` without trace evidence and commit note.
2. Phase R4 completion requires all \`required-runtime\` symbols marked \`done\` with parity tests.
3. Any new trace that hits an excluded symbol must reopen the manifest and add it to required.
`;
}

async function runDeterministicMenuTraceDigest(): Promise<number> {
  const oracle = new OracleBridge();
  await oracle.init();
  let hash = 2166136261 >>> 0;
  try {
    let screen = 0;
    let cursor = 0;
    const actions = [0, 1, 1, 2, 3, 1, 4, 0, 2, 1, 0, 3];

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i] | 0;
      const control = oracle.wlMenuUsControlPanelHash(screen, cursor, action, 8) >>> 0;
      const main = oracle.wlMenuDrawMainMenuHash(cursor & 7, 0xff, i % 2) >>> 0;
      const draw = oracle.wlMenuDrawMenuHash(screen, cursor, 8, 0, i & 1) >>> 0;
      const sound = oracle.wlMenuCpSoundHash(i % 3, (i + 1) % 3, (i + 2) % 3, action) >>> 0;
      const controlCfg = oracle.wlMenuCpControlHash(i & 1, (i >>> 1) & 1, (i * 7) & 0xff, action) >>> 0;
      const msg = oracle.wlMenuMessageHash(8 + i, i & 1, (i * 13) & 0xff, (0x9e3779b9 ^ i) | 0) >>> 0;

      hash = fnv1a(hash, control);
      hash = fnv1a(hash, main);
      hash = fnv1a(hash, draw);
      hash = fnv1a(hash, sound);
      hash = fnv1a(hash, controlCfg);
      hash = fnv1a(hash, msg);

      cursor = control & 0xff;
      screen = (control >>> 8) & 0xff;
    }

    hash = fnv1a(hash, oracle.wlMenuCpNewGameHash(2, 0, 0, 1) >>> 0);
    hash = fnv1a(hash, oracle.wlMenuCpViewScoresHash(10000, 9000, 8000, 7000, 6000, 7654) >>> 0);
    hash = fnv1a(hash, oracle.idUs1UsPrintHash(8, 8, 24, 15, 8) >>> 0);
    hash = fnv1a(hash, oracle.idUs1UsCPrintHash(0, 320, 24, 1, 8) >>> 0);
    hash = fnv1a(hash, oracle.idUs1UsDrawWindowHash(16, 24, 30, 12, 14, 1) >>> 0);

    return hash >>> 0;
  } finally {
    await oracle.shutdown();
  }
}

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const generatedDir = path.join(root, 'specs', 'generated');
  const manifestPath = path.join(root, 'specs', 'runtime-symbol-manifest.md');
  const hitsPath = path.join(generatedDir, 'runtime-symbol-hits.json');

  const scenarios = await loadWl1Scenarios(root);
  if (scenarios.length === 0) {
    throw new Error('No WL1 runtime scenarios were extracted from MAPHEAD.WL1/GAMEMAPS.WL1');
  }
  const menuTraceDigest = await runDeterministicMenuTraceDigest();

  const allHits = new Set<number>();
  const oracle = new WolfsrcOraclePort();
  try {
    for (const scenario of scenarios) {
      await oracle.init(scenario.config);
      oracle.resetTrace();
      await oracle.init(scenario.config);
      oracle.reset();
      oracle.snapshot();
      oracle.renderHash(320, 200);
      for (const step of scenario.steps) {
        oracle.step(step);
      }
      const blob = oracle.serialize();
      oracle.deserialize(blob);
      oracle.snapshot();
      for (const id of oracle.traceSymbolIds()) {
        allHits.add(id);
      }
    }
  } finally {
    await oracle.shutdown();
  }

  const hitIds = [...allHits].sort((a, b) => a - b);
  const requiredSymbols: TraceSymbol[] = hitIds.map((id) => {
    return (
      TRACE_SYMBOL_MAP.get(id) ?? {
        id,
        file: 'unknown',
        func: `unknown_symbol_${id}`,
        notes: 'symbol id not mapped yet',
      }
    );
  });
  const excludedSymbols = TRACE_SYMBOLS.filter((entry) => !allHits.has(entry.id));
  await mkdir(generatedDir, { recursive: true });
  await writeFile(
    hitsPath,
    JSON.stringify(
      {
        scenarioCount: scenarios.length,
        menuTraceDigest: menuTraceDigest >>> 0,
        traceScenarios: scenarios.map((scenario) => ({
          mapIndex: scenario.mapIndex,
          mapName: scenario.mapName,
          seedHex: `0x${scenario.seed.toString(16)}`,
        })),
        requiredRuntimeSymbolIds: hitIds,
        requiredRuntimeSymbols: requiredSymbols,
        excludedRuntimeSymbols: excludedSymbols,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  const manifest = formatManifest(scenarios.length, menuTraceDigest, requiredSymbols, excludedSymbols);
  await writeFile(manifestPath, manifest, 'utf8');

  console.log(`Wrote ${path.relative(root, hitsPath)} (${hitIds.length} required symbols).`);
  console.log(`Updated ${path.relative(root, manifestPath)} from ${scenarios.length} WL1 scenarios.`);
}

void main();

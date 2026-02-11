#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EMSDK_ENV="$ROOT_DIR/.tools/emsdk/emsdk_env.sh"

if [[ -f "$EMSDK_ENV" ]]; then
  # shellcheck disable=SC1090
  source "$EMSDK_ENV" >/dev/null
fi

if ! command -v emcc >/dev/null 2>&1; then
  echo "emcc not found. Install emsdk or ensure emcc is on PATH." >&2
  exit 1
fi

OUT_DIR="$ROOT_DIR/src/oracle/generated"
mkdir -p "$OUT_DIR"

EXPORTED_FUNCTIONS='["_malloc","_free","_oracle_fixed_mul","_oracle_fixed_by_frac","_oracle_rlew_expand_checksum","_oracle_raycast_distance_q16","_oracle_actor_step_packed","_oracle_player_move_packed","_oracle_game_event_hash","_oracle_menu_reduce_packed","_oracle_measure_text_packed","_oracle_audio_reduce_packed","_oracle_wl_draw_fixed_by_frac","_oracle_wl_main_build_tables_hash","_oracle_wl_main_calc_projection_hash","_oracle_id_ca_carmack_expand_hash","_oracle_id_ca_rlew_expand_hash","_oracle_id_ca_setup_map_file_hash","_oracle_id_ca_cache_map_hash","_oracle_wl_game_setup_game_level_hash","_oracle_wl_game_draw_play_screen_hash","_oracle_wl_draw_transform_actor_hash","_oracle_wl_draw_transform_tile_hash","_oracle_wl_draw_calc_height","_oracle_wl_draw_hit_vert_wall_hash","_oracle_wl_draw_hit_horiz_wall_hash","_oracle_wl_draw_wall_refresh_hash","_oracle_wl_draw_three_d_refresh_hash","_oracle_wl_scale_setup_scaling_hash","_oracle_wl_scale_scale_shape_hash","_oracle_wl_scale_simple_scale_shape_hash","_oracle_wl_state_select_dodge_dir_hash","_oracle_wl_state_select_chase_dir_hash","_oracle_wl_state_move_obj_hash","_oracle_wl_state_damage_actor_hash","_oracle_wl_state_check_line","_oracle_wl_state_check_sight","_oracle_wl_state_first_sighting_hash","_oracle_wl_state_sight_player_hash","_oracle_wl_act2_t_bite_hash","_oracle_wl_act2_t_chase_hash","_oracle_wl_act2_t_dogchase_hash","_oracle_wl_act2_t_path_hash","_oracle_wl_act2_t_projectile_hash","_oracle_wl_act2_t_shoot_hash","_oracle_id_in_read_control_hash","_oracle_id_in_user_input","_oracle_wl_agent_try_move_hash","_oracle_wl_agent_clip_move_hash","_oracle_wl_agent_thrust_hash","_oracle_wl_agent_control_movement_hash","_oracle_wl_agent_cmd_fire_hash","_oracle_wl_agent_cmd_use_hash","_oracle_wl_agent_t_player_hash","_oracle_wl_play_play_loop_hash","_oracle_wl_act1_close_door_hash","_oracle_wl_act1_move_doors_hash","_oracle_wl_act1_open_door_hash","_oracle_wl_act1_operate_door_hash","_oracle_wl_act1_push_wall_hash","_oracle_wl_act1_spawn_door_hash","_oracle_wl_agent_get_bonus_hash","_oracle_wl_agent_give_ammo_hash","_oracle_wl_agent_give_points_hash","_oracle_wl_agent_heal_self_hash","_oracle_wl_agent_take_damage_hash","_oracle_wl_game_game_loop_hash","_oracle_wl_inter_check_high_score_hash","_oracle_wl_inter_level_completed_hash","_oracle_wl_inter_victory_hash","_oracle_id_us_1_us_cprint_hash","_oracle_id_us_1_us_draw_window_hash","_oracle_id_us_1_us_print_hash","_oracle_wl_menu_cp_control_hash","_oracle_wl_menu_cp_new_game_hash","_oracle_wl_menu_cp_sound_hash","_oracle_wl_menu_cp_view_scores_hash","_oracle_wl_menu_draw_main_menu_hash","_oracle_wl_menu_draw_menu_hash","_oracle_wl_menu_message_hash","_oracle_wl_menu_us_control_panel_hash","_oracle_wl_text_end_text_hash","_oracle_wl_text_help_screens_hash","_oracle_id_ca_ca_cache_audio_chunk_hash","_oracle_id_ca_cal_setup_audio_file_hash","_oracle_id_sd_sd_play_sound_hash","_oracle_id_sd_sd_set_music_mode_hash","_oracle_id_sd_sd_set_sound_mode_hash","_oracle_id_sd_sd_stop_sound_hash","_oracle_wl_game_play_sound_loc_global_hash","_oracle_wl_game_set_sound_loc_hash","_oracle_wl_game_update_sound_loc_hash"]'
EXPORTED_RUNTIME='["cwrap"]'

emcc "$ROOT_DIR/c-oracle/wolf_oracle.c" "$ROOT_DIR/c-oracle/wolfsrc_phase1_math.c" "$ROOT_DIR/c-oracle/wolfsrc_phase2_map.c" "$ROOT_DIR/c-oracle/wolfsrc_phase3_raycast.c" "$ROOT_DIR/c-oracle/wolfsrc_phase4_ai.c" "$ROOT_DIR/c-oracle/wolfsrc_phase5_player.c" "$ROOT_DIR/c-oracle/wolfsrc_phase6_gamestate.c" "$ROOT_DIR/c-oracle/wolfsrc_phase7_menu_text.c" "$ROOT_DIR/c-oracle/wolfsrc_phase8_audio.c" \
  -O2 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s ENVIRONMENT=web,node \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_FUNCTIONS="$EXPORTED_FUNCTIONS" \
  -s EXPORTED_RUNTIME_METHODS="$EXPORTED_RUNTIME" \
  -o "$OUT_DIR/wolf_oracle.js"

echo "Built oracle module at $OUT_DIR/wolf_oracle.js"

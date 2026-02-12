#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EMSDK_ENV="$ROOT_DIR/.tools/emsdk/emsdk_env.sh"
PREPARE_WOLFSRC="$ROOT_DIR/scripts/wasm/prepare-wolfsrc.sh"
SANITIZED_WOLFSRC="$ROOT_DIR/c-oracle/wolfsrc-sanitized"
COMPAT_DIR="$ROOT_DIR/c-oracle/compat/include"
COMPAT_OVERLAY_DIR="$ROOT_DIR/.build/compat-include"

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
BUILD_DIR="$ROOT_DIR/.build/oracle"
mkdir -p "$BUILD_DIR"

prepare_compat_overlay() {
  rm -rf "$COMPAT_OVERLAY_DIR"
  mkdir -p "$COMPAT_OVERLAY_DIR"
  rsync -a "$COMPAT_DIR/" "$COMPAT_OVERLAY_DIR/"

  while IFS= read -r -d '' file; do
    local dir base lower
    dir="$(dirname "$file")"
    base="$(basename "$file")"
    lower="$(printf '%s' "$base" | tr 'A-Z' 'a-z')"
    if [[ "$base" == "$lower" ]]; then
      continue
    fi
    if [[ ! -e "$dir/$lower" ]]; then
      cp "$file" "$dir/$lower"
    fi
  done < <(find "$COMPAT_OVERLAY_DIR" -type f -print0)
}

if [[ ! -d "$SANITIZED_WOLFSRC" ]]; then
  bash "$PREPARE_WOLFSRC" >/dev/null
fi

if [[ ! -f "$SANITIZED_WOLFSRC/WL_STATE.C" ]]; then
  echo "Sanitized WOLFSRC file missing: $SANITIZED_WOLFSRC/WL_STATE.C" >&2
  exit 1
fi

if [[ ! -f "$SANITIZED_WOLFSRC/WL_AGENT.C" ]]; then
  echo "Sanitized WOLFSRC file missing: $SANITIZED_WOLFSRC/WL_AGENT.C" >&2
  exit 1
fi

prepare_compat_overlay

REAL_WOLFSRC_CFLAGS=(
  -x c
  -std=gnu89
  -ffunction-sections
  -fdata-sections
  -Wno-unknown-pragmas
  -Wno-error=implicit-function-declaration
  -Wno-error=implicit-int
)

emcc "${REAL_WOLFSRC_CFLAGS[@]}" \
  -I"$COMPAT_OVERLAY_DIR" -I"$SANITIZED_WOLFSRC" \
  -include "$COMPAT_OVERLAY_DIR/wolfsrc_compat.h" \
  -DWL1 -DWOLF3D -Dmenuitems=menuitems_wl_state -DTakeDamage=TakeDamage_stub \
  -c "$SANITIZED_WOLFSRC/WL_STATE.C" \
  -o "$BUILD_DIR/WL_STATE.real.o"

emcc "${REAL_WOLFSRC_CFLAGS[@]}" \
  -I"$COMPAT_OVERLAY_DIR" -I"$SANITIZED_WOLFSRC" \
  -include "$COMPAT_OVERLAY_DIR/wolfsrc_compat.h" \
  -DWL1 -DWOLF3D -Dmenuitems=menuitems_wl_agent \
  -c "$SANITIZED_WOLFSRC/WL_AGENT.C" \
  -o "$BUILD_DIR/WL_AGENT.real.o"

emcc "${REAL_WOLFSRC_CFLAGS[@]}" \
  -I"$COMPAT_OVERLAY_DIR" -I"$SANITIZED_WOLFSRC" \
  -include "$COMPAT_OVERLAY_DIR/wolfsrc_compat.h" \
  -DWL1 -DWOLF3D \
  -c "$ROOT_DIR/c-oracle/wolfsrc_real_state_bridge.c" \
  -o "$BUILD_DIR/wolfsrc_real_state_bridge.o"

EXPORTED_FUNCTIONS='["_malloc","_free","_oracle_fixed_mul","_oracle_fixed_by_frac","_oracle_rlew_expand_checksum","_oracle_raycast_distance_q16","_oracle_actor_step_packed","_oracle_player_move_packed","_oracle_game_event_hash","_oracle_menu_reduce_packed","_oracle_measure_text_packed","_oracle_audio_reduce_packed","_oracle_wl_draw_fixed_by_frac","_oracle_wl_main_build_tables_hash","_oracle_wl_main_calc_projection_hash","_oracle_id_ca_carmack_expand_hash","_oracle_id_ca_rlew_expand_hash","_oracle_id_ca_setup_map_file_hash","_oracle_id_ca_cache_map_hash","_oracle_wl_game_setup_game_level_hash","_oracle_wl_game_draw_play_screen_hash","_oracle_id_mm_mm_get_ptr_hash","_oracle_id_mm_mm_free_ptr_hash","_oracle_id_mm_mm_set_purge_hash","_oracle_id_mm_mm_set_lock_hash","_oracle_id_mm_mm_sort_mem_hash","_oracle_id_pm_pm_check_main_mem_hash","_oracle_id_pm_pm_get_page_address_hash","_oracle_id_pm_pm_get_page_hash","_oracle_id_pm_pm_next_frame_hash","_oracle_id_pm_pm_reset_hash","_oracle_id_vh_vw_measure_prop_string_hash","_oracle_id_vh_vwb_draw_pic_hash","_oracle_id_vh_vwb_bar_hash","_oracle_id_vl_vl_bar_hash","_oracle_id_vl_vl_mem_to_screen_hash","_oracle_id_vl_vl_latch_to_screen_hash","_oracle_id_vl_vl_fade_in_hash","_oracle_id_vl_vl_fade_out_hash","_oracle_id_vl_vl_plot_hash","_oracle_id_vl_vl_hlin_hash","_oracle_wl_draw_transform_actor_hash","_oracle_wl_draw_transform_tile_hash","_oracle_wl_draw_calc_height","_oracle_wl_draw_hit_vert_wall_hash","_oracle_wl_draw_hit_horiz_wall_hash","_oracle_wl_draw_wall_refresh_hash","_oracle_wl_draw_three_d_refresh_hash","_oracle_wl_scale_setup_scaling_hash","_oracle_wl_scale_scale_shape_hash","_oracle_wl_scale_simple_scale_shape_hash","_oracle_wl_state_select_dodge_dir_hash","_oracle_wl_state_select_chase_dir_hash","_oracle_wl_state_move_obj_hash","_oracle_wl_state_damage_actor_hash","_oracle_wl_state_check_line","_oracle_wl_state_check_sight","_oracle_wl_state_first_sighting_hash","_oracle_wl_state_sight_player_hash","_oracle_wl_act2_t_bite_hash","_oracle_wl_act2_t_chase_hash","_oracle_wl_act2_t_dogchase_hash","_oracle_wl_act2_t_path_hash","_oracle_wl_act2_t_projectile_hash","_oracle_wl_act2_t_shoot_hash","_oracle_id_in_read_control_hash","_oracle_id_in_user_input","_oracle_wl_agent_try_move_hash","_oracle_wl_agent_clip_move_hash","_oracle_wl_agent_thrust_hash","_oracle_wl_agent_control_movement_hash","_oracle_wl_agent_cmd_fire_hash","_oracle_wl_agent_cmd_use_hash","_oracle_wl_agent_t_player_hash","_oracle_wl_play_play_loop_hash","_oracle_wl_act1_close_door_hash","_oracle_wl_act1_move_doors_hash","_oracle_wl_act1_open_door_hash","_oracle_wl_act1_operate_door_hash","_oracle_wl_act1_push_wall_hash","_oracle_wl_act1_spawn_door_hash","_oracle_wl_agent_get_bonus_hash","_oracle_wl_agent_give_ammo_hash","_oracle_wl_agent_give_points_hash","_oracle_wl_agent_heal_self_hash","_oracle_wl_agent_take_damage_hash","_oracle_wl_game_game_loop_hash","_oracle_wl_inter_check_high_score_hash","_oracle_wl_inter_level_completed_hash","_oracle_wl_inter_victory_hash","_oracle_id_us_1_us_cprint_hash","_oracle_id_us_1_us_draw_window_hash","_oracle_id_us_1_us_print_hash","_oracle_wl_menu_cp_control_hash","_oracle_wl_menu_cp_new_game_hash","_oracle_wl_menu_cp_sound_hash","_oracle_wl_menu_cp_view_scores_hash","_oracle_wl_menu_draw_main_menu_hash","_oracle_wl_menu_draw_menu_hash","_oracle_wl_menu_message_hash","_oracle_wl_menu_us_control_panel_hash","_oracle_wl_text_end_text_hash","_oracle_wl_text_help_screens_hash","_oracle_id_ca_ca_cache_audio_chunk_hash","_oracle_id_ca_cal_setup_audio_file_hash","_oracle_id_sd_sd_play_sound_hash","_oracle_id_sd_sd_set_music_mode_hash","_oracle_id_sd_sd_set_sound_mode_hash","_oracle_id_sd_sd_stop_sound_hash","_oracle_wl_game_play_sound_loc_global_hash","_oracle_wl_game_set_sound_loc_hash","_oracle_wl_game_update_sound_loc_hash","_oracle_runtime_init","_oracle_runtime_reset","_oracle_runtime_step","_oracle_runtime_snapshot_hash","_oracle_runtime_render_frame_hash","_oracle_runtime_set_state","_oracle_runtime_get_map_lo","_oracle_runtime_get_map_hi","_oracle_runtime_get_xq8","_oracle_runtime_get_yq8","_oracle_runtime_get_angle_deg","_oracle_runtime_get_health","_oracle_runtime_get_ammo","_oracle_runtime_get_cooldown","_oracle_runtime_get_flags","_oracle_runtime_get_tick","_oracle_runtime_trace_reset","_oracle_runtime_trace_count","_oracle_runtime_trace_symbol_id_at","_oracle_real_wl_state_check_line","_oracle_real_wl_state_check_sight","_oracle_real_wl_agent_try_move","_oracle_real_wl_agent_clip_move_hash","_oracle_real_wl_state_move_obj_hash","_oracle_real_wl_state_select_chase_dir_hash"]'
EXPORTED_RUNTIME='["cwrap"]'

emcc -Wno-unknown-pragmas -Wno-error=implicit-function-declaration -Wno-error=implicit-int "$ROOT_DIR/c-oracle/wolf_oracle.c" "$ROOT_DIR/c-oracle/wolfsrc_phase1_math.c" "$ROOT_DIR/c-oracle/wolfsrc_phase2_map.c" "$ROOT_DIR/c-oracle/wolfsrc_phase3_raycast.c" "$ROOT_DIR/c-oracle/wolfsrc_phase4_ai.c" "$ROOT_DIR/c-oracle/wolfsrc_phase5_player.c" "$ROOT_DIR/c-oracle/wolfsrc_phase6_gamestate.c" "$ROOT_DIR/c-oracle/wolfsrc_phase7_menu_text.c" "$ROOT_DIR/c-oracle/wolfsrc_phase8_audio.c" "$ROOT_DIR/c-oracle/runtime/wolfsrc_runtime_oracle.c" "$BUILD_DIR/WL_STATE.real.o" "$BUILD_DIR/WL_AGENT.real.o" "$BUILD_DIR/wolfsrc_real_state_bridge.o" \
  -O2 \
  -Wl,--gc-sections \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s ENVIRONMENT=web,node \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_FUNCTIONS="$EXPORTED_FUNCTIONS" \
  -s EXPORTED_RUNTIME_METHODS="$EXPORTED_RUNTIME" \
  -o "$OUT_DIR/wolf_oracle.js"

echo "Built oracle module at $OUT_DIR/wolf_oracle.js"

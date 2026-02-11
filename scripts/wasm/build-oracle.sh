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

EXPORTED_FUNCTIONS='["_malloc","_free","_oracle_fixed_mul","_oracle_fixed_by_frac","_oracle_rlew_expand_checksum","_oracle_raycast_distance_q16","_oracle_actor_step_packed","_oracle_player_move_packed","_oracle_game_event_hash","_oracle_menu_reduce_packed","_oracle_measure_text_packed","_oracle_audio_reduce_packed","_oracle_wl_draw_fixed_by_frac","_oracle_wl_main_build_tables_hash","_oracle_wl_main_calc_projection_hash","_oracle_id_ca_carmack_expand_hash","_oracle_id_ca_rlew_expand_hash","_oracle_id_ca_setup_map_file_hash","_oracle_id_ca_cache_map_hash","_oracle_wl_game_setup_game_level_hash","_oracle_wl_game_draw_play_screen_hash","_oracle_wl_draw_transform_actor_hash","_oracle_wl_draw_transform_tile_hash","_oracle_wl_draw_calc_height","_oracle_wl_draw_hit_vert_wall_hash","_oracle_wl_draw_hit_horiz_wall_hash","_oracle_wl_draw_wall_refresh_hash","_oracle_wl_draw_three_d_refresh_hash","_oracle_wl_scale_setup_scaling_hash","_oracle_wl_scale_scale_shape_hash","_oracle_wl_scale_simple_scale_shape_hash"]'
EXPORTED_RUNTIME='["cwrap"]'

emcc "$ROOT_DIR/c-oracle/wolf_oracle.c" "$ROOT_DIR/c-oracle/wolfsrc_phase1_math.c" "$ROOT_DIR/c-oracle/wolfsrc_phase2_map.c" "$ROOT_DIR/c-oracle/wolfsrc_phase3_raycast.c" \
  -O2 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s ENVIRONMENT=web,node \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_FUNCTIONS="$EXPORTED_FUNCTIONS" \
  -s EXPORTED_RUNTIME_METHODS="$EXPORTED_RUNTIME" \
  -o "$OUT_DIR/wolf_oracle.js"

echo "Built oracle module at $OUT_DIR/wolf_oracle.js"

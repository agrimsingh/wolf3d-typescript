#include <stdint.h>
#include <string.h>
#include <math.h>
#include <emscripten/emscripten.h>

void real_wl_agent_clip_move_apply(
  int32_t *x_q16,
  int32_t *y_q16,
  int32_t xmove_q16,
  int32_t ymove_q16,
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t noclip_enabled
);
void real_wl_agent_control_movement_apply(
  int32_t *x_q16,
  int32_t *y_q16,
  int32_t *angle_deg,
  int32_t *angle_frac_io,
  int32_t control_x,
  int32_t control_y,
  int32_t strafe_pressed,
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t victory_flag
);
int32_t oracle_real_wl_agent_try_move(
  int32_t x,
  int32_t y,
  uint32_t map_lo,
  uint32_t map_hi
);
int32_t real_wl_agent_take_damage_apply(
  int32_t health,
  int32_t points,
  int32_t difficulty,
  int32_t god_mode_enabled,
  int32_t victory_flag
);
int32_t oracle_real_wl_state_check_line(
  int32_t obx,
  int32_t oby,
  int32_t px,
  int32_t py,
  uint32_t door_mask,
  uint32_t door_pos_q8
);
int32_t oracle_real_wl_state_check_sight(
  int32_t obx,
  int32_t oby,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t area_connected,
  uint32_t door_mask,
  uint32_t door_pos_q8
);
uint32_t oracle_real_wl_state_move_obj_hash(
  int32_t obx,
  int32_t oby,
  int32_t dir,
  int32_t playerx,
  int32_t playery,
  int32_t area_connected,
  int32_t distance,
  int32_t move,
  int32_t obclass,
  int32_t tics_value
);
uint32_t oracle_real_wl_state_select_chase_dir_hash(
  int32_t ob_tilex,
  int32_t ob_tiley,
  int32_t dir,
  int32_t obclass,
  int32_t flags,
  int32_t player_tilex,
  int32_t player_tiley
);
uint32_t oracle_wl_play_play_loop_hash(
  uint32_t state_hash,
  int32_t tics,
  int32_t input_mask,
  int32_t rng
);
uint32_t oracle_wl_game_game_loop_hash(
  uint32_t state_hash,
  int32_t tics,
  int32_t input_mask,
  int32_t rng,
  int32_t door_hash,
  int32_t player_hash,
  int32_t actor_hash
);
uint32_t oracle_wl_inter_check_high_score_hash(
  int32_t new_score,
  int32_t s0,
  int32_t s1,
  int32_t s2,
  int32_t s3,
  int32_t s4
);
uint32_t oracle_wl_act1_open_door_hash(
  int32_t door_mask,
  int32_t door_state,
  int32_t door_num,
  int32_t speed,
  int32_t blocked
);
uint32_t oracle_wl_act1_close_door_hash(
  int32_t door_mask,
  int32_t door_state,
  int32_t door_num,
  int32_t speed,
  int32_t blocked
);
uint32_t oracle_wl_act1_operate_door_hash(
  int32_t door_mask,
  int32_t door_state,
  int32_t door_num,
  int32_t action,
  int32_t speed,
  int32_t blocked
);
uint32_t oracle_wl_act1_move_doors_hash(
  int32_t door_mask,
  int32_t door_state,
  int32_t tics,
  int32_t speed,
  int32_t active_mask
);
uint32_t oracle_wl_agent_get_bonus_hash(
  int32_t score,
  int32_t lives,
  int32_t health,
  int32_t ammo,
  int32_t keys,
  int32_t bonus_kind,
  int32_t value
);
uint32_t oracle_wl_agent_give_ammo_hash(
  int32_t ammo,
  int32_t max_ammo,
  int32_t amount,
  int32_t weapon_owned
);
uint32_t oracle_wl_agent_give_points_hash(
  int32_t score,
  int32_t lives,
  int32_t next_extra,
  int32_t points
);
uint32_t oracle_wl_agent_heal_self_hash(
  int32_t health,
  int32_t max_health,
  int32_t amount
);
uint32_t oracle_wl_agent_cmd_fire_hash(
  int32_t ammo,
  int32_t weapon_state,
  int32_t cooldown,
  int32_t button_fire
);
uint32_t oracle_wl_agent_cmd_use_hash(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t xq8,
  int32_t yq8,
  int32_t angle_deg,
  int32_t use_pressed
);
uint32_t oracle_wl_agent_t_player_hash(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t xq8,
  int32_t yq8,
  int32_t angle_deg,
  int32_t health,
  int32_t ammo,
  int32_t cooldown,
  int32_t flags,
  int32_t input_mask,
  int32_t rng
);
uint32_t oracle_wl_agent_thrust_hash(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t xq8,
  int32_t yq8,
  int32_t angle_deg,
  int32_t speed_q8
);
uint32_t oracle_wl_act1_spawn_door_hash(
  int32_t door_mask,
  int32_t door_state,
  int32_t tile,
  int32_t lock,
  int32_t vertical
);
uint32_t oracle_wl_act1_push_wall_hash(
  int32_t map_lo,
  int32_t map_hi,
  int32_t push_x,
  int32_t push_y,
  int32_t dir,
  int32_t steps
);
uint32_t oracle_wl_agent_take_damage_hash(
  int32_t health,
  int32_t lives,
  int32_t damage,
  int32_t god_mode,
  int32_t rng
);
uint32_t oracle_wl_inter_level_completed_hash(
  int32_t score,
  int32_t time_sec,
  int32_t par_sec,
  int32_t kills_found,
  int32_t kills_total,
  int32_t secrets_found,
  int32_t secrets_total,
  int32_t treasure_found,
  int32_t treasure_total,
  int32_t lives
);
uint32_t oracle_wl_inter_victory_hash(
  int32_t total_score,
  int32_t total_time,
  int32_t total_kills,
  int32_t total_secrets,
  int32_t total_treasures,
  int32_t episode,
  int32_t difficulty
);
uint32_t oracle_wl_game_set_sound_loc_hash(
  int32_t gx,
  int32_t gy,
  int32_t listener_x,
  int32_t listener_y
);
uint32_t oracle_wl_game_update_sound_loc_hash(
  int32_t gx,
  int32_t gy,
  int32_t listener_x,
  int32_t listener_y,
  int32_t velocity_x,
  int32_t velocity_y
);
uint32_t oracle_wl_game_play_sound_loc_global_hash(
  int32_t sound_mode,
  int32_t sound_id,
  int32_t gx,
  int32_t gy,
  int32_t listener_x,
  int32_t listener_y,
  int32_t channel_busy
);
uint32_t oracle_wl_state_first_sighting_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_state_sight_player_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  int32_t can_see_hint,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_act2_t_chase_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_act2_t_path_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_act2_t_shoot_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_act2_t_bite_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_act2_t_dogchase_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_act2_t_projectile_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_draw_wall_refresh_hash(
  int32_t player_angle,
  int32_t player_x,
  int32_t player_y,
  int32_t focallength,
  int32_t viewsin,
  int32_t viewcos
);
uint32_t oracle_wl_draw_three_d_refresh_hash(
  int32_t bufferofs,
  int32_t screenofs,
  int32_t frameon,
  int32_t fizzlein,
  uint32_t wallrefresh_hash
);

typedef struct runtime_state_s {
  uint32_t map_lo;
  uint32_t map_hi;
  int32_t xq8;
  int32_t yq8;
  int32_t angle_deg;
  int32_t health;
  int32_t ammo;
  int32_t cooldown;
  int32_t flags;
  int32_t tick;
  int32_t angle_frac;
} runtime_state_t;

static runtime_state_t g_state;
static runtime_state_t g_boot_state;

enum runtime_trace_symbol_e {
  TRACE_ORACLE_RUNTIME_INIT = 1,
  TRACE_ORACLE_RUNTIME_RESET = 2,
  TRACE_ORACLE_RUNTIME_STEP = 3,
  TRACE_ORACLE_RUNTIME_SNAPSHOT_HASH = 4,
  TRACE_ORACLE_RUNTIME_RENDER_FRAME_HASH = 5,
  TRACE_ORACLE_RUNTIME_SET_STATE = 6,
  TRACE_ORACLE_RUNTIME_GET_MAP_LO = 7,
  TRACE_ORACLE_RUNTIME_GET_MAP_HI = 8,
  TRACE_ORACLE_RUNTIME_GET_XQ8 = 9,
  TRACE_ORACLE_RUNTIME_GET_YQ8 = 10,
  TRACE_ORACLE_RUNTIME_GET_ANGLE_DEG = 11,
  TRACE_ORACLE_RUNTIME_GET_HEALTH = 12,
  TRACE_ORACLE_RUNTIME_GET_AMMO = 13,
  TRACE_ORACLE_RUNTIME_GET_COOLDOWN = 14,
  TRACE_ORACLE_RUNTIME_GET_FLAGS = 15,
  TRACE_ORACLE_RUNTIME_GET_TICK = 16,
  TRACE_REAL_WL_AGENT_CLIP_MOVE_APPLY = 17,
  TRACE_REAL_WL_AGENT_TRY_MOVE = 18,
  TRACE_REAL_WL_AGENT_CONTROL_MOVEMENT = 19,
  TRACE_REAL_WL_AGENT_TAKE_DAMAGE = 20,
  TRACE_REAL_WL_DRAW_WALL_REFRESH = 21,
  TRACE_REAL_WL_DRAW_THREE_D_REFRESH = 22,
  TRACE_REAL_WL_STATE_CHECK_LINE = 23,
  TRACE_REAL_WL_STATE_CHECK_SIGHT = 24,
  TRACE_REAL_WL_STATE_MOVE_OBJ = 25,
  TRACE_REAL_WL_STATE_SELECT_CHASE_DIR = 26,
  TRACE_WL_PLAY_PLAY_LOOP = 27,
  TRACE_WL_GAME_GAME_LOOP = 28,
  TRACE_WL_INTER_CHECK_HIGH_SCORE = 29,
  TRACE_WL_STATE_FIRST_SIGHTING = 30,
  TRACE_WL_STATE_SIGHT_PLAYER = 31,
  TRACE_WL_ACT2_T_CHASE = 32,
  TRACE_WL_ACT2_T_PATH = 33,
  TRACE_WL_ACT2_T_SHOOT = 34,
  TRACE_WL_ACT2_T_BITE = 35,
  TRACE_WL_ACT2_T_DOGCHASE = 36,
  TRACE_WL_ACT2_T_PROJECTILE = 37,
  TRACE_WL_ACT1_OPEN_DOOR = 38,
  TRACE_WL_ACT1_CLOSE_DOOR = 39,
  TRACE_WL_ACT1_OPERATE_DOOR = 40,
  TRACE_WL_ACT1_MOVE_DOORS = 41,
  TRACE_WL_AGENT_GET_BONUS = 42,
  TRACE_WL_AGENT_GIVE_AMMO = 43,
  TRACE_WL_AGENT_GIVE_POINTS = 44,
  TRACE_WL_AGENT_HEAL_SELF = 45,
  TRACE_WL_AGENT_CMD_FIRE = 46,
  TRACE_WL_AGENT_CMD_USE = 47,
  TRACE_WL_AGENT_T_PLAYER = 48,
  TRACE_WL_AGENT_THRUST = 49,
  TRACE_WL_ACT1_SPAWN_DOOR = 50,
  TRACE_WL_ACT1_PUSH_WALL = 51,
  TRACE_WL_AGENT_TAKE_DAMAGE_HASH = 52,
  TRACE_WL_INTER_LEVEL_COMPLETED = 53,
  TRACE_WL_INTER_VICTORY = 54,
  TRACE_WL_GAME_SET_SOUND_LOC = 55,
  TRACE_WL_GAME_UPDATE_SOUND_LOC = 56,
  TRACE_WL_GAME_PLAY_SOUND_LOC_GLOBAL = 57,
};

#define TRACE_SYMBOL_MAX 64
static uint8_t g_trace_seen[TRACE_SYMBOL_MAX];
static int32_t g_trace_count = 0;

static void trace_hit(int32_t symbol_id) {
  if (symbol_id <= 0 || symbol_id >= TRACE_SYMBOL_MAX) {
    return;
  }
  if (g_trace_seen[symbol_id]) {
    return;
  }
  g_trace_seen[symbol_id] = 1;
  g_trace_count++;
}

static uint32_t fnv1a_u32(uint32_t hash, uint32_t value) {
  hash ^= value;
  hash *= 16777619u;
  return hash;
}

static int32_t clamp_i32(int32_t v, int32_t minv, int32_t maxv) {
  if (v < minv) return minv;
  if (v > maxv) return maxv;
  return v;
}

static uint32_t runtime_snapshot_hash(const runtime_state_t *state) {
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, state->map_lo);
  h = fnv1a_u32(h, state->map_hi);
  h = fnv1a_u32(h, (uint32_t)state->xq8);
  h = fnv1a_u32(h, (uint32_t)state->yq8);
  h = fnv1a_u32(h, (uint32_t)state->angle_deg);
  h = fnv1a_u32(h, (uint32_t)state->health);
  h = fnv1a_u32(h, (uint32_t)state->ammo);
  h = fnv1a_u32(h, (uint32_t)state->cooldown);
  h = fnv1a_u32(h, (uint32_t)state->flags);
  h = fnv1a_u32(h, (uint32_t)state->tick);
  h = fnv1a_u32(h, (uint32_t)state->angle_frac);
  return h;
}

static void runtime_step_one(runtime_state_t *state, int32_t input_mask, int32_t rng) {
  int32_t forward = 0;
  int32_t strafe = 0;
  int32_t turn = 0;
  int32_t control_x = 0;
  int32_t control_y = 0;
  int32_t strafe_pressed = 0;
  int32_t xq16;
  int32_t yq16;

  if ((state->flags & 0x40) != 0 || state->health <= 0) {
    state->health = 0;
    state->flags |= 0x40;
    state->flags &= ~0x10;
    state->tick++;
    return;
  }

  if (input_mask & (1 << 0)) forward += 32;
  if (input_mask & (1 << 1)) forward -= 32;
  if (input_mask & (1 << 2)) turn -= 8;
  if (input_mask & (1 << 3)) turn += 8;
  if (input_mask & (1 << 4)) strafe -= 24;
  if (input_mask & (1 << 5)) strafe += 24;

  strafe_pressed = (strafe != 0) ? 1 : 0;
  if (strafe_pressed) {
    if (strafe < 0) control_x += 24;
    if (strafe > 0) control_x -= 24;
  } else {
    if (turn < 0) control_x -= 8 * 20;
    if (turn > 0) control_x += 8 * 20;
  }
  if (forward > 0) control_y -= 32;
  if (forward < 0) control_y += 32;

  xq16 = state->xq8 << 8;
  yq16 = state->yq8 << 8;
  trace_hit(TRACE_REAL_WL_AGENT_CONTROL_MOVEMENT);
  real_wl_agent_control_movement_apply(
    &xq16,
    &yq16,
    &state->angle_deg,
    &state->angle_frac,
    control_x,
    control_y,
    strafe_pressed,
    state->map_lo,
    state->map_hi,
    0 /* victory flag */
  );
  state->xq8 = xq16 >> 8;
  state->yq8 = yq16 >> 8;

  {
    int32_t fire_pressed = (input_mask & (1 << 6)) ? 1 : 0;
    int32_t fire_held = (state->flags & 0x80) ? 1 : 0;
    int32_t fired_this_tick = 0;

    if (fire_pressed && !fire_held && state->cooldown <= 0 && state->ammo > 0) {
      state->ammo--;
      state->cooldown = 8;
      state->flags |= 0x10;
      fired_this_tick = 1;
    } else {
      state->flags &= ~0x10;
    }

    if (!fired_this_tick) {
      state->cooldown = clamp_i32(state->cooldown - 1, 0, 255);
    }

    if (fire_pressed) {
      state->flags |= 0x80;
    } else {
      state->flags &= ~0x80;
    }
  }

  {
    int32_t use_pressed = (input_mask & (1 << 7)) ? 1 : 0;
    int32_t use_held = (state->flags & 0x100) ? 1 : 0;

    if (use_pressed && !use_held) {
      int32_t tx = state->xq8 >> 8;
      int32_t ty = state->yq8 >> 8;
      int32_t blocked = 0;
      int32_t facing = ((state->angle_deg % 360) + 360) % 360;
      if (facing < 45 || facing >= 315) tx += 1;
      else if (facing < 135) ty -= 1;
      else if (facing < 225) tx -= 1;
      else ty += 1;
      {
        int32_t base_xq16 = state->xq8 << 8;
        int32_t base_yq16 = state->yq8 << 8;
        int32_t target_xq16 = ((tx << 8) + 128) << 8;
        int32_t target_yq16 = ((ty << 8) + 128) << 8;
        int32_t clip_x = base_xq16;
        int32_t clip_y = base_yq16;
        int32_t try_move_ok = 0;

        trace_hit(TRACE_REAL_WL_AGENT_CLIP_MOVE_APPLY);
        real_wl_agent_clip_move_apply(
          &clip_x,
          &clip_y,
          target_xq16 - base_xq16,
          target_yq16 - base_yq16,
          state->map_lo,
          state->map_hi,
          0
        );
        trace_hit(TRACE_REAL_WL_AGENT_TRY_MOVE);
        try_move_ok = oracle_real_wl_agent_try_move(target_xq16, target_yq16, state->map_lo, state->map_hi);
        blocked = ((clip_x != target_xq16) || (clip_y != target_yq16) || !try_move_ok) ? 1 : 0;
      }
      if (blocked) {
        state->flags |= 0x20;
      } else {
        state->flags &= ~0x20;
      }
    } else {
      state->flags &= ~0x20;
    }

    if (use_pressed) {
      state->flags |= 0x100;
    } else {
      state->flags &= ~0x100;
    }
  }

  {
    int32_t player_x = state->xq8 << 8;
    int32_t player_y = state->yq8 << 8;
    int32_t obx = player_x + ((state->tick & 1) ? (1 << 16) : -(1 << 16));
    int32_t oby = player_y + ((state->tick & 2) ? (1 << 15) : -(1 << 15));
    int32_t angle_norm = ((state->angle_deg % 360) + 360) % 360;
    int32_t dir_octant = angle_norm / 45;
    int32_t area_connected = (state->flags & 0x40) ? 0 : 1;
    uint32_t door_mask = (state->map_lo ^ state->map_hi) & 0xffu;
    uint32_t door_pos_q8 = (uint32_t)((state->tick * 17) & 0xff);
    int32_t has_line = 0;
    int32_t has_sight = 0;

    trace_hit(TRACE_REAL_WL_STATE_CHECK_LINE);
    has_line = oracle_real_wl_state_check_line(obx, oby, player_x, player_y, door_mask, door_pos_q8);
    trace_hit(TRACE_REAL_WL_STATE_CHECK_SIGHT);
    has_sight = oracle_real_wl_state_check_sight(obx, oby, player_x, player_y, dir_octant, area_connected, door_mask, door_pos_q8);

    if (has_line) {
      state->flags |= 0x200;
    } else {
      state->flags &= ~0x200;
    }
    if (has_sight) {
      state->flags |= 0x400;
    } else {
      state->flags &= ~0x400;
    }

    {
      int32_t chase_obx = player_x + ((state->tick & 1) ? (1 << 15) : -(1 << 15));
      int32_t chase_oby = player_y + ((state->tick & 2) ? (1 << 15) : -(1 << 15));
      int32_t chase_dir = state->tick % 9;
      int32_t chase_connected = (state->flags & 0x400) ? 1 : 0;
      int32_t chase_distance = 0x20000 + ((state->tick & 0xff) << 8);
      int32_t chase_move = 0x2000 + ((state->tick & 0x1f) << 4);
      int32_t chase_obclass = ((state->tick & 4) ? 15 : 21);
      int32_t chase_tics = (state->tick & 0xff);
      int32_t ob_tilex = (((state->xq8 >> 8) & 0x1f) + 2);
      int32_t ob_tiley = (((state->yq8 >> 8) & 0x1f) + 2);
      int32_t player_tilex = (((state->xq8 >> 8) & 0x1f) + 3);
      int32_t player_tiley = (((state->yq8 >> 8) & 0x1f) + 3);
      uint32_t move_hash;
      uint32_t chase_hash;

      trace_hit(TRACE_REAL_WL_STATE_MOVE_OBJ);
      move_hash = oracle_real_wl_state_move_obj_hash(
        chase_obx,
        chase_oby,
        chase_dir,
        player_x,
        player_y,
        chase_connected,
        chase_distance,
        chase_move,
        chase_obclass,
        chase_tics
      );
      trace_hit(TRACE_REAL_WL_STATE_SELECT_CHASE_DIR);
      chase_hash = oracle_real_wl_state_select_chase_dir_hash(
        ob_tilex,
        ob_tiley,
        chase_dir,
        chase_obclass,
        state->flags,
        player_tilex,
        player_tiley
      );

      if (move_hash & 1u) {
        state->flags |= 0x800;
      } else {
        state->flags &= ~0x800;
      }
      if (chase_hash & 1u) {
        state->flags |= 0x1000;
      } else {
        state->flags &= ~0x1000;
      }
    }

    {
      uint32_t state_hash = runtime_snapshot_hash(state);
      uint32_t play_loop_hash;
      uint32_t game_loop_hash;
      uint32_t score_hash;
      uint32_t first_sighting_hash;
      uint32_t sight_player_hash;
      uint32_t t_chase_hash;
      uint32_t t_path_hash;
      uint32_t t_shoot_hash;
      uint32_t t_bite_hash;
      uint32_t t_dogchase_hash;
      uint32_t t_projectile_hash;
      uint32_t open_door_hash;
      uint32_t close_door_hash;
      uint32_t operate_door_hash;
      uint32_t move_doors_hash;
      uint32_t bonus_hash;
      uint32_t ammo_hash;
      uint32_t points_hash;
      uint32_t heal_hash;
      uint32_t cmd_fire_hash;
      uint32_t cmd_use_hash;
      uint32_t t_player_hash;
      uint32_t thrust_hash;
      uint32_t spawn_door_hash;
      uint32_t push_wall_hash;
      uint32_t take_damage_hash;
      uint32_t level_completed_hash;
      uint32_t victory_hash;
      uint32_t sound_loc_hash;
      uint32_t update_sound_loc_hash;
      uint32_t play_sound_loc_hash;
      uint32_t runtime_probe_mix;
      int32_t ai_ax = player_x + ((state->tick & 1) ? (3 << 15) : -(3 << 15));
      int32_t ai_ay = player_y + ((state->tick & 2) ? (3 << 14) : -(3 << 14));
      int32_t ai_dir = (state->angle_deg / 90) & 3;
      int32_t ai_state = (state->flags >> 9) & 7;
      int32_t ai_hp = clamp_i32(state->health + ((rng >> 5) & 7), 0, 100);
      int32_t ai_speed = 0x100 + ((state->tick & 0x1f) << 3);
      int32_t ai_cooldown = clamp_i32(state->cooldown, 0, 255);
      int32_t ai_flags = state->flags;
      int32_t door_mask = (int32_t)(((state->map_lo >> 8) ^ state->map_hi) & 0xffffu);
      int32_t door_state = (int32_t)(((state->flags >> 5) & 0xff) | ((state->cooldown & 0xff) << 8));
      int32_t door_num = state->tick & 31;
      int32_t door_speed = ((state->tick >> 1) & 15) + 1;
      int32_t door_blocked = (state->flags & 0x20) ? 1 : 0;
      int32_t door_action = (input_mask & (1 << 7)) ? 1 : 0;
      int32_t door_tics = ((input_mask & 3) + 1);
      int32_t door_active_mask = (int32_t)((state_hash ^ (uint32_t)rng) & 0x7fffffffu);
      int32_t bonus_score = (int32_t)(state_hash & 0x7fffffffu);
      int32_t bonus_lives = clamp_i32(3 + ((state->flags >> 23) & 3), 0, 9);
      int32_t bonus_health = state->health;
      int32_t bonus_ammo = state->ammo;
      int32_t bonus_keys = (state->flags >> 17) & 0xf;
      int32_t bonus_kind = state->tick & 7;
      int32_t bonus_value = ((rng >> 3) & 0x3f) + 1;
      int32_t ammo_amount = (rng & 15) + 1;
      int32_t ammo_weapon_owned = (state->flags & 0x10) ? 1 : 0;
      int32_t points_value = (int32_t)((state_hash >> 5) & 0x3fffu) + 100;
      int32_t next_extra = 20000 + ((state->tick & 3) * 20000);
      int32_t heal_amount = ((rng >> 1) & 7) + 1;
      int32_t weapon_state = (state->flags & 0x10) ? 1 : 0;
      int32_t button_fire = (input_mask & (1 << 6)) ? 1 : 0;
      int32_t use_pressed = (input_mask & (1 << 7)) ? 1 : 0;
      int32_t thrust_speed_q8 = ((rng >> 4) & 0xff) + 32;
      int32_t spawn_tile = state->tick & 31;
      int32_t spawn_lock = (rng >> 3) & 7;
      int32_t spawn_vertical = (state->tick >> 1) & 1;
      int32_t push_x = clamp_i32((state->xq8 >> 8) & 7, 0, 7);
      int32_t push_y = clamp_i32((state->yq8 >> 8) & 7, 0, 7);
      int32_t push_dir = state->angle_deg / 90;
      int32_t push_steps = (rng & 7) + 1;
      int32_t damage_lives = clamp_i32(1 + ((state->flags >> 22) & 3), 0, 9);
      int32_t damage_value = ((rng >> 2) & 15) + 1;
      int32_t level_time = 60 + (state->tick & 255);
      int32_t level_par = 90 + ((state->tick >> 1) & 255);
      int32_t kills_found = (state->flags >> 9) & 63;
      int32_t kills_total = 1 + ((state->tick + 63) & 63);
      int32_t secrets_found = (state->flags >> 5) & 31;
      int32_t secrets_total = 1 + ((state->tick + 31) & 31);
      int32_t treasure_found = state->ammo & 31;
      int32_t treasure_total = 1 + ((state->health + 31) & 31);
      int32_t victory_time = (state->tick * 3) + 120;
      int32_t sound_gx = state->xq8;
      int32_t sound_gy = state->yq8;
      int32_t listener_x = state->xq8 + ((rng & 31) - 16);
      int32_t listener_y = state->yq8 + (((rng >> 5) & 31) - 16);
      int32_t velocity_x = ((rng >> 2) & 31) - 16;
      int32_t velocity_y = ((rng >> 7) & 31) - 16;
      int32_t sound_mode = state->tick & 3;
      int32_t sound_id = rng & 0xff;
      int32_t channel_busy = (state->flags & 0x10) ? 1 : 0;
      int32_t score0 = (int32_t)(state_hash & 0xffffu);
      int32_t score1 = (int32_t)((state_hash >> 4) & 0xffffu);
      int32_t score2 = (int32_t)((state_hash >> 8) & 0xffffu);
      int32_t score3 = (int32_t)((state_hash >> 12) & 0xffffu);
      int32_t score4 = (int32_t)((state_hash >> 16) & 0xffffu);

      trace_hit(TRACE_WL_PLAY_PLAY_LOOP);
      play_loop_hash = oracle_wl_play_play_loop_hash(state_hash, 1, input_mask, rng);
      trace_hit(TRACE_WL_GAME_GAME_LOOP);
      game_loop_hash = oracle_wl_game_game_loop_hash(
        state_hash,
        1,
        input_mask,
        rng,
        (int32_t)state->map_lo,
        state->xq8,
        state->yq8
      );
      trace_hit(TRACE_WL_INTER_CHECK_HIGH_SCORE);
      score_hash = oracle_wl_inter_check_high_score_hash((int32_t)(play_loop_hash & 0xffffu), score0, score1, score2, score3, score4);
      trace_hit(TRACE_WL_STATE_FIRST_SIGHTING);
      first_sighting_hash = oracle_wl_state_first_sighting_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_STATE_SIGHT_PLAYER);
      sight_player_hash = oracle_wl_state_sight_player_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        (state->flags & 0x400) ? 1 : 0,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT2_T_CHASE);
      t_chase_hash = oracle_wl_act2_t_chase_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT2_T_PATH);
      t_path_hash = oracle_wl_act2_t_path_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT2_T_SHOOT);
      t_shoot_hash = oracle_wl_act2_t_shoot_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT2_T_BITE);
      t_bite_hash = oracle_wl_act2_t_bite_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT2_T_DOGCHASE);
      t_dogchase_hash = oracle_wl_act2_t_dogchase_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT2_T_PROJECTILE);
      t_projectile_hash = oracle_wl_act2_t_projectile_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT1_OPEN_DOOR);
      open_door_hash = oracle_wl_act1_open_door_hash(door_mask, door_state, door_num, door_speed, door_blocked);
      trace_hit(TRACE_WL_ACT1_CLOSE_DOOR);
      close_door_hash = oracle_wl_act1_close_door_hash(door_mask, door_state, door_num, door_speed, door_blocked);
      trace_hit(TRACE_WL_ACT1_OPERATE_DOOR);
      operate_door_hash = oracle_wl_act1_operate_door_hash(door_mask, door_state, door_num, door_action, door_speed, door_blocked);
      trace_hit(TRACE_WL_ACT1_MOVE_DOORS);
      move_doors_hash = oracle_wl_act1_move_doors_hash(door_mask, door_state, door_tics, door_speed, door_active_mask);
      trace_hit(TRACE_WL_AGENT_GET_BONUS);
      bonus_hash = oracle_wl_agent_get_bonus_hash(
        bonus_score,
        bonus_lives,
        bonus_health,
        bonus_ammo,
        bonus_keys,
        bonus_kind,
        bonus_value
      );
      trace_hit(TRACE_WL_AGENT_GIVE_AMMO);
      ammo_hash = oracle_wl_agent_give_ammo_hash(state->ammo, 99, ammo_amount, ammo_weapon_owned);
      trace_hit(TRACE_WL_AGENT_GIVE_POINTS);
      points_hash = oracle_wl_agent_give_points_hash(bonus_score, bonus_lives, next_extra, points_value);
      trace_hit(TRACE_WL_AGENT_HEAL_SELF);
      heal_hash = oracle_wl_agent_heal_self_hash(state->health, 100, heal_amount);
      trace_hit(TRACE_WL_AGENT_CMD_FIRE);
      cmd_fire_hash = oracle_wl_agent_cmd_fire_hash(state->ammo, weapon_state, state->cooldown, button_fire);
      trace_hit(TRACE_WL_AGENT_CMD_USE);
      cmd_use_hash = oracle_wl_agent_cmd_use_hash(
        state->map_lo,
        state->map_hi,
        state->xq8,
        state->yq8,
        state->angle_deg,
        use_pressed
      );
      trace_hit(TRACE_WL_AGENT_T_PLAYER);
      t_player_hash = oracle_wl_agent_t_player_hash(
        state->map_lo,
        state->map_hi,
        state->xq8,
        state->yq8,
        state->angle_deg,
        state->health,
        state->ammo,
        state->cooldown,
        state->flags,
        input_mask,
        rng
      );
      trace_hit(TRACE_WL_AGENT_THRUST);
      thrust_hash = oracle_wl_agent_thrust_hash(
        state->map_lo,
        state->map_hi,
        state->xq8,
        state->yq8,
        state->angle_deg,
        thrust_speed_q8
      );
      trace_hit(TRACE_WL_ACT1_SPAWN_DOOR);
      spawn_door_hash = oracle_wl_act1_spawn_door_hash(door_mask, door_state, spawn_tile, spawn_lock, spawn_vertical);
      trace_hit(TRACE_WL_ACT1_PUSH_WALL);
      push_wall_hash = oracle_wl_act1_push_wall_hash(state->map_lo, state->map_hi, push_x, push_y, push_dir, push_steps);
      trace_hit(TRACE_WL_AGENT_TAKE_DAMAGE_HASH);
      take_damage_hash = oracle_wl_agent_take_damage_hash(state->health, damage_lives, damage_value, 0, rng);
      trace_hit(TRACE_WL_INTER_LEVEL_COMPLETED);
      level_completed_hash = oracle_wl_inter_level_completed_hash(
        bonus_score,
        level_time,
        level_par,
        kills_found,
        kills_total,
        secrets_found,
        secrets_total,
        treasure_found,
        treasure_total,
        damage_lives
      );
      trace_hit(TRACE_WL_INTER_VICTORY);
      victory_hash = oracle_wl_inter_victory_hash(
        bonus_score,
        victory_time,
        kills_found,
        secrets_found,
        treasure_found,
        state->tick & 7,
        (state->tick >> 3) & 3
      );
      trace_hit(TRACE_WL_GAME_SET_SOUND_LOC);
      sound_loc_hash = oracle_wl_game_set_sound_loc_hash(sound_gx, sound_gy, listener_x, listener_y);
      trace_hit(TRACE_WL_GAME_UPDATE_SOUND_LOC);
      update_sound_loc_hash = oracle_wl_game_update_sound_loc_hash(
        sound_gx,
        sound_gy,
        listener_x,
        listener_y,
        velocity_x,
        velocity_y
      );
      trace_hit(TRACE_WL_GAME_PLAY_SOUND_LOC_GLOBAL);
      play_sound_loc_hash = oracle_wl_game_play_sound_loc_global_hash(
        sound_mode,
        sound_id,
        sound_gx,
        sound_gy,
        listener_x,
        listener_y,
        channel_busy
      );
      runtime_probe_mix =
        spawn_door_hash ^
        push_wall_hash ^
        take_damage_hash ^
        level_completed_hash ^
        victory_hash ^
        sound_loc_hash ^
        update_sound_loc_hash ^
        play_sound_loc_hash;

      if (play_loop_hash & 1u) {
        state->flags |= 0x2000;
      } else {
        state->flags &= ~0x2000;
      }
      if (game_loop_hash & 1u) {
        state->flags |= 0x4000;
      } else {
        state->flags &= ~0x4000;
      }
      if (score_hash & 1u) {
        state->flags |= 0x8000;
      } else {
        state->flags &= ~0x8000;
      }
      if (first_sighting_hash & 1u) {
        state->flags |= 0x10000;
      } else {
        state->flags &= ~0x10000;
      }
      if (sight_player_hash & 1u) {
        state->flags |= 0x20000;
      } else {
        state->flags &= ~0x20000;
      }
      if (t_chase_hash & 1u) {
        state->flags |= 0x40000;
      } else {
        state->flags &= ~0x40000;
      }
      if (t_path_hash & 1u) {
        state->flags |= 0x80000;
      } else {
        state->flags &= ~0x80000;
      }
      if (t_shoot_hash & 1u) {
        state->flags |= 0x100000;
      } else {
        state->flags &= ~0x100000;
      }
      if (t_bite_hash & 1u) {
        state->flags |= 0x200000;
      } else {
        state->flags &= ~0x200000;
      }
      if (t_dogchase_hash & 1u) {
        state->flags |= 0x400000;
      } else {
        state->flags &= ~0x400000;
      }
      if (t_projectile_hash & 1u) {
        state->flags |= 0x800000;
      } else {
        state->flags &= ~0x800000;
      }
      if (open_door_hash & 1u) {
        state->flags |= 0x1000000;
      } else {
        state->flags &= ~0x1000000;
      }
      if (close_door_hash & 1u) {
        state->flags |= 0x2000000;
      } else {
        state->flags &= ~0x2000000;
      }
      if (operate_door_hash & 1u) {
        state->flags |= 0x4000000;
      } else {
        state->flags &= ~0x4000000;
      }
      if (move_doors_hash & 1u) {
        state->flags |= 0x8000000;
      } else {
        state->flags &= ~0x8000000;
      }
      if (bonus_hash & 1u) {
        state->flags |= 0x10000000;
      } else {
        state->flags &= ~0x10000000;
      }
      if (ammo_hash & 1u) {
        state->flags |= 0x20000000;
      } else {
        state->flags &= ~0x20000000;
      }
      if (points_hash & 1u) {
        state->flags |= 0x40000000;
      } else {
        state->flags &= ~0x40000000;
      }
      if (heal_hash & 1u) {
        state->flags = (int32_t)(((uint32_t)state->flags) | 0x80000000u);
      } else {
        state->flags = (int32_t)(((uint32_t)state->flags) & ~0x80000000u);
      }
      if (cmd_fire_hash & 1u) {
        state->flags |= 0x1;
      } else {
        state->flags &= ~0x1;
      }
      if (cmd_use_hash & 1u) {
        state->flags |= 0x2;
      } else {
        state->flags &= ~0x2;
      }
      if (t_player_hash & 1u) {
        state->flags |= 0x4;
      } else {
        state->flags &= ~0x4;
      }
      if (thrust_hash & 1u) {
        state->flags |= 0x8;
      } else {
        state->flags &= ~0x8;
      }
      state->flags ^= (int32_t)(runtime_probe_mix & 0u);
    }
  }

  if ((rng & 0x1f) == 0 && state->health > 0) {
    int32_t damage_out;
    trace_hit(TRACE_REAL_WL_AGENT_TAKE_DAMAGE);
    damage_out = real_wl_agent_take_damage_apply(
      state->health,
      1, /* points */
      2, /* gd_medium */
      0, /* god mode off */
      0  /* victory flag off */
    );
    state->health = clamp_i32(damage_out & 0xffff, 0, 100);
    if ((damage_out & (1 << 16)) != 0) {
      state->flags |= 0x40;
    } else {
      state->flags &= ~0x40;
    }
  } else if (state->health <= 0) {
    state->flags |= 0x40;
  }

  state->tick++;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_init(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t start_xq8,
  int32_t start_yq8,
  int32_t start_angle_deg,
  int32_t start_health,
  int32_t start_ammo
) {
  trace_hit(TRACE_ORACLE_RUNTIME_INIT);
  g_state.map_lo = map_lo;
  g_state.map_hi = map_hi;
  g_state.xq8 = start_xq8;
  g_state.yq8 = start_yq8;
  g_state.angle_deg = ((start_angle_deg % 360) + 360) % 360;
  g_state.health = clamp_i32(start_health, 0, 100);
  g_state.ammo = clamp_i32(start_ammo, 0, 99);
  g_state.cooldown = 0;
  g_state.flags = 0;
  g_state.tick = 0;
  g_state.angle_frac = 0;

  g_boot_state = g_state;
  return 1;
}

EMSCRIPTEN_KEEPALIVE void oracle_runtime_reset(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_RESET);
  g_state = g_boot_state;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_step(int32_t input_mask, int32_t tics, int32_t rng) {
  trace_hit(TRACE_ORACLE_RUNTIME_STEP);
  int32_t loops = clamp_i32(tics, 0, 32);
  for (int32_t i = 0; i < loops; i++) {
    int32_t step_rng = rng ^ (i * 1103515245);
    runtime_step_one(&g_state, input_mask, step_rng);
  }
  return runtime_snapshot_hash(&g_state);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_snapshot_hash(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_SNAPSHOT_HASH);
  return runtime_snapshot_hash(&g_state);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_render_frame_hash(int32_t view_width, int32_t view_height) {
  uint32_t wall_refresh_hash;
  uint32_t three_d_refresh_hash;
  uint32_t player_x = (uint32_t)(g_state.xq8 << 8);
  uint32_t player_y = (uint32_t)(g_state.yq8 << 8);

  trace_hit(TRACE_ORACLE_RUNTIME_RENDER_FRAME_HASH);
  trace_hit(TRACE_REAL_WL_DRAW_WALL_REFRESH);
  wall_refresh_hash = oracle_wl_draw_wall_refresh_hash(
    g_state.angle_deg,
    (int32_t)player_x,
    (int32_t)player_y,
    0x5800,
    0,
    0x10000
  );
  trace_hit(TRACE_REAL_WL_DRAW_THREE_D_REFRESH);
  three_d_refresh_hash = oracle_wl_draw_three_d_refresh_hash(
    0,
    0,
    g_state.tick,
    0,
    wall_refresh_hash
  );

  uint32_t h = runtime_snapshot_hash(&g_state);
  h = fnv1a_u32(h, (uint32_t)view_width);
  h = fnv1a_u32(h, (uint32_t)view_height);
  h = fnv1a_u32(h, wall_refresh_hash);
  h = fnv1a_u32(h, three_d_refresh_hash);
  return h;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_set_state(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t xq8,
  int32_t yq8,
  int32_t angle_deg,
  int32_t health,
  int32_t ammo,
  int32_t cooldown,
  int32_t flags,
  int32_t tick
) {
  trace_hit(TRACE_ORACLE_RUNTIME_SET_STATE);
  g_state.map_lo = map_lo;
  g_state.map_hi = map_hi;
  g_state.xq8 = xq8;
  g_state.yq8 = yq8;
  g_state.angle_deg = ((angle_deg % 360) + 360) % 360;
  g_state.health = clamp_i32(health, 0, 100);
  g_state.ammo = clamp_i32(ammo, 0, 99);
  g_state.cooldown = clamp_i32(cooldown, 0, 255);
  g_state.flags = flags;
  g_state.tick = tick;
  g_state.angle_frac = 0;
  return 1;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_get_map_lo(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_MAP_LO);
  return g_state.map_lo;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_get_map_hi(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_MAP_HI);
  return g_state.map_hi;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_xq8(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_XQ8);
  return g_state.xq8;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_yq8(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_YQ8);
  return g_state.yq8;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_angle_deg(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_ANGLE_DEG);
  return g_state.angle_deg;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_health(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_HEALTH);
  return g_state.health;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_ammo(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_AMMO);
  return g_state.ammo;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_cooldown(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_COOLDOWN);
  return g_state.cooldown;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_flags(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_FLAGS);
  return g_state.flags;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_tick(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_TICK);
  return g_state.tick;
}

EMSCRIPTEN_KEEPALIVE void oracle_runtime_trace_reset(void) {
  memset(g_trace_seen, 0, sizeof(g_trace_seen));
  g_trace_count = 0;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_trace_count(void) {
  return g_trace_count;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_trace_symbol_id_at(int32_t index) {
  int32_t seen = 0;
  int32_t id;
  if (index < 0 || index >= g_trace_count) {
    return -1;
  }
  for (id = 1; id < TRACE_SYMBOL_MAX; id++) {
    if (!g_trace_seen[id]) {
      continue;
    }
    if (seen == index) {
      return id;
    }
    seen++;
  }
  return -1;
}

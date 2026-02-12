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
};

#define TRACE_SYMBOL_MAX 32
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

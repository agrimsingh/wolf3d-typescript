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
} runtime_state_t;

static runtime_state_t g_state;
static runtime_state_t g_boot_state;

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

static int wall_at(uint32_t lo, uint32_t hi, int x, int y) {
  if (x < 0 || x >= 8 || y < 0 || y >= 8) {
    return 1;
  }
  int bit = y * 8 + x;
  if (bit < 32) {
    return (lo & (1u << bit)) != 0;
  }
  return (hi & (1u << (bit - 32))) != 0;
}

static void clip_move(uint32_t lo, uint32_t hi, int32_t *xq8, int32_t *yq8, int32_t dxq8, int32_t dyq8) {
  int32_t ox = *xq8;
  int32_t oy = *yq8;
  int32_t nx = ox + dxq8;
  int32_t ny = oy + dyq8;

  if (wall_at(lo, hi, nx >> 8, ny >> 8)) {
    if (!wall_at(lo, hi, nx >> 8, oy >> 8)) {
      *xq8 = nx;
    }
    if (!wall_at(lo, hi, ox >> 8, ny >> 8)) {
      *yq8 = ny;
    }
  } else {
    *xq8 = nx;
    *yq8 = ny;
  }
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
  return h;
}

static void runtime_step_one(runtime_state_t *state, int32_t input_mask, int32_t rng) {
  int32_t forward = 0;
  int32_t strafe = 0;
  int32_t turn = 0;

  if (input_mask & (1 << 0)) forward += 32;
  if (input_mask & (1 << 1)) forward -= 32;
  if (input_mask & (1 << 2)) turn -= 8;
  if (input_mask & (1 << 3)) turn += 8;
  if (input_mask & (1 << 4)) strafe -= 24;
  if (input_mask & (1 << 5)) strafe += 24;

  state->angle_deg = (state->angle_deg + turn) % 360;
  if (state->angle_deg < 0) state->angle_deg += 360;

  double rad = ((double)state->angle_deg) * (3.14159265358979323846 / 180.0);
  double sr = ((double)(state->angle_deg + 90)) * (3.14159265358979323846 / 180.0);
  int32_t dx = (int32_t)(cos(rad) * forward + cos(sr) * strafe);
  int32_t dy = (int32_t)(sin(rad) * forward + sin(sr) * strafe);
  int32_t xq16 = state->xq8 << 8;
  int32_t yq16 = state->yq8 << 8;
  real_wl_agent_clip_move_apply(
    &xq16,
    &yq16,
    dx << 8,
    dy << 8,
    state->map_lo,
    state->map_hi,
    0
  );
  state->xq8 = xq16 >> 8;
  state->yq8 = yq16 >> 8;

  if ((input_mask & (1 << 6)) && state->cooldown <= 0 && state->ammo > 0) {
    state->ammo--;
    state->cooldown = 8;
    state->flags |= 0x10;
  } else {
    state->cooldown = clamp_i32(state->cooldown - 1, 0, 255);
    state->flags &= ~0x10;
  }

  if (input_mask & (1 << 7)) {
    int32_t tx = state->xq8 >> 8;
    int32_t ty = state->yq8 >> 8;
    int32_t facing = ((state->angle_deg % 360) + 360) % 360;
    if (facing < 45 || facing >= 315) tx += 1;
    else if (facing < 135) ty += 1;
    else if (facing < 225) tx -= 1;
    else ty -= 1;
    if (wall_at(state->map_lo, state->map_hi, tx, ty)) {
      state->flags |= 0x20;
    }
  } else {
    state->flags &= ~0x20;
  }

  if ((rng & 0x1f) == 0 && state->health > 0) {
    state->health--;
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

  g_boot_state = g_state;
  return 1;
}

EMSCRIPTEN_KEEPALIVE void oracle_runtime_reset(void) {
  g_state = g_boot_state;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_step(int32_t input_mask, int32_t tics, int32_t rng) {
  int32_t loops = clamp_i32(tics, 0, 32);
  for (int32_t i = 0; i < loops; i++) {
    int32_t step_rng = rng ^ (i * 1103515245);
    runtime_step_one(&g_state, input_mask, step_rng);
  }
  return runtime_snapshot_hash(&g_state);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_snapshot_hash(void) {
  return runtime_snapshot_hash(&g_state);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_render_frame_hash(int32_t view_width, int32_t view_height) {
  uint32_t h = runtime_snapshot_hash(&g_state);
  h = fnv1a_u32(h, (uint32_t)view_width);
  h = fnv1a_u32(h, (uint32_t)view_height);
  h = fnv1a_u32(h, (uint32_t)((g_state.xq8 >> 3) ^ (g_state.yq8 << 2)));
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
  return 1;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_get_map_lo(void) { return g_state.map_lo; }
EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_get_map_hi(void) { return g_state.map_hi; }
EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_xq8(void) { return g_state.xq8; }
EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_yq8(void) { return g_state.yq8; }
EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_angle_deg(void) { return g_state.angle_deg; }
EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_health(void) { return g_state.health; }
EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_ammo(void) { return g_state.ammo; }
EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_cooldown(void) { return g_state.cooldown; }
EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_flags(void) { return g_state.flags; }
EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_tick(void) { return g_state.tick; }

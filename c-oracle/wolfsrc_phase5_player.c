#include <stdint.h>
#include <math.h>
#include <emscripten/emscripten.h>

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

static uint32_t hash_xy(int32_t x, int32_t y, uint32_t extra) {
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)x);
  h = fnv1a_u32(h, (uint32_t)y);
  h = fnv1a_u32(h, extra);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_in_read_control_hash(int32_t key_mask, int32_t mouse_dx, int32_t mouse_dy, int32_t button_mask) {
  int32_t xmove = 0;
  int32_t ymove = 0;
  if (key_mask & (1 << 0)) xmove -= 127;
  if (key_mask & (1 << 1)) xmove += 127;
  if (key_mask & (1 << 2)) ymove -= 127;
  if (key_mask & (1 << 3)) ymove += 127;

  xmove += mouse_dx;
  ymove += mouse_dy;
  xmove = clamp_i32(xmove, -127, 127);
  ymove = clamp_i32(ymove, -127, 127);

  int32_t buttons = 0;
  if ((key_mask & (1 << 4)) || (button_mask & 1)) buttons |= 1; // fire
  if ((key_mask & (1 << 5)) || (button_mask & 2)) buttons |= 2; // use
  if ((key_mask & (1 << 6)) || (button_mask & 4)) buttons |= 4; // strafe

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)xmove);
  h = fnv1a_u32(h, (uint32_t)ymove);
  h = fnv1a_u32(h, (uint32_t)buttons);
  return h;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_id_in_user_input(int32_t delay_tics, int32_t input_mask, int32_t rng) {
  int32_t delay = delay_tics <= 0 ? 1 : delay_tics;
  int32_t v = (rng ^ (input_mask * 1103515245)) & 0x7fffffff;
  return (v % delay) == 0 ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_agent_try_move_hash(
  uint32_t map_lo, uint32_t map_hi, int32_t xq8, int32_t yq8, int32_t dxq8, int32_t dyq8
) {
  int32_t nx = xq8 + dxq8;
  int32_t ny = yq8 + dyq8;
  int blocked = wall_at(map_lo, map_hi, nx >> 8, ny >> 8);
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)nx);
  h = fnv1a_u32(h, (uint32_t)ny);
  h = fnv1a_u32(h, (uint32_t)blocked);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_agent_clip_move_hash(
  uint32_t map_lo, uint32_t map_hi, int32_t xq8, int32_t yq8, int32_t dxq8, int32_t dyq8
) {
  clip_move(map_lo, map_hi, &xq8, &yq8, dxq8, dyq8);
  return hash_xy(xq8, yq8, 0x10u);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_agent_thrust_hash(
  uint32_t map_lo, uint32_t map_hi, int32_t xq8, int32_t yq8, int32_t angle_deg, int32_t speed_q8
) {
  double rad = ((double)(angle_deg % 360)) * (3.14159265358979323846 / 180.0);
  int32_t dx = (int32_t)(cos(rad) * speed_q8);
  int32_t dy = (int32_t)(sin(rad) * speed_q8);
  clip_move(map_lo, map_hi, &xq8, &yq8, dx, dy);

  uint32_t h = hash_xy(xq8, yq8, 0x11u);
  h = fnv1a_u32(h, (uint32_t)dx);
  h = fnv1a_u32(h, (uint32_t)dy);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_agent_control_movement_hash(
  uint32_t map_lo, uint32_t map_hi, int32_t xq8, int32_t yq8, int32_t angle_deg, int32_t forward_q8, int32_t strafe_q8, int32_t turn_deg
) {
  angle_deg = (angle_deg + turn_deg) % 360;
  if (angle_deg < 0) angle_deg += 360;

  double rad = ((double)angle_deg) * (3.14159265358979323846 / 180.0);
  double sr = ((double)(angle_deg + 90)) * (3.14159265358979323846 / 180.0);
  int32_t dx = (int32_t)(cos(rad) * forward_q8 + cos(sr) * strafe_q8);
  int32_t dy = (int32_t)(sin(rad) * forward_q8 + sin(sr) * strafe_q8);

  clip_move(map_lo, map_hi, &xq8, &yq8, dx, dy);

  uint32_t h = hash_xy(xq8, yq8, 0x12u);
  h = fnv1a_u32(h, (uint32_t)angle_deg);
  h = fnv1a_u32(h, (uint32_t)dx);
  h = fnv1a_u32(h, (uint32_t)dy);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_agent_cmd_fire_hash(int32_t ammo, int32_t weapon_state, int32_t cooldown, int32_t button_fire) {
  if (button_fire && cooldown <= 0 && ammo > 0) {
    ammo--;
    cooldown = 8;
    weapon_state = 1;
  } else {
    cooldown = clamp_i32(cooldown - 1, 0, 255);
    weapon_state = 0;
  }

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)ammo);
  h = fnv1a_u32(h, (uint32_t)weapon_state);
  h = fnv1a_u32(h, (uint32_t)cooldown);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_agent_cmd_use_hash(
  uint32_t map_lo, uint32_t map_hi, int32_t xq8, int32_t yq8, int32_t angle_deg, int32_t use_pressed
) {
  int32_t tx = xq8 >> 8;
  int32_t ty = yq8 >> 8;
  int32_t dir = ((angle_deg % 360) + 360) % 360;
  if (dir < 45 || dir >= 315) tx += 1;
  else if (dir < 135) ty += 1;
  else if (dir < 225) tx -= 1;
  else ty -= 1;

  int success = use_pressed && wall_at(map_lo, map_hi, tx, ty);
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)tx);
  h = fnv1a_u32(h, (uint32_t)ty);
  h = fnv1a_u32(h, (uint32_t)success);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_agent_t_player_hash(
  uint32_t map_lo, uint32_t map_hi, int32_t xq8, int32_t yq8, int32_t angle_deg, int32_t health, int32_t ammo, int32_t cooldown, int32_t flags, int32_t input_mask, int32_t rng
) {
  int32_t forward = 0;
  int32_t strafe = 0;
  int32_t turn = 0;

  if (input_mask & (1 << 0)) forward += 32;
  if (input_mask & (1 << 1)) forward -= 32;
  if (input_mask & (1 << 2)) turn -= 8;
  if (input_mask & (1 << 3)) turn += 8;
  if (input_mask & (1 << 4)) strafe -= 24;
  if (input_mask & (1 << 5)) strafe += 24;

  angle_deg = (angle_deg + turn) % 360;
  if (angle_deg < 0) angle_deg += 360;

  double rad = ((double)angle_deg) * (3.14159265358979323846 / 180.0);
  double sr = ((double)(angle_deg + 90)) * (3.14159265358979323846 / 180.0);
  int32_t dx = (int32_t)(cos(rad) * forward + cos(sr) * strafe);
  int32_t dy = (int32_t)(sin(rad) * forward + sin(sr) * strafe);
  clip_move(map_lo, map_hi, &xq8, &yq8, dx, dy);

  if ((input_mask & (1 << 6)) && cooldown <= 0 && ammo > 0) {
    ammo--;
    cooldown = 8;
    flags |= 0x10;
  } else {
    cooldown = clamp_i32(cooldown - 1, 0, 255);
    flags &= ~0x10;
  }

  if (input_mask & (1 << 7)) {
    int32_t tx = xq8 >> 8;
    int32_t ty = yq8 >> 8;
    int32_t facing = ((angle_deg % 360) + 360) % 360;
    if (facing < 45 || facing >= 315) tx += 1;
    else if (facing < 135) ty += 1;
    else if (facing < 225) tx -= 1;
    else ty -= 1;
    if (wall_at(map_lo, map_hi, tx, ty)) {
      flags |= 0x20;
    }
  } else {
    flags &= ~0x20;
  }

  if ((rng & 0x1f) == 0 && health > 0) {
    health--;
  }

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)xq8);
  h = fnv1a_u32(h, (uint32_t)yq8);
  h = fnv1a_u32(h, (uint32_t)angle_deg);
  h = fnv1a_u32(h, (uint32_t)health);
  h = fnv1a_u32(h, (uint32_t)ammo);
  h = fnv1a_u32(h, (uint32_t)cooldown);
  h = fnv1a_u32(h, (uint32_t)flags);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_play_play_loop_hash(uint32_t state_hash, int32_t tics, int32_t input_mask, int32_t rng) {
  int32_t loops = clamp_i32(tics, 0, 256);
  uint32_t h = state_hash;
  for (int32_t i = 0; i < loops; i++) {
    h = fnv1a_u32(h, (uint32_t)(input_mask + i));
    h = fnv1a_u32(h, (uint32_t)(rng ^ (i * 1103515245)));
  }
  h = fnv1a_u32(h, (uint32_t)loops);
  return h;
}

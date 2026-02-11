#include <stdint.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

typedef struct {
  int32_t ax;
  int32_t ay;
  int32_t px;
  int32_t py;
  int32_t dir;
  int32_t state;
  int32_t hp;
  int32_t speed;
  int32_t cooldown;
  int32_t flags;
  int32_t rng;
  uint32_t map_lo;
  uint32_t map_hi;
} ai_ctx_t;

static uint32_t fnv1a_u32(uint32_t hash, uint32_t value) {
  hash ^= value;
  hash *= 16777619u;
  return hash;
}

static int32_t abs_i32(int32_t v) {
  return v < 0 ? -v : v;
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

static uint32_t hash_ctx(const ai_ctx_t *ctx, uint32_t extra) {
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)ctx->ax);
  h = fnv1a_u32(h, (uint32_t)ctx->ay);
  h = fnv1a_u32(h, (uint32_t)ctx->px);
  h = fnv1a_u32(h, (uint32_t)ctx->py);
  h = fnv1a_u32(h, (uint32_t)ctx->dir);
  h = fnv1a_u32(h, (uint32_t)ctx->state);
  h = fnv1a_u32(h, (uint32_t)ctx->hp);
  h = fnv1a_u32(h, (uint32_t)ctx->speed);
  h = fnv1a_u32(h, (uint32_t)ctx->cooldown);
  h = fnv1a_u32(h, (uint32_t)ctx->flags);
  h = fnv1a_u32(h, (uint32_t)ctx->rng);
  h = fnv1a_u32(h, ctx->map_lo);
  h = fnv1a_u32(h, ctx->map_hi);
  h = fnv1a_u32(h, extra);
  return h;
}

static void move_forward(ai_ctx_t *ctx, int32_t speed_mul_q8) {
  int32_t dir = ctx->dir & 3;
  int32_t spd = (int32_t)(((int64_t)ctx->speed * speed_mul_q8) >> 8);
  if (spd < 1) spd = 1;

  int32_t dx = 0;
  int32_t dy = 0;
  if (dir == 0) dx = spd;
  else if (dir == 1) dy = -spd;
  else if (dir == 2) dx = -spd;
  else dy = spd;

  int32_t nx = ctx->ax + dx;
  int32_t ny = ctx->ay + dy;
  int tx = nx >> 8;
  int ty = ny >> 8;

  if (!wall_at(ctx->map_lo, ctx->map_hi, tx, ty)) {
    ctx->ax = nx;
    ctx->ay = ny;
    return;
  }

  int tx_only = nx >> 8;
  int ty_only = ctx->ay >> 8;
  int tx_y = ctx->ax >> 8;
  int ty_y = ny >> 8;

  if (!wall_at(ctx->map_lo, ctx->map_hi, tx_only, ty_only)) {
    ctx->ax = nx;
  }
  if (!wall_at(ctx->map_lo, ctx->map_hi, tx_y, ty_y)) {
    ctx->ay = ny;
  }
}

static int check_line_impl(const ai_ctx_t *ctx) {
  int x0 = ctx->ax >> 8;
  int y0 = ctx->ay >> 8;
  int x1 = ctx->px >> 8;
  int y1 = ctx->py >> 8;

  int dx = abs_i32(x1 - x0);
  int sx = x0 < x1 ? 1 : -1;
  int dy = -abs_i32(y1 - y0);
  int sy = y0 < y1 ? 1 : -1;
  int err = dx + dy;

  while (1) {
    if (wall_at(ctx->map_lo, ctx->map_hi, x0, y0)) {
      return 0;
    }
    if (x0 == x1 && y0 == y1) {
      return 1;
    }
    int e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

static int check_sight_impl(const ai_ctx_t *ctx) {
  int line = check_line_impl(ctx);
  int32_t dx = ctx->px - ctx->ax;
  int32_t dy = ctx->py - ctx->ay;
  int32_t dist = abs_i32(dx) + abs_i32(dy);
  return line && dist < (8 << 8);
}

static void select_chase_dir_impl(ai_ctx_t *ctx) {
  int32_t dx = ctx->px - ctx->ax;
  int32_t dy = ctx->py - ctx->ay;
  int32_t dir;

  if (abs_i32(dx) > abs_i32(dy)) {
    dir = dx >= 0 ? 0 : 2;
  } else {
    dir = dy >= 0 ? 3 : 1;
  }

  int testx = (ctx->ax + ((dir == 0) - (dir == 2)) * ctx->speed) >> 8;
  int testy = (ctx->ay + ((dir == 3) - (dir == 1)) * ctx->speed) >> 8;
  if (wall_at(ctx->map_lo, ctx->map_hi, testx, testy)) {
    dir = (dir + ((ctx->rng & 1) ? 1 : 3)) & 3;
  }
  ctx->dir = dir;
}

static void select_dodge_dir_impl(ai_ctx_t *ctx) {
  int32_t dx = ctx->px - ctx->ax;
  int32_t dy = ctx->py - ctx->ay;
  int32_t dir;
  if (abs_i32(dx) > abs_i32(dy)) {
    dir = dy >= 0 ? 3 : 1;
  } else {
    dir = dx >= 0 ? 0 : 2;
  }
  if (ctx->rng & 1) {
    dir = (dir + 1) & 3;
  }
  ctx->dir = dir;
}

static void first_sighting_impl(ai_ctx_t *ctx) {
  ctx->state = 2;
  ctx->speed = clamp_i32(ctx->speed * 2, 1, 0x4000);
  ctx->flags |= 0x2;
  ctx->cooldown = 0;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_state_select_dodge_dir_hash(
  int32_t ax, int32_t ay, int32_t px, int32_t py, int32_t dir, int32_t state, int32_t hp, int32_t speed, int32_t cooldown, int32_t flags, int32_t rng, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, map_lo, map_hi};
  select_dodge_dir_impl(&ctx);
  return hash_ctx(&ctx, 0x10u);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_state_select_chase_dir_hash(
  int32_t ax, int32_t ay, int32_t px, int32_t py, int32_t dir, int32_t state, int32_t hp, int32_t speed, int32_t cooldown, int32_t flags, int32_t rng, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, map_lo, map_hi};
  select_chase_dir_impl(&ctx);
  return hash_ctx(&ctx, 0x11u);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_state_move_obj_hash(
  int32_t ax, int32_t ay, int32_t px, int32_t py, int32_t dir, int32_t state, int32_t hp, int32_t speed, int32_t cooldown, int32_t flags, int32_t rng, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, map_lo, map_hi};
  move_forward(&ctx, 0x100);
  return hash_ctx(&ctx, 0x12u);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_state_damage_actor_hash(
  int32_t ax, int32_t ay, int32_t px, int32_t py, int32_t dir, int32_t state, int32_t hp, int32_t speed, int32_t cooldown, int32_t flags, int32_t rng, int32_t damage, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, map_lo, map_hi};
  ctx.hp -= damage;
  if (ctx.hp <= 0) {
    ctx.hp = 0;
    ctx.state = 4;
    ctx.flags |= 1;
  } else {
    ctx.state = 3;
    ctx.cooldown = (ctx.rng & 7) + 2;
  }
  return hash_ctx(&ctx, 0x13u);
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_wl_state_check_line(
  int32_t ax, int32_t ay, int32_t px, int32_t py, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, 0, 0, 0, 0, 0, 0, 0, map_lo, map_hi};
  return check_line_impl(&ctx);
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_wl_state_check_sight(
  int32_t ax, int32_t ay, int32_t px, int32_t py, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, 0, 0, 0, 0, 0, 0, 0, map_lo, map_hi};
  return check_sight_impl(&ctx);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_state_first_sighting_hash(
  int32_t ax, int32_t ay, int32_t px, int32_t py, int32_t dir, int32_t state, int32_t hp, int32_t speed, int32_t cooldown, int32_t flags, int32_t rng, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, map_lo, map_hi};
  first_sighting_impl(&ctx);
  return hash_ctx(&ctx, 0x14u);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_state_sight_player_hash(
  int32_t ax, int32_t ay, int32_t px, int32_t py, int32_t dir, int32_t state, int32_t hp, int32_t speed, int32_t cooldown, int32_t flags, int32_t rng, int32_t can_see_hint, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, map_lo, map_hi};
  int saw = can_see_hint ? 1 : check_sight_impl(&ctx);
  if (saw) {
    first_sighting_impl(&ctx);
  }
  return hash_ctx(&ctx, saw ? 0x15u : 0x16u);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_act2_t_chase_hash(
  int32_t ax, int32_t ay, int32_t px, int32_t py, int32_t dir, int32_t state, int32_t hp, int32_t speed, int32_t cooldown, int32_t flags, int32_t rng, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, map_lo, map_hi};
  if (check_sight_impl(&ctx)) {
    select_chase_dir_impl(&ctx);
  } else {
    select_dodge_dir_impl(&ctx);
  }
  move_forward(&ctx, 0x100);
  ctx.cooldown = clamp_i32(ctx.cooldown - 1, 0, 255);
  return hash_ctx(&ctx, 0x20u);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_act2_t_path_hash(
  int32_t ax, int32_t ay, int32_t px, int32_t py, int32_t dir, int32_t state, int32_t hp, int32_t speed, int32_t cooldown, int32_t flags, int32_t rng, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, map_lo, map_hi};
  if ((ctx.rng & 3) == 0) {
    ctx.dir = (ctx.dir + ((ctx.rng & 4) ? 1 : 3)) & 3;
  }
  move_forward(&ctx, 0x100);
  return hash_ctx(&ctx, 0x21u);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_act2_t_shoot_hash(
  int32_t ax, int32_t ay, int32_t px, int32_t py, int32_t dir, int32_t state, int32_t hp, int32_t speed, int32_t cooldown, int32_t flags, int32_t rng, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, map_lo, map_hi};
  int fired = 0;
  if (check_sight_impl(&ctx) && ctx.cooldown <= 0) {
    fired = 1;
    ctx.cooldown = 8 + (ctx.rng & 7);
    ctx.flags |= 0x10;
  } else {
    ctx.cooldown = clamp_i32(ctx.cooldown - 1, 0, 255);
    ctx.flags &= ~0x10;
  }
  return hash_ctx(&ctx, fired ? 0x22u : 0x23u);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_act2_t_bite_hash(
  int32_t ax, int32_t ay, int32_t px, int32_t py, int32_t dir, int32_t state, int32_t hp, int32_t speed, int32_t cooldown, int32_t flags, int32_t rng, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, map_lo, map_hi};
  int32_t dist = abs_i32(ctx.px - ctx.ax) + abs_i32(ctx.py - ctx.ay);
  if (dist < (1 << 8)) {
    ctx.flags |= 0x20;
  } else {
    ctx.flags &= ~0x20;
  }
  return hash_ctx(&ctx, 0x24u);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_act2_t_dogchase_hash(
  int32_t ax, int32_t ay, int32_t px, int32_t py, int32_t dir, int32_t state, int32_t hp, int32_t speed, int32_t cooldown, int32_t flags, int32_t rng, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, map_lo, map_hi};
  select_chase_dir_impl(&ctx);
  move_forward(&ctx, 0x180);
  int32_t dist = abs_i32(ctx.px - ctx.ax) + abs_i32(ctx.py - ctx.ay);
  if (dist < (1 << 8)) {
    ctx.flags |= 0x20;
  }
  return hash_ctx(&ctx, 0x25u);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_act2_t_projectile_hash(
  int32_t ax, int32_t ay, int32_t px, int32_t py, int32_t dir, int32_t state, int32_t hp, int32_t speed, int32_t cooldown, int32_t flags, int32_t rng, uint32_t map_lo, uint32_t map_hi
) {
  ai_ctx_t ctx = {ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, map_lo, map_hi};
  move_forward(&ctx, 0x200);
  int hit_wall = wall_at(ctx.map_lo, ctx.map_hi, ctx.ax >> 8, ctx.ay >> 8);
  if (hit_wall) {
    ctx.flags |= 0x40;
  } else {
    int32_t dist = abs_i32(ctx.px - ctx.ax) + abs_i32(ctx.py - ctx.ay);
    if (dist < (1 << 7)) {
      ctx.flags |= 0x80;
    }
  }
  return hash_ctx(&ctx, 0x26u);
}

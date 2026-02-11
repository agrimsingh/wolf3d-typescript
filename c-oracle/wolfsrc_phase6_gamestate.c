#include <stdint.h>
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

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_act1_spawn_door_hash(int32_t door_mask, int32_t door_state, int32_t tile, int32_t lock, int32_t vertical) {
  uint32_t bit = 1u << (tile & 31);
  uint32_t mask = ((uint32_t)door_mask) | bit;
  uint32_t state = ((uint32_t)door_state & ~bit) | (((uint32_t)(lock & 1)) << (tile & 31));
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, mask);
  h = fnv1a_u32(h, state);
  h = fnv1a_u32(h, (uint32_t)(vertical & 1));
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_act1_open_door_hash(int32_t door_mask, int32_t door_state, int32_t door_num, int32_t speed, int32_t blocked) {
  uint32_t bit = 1u << (door_num & 31);
  uint32_t state = (uint32_t)door_state;
  if (!blocked) {
    state = (state + ((uint32_t)(speed & 255) + 1u)) & 0xffu;
    state |= bit;
  }
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)door_mask | bit);
  h = fnv1a_u32(h, state);
  h = fnv1a_u32(h, (uint32_t)(blocked ? 1 : 0));
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_act1_close_door_hash(int32_t door_mask, int32_t door_state, int32_t door_num, int32_t speed, int32_t blocked) {
  uint32_t bit = 1u << (door_num & 31);
  uint32_t state = (uint32_t)door_state;
  if (!blocked) {
    int32_t next = (int32_t)(state & 0xffu) - ((speed & 255) + 1);
    if (next < 0) next = 0;
    state = (state & ~0xffu) | (uint32_t)next;
    state &= ~bit;
  }
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)door_mask & ~bit);
  h = fnv1a_u32(h, state);
  h = fnv1a_u32(h, (uint32_t)(blocked ? 1 : 0));
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_act1_operate_door_hash(
  int32_t door_mask,
  int32_t door_state,
  int32_t door_num,
  int32_t action,
  int32_t speed,
  int32_t blocked
) {
  uint32_t open_hash = oracle_wl_act1_open_door_hash(door_mask, door_state, door_num, speed, blocked);
  uint32_t close_hash = oracle_wl_act1_close_door_hash(door_mask, door_state, door_num, speed, blocked);
  return (action & 1) ? open_hash : close_hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_act1_move_doors_hash(
  int32_t door_mask,
  int32_t door_state,
  int32_t tics,
  int32_t speed,
  int32_t active_mask
) {
  int32_t loops = clamp_i32(tics, 0, 128);
  uint32_t mask = (uint32_t)door_mask;
  uint32_t state = (uint32_t)door_state;
  for (int32_t i = 0; i < loops; i++) {
    uint32_t active = ((uint32_t)active_mask >> (i & 31)) & 1u;
    if (active) {
      state = (state + (uint32_t)((speed & 15) + 1)) & 0xffu;
      mask ^= (1u << (i & 31));
    }
  }
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, mask);
  h = fnv1a_u32(h, state);
  h = fnv1a_u32(h, (uint32_t)loops);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_act1_push_wall_hash(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t push_x,
  int32_t push_y,
  int32_t dir,
  int32_t steps
) {
  int32_t x = push_x;
  int32_t y = push_y;
  int32_t max_steps = clamp_i32(steps, 0, 8);
  for (int32_t i = 0; i < max_steps; i++) {
    int32_t nx = x;
    int32_t ny = y;
    switch (dir & 3) {
      case 0: nx += 1; break;
      case 1: ny -= 1; break;
      case 2: nx -= 1; break;
      default: ny += 1; break;
    }
    if (wall_at(map_lo, map_hi, nx, ny)) {
      break;
    }
    x = nx;
    y = ny;
  }
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)x);
  h = fnv1a_u32(h, (uint32_t)y);
  h = fnv1a_u32(h, (uint32_t)(dir & 3));
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_agent_get_bonus_hash(
  int32_t score,
  int32_t lives,
  int32_t health,
  int32_t ammo,
  int32_t keys,
  int32_t bonus_kind,
  int32_t value
) {
  switch (bonus_kind & 7) {
    case 0: score += value; break;
    case 1: health += value; break;
    case 2: ammo += value; break;
    case 3: keys |= (1 << (value & 3)); break;
    case 4: lives += 1; break;
    default: score += (value >> 1); break;
  }
  health = clamp_i32(health, 0, 100);
  ammo = clamp_i32(ammo, 0, 99);
  lives = clamp_i32(lives, 0, 9);

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)score);
  h = fnv1a_u32(h, (uint32_t)lives);
  h = fnv1a_u32(h, (uint32_t)health);
  h = fnv1a_u32(h, (uint32_t)ammo);
  h = fnv1a_u32(h, (uint32_t)keys);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_agent_give_ammo_hash(int32_t ammo, int32_t max_ammo, int32_t amount, int32_t weapon_owned) {
  int32_t a = ammo + amount;
  if (weapon_owned) {
    a += 1;
  }
  a = clamp_i32(a, 0, max_ammo < 0 ? 0 : max_ammo);

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)a);
  h = fnv1a_u32(h, (uint32_t)max_ammo);
  h = fnv1a_u32(h, (uint32_t)(weapon_owned ? 1 : 0));
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_agent_give_points_hash(int32_t score, int32_t lives, int32_t next_extra, int32_t points) {
  int32_t s = score + points;
  int32_t l = lives;
  int32_t threshold = next_extra <= 0 ? 20000 : next_extra;
  while (s >= threshold && l < 9) {
    l++;
    threshold += 20000;
  }

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)s);
  h = fnv1a_u32(h, (uint32_t)l);
  h = fnv1a_u32(h, (uint32_t)threshold);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_agent_heal_self_hash(int32_t health, int32_t max_health, int32_t amount) {
  int32_t hlt = clamp_i32(health + amount, 0, max_health < 0 ? 0 : max_health);
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)hlt);
  h = fnv1a_u32(h, (uint32_t)max_health);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_agent_take_damage_hash(int32_t health, int32_t lives, int32_t damage, int32_t god_mode, int32_t rng) {
  int32_t hlt = health;
  int32_t l = lives;
  if (!god_mode) {
    int32_t mitigated = damage - (rng & 3);
    if (mitigated < 0) mitigated = 0;
    hlt -= mitigated;
    if (hlt <= 0) {
      if (l > 0) {
        l -= 1;
        hlt = 100;
      } else {
        hlt = 0;
      }
    }
  }

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)hlt);
  h = fnv1a_u32(h, (uint32_t)l);
  h = fnv1a_u32(h, (uint32_t)(god_mode ? 1 : 0));
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_game_game_loop_hash(
  uint32_t state_hash,
  int32_t tics,
  int32_t input_mask,
  int32_t rng,
  int32_t door_hash,
  int32_t player_hash,
  int32_t actor_hash
) {
  int32_t loops = clamp_i32(tics, 0, 256);
  uint32_t h = state_hash;
  for (int32_t i = 0; i < loops; i++) {
    h = fnv1a_u32(h, (uint32_t)(input_mask + i));
    h = fnv1a_u32(h, (uint32_t)(rng ^ (i * 1103515245)));
    h = fnv1a_u32(h, (uint32_t)door_hash);
    h = fnv1a_u32(h, (uint32_t)player_hash);
    h = fnv1a_u32(h, (uint32_t)actor_hash);
  }
  h = fnv1a_u32(h, (uint32_t)loops);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_inter_check_high_score_hash(
  int32_t new_score,
  int32_t s0,
  int32_t s1,
  int32_t s2,
  int32_t s3,
  int32_t s4
) {
  int32_t board[5] = {s0, s1, s2, s3, s4};
  int32_t pos = 5;
  for (int32_t i = 0; i < 5; i++) {
    if (new_score > board[i]) {
      pos = i;
      break;
    }
  }
  if (pos < 5) {
    for (int32_t j = 4; j > pos; j--) {
      board[j] = board[j - 1];
    }
    board[pos] = new_score;
  }

  uint32_t h = 2166136261u;
  for (int32_t i = 0; i < 5; i++) {
    h = fnv1a_u32(h, (uint32_t)board[i]);
  }
  h = fnv1a_u32(h, (uint32_t)pos);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_inter_level_completed_hash(
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
) {
  int32_t kill_ratio = kills_total <= 0 ? 0 : (kills_found * 100) / kills_total;
  int32_t secret_ratio = secrets_total <= 0 ? 0 : (secrets_found * 100) / secrets_total;
  int32_t treasure_ratio = treasure_total <= 0 ? 0 : (treasure_found * 100) / treasure_total;
  int32_t time_bonus = par_sec > 0 && time_sec < par_sec ? (par_sec - time_sec) * 500 : 0;
  int32_t ratio_bonus = (kill_ratio + secret_ratio + treasure_ratio) * 10;
  int32_t total = score + time_bonus + ratio_bonus + (lives * 1000);

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)total);
  h = fnv1a_u32(h, (uint32_t)kill_ratio);
  h = fnv1a_u32(h, (uint32_t)secret_ratio);
  h = fnv1a_u32(h, (uint32_t)treasure_ratio);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_inter_victory_hash(
  int32_t total_score,
  int32_t total_time,
  int32_t total_kills,
  int32_t total_secrets,
  int32_t total_treasures,
  int32_t episode,
  int32_t difficulty
) {
  int32_t skill_bonus = (difficulty + 1) * 10000;
  int32_t completion = clamp_i32(total_kills + total_secrets + total_treasures, 0, 300);
  int32_t final_score = total_score + skill_bonus + (completion * 100) - (total_time * 2);

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)final_score);
  h = fnv1a_u32(h, (uint32_t)episode);
  h = fnv1a_u32(h, (uint32_t)difficulty);
  return h;
}

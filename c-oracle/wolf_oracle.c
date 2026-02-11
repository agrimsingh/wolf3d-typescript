#include <stdint.h>
#include <stdbool.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

static uint32_t fnv1a_u32(uint32_t hash, uint32_t value) {
  hash ^= value;
  hash *= 16777619u;
  return hash;
}

static uint32_t isqrt_u64(uint64_t value) {
  uint64_t res = 0;
  uint64_t bit = 1ULL << 62;
  while (bit > value) {
    bit >>= 2;
  }
  while (bit != 0) {
    if (value >= res + bit) {
      value -= res + bit;
      res = (res >> 1) + bit;
    } else {
      res >>= 1;
    }
    bit >>= 2;
  }
  return (uint32_t)res;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_fixed_mul(int32_t a, int32_t b) {
  int64_t v = (int64_t)a * (int64_t)b;
  return (int32_t)(v >> 16);
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_fixed_by_frac(int32_t a, int32_t b) {
  int64_t v = (int64_t)a * (int64_t)b;
  return (int32_t)(v >> 16);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_rlew_expand_checksum(const uint16_t* src, int src_len, uint16_t tag, int out_len) {
  uint32_t hash = 2166136261u;
  int src_i = 0;
  int out_i = 0;

  while (out_i < out_len && src_i < src_len) {
    uint16_t value = src[src_i++];
    if (value == tag && src_i + 1 < src_len) {
      uint16_t count = src[src_i++];
      uint16_t repeated = src[src_i++];
      for (uint16_t c = 0; c < count && out_i < out_len; c++) {
        hash = fnv1a_u32(hash, repeated);
        out_i++;
      }
    } else {
      hash = fnv1a_u32(hash, value);
      out_i++;
    }
  }

  hash = fnv1a_u32(hash, (uint32_t)out_i);
  hash = fnv1a_u32(hash, (uint32_t)out_len);
  return hash;
}

static bool wall_at(uint32_t lo, uint32_t hi, int x, int y) {
  if (x < 0 || x >= 8 || y < 0 || y >= 8) {
    return true;
  }
  int bit = y * 8 + x;
  if (bit < 32) {
    return (lo & (1u << bit)) != 0;
  }
  return (hi & (1u << (bit - 32))) != 0;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_raycast_distance_q16(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t start_x_q16,
  int32_t start_y_q16,
  int32_t dir_x_q16,
  int32_t dir_y_q16,
  int32_t max_steps
) {
  int32_t x = start_x_q16;
  int32_t y = start_y_q16;

  uint64_t mag_sq = (uint64_t)((int64_t)dir_x_q16 * dir_x_q16) + (uint64_t)((int64_t)dir_y_q16 * dir_y_q16);
  uint32_t mag = isqrt_u64(mag_sq);

  if (mag == 0) {
    return -1;
  }

  for (int32_t step = 1; step <= max_steps; step++) {
    x += dir_x_q16;
    y += dir_y_q16;

    int tx = x >> 16;
    int ty = y >> 16;
    if (wall_at(map_lo, map_hi, tx, ty)) {
      return (int32_t)((int64_t)step * (int64_t)mag);
    }
  }

  return -1;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_actor_step_packed(
  int32_t state,
  int32_t player_dist_q8,
  int32_t can_see,
  int32_t rng
) {
  // state: 0 idle, 1 patrol, 2 chase, 3 attack
  int32_t next = state;
  int32_t timer = (rng & 0x0f) + 1;

  if (state == 0 && can_see) {
    next = 2;
  } else if (state == 1 && can_see && player_dist_q8 < (4 << 8)) {
    next = 2;
  } else if (state == 2 && player_dist_q8 < (1 << 8)) {
    next = 3;
  } else if (state == 3 && player_dist_q8 > (2 << 8)) {
    next = can_see ? 2 : 1;
  }

  return ((next & 0x7) << 8) | (timer & 0xff);
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_player_move_packed(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t x_q8,
  int32_t y_q8,
  int32_t dx_q8,
  int32_t dy_q8
) {
  int32_t nx = x_q8 + dx_q8;
  int32_t ny = y_q8 + dy_q8;

  int tx = nx >> 8;
  int ty = ny >> 8;

  if (wall_at(map_lo, map_hi, tx, ty)) {
    int tx_only = nx >> 8;
    int ty_only = y_q8 >> 8;
    int tx_y = x_q8 >> 8;
    int ty_y = ny >> 8;

    if (!wall_at(map_lo, map_hi, tx_only, ty_only)) {
      x_q8 = nx;
    }
    if (!wall_at(map_lo, map_hi, tx_y, ty_y)) {
      y_q8 = ny;
    }
  } else {
    x_q8 = nx;
    y_q8 = ny;
  }

  return ((x_q8 & 0xffff) << 16) | (y_q8 & 0xffff);
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_game_event_hash(
  int32_t score,
  int32_t lives,
  int32_t health,
  int32_t ammo,
  int32_t event_kind,
  int32_t value
) {
  switch (event_kind) {
    case 0: score += value; break; // points
    case 1: health += value; break; // heal
    case 2: health -= value; break; // damage
    case 3: ammo += value; break;
    case 4: lives += value; break;
    default: break;
  }

  if (health < 0) {
    health = 0;
  }
  if (health > 100) {
    health = 100;
  }
  if (ammo < 0) {
    ammo = 0;
  }
  if (ammo > 99) {
    ammo = 99;
  }
  if (lives < 0) {
    lives = 0;
  }
  if (lives > 9) {
    lives = 9;
  }
  if (score < 0) {
    score = 0;
  }

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)score);
  hash = fnv1a_u32(hash, (uint32_t)lives);
  hash = fnv1a_u32(hash, (uint32_t)health);
  hash = fnv1a_u32(hash, (uint32_t)ammo);
  return (int32_t)hash;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_menu_reduce_packed(
  int32_t screen,
  int32_t cursor,
  int32_t action,
  int32_t item_count
) {
  int32_t s = screen;
  int32_t c = cursor;

  switch (action) {
    case 0: c = (c + item_count - 1) % item_count; break; // up
    case 1: c = (c + 1) % item_count; break; // down
    case 2: s = c + 1; c = 0; break; // select
    case 3: s = 0; c = 0; break; // back
    default: break;
  }

  return ((s & 0xff) << 8) | (c & 0xff);
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_measure_text_packed(int32_t text_len, int32_t max_width_chars) {
  if (max_width_chars <= 0) {
    return 0;
  }
  int32_t lines = text_len / max_width_chars;
  if (text_len % max_width_chars != 0) {
    lines++;
  }
  if (lines == 0) {
    lines = 1;
  }
  int32_t width = text_len < max_width_chars ? text_len : max_width_chars;
  return ((lines & 0xffff) << 16) | (width & 0xffff);
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_audio_reduce_packed(
  int32_t sound_mode,
  int32_t music_mode,
  int32_t digi_mode,
  int32_t event_kind,
  int32_t sound_id
) {
  int32_t playing = -1;

  switch (event_kind) {
    case 0: // set sound mode
      sound_mode = sound_id & 0x3;
      break;
    case 1: // set music mode
      music_mode = sound_id & 0x3;
      break;
    case 2: // play sound
      if (sound_mode != 0 || digi_mode != 0) {
        playing = sound_id & 0xff;
      }
      break;
    case 3: // stop all
      playing = -1;
      break;
    default:
      break;
  }

  return ((sound_mode & 0x3) << 18) |
         ((music_mode & 0x3) << 16) |
         ((digi_mode & 0x3) << 14) |
         ((playing + 1) & 0x3fff);
}

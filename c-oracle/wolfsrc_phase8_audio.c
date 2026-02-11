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

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_ca_cal_setup_audio_file_hash(int32_t audiohed_len, int32_t audiot_len, int32_t start) {
  int32_t chunks = (audiohed_len / 4) - start;
  if (chunks < 0) chunks = 0;
  int32_t data_bytes = audiot_len - (start * 16);
  if (data_bytes < 0) data_bytes = 0;

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)chunks);
  h = fnv1a_u32(h, (uint32_t)data_bytes);
  h = fnv1a_u32(h, (uint32_t)start);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_ca_ca_cache_audio_chunk_hash(
  int32_t chunk_num,
  int32_t offset,
  int32_t next_offset,
  int32_t audiot_len,
  int32_t cache_mask
) {
  int32_t begin = clamp_i32(offset, 0, audiot_len);
  int32_t end = clamp_i32(next_offset, begin, audiot_len);
  int32_t len = end - begin;
  uint32_t new_mask = (uint32_t)cache_mask | (1u << (chunk_num & 31));

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)len);
  h = fnv1a_u32(h, new_mask);
  h = fnv1a_u32(h, (uint32_t)chunk_num);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_sd_sd_set_sound_mode_hash(int32_t current_mode, int32_t requested_mode, int32_t has_device) {
  int32_t mode = has_device ? (requested_mode & 3) : 0;
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)current_mode);
  h = fnv1a_u32(h, (uint32_t)mode);
  h = fnv1a_u32(h, (uint32_t)(has_device ? 1 : 0));
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_sd_sd_set_music_mode_hash(int32_t current_mode, int32_t requested_mode, int32_t has_device) {
  int32_t mode = has_device ? (requested_mode & 3) : 0;
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)current_mode);
  h = fnv1a_u32(h, (uint32_t)mode);
  h = fnv1a_u32(h, (uint32_t)(has_device ? 1 : 0));
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_sd_sd_play_sound_hash(
  int32_t sound_mode,
  int32_t sound_id,
  int32_t priority,
  int32_t current_priority,
  int32_t channel_busy
) {
  int32_t started = 0;
  int32_t new_priority = current_priority;
  int32_t sid = -1;
  if (sound_mode != 0 && (!channel_busy || priority >= current_priority)) {
    started = 1;
    sid = sound_id;
    new_priority = priority;
  }

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)started);
  h = fnv1a_u32(h, (uint32_t)sid);
  h = fnv1a_u32(h, (uint32_t)new_priority);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_sd_sd_stop_sound_hash(int32_t channel_busy, int32_t current_sound, int32_t current_priority) {
  int32_t busy = 0;
  int32_t sid = channel_busy ? -1 : current_sound;
  int32_t pr = channel_busy ? 0 : current_priority;
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)busy);
  h = fnv1a_u32(h, (uint32_t)sid);
  h = fnv1a_u32(h, (uint32_t)pr);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_game_set_sound_loc_hash(int32_t gx, int32_t gy, int32_t listener_x, int32_t listener_y) {
  int32_t dx = gx - listener_x;
  int32_t dy = gy - listener_y;
  int32_t dist = dx < 0 ? -dx : dx;
  dist += dy < 0 ? -dy : dy;
  int32_t pan = clamp_i32(dx / 8, -15, 15);

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)dist);
  h = fnv1a_u32(h, (uint32_t)(pan & 31));
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_game_update_sound_loc_hash(
  int32_t gx,
  int32_t gy,
  int32_t listener_x,
  int32_t listener_y,
  int32_t velocity_x,
  int32_t velocity_y
) {
  int32_t nx = gx + velocity_x;
  int32_t ny = gy + velocity_y;
  return oracle_wl_game_set_sound_loc_hash(nx, ny, listener_x, listener_y);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_game_play_sound_loc_global_hash(
  int32_t sound_mode,
  int32_t sound_id,
  int32_t gx,
  int32_t gy,
  int32_t listener_x,
  int32_t listener_y,
  int32_t channel_busy
) {
  uint32_t loc = oracle_wl_game_set_sound_loc_hash(gx, gy, listener_x, listener_y);
  uint32_t play = oracle_id_sd_sd_play_sound_hash(sound_mode, sound_id, 8, 0, channel_busy);
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, loc);
  h = fnv1a_u32(h, play);
  return h;
}

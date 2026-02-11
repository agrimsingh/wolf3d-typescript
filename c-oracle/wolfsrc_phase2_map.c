#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten/emscripten.h>

#define NEARTAG 0xa7
#define FARTAG 0xa8
#define AREATILE 107
#define AMBUSHTILE 106
#define STATUSLINES 40
#define MAPPLANES 2
#define MAPWORDS (64 * 64)

typedef struct {
  uint16_t rlew_tag;
  int32_t header_offsets[100];
} maphead_info_t;

typedef struct {
  int32_t plane_start[3];
  uint16_t plane_length[3];
  uint16_t width;
  uint16_t height;
  uint8_t name[16];
} map_header_t;

static uint32_t fnv1a_u32(uint32_t hash, uint32_t value) {
  hash ^= value;
  hash *= 16777619u;
  return hash;
}

static uint16_t read_u16_le(const uint8_t *bytes, int len, int offset) {
  if (!bytes || offset < 0 || offset + 1 >= len) {
    return 0u;
  }
  return (uint16_t)(bytes[offset] | ((uint16_t)bytes[offset + 1] << 8));
}

static int32_t read_s32_le(const uint8_t *bytes, int len, int offset) {
  if (!bytes || offset < 0 || offset + 3 >= len) {
    return -1;
  }
  uint32_t value = (uint32_t)bytes[offset] |
                   ((uint32_t)bytes[offset + 1] << 8) |
                   ((uint32_t)bytes[offset + 2] << 16) |
                   ((uint32_t)bytes[offset + 3] << 24);
  return (int32_t)value;
}

static maphead_info_t parse_maphead(const uint8_t *maphead_bytes, int maphead_len) {
  maphead_info_t info;
  info.rlew_tag = read_u16_le(maphead_bytes, maphead_len, 0);
  for (int i = 0; i < 100; i++) {
    info.header_offsets[i] = read_s32_le(maphead_bytes, maphead_len, 2 + i * 4);
  }
  return info;
}

static map_header_t parse_map_header(const uint8_t *gamemaps, int gamemaps_len, int offset) {
  map_header_t header;
  memset(&header, 0, sizeof(header));
  for (int i = 0; i < 3; i++) {
    header.plane_start[i] = read_s32_le(gamemaps, gamemaps_len, offset + i * 4);
  }
  for (int i = 0; i < 3; i++) {
    header.plane_length[i] = read_u16_le(gamemaps, gamemaps_len, offset + 12 + i * 2);
  }
  header.width = read_u16_le(gamemaps, gamemaps_len, offset + 18);
  header.height = read_u16_le(gamemaps, gamemaps_len, offset + 20);
  for (int i = 0; i < 16; i++) {
    int idx = offset + 22 + i;
    header.name[i] = (idx >= 0 && idx < gamemaps_len) ? gamemaps[idx] : 0u;
  }
  return header;
}

static uint16_t *id_ca_carmack_expand_words(const uint8_t *source_bytes, int source_len, int expanded_length_bytes, int *out_count) {
  int out_words = (expanded_length_bytes > 0 ? expanded_length_bytes : 0) >> 1;
  uint16_t *out = (uint16_t *)calloc((size_t)out_words, sizeof(uint16_t));
  if (!out) {
    *out_count = 0;
    return NULL;
  }

  int src = 0;
  int dst = 0;
  while (dst < out_words) {
    uint16_t ch = read_u16_le(source_bytes, source_len, src);
    src += 2;

    uint8_t chhigh = (uint8_t)(ch >> 8);
    uint8_t count = (uint8_t)(ch & 0xff);

    if (chhigh == NEARTAG) {
      if (count == 0) {
        uint8_t low = (src < source_len) ? source_bytes[src] : 0u;
        src += 1;
        out[dst++] = (uint16_t)((ch & 0xff00u) | low);
      } else {
        int offset = (src < source_len) ? (int)source_bytes[src] : 0;
        src += 1;
        for (int i = 0; i < count && dst < out_words; i++) {
          int dst_index = dst;
          int copy_index = dst - offset;
          out[dst_index] = (copy_index >= 0 && copy_index < dst_index) ? out[copy_index] : 0u;
          dst = dst_index + 1;
        }
      }
      continue;
    }

    if (chhigh == FARTAG) {
      if (count == 0) {
        uint8_t low = (src < source_len) ? source_bytes[src] : 0u;
        src += 1;
        out[dst++] = (uint16_t)((ch & 0xff00u) | low);
      } else {
        int offset = (int)read_u16_le(source_bytes, source_len, src);
        src += 2;
        for (int i = 0; i < count && dst < out_words; i++) {
          int dst_index = dst;
          int copy_index = offset + i;
          out[dst_index] = (copy_index >= 0 && copy_index < dst_index) ? out[copy_index] : 0u;
          dst = dst_index + 1;
        }
      }
      continue;
    }

    out[dst++] = ch;
  }

  *out_count = out_words;
  return out;
}

static uint16_t *id_ca_rlew_expand_words(const uint16_t *source_words, int source_count, int expanded_length_bytes, uint16_t rlew_tag, int *out_count) {
  int out_words = (expanded_length_bytes > 0 ? expanded_length_bytes : 0) >> 1;
  uint16_t *out = (uint16_t *)calloc((size_t)out_words, sizeof(uint16_t));
  if (!out) {
    *out_count = 0;
    return NULL;
  }

  int src = 0;
  int dst = 0;
  while (dst < out_words) {
    uint16_t value = (src < source_count) ? source_words[src++] : 0u;
    if (value != rlew_tag) {
      out[dst++] = value;
      continue;
    }

    uint16_t count = (src < source_count) ? source_words[src++] : 0u;
    uint16_t repeated = (src < source_count) ? source_words[src++] : 0u;
    if (count == 0u) {
      out[dst++] = rlew_tag;
      continue;
    }
    for (int i = 0; i < count && dst < out_words; i++) {
      out[dst++] = repeated;
    }
  }

  *out_count = out_words;
  return out;
}

static uint32_t hash_draw_play_border(uint32_t hash, int32_t viewwidth, int32_t viewheight) {
  int32_t xl = 160 - viewwidth / 2;
  int32_t yl = (200 - STATUSLINES - viewheight) / 2;

  hash = fnv1a_u32(hash, 0x10u);
  hash = fnv1a_u32(hash, 0u);
  hash = fnv1a_u32(hash, 0u);
  hash = fnv1a_u32(hash, 320u);
  hash = fnv1a_u32(hash, (uint32_t)(200 - STATUSLINES));
  hash = fnv1a_u32(hash, 127u);

  hash = fnv1a_u32(hash, 0x11u);
  hash = fnv1a_u32(hash, (uint32_t)xl);
  hash = fnv1a_u32(hash, (uint32_t)yl);
  hash = fnv1a_u32(hash, (uint32_t)viewwidth);
  hash = fnv1a_u32(hash, (uint32_t)viewheight);
  hash = fnv1a_u32(hash, 0u);

  hash = fnv1a_u32(hash, 0x12u);
  hash = fnv1a_u32(hash, (uint32_t)(xl - 1));
  hash = fnv1a_u32(hash, (uint32_t)(xl + viewwidth));
  hash = fnv1a_u32(hash, (uint32_t)(yl - 1));
  hash = fnv1a_u32(hash, 0u);

  hash = fnv1a_u32(hash, 0x13u);
  hash = fnv1a_u32(hash, (uint32_t)(xl - 1));
  hash = fnv1a_u32(hash, (uint32_t)(xl + viewwidth));
  hash = fnv1a_u32(hash, (uint32_t)(yl + viewheight));
  hash = fnv1a_u32(hash, 125u);

  hash = fnv1a_u32(hash, 0x14u);
  hash = fnv1a_u32(hash, (uint32_t)(yl - 1));
  hash = fnv1a_u32(hash, (uint32_t)(yl + viewheight));
  hash = fnv1a_u32(hash, (uint32_t)(xl - 1));
  hash = fnv1a_u32(hash, 0u);

  hash = fnv1a_u32(hash, 0x15u);
  hash = fnv1a_u32(hash, (uint32_t)(yl - 1));
  hash = fnv1a_u32(hash, (uint32_t)(yl + viewheight));
  hash = fnv1a_u32(hash, (uint32_t)(xl + viewwidth));
  hash = fnv1a_u32(hash, 125u);

  hash = fnv1a_u32(hash, 0x16u);
  hash = fnv1a_u32(hash, (uint32_t)(xl - 1));
  hash = fnv1a_u32(hash, (uint32_t)(yl + viewheight));
  hash = fnv1a_u32(hash, 124u);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_ca_carmack_expand_hash(const uint8_t *source_bytes, int source_len, int expanded_length_bytes) {
  int out_count = 0;
  uint16_t *out = id_ca_carmack_expand_words(source_bytes, source_len, expanded_length_bytes, &out_count);
  uint32_t hash = 2166136261u;
  if (out) {
    for (int i = 0; i < out_count; i++) {
      hash = fnv1a_u32(hash, out[i]);
    }
    free(out);
  }
  hash = fnv1a_u32(hash, (uint32_t)out_count);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_ca_rlew_expand_hash(const uint8_t *source_bytes, int source_len, int expanded_length_bytes, uint16_t rlew_tag) {
  int source_words = source_len / 2;
  uint16_t *source = (uint16_t *)calloc((size_t)source_words, sizeof(uint16_t));
  if (!source) {
    return 0u;
  }
  for (int i = 0; i < source_words; i++) {
    source[i] = read_u16_le(source_bytes, source_len, i * 2);
  }

  int out_count = 0;
  uint16_t *out = id_ca_rlew_expand_words(source, source_words, expanded_length_bytes, rlew_tag, &out_count);
  free(source);

  uint32_t hash = 2166136261u;
  if (out) {
    for (int i = 0; i < out_count; i++) {
      hash = fnv1a_u32(hash, out[i]);
    }
    free(out);
  }
  hash = fnv1a_u32(hash, (uint32_t)out_count);
  hash = fnv1a_u32(hash, rlew_tag);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_ca_setup_map_file_hash(const uint8_t *maphead_bytes, int maphead_len) {
  maphead_info_t info = parse_maphead(maphead_bytes, maphead_len);
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, info.rlew_tag);

  int valid = 0;
  for (int i = 0; i < 100; i++) {
    hash = fnv1a_u32(hash, (uint32_t)info.header_offsets[i]);
    if (info.header_offsets[i] >= 0) {
      valid++;
    }
  }

  hash = fnv1a_u32(hash, (uint32_t)valid);
  hash = fnv1a_u32(hash, (uint32_t)maphead_len);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_ca_cache_map_hash(
  const uint8_t *gamemaps_bytes,
  int gamemaps_len,
  const uint8_t *maphead_bytes,
  int maphead_len,
  int mapnum
) {
  maphead_info_t info = parse_maphead(maphead_bytes, maphead_len);
  if (mapnum < 0 || mapnum >= 100) {
    return 0u;
  }

  int32_t header_offset = info.header_offsets[mapnum];
  if (header_offset < 0 || header_offset + 38 > gamemaps_len) {
    return 0u;
  }

  map_header_t header = parse_map_header(gamemaps_bytes, gamemaps_len, header_offset);
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, header.width);
  hash = fnv1a_u32(hash, header.height);
  hash = fnv1a_u32(hash, info.rlew_tag);
  for (int i = 0; i < 16; i++) {
    hash = fnv1a_u32(hash, header.name[i]);
  }

  for (int plane = 0; plane < MAPPLANES; plane++) {
    int32_t pos = header.plane_start[plane];
    int32_t compressed = (int32_t)header.plane_length[plane];
    if (pos < 0 || compressed <= 2 || pos + compressed > gamemaps_len) {
      hash = fnv1a_u32(hash, (uint32_t)plane);
      continue;
    }

    const uint8_t *source = gamemaps_bytes + pos;
    int expanded = (int)read_u16_le(source, compressed, 0);

    int carmack_count = 0;
    uint16_t *carmack = id_ca_carmack_expand_words(source + 2, compressed - 2, expanded, &carmack_count);
    if (!carmack) {
      hash = fnv1a_u32(hash, (uint32_t)plane);
      continue;
    }

    const uint16_t *rlew_source = (carmack_count > 0) ? (carmack + 1) : carmack;
    int rlew_source_count = (carmack_count > 0) ? (carmack_count - 1) : 0;

    int plane_count = 0;
    uint16_t *plane_words = id_ca_rlew_expand_words(rlew_source, rlew_source_count, MAPWORDS * 2, info.rlew_tag, &plane_count);
    free(carmack);

    hash = fnv1a_u32(hash, (uint32_t)plane);
    if (plane_words) {
      for (int i = 0; i < plane_count; i++) {
        hash = fnv1a_u32(hash, plane_words[i]);
      }
      free(plane_words);
    }
  }

  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_game_setup_game_level_hash(const uint8_t *plane0_bytes, int word_count, int mapwidth, int mapheight) {
  int width = mapwidth > 0 ? mapwidth : 1;
  int height = mapheight > 0 ? mapheight : 1;
  int total = width * height;

  uint16_t *map = (uint16_t *)calloc((size_t)total, sizeof(uint16_t));
  uint16_t *tilemap = (uint16_t *)calloc((size_t)total, sizeof(uint16_t));
  uint16_t *actorat = (uint16_t *)calloc((size_t)total, sizeof(uint16_t));
  if (!map || !tilemap || !actorat) {
    free(map);
    free(tilemap);
    free(actorat);
    return 0u;
  }

  for (int i = 0; i < total; i++) {
    uint16_t tile = (i < word_count) ? read_u16_le(plane0_bytes, word_count * 2, i * 2) : 0u;
    map[i] = tile;
    if (tile < AREATILE) {
      tilemap[i] = tile;
      actorat[i] = tile;
    }
  }

  int door_count = 0;
  int vertical_doors = 0;
  uint32_t lock_hash = 2166136261u;

  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {
      int idx = y * width + x;
      uint16_t tile = map[idx];
      if (tile < 90 || tile > 101) {
        continue;
      }

      door_count++;
      if ((tile & 1u) == 0u) {
        vertical_doors++;
        lock_hash = fnv1a_u32(lock_hash, (uint32_t)((tile - 90) / 2));
      } else {
        lock_hash = fnv1a_u32(lock_hash, (uint32_t)((tile - 91) / 2));
      }
      lock_hash = fnv1a_u32(lock_hash, (uint32_t)x);
      lock_hash = fnv1a_u32(lock_hash, (uint32_t)y);
    }
  }

  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {
      int idx = y * width + x;
      uint16_t tile = map[idx];
      if (tile != AMBUSHTILE) {
        continue;
      }

      tilemap[idx] = 0u;
      if (actorat[idx] == AMBUSHTILE) {
        actorat[idx] = 0u;
      }

      uint16_t replacement = tile;
      if (x + 1 < width && map[idx + 1] >= AREATILE) {
        replacement = map[idx + 1];
      }
      if (y > 0 && map[idx - width] >= AREATILE) {
        replacement = map[idx - width];
      }
      if (y + 1 < height && map[idx + width] >= AREATILE) {
        replacement = map[idx + width];
      }
      if (x > 0 && map[idx - 1] >= AREATILE) {
        replacement = map[idx - 1];
      }
      map[idx] = replacement;
    }
  }

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)width);
  hash = fnv1a_u32(hash, (uint32_t)height);
  hash = fnv1a_u32(hash, (uint32_t)door_count);
  hash = fnv1a_u32(hash, (uint32_t)vertical_doors);
  hash = fnv1a_u32(hash, lock_hash);

  for (int i = 0; i < total; i++) {
    hash = fnv1a_u32(hash, tilemap[i]);
    hash = fnv1a_u32(hash, actorat[i]);
    hash = fnv1a_u32(hash, map[i]);
  }

  free(map);
  free(tilemap);
  free(actorat);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_game_draw_play_screen_hash(
  int32_t viewwidth,
  int32_t viewheight,
  int32_t bufferofs,
  int32_t screenloc0,
  int32_t screenloc1,
  int32_t screenloc2,
  int32_t statusbarpic
) {
  uint32_t hash = 2166136261u;
  int32_t current_buffer = bufferofs;
  int32_t temp = current_buffer;
  int32_t screens[3] = {screenloc0, screenloc1, screenloc2};

  hash = fnv1a_u32(hash, 0x01u);
  hash = fnv1a_u32(hash, 0x02u);
  hash = fnv1a_u32(hash, (uint32_t)statusbarpic);

  for (int i = 0; i < 3; i++) {
    current_buffer = screens[i];
    hash = fnv1a_u32(hash, (uint32_t)current_buffer);
    hash = hash_draw_play_border(hash, viewwidth, viewheight);
    hash = fnv1a_u32(hash, 0x20u);
    hash = fnv1a_u32(hash, 0u);
    hash = fnv1a_u32(hash, (uint32_t)(200 - STATUSLINES));
    hash = fnv1a_u32(hash, (uint32_t)statusbarpic);
  }

  current_buffer = temp;
  hash = fnv1a_u32(hash, (uint32_t)current_buffer);
  hash = fnv1a_u32(hash, 0x03u);
  hash = fnv1a_u32(hash, (uint32_t)statusbarpic);

  static const uint32_t hud_ops[8] = {0x30u, 0x31u, 0x32u, 0x33u, 0x34u, 0x35u, 0x36u, 0x37u};
  for (int i = 0; i < 8; i++) {
    hash = fnv1a_u32(hash, hud_ops[i]);
  }

  return hash;
}

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

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_us_1_us_print_hash(
  int32_t cursor_x,
  int32_t cursor_y,
  int32_t text_len,
  int32_t color,
  int32_t font_width
) {
  int32_t width = text_len < 0 ? 0 : text_len * (font_width <= 0 ? 8 : font_width);
  int32_t nx = cursor_x + width;
  int32_t ny = cursor_y;
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)nx);
  h = fnv1a_u32(h, (uint32_t)ny);
  h = fnv1a_u32(h, (uint32_t)color);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_us_1_us_cprint_hash(
  int32_t window_x,
  int32_t window_w,
  int32_t text_len,
  int32_t align,
  int32_t font_width
) {
  int32_t fw = font_width <= 0 ? 8 : font_width;
  int32_t text_w = (text_len < 0 ? 0 : text_len) * fw;
  int32_t cx = window_x;
  if ((align & 1) == 0) {
    cx = window_x + ((window_w - text_w) / 2);
  } else {
    cx = window_x + (window_w - text_w - 4);
  }
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)cx);
  h = fnv1a_u32(h, (uint32_t)text_w);
  h = fnv1a_u32(h, (uint32_t)align);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_us_1_us_draw_window_hash(
  int32_t x,
  int32_t y,
  int32_t w,
  int32_t h,
  int32_t frame_color,
  int32_t fill_color
) {
  int32_t area = (w < 0 || h < 0) ? 0 : w * h;
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  hash = fnv1a_u32(hash, (uint32_t)area);
  hash = fnv1a_u32(hash, (uint32_t)frame_color);
  hash = fnv1a_u32(hash, (uint32_t)fill_color);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_menu_us_control_panel_hash(
  int32_t screen,
  int32_t cursor,
  int32_t input_mask,
  int32_t menu_items
) {
  int32_t c = cursor;
  if (input_mask & 1) c -= 1;
  if (input_mask & 2) c += 1;
  if (menu_items > 0) {
    while (c < 0) c += menu_items;
    c %= menu_items;
  } else {
    c = 0;
  }
  int32_t s = screen;
  if (input_mask & 4) {
    s = c + 1;
  }
  if (input_mask & 8) {
    s = 0;
    c = 0;
  }

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)s);
  h = fnv1a_u32(h, (uint32_t)c);
  h = fnv1a_u32(h, (uint32_t)menu_items);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_menu_draw_main_menu_hash(int32_t selected, int32_t enabled_mask, int32_t episode) {
  int32_t sel = selected & 7;
  int32_t enabled = (enabled_mask >> sel) & 1;
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)sel);
  h = fnv1a_u32(h, (uint32_t)enabled);
  h = fnv1a_u32(h, (uint32_t)episode);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_menu_draw_menu_hash(
  int32_t menu_id,
  int32_t cursor,
  int32_t item_count,
  int32_t disabled_mask,
  int32_t scroll
) {
  int32_t count = item_count <= 0 ? 1 : item_count;
  int32_t cur = cursor;
  while (cur < 0) cur += count;
  cur %= count;

  int32_t tries = 0;
  while (((disabled_mask >> cur) & 1) && tries < count) {
    cur = (cur + 1) % count;
    tries++;
  }

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)menu_id);
  h = fnv1a_u32(h, (uint32_t)cur);
  h = fnv1a_u32(h, (uint32_t)scroll);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_menu_cp_new_game_hash(int32_t difficulty, int32_t episode, int32_t start_level, int32_t weapon) {
  int32_t level = start_level + ((episode & 3) * 10);
  int32_t hp = clamp_i32(100 - difficulty * 10, 10, 100);
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)level);
  h = fnv1a_u32(h, (uint32_t)hp);
  h = fnv1a_u32(h, (uint32_t)weapon);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_menu_cp_view_scores_hash(
  int32_t top0,
  int32_t top1,
  int32_t top2,
  int32_t top3,
  int32_t top4,
  int32_t new_score
) {
  int32_t board[5] = {top0, top1, top2, top3, top4};
  int32_t pos = 5;
  for (int i = 0; i < 5; i++) {
    if (new_score > board[i]) {
      pos = i;
      break;
    }
  }
  if (pos < 5) {
    for (int j = 4; j > pos; j--) {
      board[j] = board[j - 1];
    }
    board[pos] = new_score;
  }

  uint32_t h = 2166136261u;
  for (int i = 0; i < 5; i++) {
    h = fnv1a_u32(h, (uint32_t)board[i]);
  }
  h = fnv1a_u32(h, (uint32_t)pos);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_menu_cp_sound_hash(int32_t sound_mode, int32_t music_mode, int32_t digi_mode, int32_t action) {
  int32_t sm = sound_mode;
  int32_t mm = music_mode;
  int32_t dm = digi_mode;
  switch (action & 3) {
    case 0: sm = (sm + 1) & 3; break;
    case 1: mm = (mm + 1) & 3; break;
    case 2: dm = (dm + 1) & 3; break;
    default:
      sm = 0;
      mm = 0;
      dm = 0;
      break;
  }
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)sm);
  h = fnv1a_u32(h, (uint32_t)mm);
  h = fnv1a_u32(h, (uint32_t)dm);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_menu_cp_control_hash(
  int32_t mouse_enabled,
  int32_t joystick_enabled,
  int32_t sensitivity,
  int32_t action
) {
  int32_t m = mouse_enabled ? 1 : 0;
  int32_t j = joystick_enabled ? 1 : 0;
  int32_t s = sensitivity;
  switch (action & 3) {
    case 0: m ^= 1; break;
    case 1: j ^= 1; break;
    case 2: s = clamp_i32(s + 1, 0, 20); break;
    default: s = clamp_i32(s - 1, 0, 20); break;
  }
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)m);
  h = fnv1a_u32(h, (uint32_t)j);
  h = fnv1a_u32(h, (uint32_t)s);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_menu_message_hash(int32_t message_len, int32_t wait_for_ack, int32_t input_mask, int32_t rng) {
  int32_t shown = message_len < 0 ? 0 : message_len;
  int32_t closed = wait_for_ack ? ((input_mask & 1) ? 1 : 0) : 1;
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)shown);
  h = fnv1a_u32(h, (uint32_t)closed);
  h = fnv1a_u32(h, (uint32_t)(rng & 0xff));
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_text_help_screens_hash(int32_t page, int32_t total_pages, int32_t input_mask, int32_t rng) {
  int32_t total = total_pages <= 0 ? 1 : total_pages;
  int32_t p = page;
  if (input_mask & 1) p -= 1;
  if (input_mask & 2) p += 1;
  while (p < 0) p += total;
  p %= total;

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)p);
  h = fnv1a_u32(h, (uint32_t)total);
  h = fnv1a_u32(h, (uint32_t)(rng & 0xffff));
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_text_end_text_hash(int32_t text_len, int32_t scroll_pos, int32_t speed, int32_t input_mask) {
  int32_t max_scroll = text_len < 0 ? 0 : text_len * 8;
  int32_t pos = scroll_pos + (speed <= 0 ? 1 : speed);
  if (input_mask & 1) {
    pos += 32;
  }
  pos = clamp_i32(pos, 0, max_scroll);

  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, (uint32_t)pos);
  h = fnv1a_u32(h, (uint32_t)max_scroll);
  h = fnv1a_u32(h, (uint32_t)(input_mask & 0xff));
  return h;
}

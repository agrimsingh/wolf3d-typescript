#include <stdint.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

#define ACTORSIZE 0x4000
#define TILEGLOBAL (1L << 16)
#define TILESHIFT 16
#define MINDIST 0x5800
#define SCREENSIZE (80 * 208)
#define PAGE1START 0
#define PAGE3START (SCREENSIZE * 2)

static uint32_t fnv1a_u32(uint32_t hash, uint32_t value) {
  hash ^= value;
  hash *= 16777619u;
  return hash;
}

static int32_t clamp_s32_i64(int64_t value) {
  if (value > 2147483647LL) {
    return 2147483647;
  }
  if (value < -2147483648LL) {
    return -2147483648LL;
  }
  return (int32_t)value;
}

static int32_t fixed_by_frac(int32_t a, int32_t b) {
  int sign = ((a < 0) ? 1 : 0) ^ ((b < 0) ? 1 : 0);
  uint32_t ua = (a < 0) ? (uint32_t)(-(int64_t)a) : (uint32_t)a;
  uint32_t frac = (uint16_t)b;
  uint64_t prod = (uint64_t)ua * (uint64_t)frac;
  int32_t out = (int32_t)(prod >> 16);
  return sign ? -out : out;
}

static int32_t safe_div_i32(int64_t numer, int32_t denom) {
  if (denom == 0) {
    return (numer >= 0) ? INT32_MAX : INT32_MIN;
  }
  return (int32_t)(numer / denom);
}

static int32_t wl_draw_calc_height_raw(
  int32_t xintercept,
  int32_t yintercept,
  int32_t viewx,
  int32_t viewy,
  int32_t viewcos,
  int32_t viewsin,
  int32_t heightnumerator,
  int32_t mindist
) {
  int64_t gx = (int64_t)xintercept - viewx;
  int32_t gxt = fixed_by_frac((int32_t)gx, viewcos);
  int64_t gy = (int64_t)yintercept - viewy;
  int32_t gyt = fixed_by_frac((int32_t)gy, viewsin);

  int32_t nx = gxt - gyt;
  if (nx < mindist) {
    nx = mindist;
  }

  int32_t denom = nx >> 8;
  if (denom == 0) {
    denom = (nx >= 0) ? 1 : -1;
  }
  return safe_div_i32(heightnumerator, denom);
}

static int32_t clamp_i32(int32_t value, int32_t min, int32_t max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

static int32_t width_for_src(int32_t scale, int32_t src) {
  int32_t scaler_height = scale * 2;
  if (scaler_height <= 0) {
    return 0;
  }

  int64_t step = ((int64_t)scaler_height << 16) / 64;
  int32_t startpix = (int32_t)((step * src) >> 16);
  int32_t endpix = (int32_t)((step * (src + 1)) >> 16);
  int32_t width = endpix - startpix;
  return width > 0 ? width : 0;
}

static int32_t wall_height_at(int32_t x, int32_t seed) {
  uint32_t v = (uint32_t)(x * 1103515245u + seed * 12345u + 0x9e3779b9u);
  return (int32_t)((v >> 16) & 0x0fff);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_draw_transform_actor_hash(
  int32_t obx,
  int32_t oby,
  int32_t viewx,
  int32_t viewy,
  int32_t viewcos,
  int32_t viewsin,
  int32_t scale,
  int32_t centerx,
  int32_t heightnumerator,
  int32_t mindist
) {
  int32_t gx = obx - viewx;
  int32_t gy = oby - viewy;

  int32_t gxt = fixed_by_frac(gx, viewcos);
  int32_t gyt = fixed_by_frac(gy, viewsin);
  int32_t nx = gxt - gyt - ACTORSIZE;

  gxt = fixed_by_frac(gx, viewsin);
  gyt = fixed_by_frac(gy, viewcos);
  int32_t ny = gyt + gxt;

  int32_t out_viewx = 0;
  int32_t out_viewheight = 0;
  if (nx >= mindist) {
    out_viewx = centerx + safe_div_i32((int64_t)ny * scale, nx);
    int32_t denom = nx >> 8;
    if (denom == 0) {
      denom = (nx >= 0) ? 1 : -1;
    }
    out_viewheight = safe_div_i32(heightnumerator, denom);
  }

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)nx);
  hash = fnv1a_u32(hash, (uint32_t)ny);
  hash = fnv1a_u32(hash, (uint32_t)out_viewx);
  hash = fnv1a_u32(hash, (uint32_t)out_viewheight);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_draw_transform_tile_hash(
  int32_t tx,
  int32_t ty,
  int32_t viewx,
  int32_t viewy,
  int32_t viewcos,
  int32_t viewsin,
  int32_t scale,
  int32_t centerx,
  int32_t heightnumerator,
  int32_t mindist
) {
  int32_t gx = (int32_t)(((int64_t)tx << TILESHIFT) + 0x8000 - viewx);
  int32_t gy = (int32_t)(((int64_t)ty << TILESHIFT) + 0x8000 - viewy);

  int32_t gxt = fixed_by_frac(gx, viewcos);
  int32_t gyt = fixed_by_frac(gy, viewsin);
  int32_t nx = gxt - gyt - 0x2000;

  gxt = fixed_by_frac(gx, viewsin);
  gyt = fixed_by_frac(gy, viewcos);
  int32_t ny = gyt + gxt;

  int32_t dispx = 0;
  int32_t dispheight = 0;
  int32_t should_grab = 0;

  if (nx >= mindist) {
    dispx = centerx + safe_div_i32((int64_t)ny * scale, nx);
    int32_t denom = nx >> 8;
    if (denom == 0) {
      denom = (nx >= 0) ? 1 : -1;
    }
    dispheight = safe_div_i32(heightnumerator, denom);
    if (nx < TILEGLOBAL && ny > -(TILEGLOBAL / 2) && ny < (TILEGLOBAL / 2)) {
      should_grab = 1;
    }
  }

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)dispx);
  hash = fnv1a_u32(hash, (uint32_t)dispheight);
  hash = fnv1a_u32(hash, (uint32_t)should_grab);
  hash = fnv1a_u32(hash, (uint32_t)nx);
  hash = fnv1a_u32(hash, (uint32_t)ny);
  return hash;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_wl_draw_calc_height(
  int32_t xintercept,
  int32_t yintercept,
  int32_t viewx,
  int32_t viewy,
  int32_t viewcos,
  int32_t viewsin,
  int32_t heightnumerator,
  int32_t mindist
) {
  return wl_draw_calc_height_raw(
    xintercept,
    yintercept,
    viewx,
    viewy,
    viewcos,
    viewsin,
    heightnumerator,
    mindist
  );
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_draw_hit_vert_wall_hash(
  int32_t xintercept,
  int32_t yintercept,
  int32_t xtilestep,
  int32_t pixx,
  int32_t xtile,
  int32_t ytile,
  int32_t lastside,
  int32_t lastintercept,
  int32_t lasttilehit,
  int32_t tilehit,
  int32_t postsource_low,
  int32_t postwidth,
  int32_t prevheight,
  int32_t adjacent_door,
  int32_t wallpic_normal,
  int32_t wallpic_door,
  int32_t viewx,
  int32_t viewy,
  int32_t viewcos,
  int32_t viewsin,
  int32_t heightnumerator,
  int32_t mindist
) {
  int32_t texture = (yintercept >> 4) & 0xfc0;
  int32_t local_xintercept = xintercept;

  if (xtilestep == -1) {
    texture = 0xfc0 - texture;
    local_xintercept += TILEGLOBAL;
  }

  int32_t height = wl_draw_calc_height_raw(
    local_xintercept,
    yintercept,
    viewx,
    viewy,
    viewcos,
    viewsin,
    heightnumerator,
    mindist
  );

  int32_t wallpic = wallpic_normal;
  if (lastside == 1 && lastintercept == xtile && lasttilehit == tilehit) {
    if (texture == postsource_low) {
      postwidth += 1;
      height = prevheight;
    } else {
      postsource_low = texture;
      postwidth = 1;
    }
  } else {
    lastside = 1;
    lastintercept = xtile;
    lasttilehit = tilehit;
    postwidth = 1;
    if (tilehit & 0x40) {
      wallpic = adjacent_door ? wallpic_door : wallpic_normal;
    }
    postsource_low = texture;
  }

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)texture);
  hash = fnv1a_u32(hash, (uint32_t)height);
  hash = fnv1a_u32(hash, (uint32_t)postwidth);
  hash = fnv1a_u32(hash, (uint32_t)lastside);
  hash = fnv1a_u32(hash, (uint32_t)lastintercept);
  hash = fnv1a_u32(hash, (uint32_t)lasttilehit);
  hash = fnv1a_u32(hash, (uint32_t)postsource_low);
  hash = fnv1a_u32(hash, (uint32_t)wallpic);
  hash = fnv1a_u32(hash, (uint32_t)pixx);
  hash = fnv1a_u32(hash, (uint32_t)xtile);
  hash = fnv1a_u32(hash, (uint32_t)ytile);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_draw_hit_horiz_wall_hash(
  int32_t xintercept,
  int32_t yintercept,
  int32_t ytilestep,
  int32_t pixx,
  int32_t xtile,
  int32_t ytile,
  int32_t lastside,
  int32_t lastintercept,
  int32_t lasttilehit,
  int32_t tilehit,
  int32_t postsource_low,
  int32_t postwidth,
  int32_t prevheight,
  int32_t adjacent_door,
  int32_t wallpic_normal,
  int32_t wallpic_door,
  int32_t viewx,
  int32_t viewy,
  int32_t viewcos,
  int32_t viewsin,
  int32_t heightnumerator,
  int32_t mindist
) {
  int32_t texture = (xintercept >> 4) & 0xfc0;
  int32_t local_yintercept = yintercept;

  if (ytilestep == -1) {
    local_yintercept += TILEGLOBAL;
  } else {
    texture = 0xfc0 - texture;
  }

  int32_t height = wl_draw_calc_height_raw(
    xintercept,
    local_yintercept,
    viewx,
    viewy,
    viewcos,
    viewsin,
    heightnumerator,
    mindist
  );

  int32_t wallpic = wallpic_normal;
  if (lastside == 0 && lastintercept == ytile && lasttilehit == tilehit) {
    if (texture == postsource_low) {
      postwidth += 1;
      height = prevheight;
    } else {
      postsource_low = texture;
      postwidth = 1;
    }
  } else {
    lastside = 0;
    lastintercept = ytile;
    lasttilehit = tilehit;
    postwidth = 1;
    if (tilehit & 0x40) {
      wallpic = adjacent_door ? wallpic_door : wallpic_normal;
    }
    postsource_low = texture;
  }

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)texture);
  hash = fnv1a_u32(hash, (uint32_t)height);
  hash = fnv1a_u32(hash, (uint32_t)postwidth);
  hash = fnv1a_u32(hash, (uint32_t)lastside);
  hash = fnv1a_u32(hash, (uint32_t)lastintercept);
  hash = fnv1a_u32(hash, (uint32_t)lasttilehit);
  hash = fnv1a_u32(hash, (uint32_t)postsource_low);
  hash = fnv1a_u32(hash, (uint32_t)wallpic);
  hash = fnv1a_u32(hash, (uint32_t)pixx);
  hash = fnv1a_u32(hash, (uint32_t)xtile);
  hash = fnv1a_u32(hash, (uint32_t)ytile);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_draw_wall_refresh_hash(
  int32_t player_angle,
  int32_t player_x,
  int32_t player_y,
  int32_t focallength,
  int32_t viewsin,
  int32_t viewcos
) {
  int32_t viewx = player_x - fixed_by_frac(focallength, viewcos);
  int32_t viewy = player_y + fixed_by_frac(focallength, viewsin);

  int32_t focaltx = viewx >> TILESHIFT;
  int32_t focalty = viewy >> TILESHIFT;
  int32_t viewtx = player_x >> TILESHIFT;
  int32_t viewty = player_y >> TILESHIFT;

  int32_t xpartialdown = viewx & (TILEGLOBAL - 1);
  int32_t xpartialup = TILEGLOBAL - xpartialdown;
  int32_t ypartialdown = viewy & (TILEGLOBAL - 1);
  int32_t ypartialup = TILEGLOBAL - ypartialdown;

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)player_angle);
  hash = fnv1a_u32(hash, (uint32_t)viewx);
  hash = fnv1a_u32(hash, (uint32_t)viewy);
  hash = fnv1a_u32(hash, (uint32_t)focaltx);
  hash = fnv1a_u32(hash, (uint32_t)focalty);
  hash = fnv1a_u32(hash, (uint32_t)viewtx);
  hash = fnv1a_u32(hash, (uint32_t)viewty);
  hash = fnv1a_u32(hash, (uint32_t)xpartialdown);
  hash = fnv1a_u32(hash, (uint32_t)xpartialup);
  hash = fnv1a_u32(hash, (uint32_t)ypartialdown);
  hash = fnv1a_u32(hash, (uint32_t)ypartialup);
  hash = fnv1a_u32(hash, (uint32_t)-1); // lastside reset
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_draw_three_d_refresh_hash(
  int32_t bufferofs,
  int32_t screenofs,
  int32_t frameon,
  int32_t fizzlein,
  uint32_t wallrefresh_hash
) {
  int32_t local_bufferofs = bufferofs + screenofs;
  int32_t local_displayofs = local_bufferofs - screenofs;
  int32_t local_fizzlein = fizzlein ? 1 : 0;

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, 0x01u); // clear traced array
  hash = fnv1a_u32(hash, (uint32_t)local_bufferofs);
  hash = fnv1a_u32(hash, wallrefresh_hash);
  hash = fnv1a_u32(hash, 0x02u); // DrawScaleds
  hash = fnv1a_u32(hash, 0x03u); // DrawPlayerWeapon

  if (local_fizzlein) {
    hash = fnv1a_u32(hash, 0x04u); // FizzleFade
    local_fizzlein = 0;
  }

  int64_t next_buffer_wide = (int64_t)local_displayofs + SCREENSIZE;
  int32_t next_buffer = (int32_t)next_buffer_wide;
  if (next_buffer_wide > PAGE3START) {
    next_buffer = PAGE1START;
  }

  frameon += 1;

  hash = fnv1a_u32(hash, (uint32_t)local_displayofs);
  hash = fnv1a_u32(hash, (uint32_t)next_buffer);
  hash = fnv1a_u32(hash, (uint32_t)frameon);
  hash = fnv1a_u32(hash, (uint32_t)local_fizzlein);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_scale_setup_scaling_hash(
  int32_t maxscaleheight_in,
  int32_t viewheight
) {
  int32_t maxscaleheight = maxscaleheight_in / 2;
  int32_t maxscale = maxscaleheight - 1;
  int32_t maxscaleshl2 = maxscale << 2;
  int32_t stepbytwo = viewheight / 2;

  int32_t build_count = 0;
  for (int32_t i = 1; i <= maxscaleheight; i++) {
    build_count++;
    if (i >= stepbytwo) {
      i += 2;
    }
  }

  int32_t lock_count = 0;
  int32_t duplicate_count = 0;
  for (int32_t i = 1; i <= maxscaleheight; i++) {
    lock_count++;
    if (i >= stepbytwo) {
      duplicate_count += 2;
      i += 2;
    }
  }

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)maxscaleheight);
  hash = fnv1a_u32(hash, (uint32_t)maxscale);
  hash = fnv1a_u32(hash, (uint32_t)maxscaleshl2);
  hash = fnv1a_u32(hash, (uint32_t)stepbytwo);
  hash = fnv1a_u32(hash, (uint32_t)build_count);
  hash = fnv1a_u32(hash, (uint32_t)lock_count);
  hash = fnv1a_u32(hash, (uint32_t)duplicate_count);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_scale_scale_shape_hash(
  int32_t xcenter,
  int32_t leftpix_in,
  int32_t rightpix_in,
  uint32_t height,
  int32_t maxscale,
  int32_t viewwidth,
  int32_t wallheight_seed
) {
  int32_t scale = (int32_t)(height >> 3);
  if (scale <= 0 || scale > maxscale) {
    return 0u;
  }

  int32_t leftpix = clamp_i32(leftpix_in, 0, 63);
  int32_t rightpix = clamp_i32(rightpix_in, 0, 63);
  if (rightpix < leftpix) {
    int32_t t = rightpix;
    rightpix = leftpix;
    leftpix = t;
  }

  int32_t slinex = xcenter;
  int32_t srcx = 32;
  int32_t stopx = leftpix;

  int32_t drawn = 0;
  int32_t clipped = 0;
  uint32_t hash = 2166136261u;

  while (--srcx >= stopx && slinex > 0) {
    int32_t slinwidth = width_for_src(scale, srcx);
    if (!slinwidth) {
      continue;
    }

    if (slinwidth == 1) {
      slinex--;
      if (slinex < viewwidth && wall_height_at(slinex, wallheight_seed) < (int32_t)height) {
        drawn++;
        hash = fnv1a_u32(hash, (uint32_t)slinex);
      }
      continue;
    }

    if (slinex > viewwidth) {
      slinex -= slinwidth;
      slinwidth = viewwidth - slinex;
      if (slinwidth < 1) {
        continue;
      }
    } else {
      if (slinwidth > slinex) {
        slinwidth = slinex;
      }
      slinex -= slinwidth;
    }

    int32_t leftvis = wall_height_at(slinex, wallheight_seed) < (int32_t)height;
    int32_t rightvis = wall_height_at(slinex + slinwidth - 1, wallheight_seed) < (int32_t)height;

    if (leftvis) {
      if (!rightvis) {
        while (slinwidth > 0 && wall_height_at(slinex + slinwidth - 1, wallheight_seed) >= (int32_t)height) {
          slinwidth--;
          clipped++;
        }
      }
      if (slinwidth > 0) {
        drawn++;
      }
    } else {
      if (!rightvis) {
        continue;
      }
      while (slinwidth > 0 && wall_height_at(slinex, wallheight_seed) >= (int32_t)height) {
        slinex++;
        slinwidth--;
        clipped++;
      }
      if (slinwidth > 0) {
        drawn++;
      }
      break;
    }
  }

  slinex = xcenter;
  stopx = rightpix;
  srcx = (leftpix < 31) ? 31 : (leftpix - 1);
  int32_t slinwidth = 0;

  while (++srcx <= stopx && (slinex += slinwidth) < viewwidth) {
    slinwidth = width_for_src(scale, srcx);
    if (!slinwidth) {
      continue;
    }

    if (slinwidth == 1) {
      if (slinex >= 0 && wall_height_at(slinex, wallheight_seed) < (int32_t)height) {
        drawn++;
      }
      continue;
    }

    if (slinex < 0) {
      if (slinwidth <= -slinex) {
        continue;
      }
      slinwidth += slinex;
      slinex = 0;
    } else if (slinex + slinwidth > viewwidth) {
      slinwidth = viewwidth - slinex;
    }

    int32_t leftvis = wall_height_at(slinex, wallheight_seed) < (int32_t)height;
    int32_t rightvis = wall_height_at(slinex + slinwidth - 1, wallheight_seed) < (int32_t)height;

    if (leftvis) {
      if (!rightvis) {
        while (slinwidth > 0 && wall_height_at(slinex + slinwidth - 1, wallheight_seed) >= (int32_t)height) {
          slinwidth--;
          clipped++;
        }
      }
      if (slinwidth > 0) {
        drawn++;
      }
      if (!rightvis) {
        break;
      }
    } else {
      if (!rightvis) {
        continue;
      }
      while (slinwidth > 0 && wall_height_at(slinex, wallheight_seed) >= (int32_t)height) {
        slinex++;
        slinwidth--;
        clipped++;
      }
      if (slinwidth > 0) {
        drawn++;
      }
    }
  }

  hash = fnv1a_u32(hash, (uint32_t)drawn);
  hash = fnv1a_u32(hash, (uint32_t)clipped);
  hash = fnv1a_u32(hash, (uint32_t)scale);
  hash = fnv1a_u32(hash, (uint32_t)xcenter);
  hash = fnv1a_u32(hash, (uint32_t)leftpix);
  hash = fnv1a_u32(hash, (uint32_t)rightpix);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_scale_simple_scale_shape_hash(
  int32_t xcenter,
  int32_t leftpix_in,
  int32_t rightpix_in,
  uint32_t height
) {
  int32_t scale = (int32_t)(height >> 1);
  if (scale <= 0) {
    return 0u;
  }

  int32_t leftpix = clamp_i32(leftpix_in, 0, 63);
  int32_t rightpix = clamp_i32(rightpix_in, 0, 63);
  if (rightpix < leftpix) {
    int32_t t = rightpix;
    rightpix = leftpix;
    leftpix = t;
  }

  int32_t srcx = 32;
  int32_t slinex = xcenter;
  int32_t stopx = leftpix;
  int32_t drawn = 0;

  while (--srcx >= stopx) {
    int32_t slinwidth = width_for_src(scale, srcx);
    if (!slinwidth) {
      continue;
    }
    slinex -= slinwidth;
    drawn++;
  }

  slinex = xcenter;
  stopx = rightpix;
  srcx = (leftpix < 31) ? 31 : (leftpix - 1);
  int32_t slinwidth = 0;
  while (++srcx <= stopx) {
    slinwidth = width_for_src(scale, srcx);
    if (!slinwidth) {
      continue;
    }
    drawn++;
    slinex += slinwidth;
  }

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)drawn);
  hash = fnv1a_u32(hash, (uint32_t)scale);
  hash = fnv1a_u32(hash, (uint32_t)xcenter);
  hash = fnv1a_u32(hash, (uint32_t)leftpix);
  hash = fnv1a_u32(hash, (uint32_t)rightpix);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vh_vw_measure_prop_string_hash(
  int32_t text_len,
  int32_t font_width,
  int32_t spacing,
  int32_t max_width
) {
  int32_t len = text_len < 0 ? 0 : text_len;
  int32_t fw = font_width < 1 ? 1 : font_width;
  int32_t sp = spacing < 0 ? 0 : spacing;
  int32_t width = clamp_s32_i64((int64_t)len * (int64_t)(fw + sp));
  int32_t clipped = 0;
  if (max_width > 0 && width > max_width) {
    width = max_width;
    clipped = 1;
  }

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)len);
  hash = fnv1a_u32(hash, (uint32_t)fw);
  hash = fnv1a_u32(hash, (uint32_t)sp);
  hash = fnv1a_u32(hash, (uint32_t)width);
  hash = fnv1a_u32(hash, (uint32_t)clipped);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vh_vwb_draw_pic_hash(
  int32_t x,
  int32_t y,
  int32_t picnum,
  int32_t bufferofs,
  int32_t screenofs
) {
  int32_t draw_ofs = bufferofs + screenofs;
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  hash = fnv1a_u32(hash, (uint32_t)picnum);
  hash = fnv1a_u32(hash, (uint32_t)draw_ofs);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vh_vwb_bar_hash(
  int32_t x,
  int32_t y,
  int32_t width,
  int32_t height,
  int32_t color
) {
  int32_t w = width < 0 ? 0 : width;
  int32_t h = height < 0 ? 0 : height;
  uint32_t pixels = (uint32_t)((uint64_t)(uint32_t)w * (uint64_t)(uint32_t)h);
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  hash = fnv1a_u32(hash, (uint32_t)w);
  hash = fnv1a_u32(hash, (uint32_t)h);
  hash = fnv1a_u32(hash, (uint32_t)color);
  hash = fnv1a_u32(hash, pixels);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vl_vl_bar_hash(
  int32_t x,
  int32_t y,
  int32_t width,
  int32_t height,
  int32_t color,
  int32_t linewidth
) {
  int32_t w = width < 0 ? 0 : width;
  int32_t h = height < 0 ? 0 : height;
  int32_t lw = linewidth <= 0 ? 1 : linewidth;
  uint32_t span = (uint32_t)((uint64_t)(uint32_t)w * (uint64_t)(uint32_t)lw);
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  hash = fnv1a_u32(hash, (uint32_t)w);
  hash = fnv1a_u32(hash, (uint32_t)h);
  hash = fnv1a_u32(hash, (uint32_t)color);
  hash = fnv1a_u32(hash, (uint32_t)lw);
  hash = fnv1a_u32(hash, span);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vl_vl_mem_to_screen_hash(
  int32_t src_len,
  int32_t width,
  int32_t height,
  int32_t dest,
  int32_t mask
) {
  int32_t len = src_len < 0 ? 0 : src_len;
  int32_t w = width < 0 ? 0 : width;
  int32_t h = height < 0 ? 0 : height;
  int32_t copied = (int32_t)((uint32_t)w * (uint32_t)h);
  if (copied > len) {
    copied = len;
  }

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)len);
  hash = fnv1a_u32(hash, (uint32_t)w);
  hash = fnv1a_u32(hash, (uint32_t)h);
  hash = fnv1a_u32(hash, (uint32_t)dest);
  hash = fnv1a_u32(hash, (uint32_t)mask);
  hash = fnv1a_u32(hash, (uint32_t)copied);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vl_vl_latch_to_screen_hash(
  int32_t source,
  int32_t width,
  int32_t height,
  int32_t x,
  int32_t y
) {
  int32_t w = width < 0 ? 0 : width;
  int32_t h = height < 0 ? 0 : height;
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)source);
  hash = fnv1a_u32(hash, (uint32_t)w);
  hash = fnv1a_u32(hash, (uint32_t)h);
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vl_vl_fade_in_hash(
  int32_t start,
  int32_t end,
  int32_t steps,
  int32_t palette_seed
) {
  int32_t first = start < 0 ? 0 : start;
  int32_t last = end < first ? first : end;
  int32_t count = (last - first) + 1;
  int32_t s = steps <= 0 ? 1 : steps;
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)first);
  hash = fnv1a_u32(hash, (uint32_t)last);
  hash = fnv1a_u32(hash, (uint32_t)s);
  hash = fnv1a_u32(hash, (uint32_t)palette_seed);
  hash = fnv1a_u32(hash, (uint32_t)count);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vl_vl_fade_out_hash(
  int32_t start,
  int32_t end,
  int32_t steps,
  int32_t palette_seed
) {
  int32_t first = start < 0 ? 0 : start;
  int32_t last = end < first ? first : end;
  int32_t s = steps <= 0 ? 1 : steps;
  uint32_t span = (uint32_t)((last - first) + 1);
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)first);
  hash = fnv1a_u32(hash, (uint32_t)last);
  hash = fnv1a_u32(hash, (uint32_t)s);
  hash = fnv1a_u32(hash, (uint32_t)palette_seed);
  hash = fnv1a_u32(hash, span ^ 0xa5a5u);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vl_vl_plot_hash(
  int32_t x,
  int32_t y,
  int32_t color,
  int32_t linewidth
) {
  int32_t lw = linewidth <= 0 ? 1 : linewidth;
  uint32_t product = (uint32_t)x * (uint32_t)lw;
  uint32_t pixel = (uint32_t)((product & 0xffffu) | (((uint32_t)y & 0xffffu) << 16));
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  hash = fnv1a_u32(hash, (uint32_t)color);
  hash = fnv1a_u32(hash, (uint32_t)lw);
  hash = fnv1a_u32(hash, pixel);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vl_vl_hlin_hash(
  int32_t x,
  int32_t y,
  int32_t width,
  int32_t color,
  int32_t linewidth
) {
  int32_t w = width < 0 ? 0 : width;
  int32_t lw = linewidth <= 0 ? 1 : linewidth;
  uint32_t span = (uint32_t)((uint64_t)(uint32_t)w * (uint64_t)(uint32_t)lw);
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  hash = fnv1a_u32(hash, (uint32_t)w);
  hash = fnv1a_u32(hash, (uint32_t)color);
  hash = fnv1a_u32(hash, (uint32_t)lw);
  hash = fnv1a_u32(hash, span);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vh_vwb_plot_hash(
  int32_t x,
  int32_t y,
  int32_t color,
  int32_t linewidth
) {
  int32_t lw = linewidth <= 0 ? 1 : linewidth;
  uint32_t product = (uint32_t)x * (uint32_t)lw;
  uint32_t pixel = (uint32_t)((product & 0xffffu) | (((uint32_t)y & 0xffffu) << 16));
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  hash = fnv1a_u32(hash, (uint32_t)color);
  hash = fnv1a_u32(hash, (uint32_t)lw);
  hash = fnv1a_u32(hash, pixel ^ 0x55aa55aau);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vh_vwb_hlin_hash(
  int32_t x,
  int32_t y,
  int32_t width,
  int32_t color,
  int32_t linewidth
) {
  int32_t w = width < 0 ? 0 : width;
  int32_t lw = linewidth <= 0 ? 1 : linewidth;
  uint32_t span = (uint32_t)((uint64_t)(uint32_t)w * (uint64_t)(uint32_t)lw);
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  hash = fnv1a_u32(hash, (uint32_t)w);
  hash = fnv1a_u32(hash, (uint32_t)color);
  hash = fnv1a_u32(hash, (uint32_t)lw);
  hash = fnv1a_u32(hash, span ^ 0x1111u);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vh_vwb_vlin_hash(
  int32_t x,
  int32_t y,
  int32_t height,
  int32_t color,
  int32_t linewidth
) {
  int32_t h = height < 0 ? 0 : height;
  int32_t lw = linewidth <= 0 ? 1 : linewidth;
  uint32_t span = (uint32_t)((uint64_t)(uint32_t)h * (uint64_t)(uint32_t)lw);
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  hash = fnv1a_u32(hash, (uint32_t)h);
  hash = fnv1a_u32(hash, (uint32_t)color);
  hash = fnv1a_u32(hash, (uint32_t)lw);
  hash = fnv1a_u32(hash, span ^ 0x2222u);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vh_vwl_measure_string_hash(
  int32_t text_len,
  int32_t font_width,
  int32_t font_height,
  int32_t max_width
) {
  int32_t len = text_len < 0 ? 0 : text_len;
  int32_t fw = font_width < 1 ? 1 : font_width;
  int32_t fh = font_height < 1 ? 1 : font_height;
  int32_t clipped = 0;
  int32_t width = clamp_s32_i64((int64_t)len * (int64_t)fw);
  if (max_width > 0 && width > max_width) {
    width = max_width;
    clipped = 1;
  }
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)len);
  hash = fnv1a_u32(hash, (uint32_t)fw);
  hash = fnv1a_u32(hash, (uint32_t)fh);
  hash = fnv1a_u32(hash, (uint32_t)width);
  hash = fnv1a_u32(hash, (uint32_t)clipped);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vh_vwb_draw_prop_string_hash(
  int32_t text_len,
  int32_t x,
  int32_t y,
  int32_t color,
  int32_t max_width
) {
  int32_t len = text_len < 0 ? 0 : text_len;
  int32_t drawn = len;
  if (max_width > 0 && drawn > max_width) {
    drawn = max_width;
  }
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)len);
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  hash = fnv1a_u32(hash, (uint32_t)color);
  hash = fnv1a_u32(hash, (uint32_t)max_width);
  hash = fnv1a_u32(hash, (uint32_t)drawn);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vl_vl_vlin_hash(
  int32_t x,
  int32_t y,
  int32_t height,
  int32_t color,
  int32_t linewidth
) {
  int32_t h = height < 0 ? 0 : height;
  int32_t lw = linewidth <= 0 ? 1 : linewidth;
  uint32_t span = (uint32_t)((uint64_t)(uint32_t)h * (uint64_t)(uint32_t)lw);
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  hash = fnv1a_u32(hash, (uint32_t)h);
  hash = fnv1a_u32(hash, (uint32_t)color);
  hash = fnv1a_u32(hash, (uint32_t)lw);
  hash = fnv1a_u32(hash, span);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vl_vl_screen_to_screen_hash(
  int32_t source,
  int32_t dest,
  int32_t width,
  int32_t height,
  int32_t linewidth
) {
  int32_t w = width < 0 ? 0 : width;
  int32_t h = height < 0 ? 0 : height;
  int32_t lw = linewidth <= 0 ? 1 : linewidth;
  uint32_t copied = (uint32_t)((uint64_t)(uint32_t)w * (uint64_t)(uint32_t)h);
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)source);
  hash = fnv1a_u32(hash, (uint32_t)dest);
  hash = fnv1a_u32(hash, (uint32_t)w);
  hash = fnv1a_u32(hash, (uint32_t)h);
  hash = fnv1a_u32(hash, (uint32_t)lw);
  hash = fnv1a_u32(hash, copied);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vl_vl_masked_to_screen_hash(
  int32_t source,
  int32_t width,
  int32_t height,
  int32_t x,
  int32_t y,
  int32_t mask
) {
  int32_t w = width < 0 ? 0 : width;
  int32_t h = height < 0 ? 0 : height;
  uint32_t copied = (uint32_t)((uint64_t)(uint32_t)w * (uint64_t)(uint32_t)h);
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)source);
  hash = fnv1a_u32(hash, (uint32_t)w);
  hash = fnv1a_u32(hash, (uint32_t)h);
  hash = fnv1a_u32(hash, (uint32_t)x);
  hash = fnv1a_u32(hash, (uint32_t)y);
  hash = fnv1a_u32(hash, (uint32_t)mask);
  hash = fnv1a_u32(hash, copied ^ 0x5a5au);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vl_vl_mem_to_latch_hash(
  int32_t source_len,
  int32_t width,
  int32_t height,
  int32_t dest
) {
  int32_t len = source_len < 0 ? 0 : source_len;
  int32_t w = width < 0 ? 0 : width;
  int32_t h = height < 0 ? 0 : height;
  int32_t copied = (int32_t)((uint32_t)w * (uint32_t)h);
  if (copied > len) {
    copied = len;
  }
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)len);
  hash = fnv1a_u32(hash, (uint32_t)w);
  hash = fnv1a_u32(hash, (uint32_t)h);
  hash = fnv1a_u32(hash, (uint32_t)dest);
  hash = fnv1a_u32(hash, (uint32_t)copied);
  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_id_vl_vl_clear_video_hash(
  int32_t color,
  int32_t linewidth,
  int32_t pages,
  int32_t bufferofs
) {
  int32_t lw = linewidth <= 0 ? 1 : linewidth;
  int32_t pg = pages <= 0 ? 1 : pages;
  uint32_t span = (uint32_t)((uint64_t)(uint32_t)lw * (uint64_t)(uint32_t)pg * 320u * 200u);
  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)color);
  hash = fnv1a_u32(hash, (uint32_t)lw);
  hash = fnv1a_u32(hash, (uint32_t)pg);
  hash = fnv1a_u32(hash, (uint32_t)bufferofs);
  hash = fnv1a_u32(hash, span);
  return hash;
}

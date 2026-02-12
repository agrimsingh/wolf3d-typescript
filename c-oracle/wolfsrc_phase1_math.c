#include <stdint.h>
#include <math.h>
#include <emscripten/emscripten.h>

#define PI 3.141592657
#define FINEANGLES 3600
#define TILEGLOBAL (1L << 16)
#define GLOBAL1 (1L << 16)
#define ANGLES 360
#define ANGLEQUAD (ANGLES / 4)
#define VIEWGLOBAL 0x10000L
#define MINDIST 0x5800L
#define MAXVIEWWIDTH 320

static uint32_t fnv1a_u32(uint32_t hash, uint32_t value) {
  hash ^= value;
  hash *= 16777619u;
  return hash;
}

static int32_t pixelangle[MAXVIEWWIDTH];
static int32_t finetangent[FINEANGLES / 4];
static int32_t sintable[ANGLES + ANGLES / 4];

EMSCRIPTEN_KEEPALIVE int32_t oracle_wl_draw_fixed_by_frac(int32_t a, int32_t b) {
  int sign = ((a < 0) ? 1 : 0) ^ ((b < 0) ? 1 : 0);
  uint32_t ua = (a < 0) ? (uint32_t)(-(int64_t)a) : (uint32_t)a;
  uint32_t frac = (uint16_t)b;

  uint64_t prod = (uint64_t)ua * (uint64_t)frac;
  int32_t out = (int32_t)(prod >> 16);

  return sign ? -out : out;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_main_build_tables_hash(void) {
  const double radtoint = (double)FINEANGLES / 2.0 / PI;

  for (int i = 0; i < FINEANGLES / 8; i++) {
    double tang = tan((i + 0.5) / radtoint);
    finetangent[i] = (int32_t)(tang * TILEGLOBAL);
    finetangent[FINEANGLES / 4 - 1 - i] = (int32_t)((1.0 / tang) * TILEGLOBAL);
  }

  double angle = 0.0;
  double anglestep = PI / 2.0 / ANGLEQUAD;

  for (int i = 0; i <= ANGLEQUAD; i++) {
    int32_t value = (int32_t)(GLOBAL1 * sin(angle));
    if (value > 0xffff) {
      value = 0xffff;
    } else if (value < 0) {
      value = 0;
    }
    sintable[i] = value;
    sintable[i + ANGLES] = value;
    sintable[ANGLES / 2 - i] = value;

    sintable[ANGLES - i] = value | 0x80000000u;
    sintable[ANGLES / 2 + i] = value | 0x80000000u;

    angle += anglestep;
  }

  uint32_t hash = 2166136261u;
  for (int i = 0; i < FINEANGLES / 4; i++) {
    hash = fnv1a_u32(hash, (uint32_t)finetangent[i]);
  }
  for (int i = 0; i < ANGLES + ANGLES / 4; i++) {
    hash = fnv1a_u32(hash, (uint32_t)sintable[i]);
  }

  return hash;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_wl_main_calc_projection_hash(int32_t viewwidth, int32_t focal) {
  if (viewwidth < 2) {
    viewwidth = 2;
  }
  if (viewwidth > MAXVIEWWIDTH) {
    viewwidth = MAXVIEWWIDTH;
  }
  if (viewwidth & 1) {
    viewwidth -= 1;
  }

  oracle_wl_main_build_tables_hash();

  const double radtoint = (double)FINEANGLES / 2.0 / PI;
  int32_t halfview = viewwidth / 2;
  double facedist = (double)focal + (double)MINDIST;

  int32_t scale = (int32_t)(halfview * facedist / (VIEWGLOBAL / 2));
  int32_t heightnumerator = (int32_t)(((int64_t)TILEGLOBAL * (int64_t)scale) >> 6);
  int32_t minheightdiv = (heightnumerator / 0x7fff) + 1;

  for (int i = 0; i < halfview; i++) {
    double tang = ((long)i * (double)VIEWGLOBAL / viewwidth) / facedist;
    double angle = atan(tang);
    int32_t intang = (int32_t)(angle * radtoint);
    pixelangle[halfview - 1 - i] = intang;
    pixelangle[halfview + i] = -intang;
  }

  int32_t maxslope = finetangent[pixelangle[0]];
  maxslope >>= 8;

  uint32_t hash = 2166136261u;
  hash = fnv1a_u32(hash, (uint32_t)scale);
  hash = fnv1a_u32(hash, (uint32_t)heightnumerator);
  hash = fnv1a_u32(hash, (uint32_t)minheightdiv);
  hash = fnv1a_u32(hash, (uint32_t)maxslope);

  for (int i = 0; i < viewwidth; i++) {
    hash = fnv1a_u32(hash, (uint32_t)pixelangle[i]);
  }

  return hash;
}

#include <stdint.h>

// WL_DEF.H declares an enum variable named menuitems, which becomes a
// definition in each translation unit. Rename it locally to avoid collisions.
#define menuitems menuitems_stub
#include "WL_DEF.H"
#undef menuitems

#include <emscripten/emscripten.h>

objtype objlist[MAXACTORS], *new, *obj, *player, *lastobj, *objfreelist;
statobj_t statobjlist[MAXSTATS], *laststatobj;
doorobj_t doorobjlist[MAXDOORS], *lastdoorobj;
unsigned farmapylookup[MAPSIZE];
byte tilemap[MAPSIZE][MAPSIZE];
objtype *actorat[MAPSIZE][MAPSIZE];
unsigned *mapsegs[MAPPLANES];
static unsigned mapplane0[MAPSIZE * MAPSIZE];
unsigned doorposition[MAXDOORS], pwallstate;
boolean areabyplayer[NUMAREAS];
boolean noclip;

unsigned tics;
unsigned mapwidth, mapheight;
int viewsize;
boolean mouseenabled, joystickenabled, joypadenabled, joystickprogressive;
boolean compatability;
byte *updateptr;
unsigned uwidthtable[UPDATEHIGH];
unsigned blockstarts[UPDATEWIDE * UPDATEHIGH];
byte fontcolor, backcolor;
longword TimeCount;

void Quit(char *error) { (void)error; }
boolean SD_PlaySound(soundnames sound) {
  (void)sound;
  return false;
}
boolean SD_SoundPlaying(void) { return false; }
int US_RndT(void) { return 0; }
void OpenDoor(int door) { (void)door; }
void PlaceItemType(int itemtype, int tilex, int tiley) {
  (void)itemtype;
  (void)tilex;
  (void)tiley;
}

boolean CheckLine(objtype *ob);
boolean CheckSight(objtype *ob);
boolean TryMove(objtype *ob);
void ClipMove(objtype *ob, long xmove, long ymove);
void MoveObj(objtype *ob, long move);
void SelectChaseDir(objtype *ob);

static int32_t g_take_damage_stub_calls;

void TakeDamage_stub(int points, objtype *attacker) {
  (void)points;
  (void)attacker;
  g_take_damage_stub_calls++;
}

static uint32_t fnv1a_u32(uint32_t hash, uint32_t value) {
  hash ^= value;
  hash *= 16777619u;
  return hash;
}

static void setup_world(
  int32_t px,
  int32_t py,
  uint32_t door_mask,
  uint32_t door_pos_q8
) {
  int i;
  int j;

  for (i = 0; i < MAPSIZE; i++) {
    for (j = 0; j < MAPSIZE; j++) {
      tilemap[i][j] = 0;
      actorat[i][j] = 0;
    }
  }

  for (i = 0; i < MAXDOORS; i++) {
    doorposition[i] = 0;
  }

  for (i = 0; i < 8; i++) {
    if ((door_mask >> i) & 1u) {
      tilemap[32 + i][32] = (byte)(128 + i);
      doorposition[i] = door_pos_q8;
    }
  }

  for (i = 0; i < NUMAREAS; i++) {
    areabyplayer[i] = false;
  }

  player = &objlist[0];
  player->tilex = (unsigned)(px >> TILESHIFT);
  player->tiley = (unsigned)(py >> TILESHIFT);
  player->x = px;
  player->y = py;
  plux = (unsigned)(px >> UNSIGNEDSHIFT);
  pluy = (unsigned)(py >> UNSIGNEDSHIFT);
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_real_wl_state_check_line(
  int32_t obx,
  int32_t oby,
  int32_t px,
  int32_t py,
  uint32_t door_mask,
  uint32_t door_pos_q8
) {
  setup_world(px, py, door_mask, door_pos_q8);

  objlist[1].x = obx;
  objlist[1].y = oby;
  objlist[1].tilex = (unsigned)(obx >> TILESHIFT);
  objlist[1].tiley = (unsigned)(oby >> TILESHIFT);

  return CheckLine(&objlist[1]) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_real_wl_state_check_sight(
  int32_t obx,
  int32_t oby,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t area_connected,
  uint32_t door_mask,
  uint32_t door_pos_q8
) {
  setup_world(px, py, door_mask, door_pos_q8);

  objlist[1].x = obx;
  objlist[1].y = oby;
  objlist[1].tilex = (unsigned)(obx >> TILESHIFT);
  objlist[1].tiley = (unsigned)(oby >> TILESHIFT);
  objlist[1].dir = (dirtype)(dir & 7);
  objlist[1].areanumber = 0;

  areabyplayer[0] = area_connected ? true : false;

  return CheckSight(&objlist[1]) ? 1 : 0;
}

static void setup_agent_world(uint32_t map_lo, uint32_t map_hi) {
  int x;
  int y;

  for (x = 0; x < MAPSIZE; x++) {
    for (y = 0; y < MAPSIZE; y++) {
      actorat[x][y] = (objtype *)1;
    }
  }

  for (y = 0; y < 8; y++) {
    for (x = 0; x < 8; x++) {
      int bit = y * 8 + x;
      uint32_t wall_bit = bit < 32 ? (map_lo >> bit) : (map_hi >> (bit - 32));
      actorat[x][y] = (wall_bit & 1u) ? (objtype *)1 : 0;
    }
  }

  mapwidth = 8;
  mapheight = 8;
}

static void setup_state_world_empty(void) {
  int x;
  int y;

  for (x = 0; x < MAPSIZE; x++) {
    farmapylookup[x] = (unsigned)(x * MAPSIZE);
    for (y = 0; y < MAPSIZE; y++) {
      actorat[x][y] = 0;
      mapplane0[x * MAPSIZE + y] = AREATILE;
    }
  }

  mapsegs[0] = mapplane0;
}

void real_wl_agent_clip_move_apply(
  int32_t *x_q16,
  int32_t *y_q16,
  int32_t xmove_q16,
  int32_t ymove_q16,
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t noclip_enabled
) {
  setup_agent_world(map_lo, map_hi);
  noclip = noclip_enabled ? true : false;

  objlist[1].x = *x_q16;
  objlist[1].y = *y_q16;
  objlist[1].flags = 0;

  ClipMove(&objlist[1], xmove_q16, ymove_q16);

  *x_q16 = objlist[1].x;
  *y_q16 = objlist[1].y;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_real_wl_agent_try_move(
  int32_t x,
  int32_t y,
  uint32_t map_lo,
  uint32_t map_hi
) {
  setup_agent_world(map_lo, map_hi);

  objlist[1].x = x;
  objlist[1].y = y;
  objlist[1].flags = 0;

  return TryMove(&objlist[1]) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_real_wl_agent_clip_move_hash(
  int32_t x,
  int32_t y,
  int32_t xmove,
  int32_t ymove,
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t noclip_enabled
) {
  uint32_t h = 2166136261u;
  int32_t ox = x;
  int32_t oy = y;

  real_wl_agent_clip_move_apply(
    &ox,
    &oy,
    xmove,
    ymove,
    map_lo,
    map_hi,
    noclip_enabled
  );

  h = fnv1a_u32(h, (uint32_t)ox);
  h = fnv1a_u32(h, (uint32_t)oy);
  h = fnv1a_u32(h, (uint32_t)noclip);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_real_wl_state_move_obj_hash(
  int32_t obx,
  int32_t oby,
  int32_t dir,
  int32_t playerx,
  int32_t playery,
  int32_t area_connected,
  int32_t distance,
  int32_t move,
  int32_t obclass,
  int32_t tics_value
) {
  uint32_t h = 2166136261u;
  int i;

  for (i = 0; i < NUMAREAS; i++) {
    areabyplayer[i] = false;
  }
  areabyplayer[0] = area_connected ? true : false;

  player = &objlist[0];
  player->x = playerx;
  player->y = playery;

  objlist[1].x = obx;
  objlist[1].y = oby;
  objlist[1].dir = (dirtype)(((dir % 9) + 9) % 9);
  objlist[1].areanumber = 0;
  objlist[1].distance = distance;
  objlist[1].obclass = (classtype)obclass;

  tics = (unsigned)tics_value;
  g_take_damage_stub_calls = 0;

  MoveObj(&objlist[1], (long)move);

  h = fnv1a_u32(h, (uint32_t)objlist[1].x);
  h = fnv1a_u32(h, (uint32_t)objlist[1].y);
  h = fnv1a_u32(h, (uint32_t)objlist[1].distance);
  h = fnv1a_u32(h, (uint32_t)g_take_damage_stub_calls);
  return h;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_real_wl_state_select_chase_dir_hash(
  int32_t ob_tilex,
  int32_t ob_tiley,
  int32_t dir,
  int32_t obclass,
  int32_t flags,
  int32_t player_tilex,
  int32_t player_tiley
) {
  uint32_t h = 2166136261u;

  setup_state_world_empty();

  player = &objlist[0];
  player->tilex = (unsigned)player_tilex;
  player->tiley = (unsigned)player_tiley;

  objlist[1].tilex = (unsigned)ob_tilex;
  objlist[1].tiley = (unsigned)ob_tiley;
  objlist[1].dir = (dirtype)(((dir % 9) + 9) % 9);
  objlist[1].obclass = (classtype)obclass;
  objlist[1].flags = flags;
  objlist[1].distance = 0;
  objlist[1].areanumber = 0;

  SelectChaseDir(&objlist[1]);

  h = fnv1a_u32(h, (uint32_t)objlist[1].dir);
  h = fnv1a_u32(h, (uint32_t)objlist[1].tilex);
  h = fnv1a_u32(h, (uint32_t)objlist[1].tiley);
  h = fnv1a_u32(h, (uint32_t)objlist[1].distance);
  h = fnv1a_u32(h, (uint32_t)objlist[1].areanumber);
  h = fnv1a_u32(h, (uint32_t)objlist[1].flags);
  return h;
}

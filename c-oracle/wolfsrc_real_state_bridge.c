#include <stdint.h>

// WL_DEF.H declares an enum variable named menuitems, which becomes a
// definition in each translation unit. Rename it locally to avoid collisions.
#define menuitems menuitems_stub
#include "WL_DEF.H"
#undef menuitems

#include <string.h>
#include <math.h>
#include <emscripten/emscripten.h>

objtype objlist[MAXACTORS], *new, *obj, *player, *lastobj, *objfreelist, *killerobj;
statobj_t statobjlist[MAXSTATS], *laststatobj;
doorobj_t doorobjlist[MAXDOORS], *lastdoorobj;
unsigned farmapylookup[MAPSIZE];
byte tilemap[MAPSIZE][MAPSIZE];
objtype *actorat[MAPSIZE][MAPSIZE];
unsigned *mapsegs[MAPPLANES];
static unsigned mapplane0[MAPSIZE * MAPSIZE];
static unsigned mapplane1[MAPSIZE * MAPSIZE];
unsigned doorposition[MAXDOORS], pwallstate;
boolean areabyplayer[NUMAREAS];
boolean noclip;
boolean singlestep, godmode;
gametype gamestate;
exit_t playstate;
boolean madenoise;
boolean buttonheld[NUMBUTTONS];
int controlx, controly;
boolean buttonstate[NUMBUTTONS];
fixed sintable[ANGLES + ANGLES / 4 + 1];
fixed *costable = sintable + ANGLES / 4;

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
unsigned bufferofs;

void Quit(char *error) { (void)error; }
boolean SD_PlaySound(soundnames sound) {
  (void)sound;
  return false;
}
boolean SD_SoundPlaying(void) { return false; }
int US_RndT(void) { return 0; }
void OpenDoor(int door) { (void)door; }
int SpawnBJVictory(void) { return 0; }
void PlaceItemType(int itemtype, int tilex, int tiley) {
  (void)itemtype;
  (void)tilex;
  (void)tiley;
}
void LatchDrawPic(unsigned x, unsigned y, unsigned picnum) {
  (void)x;
  (void)y;
  (void)picnum;
}
void StartDamageFlash(int damage) {
  (void)damage;
}

boolean CheckLine(objtype *ob);
boolean CheckSight(objtype *ob);
boolean TryMove(objtype *ob);
void ClipMove(objtype *ob, long xmove, long ymove);
void MoveObj(objtype *ob, long move);
void SelectChaseDir(objtype *ob);
void ControlMovement(objtype *ob);
extern int anglefrac;
void TakeDamage(int points, objtype *attacker);

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

fixed FixedByFrac(fixed a, fixed b) {
  int sign;
  uint32_t ua;
  uint32_t frac;
  uint64_t prod;
  int32_t out;

  sign = ((a < 0) ? 1 : 0) ^ ((b < 0) ? 1 : 0);
  ua = (a < 0) ? (uint32_t)(-(int64_t)a) : (uint32_t)a;
  frac = ((uint32_t)b) & 0xffffu;
  prod = (uint64_t)ua * (uint64_t)frac;
  out = (int32_t)(prod >> 16);
  return sign ? -out : out;
}

static void ensure_trig_tables(void) {
  static int tables_ready;
  double angle;
  double anglestep;
  const double pi = 3.141592657;
  int i;

  if (tables_ready) {
    return;
  }

  angle = 0.0;
  anglestep = pi / 2.0 / (double)ANGLEQUAD;
  for (i = 0; i <= ANGLEQUAD; i++) {
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

  tables_ready = 1;
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
    farmapylookup[x] = (unsigned)(x * MAPSIZE);
    for (y = 0; y < MAPSIZE; y++) {
      actorat[x][y] = (objtype *)1;
      mapplane0[x * MAPSIZE + y] = AREATILE;
      mapplane1[x * MAPSIZE + y] = 0;
    }
  }

  for (y = 0; y < 8; y++) {
    for (x = 0; x < 8; x++) {
      int bit = y * 8 + x;
      uint32_t wall_bit = bit < 32 ? (map_lo >> bit) : (map_hi >> (bit - 32));
      actorat[x][y] = (wall_bit & 1u) ? (objtype *)1 : 0;
    }
  }

  mapsegs[0] = mapplane0;
  mapsegs[1] = mapplane1;
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

void real_wl_agent_control_movement_apply(
  int32_t *x_q16,
  int32_t *y_q16,
  int32_t *angle_deg,
  int32_t *angle_frac_io,
  int32_t control_x,
  int32_t control_y,
  int32_t strafe_pressed,
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t victory_flag
) {
  int normalized_angle;

  ensure_trig_tables();
  setup_agent_world(map_lo, map_hi);
  memset(&gamestate, 0, sizeof(gamestate));
  memset(buttonheld, 0, sizeof(buttonheld));
  memset(buttonstate, 0, sizeof(buttonstate));

  gamestate.victoryflag = victory_flag ? true : false;
  controlx = control_x;
  controly = control_y;
  buttonstate[bt_strafe] = strafe_pressed ? true : false;

  player = &objlist[1];
  player->x = *x_q16;
  player->y = *y_q16;
  player->tilex = (unsigned)(player->x >> TILESHIFT);
  player->tiley = (unsigned)(player->y >> TILESHIFT);
  normalized_angle = *angle_deg % ANGLES;
  if (normalized_angle < 0) {
    normalized_angle += ANGLES;
  }
  player->angle = normalized_angle;

  anglefrac = *angle_frac_io;
  ControlMovement(player);
  *angle_frac_io = anglefrac;
  *x_q16 = player->x;
  *y_q16 = player->y;
  *angle_deg = player->angle;
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

int32_t real_wl_agent_take_damage_apply(
  int32_t health,
  int32_t points,
  int32_t difficulty,
  int32_t god_mode_enabled,
  int32_t victory_flag
) {
  int32_t clamped_health = health;
  uint32_t out;

  if (clamped_health < 0) {
    clamped_health = 0;
  } else if (clamped_health > 100) {
    clamped_health = 100;
  }

  memset(&gamestate, 0, sizeof(gamestate));
  gamestate.health = clamped_health;
  gamestate.difficulty = difficulty;
  gamestate.victoryflag = victory_flag ? true : false;
  godmode = god_mode_enabled ? true : false;
  playstate = ex_stillplaying;

  player = &objlist[1];
  objlist[2].obclass = guardobj;
  TakeDamage(points, &objlist[2]);

  out = ((uint32_t)(gamestate.health & 0xffff));
  if (playstate == ex_died) {
    out |= (1u << 16);
  }
  return (int32_t)out;
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

void real_wl_state_move_obj_apply(
  int32_t obx,
  int32_t oby,
  int32_t dir,
  int32_t playerx,
  int32_t playery,
  int32_t area_connected,
  int32_t distance,
  int32_t move,
  int32_t obclass,
  int32_t tics_value,
  int32_t *out_x,
  int32_t *out_y,
  int32_t *out_distance,
  int32_t *out_take_damage_calls
) {
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
  if (out_x) {
    *out_x = objlist[1].x;
  }
  if (out_y) {
    *out_y = objlist[1].y;
  }
  if (out_distance) {
    *out_distance = objlist[1].distance;
  }
  if (out_take_damage_calls) {
    *out_take_damage_calls = g_take_damage_stub_calls;
  }
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
  int32_t out_x = 0;
  int32_t out_y = 0;
  int32_t out_distance = 0;
  int32_t out_take_damage_calls = 0;
  real_wl_state_move_obj_apply(
    obx,
    oby,
    dir,
    playerx,
    playery,
    area_connected,
    distance,
    move,
    obclass,
    tics_value,
    &out_x,
    &out_y,
    &out_distance,
    &out_take_damage_calls
  );
  h = fnv1a_u32(h, (uint32_t)out_x);
  h = fnv1a_u32(h, (uint32_t)out_y);
  h = fnv1a_u32(h, (uint32_t)out_distance);
  h = fnv1a_u32(h, (uint32_t)out_take_damage_calls);
  return h;
}

void real_wl_state_select_chase_dir_apply(
  int32_t ob_tilex,
  int32_t ob_tiley,
  int32_t dir,
  int32_t obclass,
  int32_t flags,
  int32_t player_tilex,
  int32_t player_tiley,
  int32_t *out_dir,
  int32_t *out_tilex,
  int32_t *out_tiley,
  int32_t *out_distance,
  int32_t *out_areanumber,
  int32_t *out_flags8
) {

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
  if (out_dir) {
    *out_dir = (int32_t)objlist[1].dir;
  }
  if (out_tilex) {
    *out_tilex = (int32_t)objlist[1].tilex;
  }
  if (out_tiley) {
    *out_tiley = (int32_t)objlist[1].tiley;
  }
  if (out_distance) {
    *out_distance = (int32_t)objlist[1].distance;
  }
  if (out_areanumber) {
    *out_areanumber = (int32_t)objlist[1].areanumber;
  }
  if (out_flags8) {
    *out_flags8 = (int32_t)((uint8_t)objlist[1].flags);
  }
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
  int32_t out_dir = 0;
  int32_t out_tilex = 0;
  int32_t out_tiley = 0;
  int32_t out_distance = 0;
  int32_t out_areanumber = 0;
  int32_t out_flags8 = 0;
  real_wl_state_select_chase_dir_apply(
    ob_tilex,
    ob_tiley,
    dir,
    obclass,
    flags,
    player_tilex,
    player_tiley,
    &out_dir,
    &out_tilex,
    &out_tiley,
    &out_distance,
    &out_areanumber,
    &out_flags8
  );
  h = fnv1a_u32(h, (uint32_t)out_dir);
  h = fnv1a_u32(h, (uint32_t)out_tilex);
  h = fnv1a_u32(h, (uint32_t)out_tiley);
  h = fnv1a_u32(h, (uint32_t)out_distance);
  h = fnv1a_u32(h, (uint32_t)out_areanumber);
  h = fnv1a_u32(h, (uint32_t)out_flags8);
  return h;
}

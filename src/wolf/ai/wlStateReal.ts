const MAP_SIZE = 64;
const TILE_SHIFT = 16;
const UNSIGNED_SHIFT = 8;
const MIN_SIGHT = 0x18000;
const MIN_ACTOR_DIST = 0x10000;

const DIR_EAST = 0;
const DIR_NORTHEAST = 1;
const DIR_NORTH = 2;
const DIR_NORTHWEST = 3;
const DIR_WEST = 4;
const DIR_SOUTHWEST = 5;
const DIR_SOUTH = 6;
const DIR_SOUTHEAST = 7;
const DIR_NODIR = 8;

const CLASS_GHOSTOBJ = 15;
const CLASS_SPECTREOBJ = 22;
const TILE_GLOBAL = 1 << 16;

const OPPOSITE_DIR = [DIR_WEST, DIR_SOUTHWEST, DIR_SOUTH, DIR_SOUTHEAST, DIR_EAST, DIR_NORTHEAST, DIR_NORTH, DIR_NORTHWEST, DIR_NODIR];

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function buildDoorMap(doorMask: number): Uint16Array {
  const tilemap = new Uint16Array(MAP_SIZE * MAP_SIZE);
  const mask = doorMask >>> 0;
  for (let i = 0; i < 8; i++) {
    if (((mask >>> i) & 1) === 1) {
      tilemap[(32 + i) * MAP_SIZE + 32] = 128 + i;
    }
  }
  return tilemap;
}

export function wlStateRealCheckLine(
  obx: number,
  oby: number,
  px: number,
  py: number,
  doorMask: number,
  doorPosQ8: number,
): number {
  const tilemap = buildDoorMap(doorMask);
  const doorPosition = new Int32Array(64);
  for (let i = 0; i < 8; i++) {
    if (((doorMask >>> i) & 1) === 1) {
      doorPosition[i] = doorPosQ8 | 0;
    }
  }

  const x1 = (obx | 0) >> UNSIGNED_SHIFT;
  const y1 = (oby | 0) >> UNSIGNED_SHIFT;
  const xt1 = x1 >> 8;
  const yt1 = y1 >> 8;

  const x2 = (px | 0) >> UNSIGNED_SHIFT;
  const y2 = (py | 0) >> UNSIGNED_SHIFT;
  let xt2 = (px | 0) >> TILE_SHIFT;
  let yt2 = (py | 0) >> TILE_SHIFT;

  const xdist = Math.abs(xt2 - xt1);
  if (xdist > 0) {
    let partial: number;
    let xstep: number;

    if (xt2 > xt1) {
      partial = 256 - (x1 & 0xff);
      xstep = 1;
    } else {
      partial = x1 & 0xff;
      xstep = -1;
    }

    const deltafrac = Math.abs(x2 - x1);
    const delta = y2 - y1;
    const ltemp = Math.trunc(((delta | 0) << 8) / deltafrac);
    const ystep = ltemp > 0x7fff ? 0x7fff : ltemp < -0x7fff ? -0x7fff : ltemp;
    let yfrac = y1 + (((ystep * partial) | 0) >> 8);

    let x = xt1 + xstep;
    xt2 += xstep;
    for (;;) {
      const y = yfrac >> 8;
      yfrac += ystep;
      const value = tilemap[x * MAP_SIZE + y] | 0;
      x += xstep;

      if (value !== 0) {
        if (value < 128 || value > 256) {
          return 0;
        }

        const door = value & ~0x80;
        const intercept = yfrac - Math.trunc(ystep / 2);
        if (intercept > (doorPosition[door] | 0)) {
          return 0;
        }
      }
      if (x === xt2) {
        break;
      }
    }
  }

  const ydist = Math.abs(yt2 - yt1);
  if (ydist > 0) {
    let partial: number;
    let ystep: number;

    if (yt2 > yt1) {
      partial = 256 - (y1 & 0xff);
      ystep = 1;
    } else {
      partial = y1 & 0xff;
      ystep = -1;
    }

    const deltafrac = Math.abs(y2 - y1);
    const delta = x2 - x1;
    const ltemp = Math.trunc(((delta | 0) << 8) / deltafrac);
    const xstep = ltemp > 0x7fff ? 0x7fff : ltemp < -0x7fff ? -0x7fff : ltemp;
    let xfrac = x1 + (((xstep * partial) | 0) >> 8);

    let y = yt1 + ystep;
    yt2 += ystep;
    for (;;) {
      const x = xfrac >> 8;
      xfrac += xstep;
      const value = tilemap[x * MAP_SIZE + y] | 0;
      y += ystep;

      if (value !== 0) {
        if (value < 128 || value > 256) {
          return 0;
        }

        const door = value & ~0x80;
        const intercept = xfrac - Math.trunc(xstep / 2);
        if (intercept > (doorPosition[door] | 0)) {
          return 0;
        }
      }
      if (y === yt2) {
        break;
      }
    }
  }

  return 1;
}

export function wlStateRealCheckSight(
  obx: number,
  oby: number,
  px: number,
  py: number,
  dir: number,
  areaConnected: number,
  doorMask: number,
  doorPosQ8: number,
): number {
  if ((areaConnected | 0) === 0) {
    return 0;
  }

  const deltax = (px - obx) | 0;
  const deltay = (py - oby) | 0;

  if (deltax > -MIN_SIGHT && deltax < MIN_SIGHT && deltay > -MIN_SIGHT && deltay < MIN_SIGHT) {
    return 1;
  }

  const facing = (dir | 0) & 7;
  if (facing === DIR_NORTH && deltay > 0) {
    return 0;
  }
  if (facing === DIR_EAST && deltax < 0) {
    return 0;
  }
  if (facing === DIR_SOUTH && deltay < 0) {
    return 0;
  }
  if (facing === DIR_WEST && deltax > 0) {
    return 0;
  }

  return wlStateRealCheckLine(obx, oby, px, py, doorMask, doorPosQ8) | 0;
}

export function wlStateRealMoveObjHash(
  obx: number,
  oby: number,
  dir: number,
  playerx: number,
  playery: number,
  areaConnected: number,
  distance: number,
  move: number,
  obclass: number,
  tics: number,
): number {
  let x = obx | 0;
  let y = oby | 0;
  let dist = distance | 0;
  const d = (((dir | 0) % 9) + 9) % 9;
  const step = move | 0;
  let takeDamageCalls = 0;

  switch (d) {
    case DIR_EAST:
      x = (x + step) | 0;
      break;
    case DIR_NORTHEAST:
      x = (x + step) | 0;
      y = (y - step) | 0;
      break;
    case DIR_NORTH:
      y = (y - step) | 0;
      break;
    case DIR_NORTHWEST:
      x = (x - step) | 0;
      y = (y - step) | 0;
      break;
    case DIR_WEST:
      x = (x - step) | 0;
      break;
    case DIR_SOUTHWEST:
      x = (x - step) | 0;
      y = (y + step) | 0;
      break;
    case DIR_SOUTH:
      y = (y + step) | 0;
      break;
    case DIR_SOUTHEAST:
      x = (x + step) | 0;
      y = (y + step) | 0;
      break;
    case DIR_NODIR:
      break;
    default:
      break;
  }

  if (d !== DIR_NODIR && (areaConnected | 0) !== 0) {
    const deltax = (x - (playerx | 0)) | 0;
    const deltay = (y - (playery | 0)) | 0;
    const overlapX = deltax >= -MIN_ACTOR_DIST && deltax <= MIN_ACTOR_DIST;
    const overlapY = deltay >= -MIN_ACTOR_DIST && deltay <= MIN_ACTOR_DIST;

    if (overlapX && overlapY) {
      if ((obclass | 0) === CLASS_GHOSTOBJ || (obclass | 0) === CLASS_SPECTREOBJ) {
        const _damagePoints = ((tics | 0) * 2) | 0;
        void _damagePoints;
        takeDamageCalls = 1;
      }

      switch (d) {
        case DIR_EAST:
          x = (x - step) | 0;
          break;
        case DIR_NORTHEAST:
          x = (x - step) | 0;
          y = (y + step) | 0;
          break;
        case DIR_NORTH:
          y = (y + step) | 0;
          break;
        case DIR_NORTHWEST:
          x = (x + step) | 0;
          y = (y + step) | 0;
          break;
        case DIR_WEST:
          x = (x + step) | 0;
          break;
        case DIR_SOUTHWEST:
          x = (x + step) | 0;
          y = (y - step) | 0;
          break;
        case DIR_SOUTH:
          y = (y - step) | 0;
          break;
        case DIR_SOUTHEAST:
          x = (x - step) | 0;
          y = (y - step) | 0;
          break;
      }
    } else {
      dist = (dist - step) | 0;
    }
  } else if (d !== DIR_NODIR) {
    dist = (dist - step) | 0;
  }

  let h = 2166136261 >>> 0;
  h = fnv1a(h, x);
  h = fnv1a(h, y);
  h = fnv1a(h, dist);
  h = fnv1a(h, takeDamageCalls);
  return h >>> 0;
}

export function wlStateRealSelectChaseDirHash(
  obTileX: number,
  obTileY: number,
  dir: number,
  obclass: number,
  flags: number,
  playerTileX: number,
  playerTileY: number,
): number {
  let tilex = obTileX | 0;
  let tiley = obTileY | 0;
  let curDir = (((dir | 0) % 9) + 9) % 9;
  let distance = 0;
  let areaNumber = 0;
  const cls = obclass | 0;
  // objtype.flags is a byte in WOLFSRC; mirror truncation for parity hashes.
  const flags8 = flags & 0xff;
  const playerX = playerTileX | 0;
  const playerY = playerTileY | 0;
  const olddir = curDir;
  const turnaround = OPPOSITE_DIR[olddir] ?? DIR_NODIR;

  const tryWalk = (nextDir: number): boolean => {
    switch (nextDir) {
      case DIR_NORTH:
        tiley = (tiley - 1) | 0;
        break;
      case DIR_NORTHEAST:
        tilex = (tilex + 1) | 0;
        tiley = (tiley - 1) | 0;
        break;
      case DIR_EAST:
        tilex = (tilex + 1) | 0;
        break;
      case DIR_SOUTHEAST:
        tilex = (tilex + 1) | 0;
        tiley = (tiley + 1) | 0;
        break;
      case DIR_SOUTH:
        tiley = (tiley + 1) | 0;
        break;
      case DIR_SOUTHWEST:
        tilex = (tilex - 1) | 0;
        tiley = (tiley + 1) | 0;
        break;
      case DIR_WEST:
        tilex = (tilex - 1) | 0;
        break;
      case DIR_NORTHWEST:
        tilex = (tilex - 1) | 0;
        tiley = (tiley - 1) | 0;
        break;
      case DIR_NODIR:
      default:
        return false;
    }

    void cls;
    distance = TILE_GLOBAL;
    areaNumber = 0;
    return true;
  };

  const deltax = (playerX - tilex) | 0;
  const deltay = (playerY - tiley) | 0;
  let d1 = DIR_NODIR;
  let d2 = DIR_NODIR;

  if (deltax > 0) d1 = DIR_EAST;
  else if (deltax < 0) d1 = DIR_WEST;
  if (deltay > 0) d2 = DIR_SOUTH;
  else if (deltay < 0) d2 = DIR_NORTH;

  if (Math.abs(deltay) > Math.abs(deltax)) {
    const t = d1;
    d1 = d2;
    d2 = t;
  }

  if (d1 === turnaround) d1 = DIR_NODIR;
  if (d2 === turnaround) d2 = DIR_NODIR;

  if (d1 !== DIR_NODIR) {
    curDir = d1;
    if (tryWalk(curDir)) {
      let h = 2166136261 >>> 0;
      h = fnv1a(h, curDir);
      h = fnv1a(h, tilex);
      h = fnv1a(h, tiley);
      h = fnv1a(h, distance);
      h = fnv1a(h, areaNumber);
      h = fnv1a(h, flags8);
      return h >>> 0;
    }
  }

  if (d2 !== DIR_NODIR) {
    curDir = d2;
    if (tryWalk(curDir)) {
      let h = 2166136261 >>> 0;
      h = fnv1a(h, curDir);
      h = fnv1a(h, tilex);
      h = fnv1a(h, tiley);
      h = fnv1a(h, distance);
      h = fnv1a(h, areaNumber);
      h = fnv1a(h, flags8);
      return h >>> 0;
    }
  }

  if (olddir !== DIR_NODIR) {
    curDir = olddir;
    if (tryWalk(curDir)) {
      let h = 2166136261 >>> 0;
      h = fnv1a(h, curDir);
      h = fnv1a(h, tilex);
      h = fnv1a(h, tiley);
      h = fnv1a(h, distance);
      h = fnv1a(h, areaNumber);
      h = fnv1a(h, flags8);
      return h >>> 0;
    }
  }

  for (let tdir = DIR_WEST; tdir >= DIR_NORTH; tdir--) {
    if (tdir !== turnaround) {
      curDir = tdir;
      if (tryWalk(curDir)) {
        let h = 2166136261 >>> 0;
        h = fnv1a(h, curDir);
        h = fnv1a(h, tilex);
        h = fnv1a(h, tiley);
        h = fnv1a(h, distance);
        h = fnv1a(h, areaNumber);
        h = fnv1a(h, flags8);
        return h >>> 0;
      }
    }
  }

  if (turnaround !== DIR_NODIR) {
    curDir = turnaround;
    if (curDir !== DIR_NODIR && tryWalk(curDir)) {
      let h = 2166136261 >>> 0;
      h = fnv1a(h, curDir);
      h = fnv1a(h, tilex);
      h = fnv1a(h, tiley);
      h = fnv1a(h, distance);
      h = fnv1a(h, areaNumber);
      h = fnv1a(h, flags8);
      return h >>> 0;
    }
  }

  curDir = DIR_NODIR;
  let h = 2166136261 >>> 0;
  h = fnv1a(h, curDir);
  h = fnv1a(h, tilex);
  h = fnv1a(h, tiley);
  h = fnv1a(h, distance);
  h = fnv1a(h, areaNumber);
  h = fnv1a(h, flags8);
  return h >>> 0;
}

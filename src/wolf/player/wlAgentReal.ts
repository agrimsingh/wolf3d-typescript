const TILE_SHIFT = 16;
const TILE_GLOBAL = 1 << TILE_SHIFT;
const PLAYERSIZE = 0x5800;
const MAP_WIDTH = 8;
const MAP_HEIGHT = 8;

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function wallAt(mapLo: number, mapHi: number, x: number, y: number): boolean {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
    return true;
  }
  const bit = y * MAP_WIDTH + x;
  if (bit < 32) {
    return ((mapLo >>> bit) & 1) === 1;
  }
  return ((mapHi >>> (bit - 32)) & 1) === 1;
}

export function wlAgentRealTryMove(x: number, y: number, mapLo: number, mapHi: number): number {
  const ix = x | 0;
  const iy = y | 0;

  const xl = ((ix - PLAYERSIZE) | 0) >> TILE_SHIFT;
  const yl = ((iy - PLAYERSIZE) | 0) >> TILE_SHIFT;
  const xh = ((ix + PLAYERSIZE) | 0) >> TILE_SHIFT;
  const yh = ((iy + PLAYERSIZE) | 0) >> TILE_SHIFT;

  for (let ty = yl; ty <= yh; ty++) {
    for (let tx = xl; tx <= xh; tx++) {
      if (wallAt(mapLo >>> 0, mapHi >>> 0, tx, ty)) {
        return 0;
      }
    }
  }

  return 1;
}

export function wlAgentRealClipMoveHash(
  x: number,
  y: number,
  xmove: number,
  ymove: number,
  mapLo: number,
  mapHi: number,
  noclip: number,
): number {
  const mapLoU = mapLo >>> 0;
  const mapHiU = mapHi >>> 0;
  const out = wlAgentRealClipMoveQ16(x, y, xmove, ymove, mapLoU, mapHiU, noclip);

  let h = 2166136261 >>> 0;
  h = fnv1a(h, out.x);
  h = fnv1a(h, out.y);
  h = fnv1a(h, noclip | 0);
  return h >>> 0;
}

export function wlAgentRealClipMoveQ16(
  x: number,
  y: number,
  xmove: number,
  ymove: number,
  mapLo: number,
  mapHi: number,
  noclip: number,
): { x: number; y: number } {
  const mapLoU = mapLo >>> 0;
  const mapHiU = mapHi >>> 0;

  const baseX = x | 0;
  const baseY = y | 0;

  const nx = (baseX + (xmove | 0)) | 0;
  const ny = (baseY + (ymove | 0)) | 0;

  let outX = baseX;
  let outY = baseY;

  if (wlAgentRealTryMove(nx, ny, mapLoU, mapHiU) !== 0) {
    outX = nx;
    outY = ny;
  } else if (
    (noclip | 0) !== 0 &&
    nx > (2 * TILE_GLOBAL) &&
    ny > (2 * TILE_GLOBAL) &&
    nx < ((MAP_WIDTH - 1) << TILE_SHIFT) &&
    ny < ((MAP_HEIGHT - 1) << TILE_SHIFT)
  ) {
    outX = nx;
    outY = ny;
  } else {
    const xOnly = (baseX + (xmove | 0)) | 0;
    if (wlAgentRealTryMove(xOnly, baseY, mapLoU, mapHiU) !== 0) {
      outX = xOnly;
      outY = baseY;
    } else {
      const yOnly = (baseY + (ymove | 0)) | 0;
      if (wlAgentRealTryMove(baseX, yOnly, mapLoU, mapHiU) !== 0) {
        outX = baseX;
        outY = yOnly;
      }
    }
  }

  return { x: outX | 0, y: outY | 0 };
}

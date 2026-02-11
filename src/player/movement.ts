function wallAt(mapLo: number, mapHi: number, x: number, y: number): boolean {
  if (x < 0 || x >= 8 || y < 0 || y >= 8) {
    return true;
  }
  const bit = y * 8 + x;
  if (bit < 32) {
    return ((mapLo >>> bit) & 1) === 1;
  }
  return ((mapHi >>> (bit - 32)) & 1) === 1;
}

export function playerMovePacked(
  mapLo: number,
  mapHi: number,
  xQ8: number,
  yQ8: number,
  dxQ8: number,
  dyQ8: number,
): number {
  const originalX = xQ8 | 0;
  const originalY = yQ8 | 0;
  const nx = (xQ8 + dxQ8) | 0;
  const ny = (yQ8 + dyQ8) | 0;

  if (wallAt(mapLo >>> 0, mapHi >>> 0, nx >> 8, ny >> 8)) {
    if (!wallAt(mapLo >>> 0, mapHi >>> 0, nx >> 8, originalY >> 8)) {
      xQ8 = nx;
    }
    if (!wallAt(mapLo >>> 0, mapHi >>> 0, originalX >> 8, ny >> 8)) {
      yQ8 = ny;
    }
  } else {
    xQ8 = nx;
    yQ8 = ny;
  }

  return ((((xQ8 & 0xffff) << 16) | (yQ8 & 0xffff)) | 0) as number;
}

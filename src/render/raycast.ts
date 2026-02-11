function isqrt(value: bigint): number {
  if (value <= 0n) return 0;
  let x = value;
  let y = (x + 1n) >> 1n;
  while (y < x) {
    x = y;
    y = (x + value / x) >> 1n;
  }
  return Number(x);
}

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

export function raycastDistanceQ16(
  mapLo: number,
  mapHi: number,
  startXQ16: number,
  startYQ16: number,
  dirXQ16: number,
  dirYQ16: number,
  maxSteps: number,
): number {
  let x = startXQ16 | 0;
  let y = startYQ16 | 0;

  const magSq = BigInt(dirXQ16 | 0) * BigInt(dirXQ16 | 0) + BigInt(dirYQ16 | 0) * BigInt(dirYQ16 | 0);
  const mag = isqrt(magSq);
  if (mag === 0) {
    return -1;
  }

  for (let step = 1; step <= (maxSteps | 0); step++) {
    x = (x + (dirXQ16 | 0)) | 0;
    y = (y + (dirYQ16 | 0)) | 0;

    const tx = x >> 16;
    const ty = y >> 16;

    if (wallAt(mapLo >>> 0, mapHi >>> 0, tx, ty)) {
      return (Math.imul(step, mag) | 0) as number;
    }
  }

  return -1;
}

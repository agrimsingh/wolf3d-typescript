const ACTORSIZE = 0x4000;
const TILEGLOBAL = 1 << 16;
const TILESHIFT = 16;
const MINDIST = 0x5800;
const SCREENSIZE = 80 * 208;
const PAGE1START = 0;
const PAGE3START = SCREENSIZE * 2;

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function fixedByFrac(a: number, b: number): number {
  const sign = ((a | 0) < 0 ? 1 : 0) ^ ((b | 0) < 0 ? 1 : 0);
  const ua = (a | 0) < 0 ? Number(-BigInt(a | 0)) : (a | 0);
  const frac = (b | 0) & 0xffff;
  const prod = (BigInt(ua >>> 0) * BigInt(frac >>> 0)) >> 16n;
  const out = Number(prod) | 0;
  return sign ? (-out | 0) : out;
}

function safeDiv(numer: bigint | number, denom: number): number {
  if ((denom | 0) === 0) {
    const n = typeof numer === 'bigint' ? numer : BigInt(numer | 0);
    return n >= 0n ? 0x7fffffff : -0x80000000;
  }
  if (typeof numer === 'bigint') {
    return Number(numer / BigInt(denom | 0)) | 0;
  }
  return ((numer as number) / (denom | 0)) | 0;
}

function calcHeightRaw(
  xintercept: number,
  yintercept: number,
  viewx: number,
  viewy: number,
  viewcos: number,
  viewsin: number,
  heightnumerator: number,
  mindist: number,
): number {
  const gx = (xintercept - viewx) | 0;
  const gxt = fixedByFrac(gx, viewcos);
  const gy = (yintercept - viewy) | 0;
  const gyt = fixedByFrac(gy, viewsin);
  let nx = (gxt - gyt) | 0;
  if (nx < (mindist | 0)) {
    nx = mindist | 0;
  }
  let denom = nx >> 8;
  if (denom === 0) {
    denom = nx >= 0 ? 1 : -1;
  }
  return safeDiv(heightnumerator | 0, denom);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value | 0)) | 0;
}

function clampS32(value: number): number {
  if (value > 0x7fffffff) return 0x7fffffff;
  if (value < -0x80000000) return -0x80000000;
  return value | 0;
}

function widthForSrc(scale: number, src: number): number {
  const scalerHeight = (scale | 0) * 2;
  if (scalerHeight <= 0) {
    return 0;
  }
  const step = (BigInt(scalerHeight) << 16n) / 64n;
  const startpix = Number((step * BigInt(src | 0)) >> 16n) | 0;
  const endpix = Number((step * BigInt((src | 0) + 1)) >> 16n) | 0;
  return Math.max(0, (endpix - startpix) | 0) | 0;
}

function wallHeightAt(x: number, seed: number): number {
  const v = (Math.imul(x | 0, 1103515245) + Math.imul(seed | 0, 12345) + 0x9e3779b9) >>> 0;
  return (v >>> 16) & 0x0fff;
}

export function wlDrawTransformActorHash(
  obx: number,
  oby: number,
  viewx: number,
  viewy: number,
  viewcos: number,
  viewsin: number,
  scale: number,
  centerx: number,
  heightnumerator: number,
  mindist: number,
): number {
  const gx = (obx - viewx) | 0;
  const gy = (oby - viewy) | 0;
  let gxt = fixedByFrac(gx, viewcos);
  let gyt = fixedByFrac(gy, viewsin);
  const nx = (gxt - gyt - ACTORSIZE) | 0;

  gxt = fixedByFrac(gx, viewsin);
  gyt = fixedByFrac(gy, viewcos);
  const ny = (gyt + gxt) | 0;

  let outViewx = 0;
  let outViewheight = 0;
  if (nx >= (mindist | 0)) {
    outViewx = (centerx + safeDiv(BigInt(ny) * BigInt(scale | 0), nx)) | 0;
    let denom = nx >> 8;
    if (denom === 0) {
      denom = nx >= 0 ? 1 : -1;
    }
    outViewheight = safeDiv(heightnumerator | 0, denom);
  }

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, nx);
  hash = fnv1a(hash, ny);
  hash = fnv1a(hash, outViewx);
  hash = fnv1a(hash, outViewheight);
  return hash >>> 0;
}

export function wlDrawTransformTileHash(
  tx: number,
  ty: number,
  viewx: number,
  viewy: number,
  viewcos: number,
  viewsin: number,
  scale: number,
  centerx: number,
  heightnumerator: number,
  mindist: number,
): number {
  const gx = Number((BigInt(tx | 0) << BigInt(TILESHIFT)) + 0x8000n - BigInt(viewx | 0)) | 0;
  const gy = Number((BigInt(ty | 0) << BigInt(TILESHIFT)) + 0x8000n - BigInt(viewy | 0)) | 0;

  let gxt = fixedByFrac(gx, viewcos);
  let gyt = fixedByFrac(gy, viewsin);
  const nx = (gxt - gyt - 0x2000) | 0;

  gxt = fixedByFrac(gx, viewsin);
  gyt = fixedByFrac(gy, viewcos);
  const ny = (gyt + gxt) | 0;

  let dispx = 0;
  let dispheight = 0;
  let shouldGrab = 0;
  if (nx >= (mindist | 0)) {
    dispx = (centerx + safeDiv(BigInt(ny) * BigInt(scale | 0), nx)) | 0;
    let denom = nx >> 8;
    if (denom === 0) {
      denom = nx >= 0 ? 1 : -1;
    }
    dispheight = safeDiv(heightnumerator | 0, denom);
    if (nx < TILEGLOBAL && ny > -(TILEGLOBAL / 2) && ny < TILEGLOBAL / 2) {
      shouldGrab = 1;
    }
  }

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, dispx);
  hash = fnv1a(hash, dispheight);
  hash = fnv1a(hash, shouldGrab);
  hash = fnv1a(hash, nx);
  hash = fnv1a(hash, ny);
  return hash >>> 0;
}

export function wlDrawCalcHeight(
  xintercept: number,
  yintercept: number,
  viewx: number,
  viewy: number,
  viewcos: number,
  viewsin: number,
  heightnumerator: number,
  mindist: number,
): number {
  return calcHeightRaw(xintercept, yintercept, viewx, viewy, viewcos, viewsin, heightnumerator, mindist);
}

export function wlDrawHitVertWallHash(
  xintercept: number,
  yintercept: number,
  xtilestep: number,
  pixx: number,
  xtile: number,
  ytile: number,
  lastside: number,
  lastintercept: number,
  lasttilehit: number,
  tilehit: number,
  postsourceLow: number,
  postwidth: number,
  prevheight: number,
  adjacentDoor: number,
  wallpicNormal: number,
  wallpicDoor: number,
  viewx: number,
  viewy: number,
  viewcos: number,
  viewsin: number,
  heightnumerator: number,
  mindist: number,
): number {
  let texture = (yintercept >> 4) & 0xfc0;
  let localXIntercept = xintercept | 0;
  if ((xtilestep | 0) === -1) {
    texture = (0xfc0 - texture) | 0;
    localXIntercept = (localXIntercept + TILEGLOBAL) | 0;
  }

  let height = calcHeightRaw(localXIntercept, yintercept, viewx, viewy, viewcos, viewsin, heightnumerator, mindist);
  let wallpic = wallpicNormal | 0;

  if ((lastside | 0) === 1 && (lastintercept | 0) === (xtile | 0) && (lasttilehit | 0) === (tilehit | 0)) {
    if ((texture | 0) === (postsourceLow | 0)) {
      postwidth = (postwidth + 1) | 0;
      height = prevheight | 0;
    } else {
      postsourceLow = texture | 0;
      postwidth = 1;
    }
  } else {
    lastside = 1;
    lastintercept = xtile | 0;
    lasttilehit = tilehit | 0;
    postwidth = 1;
    if ((tilehit & 0x40) !== 0) {
      wallpic = adjacentDoor ? wallpicDoor | 0 : wallpicNormal | 0;
    }
    postsourceLow = texture | 0;
  }

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, texture);
  hash = fnv1a(hash, height);
  hash = fnv1a(hash, postwidth);
  hash = fnv1a(hash, lastside);
  hash = fnv1a(hash, lastintercept);
  hash = fnv1a(hash, lasttilehit);
  hash = fnv1a(hash, postsourceLow);
  hash = fnv1a(hash, wallpic);
  hash = fnv1a(hash, pixx);
  hash = fnv1a(hash, xtile);
  hash = fnv1a(hash, ytile);
  return hash >>> 0;
}

export function wlDrawHitHorizWallHash(
  xintercept: number,
  yintercept: number,
  ytilestep: number,
  pixx: number,
  xtile: number,
  ytile: number,
  lastside: number,
  lastintercept: number,
  lasttilehit: number,
  tilehit: number,
  postsourceLow: number,
  postwidth: number,
  prevheight: number,
  adjacentDoor: number,
  wallpicNormal: number,
  wallpicDoor: number,
  viewx: number,
  viewy: number,
  viewcos: number,
  viewsin: number,
  heightnumerator: number,
  mindist: number,
): number {
  let texture = (xintercept >> 4) & 0xfc0;
  let localYIntercept = yintercept | 0;
  if ((ytilestep | 0) === -1) {
    localYIntercept = (localYIntercept + TILEGLOBAL) | 0;
  } else {
    texture = (0xfc0 - texture) | 0;
  }

  let height = calcHeightRaw(xintercept, localYIntercept, viewx, viewy, viewcos, viewsin, heightnumerator, mindist);
  let wallpic = wallpicNormal | 0;

  if ((lastside | 0) === 0 && (lastintercept | 0) === (ytile | 0) && (lasttilehit | 0) === (tilehit | 0)) {
    if ((texture | 0) === (postsourceLow | 0)) {
      postwidth = (postwidth + 1) | 0;
      height = prevheight | 0;
    } else {
      postsourceLow = texture | 0;
      postwidth = 1;
    }
  } else {
    lastside = 0;
    lastintercept = ytile | 0;
    lasttilehit = tilehit | 0;
    postwidth = 1;
    if ((tilehit & 0x40) !== 0) {
      wallpic = adjacentDoor ? wallpicDoor | 0 : wallpicNormal | 0;
    }
    postsourceLow = texture | 0;
  }

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, texture);
  hash = fnv1a(hash, height);
  hash = fnv1a(hash, postwidth);
  hash = fnv1a(hash, lastside);
  hash = fnv1a(hash, lastintercept);
  hash = fnv1a(hash, lasttilehit);
  hash = fnv1a(hash, postsourceLow);
  hash = fnv1a(hash, wallpic);
  hash = fnv1a(hash, pixx);
  hash = fnv1a(hash, xtile);
  hash = fnv1a(hash, ytile);
  return hash >>> 0;
}

export function wlDrawWallRefreshHash(
  playerAngle: number,
  playerX: number,
  playerY: number,
  focallength: number,
  viewsin: number,
  viewcos: number,
): number {
  const viewx = (playerX - fixedByFrac(focallength, viewcos)) | 0;
  const viewy = (playerY + fixedByFrac(focallength, viewsin)) | 0;
  const focaltx = viewx >> TILESHIFT;
  const focalty = viewy >> TILESHIFT;
  const viewtx = playerX >> TILESHIFT;
  const viewty = playerY >> TILESHIFT;
  const xpartialdown = viewx & (TILEGLOBAL - 1);
  const xpartialup = TILEGLOBAL - xpartialdown;
  const ypartialdown = viewy & (TILEGLOBAL - 1);
  const ypartialup = TILEGLOBAL - ypartialdown;

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, playerAngle);
  hash = fnv1a(hash, viewx);
  hash = fnv1a(hash, viewy);
  hash = fnv1a(hash, focaltx);
  hash = fnv1a(hash, focalty);
  hash = fnv1a(hash, viewtx);
  hash = fnv1a(hash, viewty);
  hash = fnv1a(hash, xpartialdown);
  hash = fnv1a(hash, xpartialup);
  hash = fnv1a(hash, ypartialdown);
  hash = fnv1a(hash, ypartialup);
  hash = fnv1a(hash, -1);
  return hash >>> 0;
}

export function wlDrawThreeDRefreshHash(
  bufferofs: number,
  screenofs: number,
  frameon: number,
  fizzlein: number,
  wallRefreshHash: number,
): number {
  const localBufferOfs = (bufferofs + screenofs) | 0;
  const localDisplayOfs = (localBufferOfs - screenofs) | 0;
  let localFizzlein = fizzlein ? 1 : 0;

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, 0x01);
  hash = fnv1a(hash, localBufferOfs);
  hash = fnv1a(hash, wallRefreshHash);
  hash = fnv1a(hash, 0x02);
  hash = fnv1a(hash, 0x03);

  if (localFizzlein) {
    hash = fnv1a(hash, 0x04);
    localFizzlein = 0;
  }

  const nextBufferWide = localDisplayOfs + SCREENSIZE;
  let nextBuffer = nextBufferWide | 0;
  if (nextBufferWide > PAGE3START) {
    nextBuffer = PAGE1START;
  }
  const nextFrame = (frameon + 1) | 0;

  hash = fnv1a(hash, localDisplayOfs);
  hash = fnv1a(hash, nextBuffer);
  hash = fnv1a(hash, nextFrame);
  hash = fnv1a(hash, localFizzlein);
  return hash >>> 0;
}

export function wlScaleSetupScalingHash(maxscaleheightIn: number, viewheight: number): number {
  const maxscaleheight = (maxscaleheightIn / 2) | 0;
  const maxscale = (maxscaleheight - 1) | 0;
  const maxscaleshl2 = (maxscale << 2) | 0;
  const stepbytwo = (viewheight / 2) | 0;

  let buildCount = 0;
  for (let i = 1; i <= maxscaleheight; i++) {
    buildCount++;
    if (i >= stepbytwo) {
      i += 2;
    }
  }

  let lockCount = 0;
  let duplicateCount = 0;
  for (let i = 1; i <= maxscaleheight; i++) {
    lockCount++;
    if (i >= stepbytwo) {
      duplicateCount += 2;
      i += 2;
    }
  }

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, maxscaleheight);
  hash = fnv1a(hash, maxscale);
  hash = fnv1a(hash, maxscaleshl2);
  hash = fnv1a(hash, stepbytwo);
  hash = fnv1a(hash, buildCount);
  hash = fnv1a(hash, lockCount);
  hash = fnv1a(hash, duplicateCount);
  return hash >>> 0;
}

export function wlScaleScaleShapeHash(
  xcenter: number,
  leftpixIn: number,
  rightpixIn: number,
  height: number,
  maxscale: number,
  viewwidth: number,
  wallheightSeed: number,
): number {
  const scale = (height >>> 3) | 0;
  if (scale <= 0 || scale > (maxscale | 0)) {
    return 0;
  }

  let leftpix = clamp(leftpixIn, 0, 63);
  let rightpix = clamp(rightpixIn, 0, 63);
  if (rightpix < leftpix) {
    const t = rightpix;
    rightpix = leftpix;
    leftpix = t;
  }

  let slinex = xcenter | 0;
  let srcx = 32;
  const stopx = leftpix;
  let drawn = 0;
  let clipped = 0;
  let hash = 2166136261 >>> 0;

  while (--srcx >= stopx && slinex > 0) {
    let slinwidth = widthForSrc(scale, srcx);
    if (!slinwidth) continue;

    if (slinwidth === 1) {
      slinex--;
      if (slinex < (viewwidth | 0) && wallHeightAt(slinex, wallheightSeed) < (height | 0)) {
        drawn++;
        hash = fnv1a(hash, slinex);
      }
      continue;
    }

    if (slinex > (viewwidth | 0)) {
      slinex -= slinwidth;
      slinwidth = (viewwidth - slinex) | 0;
      if (slinwidth < 1) continue;
    } else {
      if (slinwidth > slinex) slinwidth = slinex;
      slinex -= slinwidth;
    }

    const leftvis = wallHeightAt(slinex, wallheightSeed) < (height | 0);
    const rightvis = wallHeightAt((slinex + slinwidth - 1) | 0, wallheightSeed) < (height | 0);
    if (leftvis) {
      if (!rightvis) {
        while (slinwidth > 0 && wallHeightAt((slinex + slinwidth - 1) | 0, wallheightSeed) >= (height | 0)) {
          slinwidth--;
          clipped++;
        }
      }
      if (slinwidth > 0) drawn++;
    } else {
      if (!rightvis) continue;
      while (slinwidth > 0 && wallHeightAt(slinex, wallheightSeed) >= (height | 0)) {
        slinex++;
        slinwidth--;
        clipped++;
      }
      if (slinwidth > 0) drawn++;
      break;
    }
  }

  slinex = xcenter | 0;
  srcx = leftpix < 31 ? 31 : (leftpix - 1);
  let slinwidth = 0;
  while (++srcx <= rightpix && (slinex += slinwidth) < (viewwidth | 0)) {
    slinwidth = widthForSrc(scale, srcx);
    if (!slinwidth) continue;

    if (slinwidth === 1) {
      if (slinex >= 0 && wallHeightAt(slinex, wallheightSeed) < (height | 0)) {
        drawn++;
      }
      continue;
    }

    if (slinex < 0) {
      if (slinwidth <= -slinex) continue;
      slinwidth += slinex;
      slinex = 0;
    } else if (slinex + slinwidth > (viewwidth | 0)) {
      slinwidth = (viewwidth - slinex) | 0;
    }

    const leftvis = wallHeightAt(slinex, wallheightSeed) < (height | 0);
    const rightvis = wallHeightAt((slinex + slinwidth - 1) | 0, wallheightSeed) < (height | 0);
    if (leftvis) {
      if (!rightvis) {
        while (slinwidth > 0 && wallHeightAt((slinex + slinwidth - 1) | 0, wallheightSeed) >= (height | 0)) {
          slinwidth--;
          clipped++;
        }
      }
      if (slinwidth > 0) drawn++;
      if (!rightvis) break;
    } else {
      if (!rightvis) continue;
      while (slinwidth > 0 && wallHeightAt(slinex, wallheightSeed) >= (height | 0)) {
        slinex++;
        slinwidth--;
        clipped++;
      }
      if (slinwidth > 0) drawn++;
    }
  }

  hash = fnv1a(hash, drawn);
  hash = fnv1a(hash, clipped);
  hash = fnv1a(hash, scale);
  hash = fnv1a(hash, xcenter);
  hash = fnv1a(hash, leftpix);
  hash = fnv1a(hash, rightpix);
  return hash >>> 0;
}

export function wlScaleSimpleScaleShapeHash(
  xcenter: number,
  leftpixIn: number,
  rightpixIn: number,
  height: number,
): number {
  const scale = (height >>> 1) | 0;
  if (scale <= 0) {
    return 0;
  }

  let leftpix = clamp(leftpixIn, 0, 63);
  let rightpix = clamp(rightpixIn, 0, 63);
  if (rightpix < leftpix) {
    const t = rightpix;
    rightpix = leftpix;
    leftpix = t;
  }

  let srcx = 32;
  let slinex = xcenter | 0;
  let drawn = 0;
  while (--srcx >= leftpix) {
    const slinwidth = widthForSrc(scale, srcx);
    if (!slinwidth) continue;
    slinex -= slinwidth;
    drawn++;
  }

  srcx = leftpix < 31 ? 31 : (leftpix - 1);
  let slinwidth = 0;
  while (++srcx <= rightpix) {
    slinwidth = widthForSrc(scale, srcx);
    if (!slinwidth) continue;
    drawn++;
    slinex += slinwidth;
  }

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, drawn);
  hash = fnv1a(hash, scale);
  hash = fnv1a(hash, xcenter);
  hash = fnv1a(hash, leftpix);
  hash = fnv1a(hash, rightpix);
  return hash >>> 0;
}

export function idVhVwMeasurePropStringHash(textLen: number, fontWidth: number, spacing: number, maxWidth: number): number {
  const len = textLen < 0 ? 0 : (textLen | 0);
  const fw = fontWidth < 1 ? 1 : (fontWidth | 0);
  const sp = spacing < 0 ? 0 : (spacing | 0);
  let width = clampS32(len * (fw + sp));
  let clipped = 0;
  if ((maxWidth | 0) > 0 && width > (maxWidth | 0)) {
    width = maxWidth | 0;
    clipped = 1;
  }
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, len);
  hash = fnv1a(hash, fw);
  hash = fnv1a(hash, sp);
  hash = fnv1a(hash, width);
  hash = fnv1a(hash, clipped);
  return hash >>> 0;
}

export function idVhVwbDrawPicHash(x: number, y: number, picnum: number, bufferofs: number, screenofs: number): number {
  const drawOfs = ((bufferofs | 0) + (screenofs | 0)) | 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, picnum);
  hash = fnv1a(hash, drawOfs);
  return hash >>> 0;
}

export function idVhVwbBarHash(x: number, y: number, width: number, height: number, color: number): number {
  const w = width < 0 ? 0 : (width | 0);
  const h = height < 0 ? 0 : (height | 0);
  const pixels = Math.imul(w, h) >>> 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, w);
  hash = fnv1a(hash, h);
  hash = fnv1a(hash, color);
  hash = fnv1a(hash, pixels);
  return hash >>> 0;
}

export function idVlVlBarHash(x: number, y: number, width: number, height: number, color: number, linewidth: number): number {
  const w = width < 0 ? 0 : (width | 0);
  const h = height < 0 ? 0 : (height | 0);
  const lw = linewidth <= 0 ? 1 : (linewidth | 0);
  const span = Math.imul(w, lw) >>> 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, w);
  hash = fnv1a(hash, h);
  hash = fnv1a(hash, color);
  hash = fnv1a(hash, lw);
  hash = fnv1a(hash, span);
  return hash >>> 0;
}

export function idVlVlMemToScreenHash(srcLen: number, width: number, height: number, dest: number, mask: number): number {
  const len = srcLen < 0 ? 0 : (srcLen | 0);
  const w = width < 0 ? 0 : (width | 0);
  const h = height < 0 ? 0 : (height | 0);
  let copied = Math.imul(w, h) | 0;
  if (copied > len) {
    copied = len;
  }
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, len);
  hash = fnv1a(hash, w);
  hash = fnv1a(hash, h);
  hash = fnv1a(hash, dest);
  hash = fnv1a(hash, mask);
  hash = fnv1a(hash, copied);
  return hash >>> 0;
}

export function idVlVlLatchToScreenHash(source: number, width: number, height: number, x: number, y: number): number {
  const w = width < 0 ? 0 : (width | 0);
  const h = height < 0 ? 0 : (height | 0);
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, source);
  hash = fnv1a(hash, w);
  hash = fnv1a(hash, h);
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  return hash >>> 0;
}

export function idVlVlFadeInHash(start: number, end: number, steps: number, paletteSeed: number): number {
  const first = start < 0 ? 0 : (start | 0);
  const last = (end | 0) < first ? first : (end | 0);
  const count = ((last - first) + 1) | 0;
  const s = steps <= 0 ? 1 : (steps | 0);
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, first);
  hash = fnv1a(hash, last);
  hash = fnv1a(hash, s);
  hash = fnv1a(hash, paletteSeed);
  hash = fnv1a(hash, count);
  return hash >>> 0;
}

export function idVlVlFadeOutHash(start: number, end: number, steps: number, paletteSeed: number): number {
  const first = start < 0 ? 0 : (start | 0);
  const last = (end | 0) < first ? first : (end | 0);
  const s = steps <= 0 ? 1 : (steps | 0);
  const span = ((last - first) + 1) >>> 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, first);
  hash = fnv1a(hash, last);
  hash = fnv1a(hash, s);
  hash = fnv1a(hash, paletteSeed);
  hash = fnv1a(hash, (span ^ 0xa5a5) >>> 0);
  return hash >>> 0;
}

export function idVlVlPlotHash(x: number, y: number, color: number, linewidth: number): number {
  const lw = linewidth <= 0 ? 1 : (linewidth | 0);
  const pixel = ((Math.imul(x | 0, lw) & 0xffff) | (((y | 0) & 0xffff) << 16)) >>> 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, color);
  hash = fnv1a(hash, lw);
  hash = fnv1a(hash, pixel);
  return hash >>> 0;
}

export function idVlVlHlinHash(x: number, y: number, width: number, color: number, linewidth: number): number {
  const w = width < 0 ? 0 : (width | 0);
  const lw = linewidth <= 0 ? 1 : (linewidth | 0);
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, w);
  hash = fnv1a(hash, color);
  hash = fnv1a(hash, lw);
  hash = fnv1a(hash, Math.imul(w, lw));
  return hash >>> 0;
}

export function idVhVwbPlotHash(x: number, y: number, color: number, linewidth: number): number {
  const lw = linewidth <= 0 ? 1 : (linewidth | 0);
  const pixel = ((Math.imul(x | 0, lw) & 0xffff) | (((y | 0) & 0xffff) << 16)) >>> 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, color);
  hash = fnv1a(hash, lw);
  hash = fnv1a(hash, (pixel ^ 0x55aa55aa) >>> 0);
  return hash >>> 0;
}

export function idVhVwbHlinHash(x: number, y: number, width: number, color: number, linewidth: number): number {
  const w = width < 0 ? 0 : (width | 0);
  const lw = linewidth <= 0 ? 1 : (linewidth | 0);
  const span = Math.imul(w, lw) >>> 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, w);
  hash = fnv1a(hash, color);
  hash = fnv1a(hash, lw);
  hash = fnv1a(hash, (span ^ 0x1111) >>> 0);
  return hash >>> 0;
}

export function idVhVwbVlinHash(x: number, y: number, height: number, color: number, linewidth: number): number {
  const h = height < 0 ? 0 : (height | 0);
  const lw = linewidth <= 0 ? 1 : (linewidth | 0);
  const span = Math.imul(h, lw) >>> 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, h);
  hash = fnv1a(hash, color);
  hash = fnv1a(hash, lw);
  hash = fnv1a(hash, (span ^ 0x2222) >>> 0);
  return hash >>> 0;
}

export function idVhVwlMeasureStringHash(textLen: number, fontWidth: number, fontHeight: number, maxWidth: number): number {
  const len = textLen < 0 ? 0 : (textLen | 0);
  const fw = fontWidth < 1 ? 1 : (fontWidth | 0);
  const fh = fontHeight < 1 ? 1 : (fontHeight | 0);
  let clipped = 0;
  let width = clampS32(len * fw);
  if ((maxWidth | 0) > 0 && width > (maxWidth | 0)) {
    width = maxWidth | 0;
    clipped = 1;
  }
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, len);
  hash = fnv1a(hash, fw);
  hash = fnv1a(hash, fh);
  hash = fnv1a(hash, width);
  hash = fnv1a(hash, clipped);
  return hash >>> 0;
}

export function idVhVwbDrawPropStringHash(textLen: number, x: number, y: number, color: number, maxWidth: number): number {
  const len = textLen < 0 ? 0 : (textLen | 0);
  let drawn = len;
  if ((maxWidth | 0) > 0 && drawn > (maxWidth | 0)) {
    drawn = maxWidth | 0;
  }
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, len);
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, color);
  hash = fnv1a(hash, maxWidth);
  hash = fnv1a(hash, drawn);
  return hash >>> 0;
}

export function idVlVlVlinHash(x: number, y: number, height: number, color: number, linewidth: number): number {
  const h = height < 0 ? 0 : (height | 0);
  const lw = linewidth <= 0 ? 1 : (linewidth | 0);
  const span = Math.imul(h, lw) >>> 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, h);
  hash = fnv1a(hash, color);
  hash = fnv1a(hash, lw);
  hash = fnv1a(hash, span);
  return hash >>> 0;
}

export function idVlVlScreenToScreenHash(source: number, dest: number, width: number, height: number, linewidth: number): number {
  const w = width < 0 ? 0 : (width | 0);
  const h = height < 0 ? 0 : (height | 0);
  const lw = linewidth <= 0 ? 1 : (linewidth | 0);
  const copied = Math.imul(w, h) >>> 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, source);
  hash = fnv1a(hash, dest);
  hash = fnv1a(hash, w);
  hash = fnv1a(hash, h);
  hash = fnv1a(hash, lw);
  hash = fnv1a(hash, copied);
  return hash >>> 0;
}

export function idVlVlMaskedToScreenHash(source: number, width: number, height: number, x: number, y: number, mask: number): number {
  const w = width < 0 ? 0 : (width | 0);
  const h = height < 0 ? 0 : (height | 0);
  const copied = Math.imul(w, h) >>> 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, source);
  hash = fnv1a(hash, w);
  hash = fnv1a(hash, h);
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, mask);
  hash = fnv1a(hash, (copied ^ 0x5a5a) >>> 0);
  return hash >>> 0;
}

export function idVlVlMemToLatchHash(sourceLen: number, width: number, height: number, dest: number): number {
  const len = sourceLen < 0 ? 0 : (sourceLen | 0);
  const w = width < 0 ? 0 : (width | 0);
  const h = height < 0 ? 0 : (height | 0);
  let copied = Math.imul(w, h) | 0;
  if (copied > len) {
    copied = len;
  }
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, len);
  hash = fnv1a(hash, w);
  hash = fnv1a(hash, h);
  hash = fnv1a(hash, dest);
  hash = fnv1a(hash, copied);
  return hash >>> 0;
}

export function idVlVlClearVideoHash(color: number, linewidth: number, pages: number, bufferofs: number): number {
  const lw = linewidth <= 0 ? 1 : (linewidth | 0);
  const pg = pages <= 0 ? 1 : (pages | 0);
  const span = (Math.imul(Math.imul(lw, pg), Math.imul(320, 200))) >>> 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, color);
  hash = fnv1a(hash, lw);
  hash = fnv1a(hash, pg);
  hash = fnv1a(hash, bufferofs);
  hash = fnv1a(hash, span);
  return hash >>> 0;
}

export function idVhVwDrawPropStringHash(textLen: number, x: number, y: number, maxWidth: number, fontWidth: number): number {
  const len = textLen < 0 ? 0 : (textLen | 0);
  const fw = fontWidth < 1 ? 1 : (fontWidth | 0);
  let width = clampS32(len * fw);
  if ((maxWidth | 0) > 0 && width > (maxWidth | 0)) {
    width = maxWidth | 0;
  }
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, len);
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, maxWidth);
  hash = fnv1a(hash, fw);
  hash = fnv1a(hash, width);
  return hash >>> 0;
}

export function idVhVwDrawColorPropStringHash(textLen: number, x: number, y: number, color: number, maxWidth: number): number {
  const len = textLen < 0 ? 0 : (textLen | 0);
  let drawn = len;
  if ((maxWidth | 0) > 0 && drawn > (maxWidth | 0)) {
    drawn = maxWidth | 0;
  }
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, len);
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, color);
  hash = fnv1a(hash, maxWidth);
  hash = fnv1a(hash, drawn);
  return hash >>> 0;
}

export function idVhVwMeasureMPropStringHash(textLen: number, fontWidth: number, spacing: number, maxWidth: number): number {
  const len = textLen < 0 ? 0 : (textLen | 0);
  const fw = fontWidth < 1 ? 1 : (fontWidth | 0);
  const sp = spacing < 0 ? 0 : (spacing | 0);
  let width = clampS32(len * (fw + sp + 1));
  let clipped = 0;
  if ((maxWidth | 0) > 0 && width > (maxWidth | 0)) {
    width = maxWidth | 0;
    clipped = 1;
  }
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, len);
  hash = fnv1a(hash, fw);
  hash = fnv1a(hash, sp);
  hash = fnv1a(hash, width);
  hash = fnv1a(hash, clipped);
  return hash >>> 0;
}

export function idVhVwbDrawTile8Hash(x: number, y: number, tile: number, screenofs: number): number {
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, tile);
  hash = fnv1a(hash, screenofs);
  return hash >>> 0;
}

export function idVhVwbDrawTile8MHash(x: number, y: number, tile: number, screenofs: number, mask: number): number {
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, tile);
  hash = fnv1a(hash, screenofs);
  hash = fnv1a(hash, mask);
  return hash >>> 0;
}

export function idVlVlSetColorHash(index: number, color: number, paletteSeed: number): number {
  const idx = index & 0xff;
  const out = color & 0xff;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, idx);
  hash = fnv1a(hash, out);
  hash = fnv1a(hash, paletteSeed);
  return hash >>> 0;
}

export function idVlVlGetColorHash(index: number, paletteSeed: number): number {
  const idx = index & 0xff;
  const out = (Math.imul(idx, 37) + (paletteSeed | 0)) & 0xff;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, idx);
  hash = fnv1a(hash, paletteSeed);
  hash = fnv1a(hash, out);
  return hash >>> 0;
}

export function idVlVlSetPaletteHash(start: number, count: number, paletteSeed: number, flags: number): number {
  const s = start < 0 ? 0 : (start | 0);
  const c = count < 0 ? 0 : (count | 0);
  const span = Math.imul(c, 3) | 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, s);
  hash = fnv1a(hash, c);
  hash = fnv1a(hash, paletteSeed);
  hash = fnv1a(hash, flags);
  hash = fnv1a(hash, span);
  return hash >>> 0;
}

export function idVlVlGetPaletteHash(start: number, count: number, paletteSeed: number): number {
  const s = start < 0 ? 0 : (start | 0);
  const c = count < 0 ? 0 : (count | 0);
  const digest = (Math.imul(c, 17) + (paletteSeed | 0)) & 0xffff;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, s);
  hash = fnv1a(hash, c);
  hash = fnv1a(hash, paletteSeed);
  hash = fnv1a(hash, digest);
  return hash >>> 0;
}

export function idVlVlFillPaletteHash(red: number, green: number, blue: number, count: number): number {
  const r = red & 0xff;
  const g = green & 0xff;
  const b = blue & 0xff;
  const c = count < 0 ? 0 : (count | 0);
  const rgb = (r | (g << 8) | (b << 16)) >>> 0;
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, r);
  hash = fnv1a(hash, g);
  hash = fnv1a(hash, b);
  hash = fnv1a(hash, c);
  hash = fnv1a(hash, rgb);
  return hash >>> 0;
}

export const wlRaycastConstants = {
  actorsize: ACTORSIZE,
  tileglobal: TILEGLOBAL,
  tileshift: TILESHIFT,
  mindist: MINDIST,
};

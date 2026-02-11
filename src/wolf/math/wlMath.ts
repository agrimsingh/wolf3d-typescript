const PI = 3.141592657;
const FINEANGLES = 3600;
const TILEGLOBAL = 1 << 16;
const GLOBAL1 = 1 << 16;
const ANGLES = 360;
const ANGLEQUAD = ANGLES / 4;
const VIEWGLOBAL = 0x10000;
const MINDIST = 0x5800;
const MAXVIEWWIDTH = 320;

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

export function wlDrawFixedByFrac(a: number, b: number): number {
  const sign = ((a | 0) < 0 ? 1 : 0) ^ ((b | 0) < 0 ? 1 : 0);
  const ua = (a | 0) < 0 ? Number(-BigInt(a | 0)) : (a | 0);
  const frac = (b | 0) & 0xffff;
  const prod = (BigInt(ua >>> 0) * BigInt(frac >>> 0)) >> 16n;
  const out = Number(prod) | 0;
  return sign ? (-out | 0) : out;
}

export function wlMainBuildTablesHash(): number {
  const finetangent = new Int32Array(FINEANGLES / 4);
  const sintable = new Int32Array(ANGLES + ANGLES / 4);
  const radtoint = FINEANGLES / 2 / PI;

  for (let i = 0; i < FINEANGLES / 8; i++) {
    const tang = Math.tan((i + 0.5) / radtoint);
    finetangent[i] = Math.trunc(tang * TILEGLOBAL) | 0;
    finetangent[FINEANGLES / 4 - 1 - i] = Math.trunc((1 / tang) * TILEGLOBAL) | 0;
  }

  let angle = 0;
  const anglestep = PI / 2 / ANGLEQUAD;

  for (let i = 0; i <= ANGLEQUAD; i++) {
    const value = Math.trunc(GLOBAL1 * Math.sin(angle)) | 0;
    sintable[i] = value;
    sintable[i + ANGLES] = value;
    sintable[ANGLES / 2 - i] = value;
    sintable[ANGLES - i] = (value | 0x80000000) | 0;
    sintable[ANGLES / 2 + i] = (value | 0x80000000) | 0;
    angle += anglestep;
  }

  let hash = 2166136261 >>> 0;
  for (let i = 0; i < finetangent.length; i++) {
    hash = fnv1a(hash, finetangent[i] ?? 0);
  }
  for (let i = 0; i < sintable.length; i++) {
    hash = fnv1a(hash, sintable[i] ?? 0);
  }
  return hash >>> 0;
}

export function wlMainCalcProjectionHash(viewWidthIn: number, focalIn: number): number {
  let viewWidth = viewWidthIn | 0;
  const focal = focalIn | 0;

  if (viewWidth < 2) viewWidth = 2;
  if (viewWidth > MAXVIEWWIDTH) viewWidth = MAXVIEWWIDTH;
  if (viewWidth & 1) viewWidth -= 1;

  const finetangent = new Int32Array(FINEANGLES / 4);
  const pixelangle = new Int32Array(MAXVIEWWIDTH);
  const radtoint = FINEANGLES / 2 / PI;

  for (let i = 0; i < FINEANGLES / 8; i++) {
    const tang = Math.tan((i + 0.5) / radtoint);
    finetangent[i] = Math.trunc(tang * TILEGLOBAL) | 0;
    finetangent[FINEANGLES / 4 - 1 - i] = Math.trunc((1 / tang) * TILEGLOBAL) | 0;
  }

  const halfview = (viewWidth / 2) | 0;
  const facedist = focal + MINDIST;

  const scale = Math.trunc((halfview * facedist) / (VIEWGLOBAL / 2)) | 0;
  const heightnumerator = Number((BigInt(TILEGLOBAL) * BigInt(scale)) >> 6n) | 0;
  const minheightdiv = ((heightnumerator / 0x7fff) | 0) + 1;

  for (let i = 0; i < halfview; i++) {
    const tang = (((i * VIEWGLOBAL) / viewWidth) / facedist);
    const angle = Math.atan(tang);
    const intang = Math.trunc(angle * radtoint) | 0;
    pixelangle[halfview - 1 - i] = intang;
    pixelangle[halfview + i] = (-intang) | 0;
  }

  let maxslope = finetangent[pixelangle[0] ?? 0] ?? 0;
  maxslope >>= 8;

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, scale);
  hash = fnv1a(hash, heightnumerator);
  hash = fnv1a(hash, minheightdiv);
  hash = fnv1a(hash, maxslope);

  for (let i = 0; i < viewWidth; i++) {
    hash = fnv1a(hash, pixelangle[i] ?? 0);
  }

  return hash >>> 0;
}

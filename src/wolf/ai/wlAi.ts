interface AiCtx {
  ax: number;
  ay: number;
  px: number;
  py: number;
  dir: number;
  state: number;
  hp: number;
  speed: number;
  cooldown: number;
  flags: number;
  rng: number;
  mapLo: number;
  mapHi: number;
}

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function absI32(v: number): number {
  const n = v | 0;
  return n < 0 ? -n : n;
}

function clampI32(v: number, minv: number, maxv: number): number {
  return Math.max(minv, Math.min(maxv, v | 0)) | 0;
}

function wallAt(lo: number, hi: number, x: number, y: number): boolean {
  if (x < 0 || x >= 8 || y < 0 || y >= 8) {
    return true;
  }
  const bit = y * 8 + x;
  if (bit < 32) {
    return ((lo >>> bit) & 1) === 1;
  }
  return ((hi >>> (bit - 32)) & 1) === 1;
}

function hashCtx(ctx: AiCtx, extra: number): number {
  let h = 2166136261 >>> 0;
  h = fnv1a(h, ctx.ax);
  h = fnv1a(h, ctx.ay);
  h = fnv1a(h, ctx.px);
  h = fnv1a(h, ctx.py);
  h = fnv1a(h, ctx.dir);
  h = fnv1a(h, ctx.state);
  h = fnv1a(h, ctx.hp);
  h = fnv1a(h, ctx.speed);
  h = fnv1a(h, ctx.cooldown);
  h = fnv1a(h, ctx.flags);
  h = fnv1a(h, ctx.rng);
  h = fnv1a(h, ctx.mapLo);
  h = fnv1a(h, ctx.mapHi);
  h = fnv1a(h, extra);
  return h >>> 0;
}

function moveForward(ctx: AiCtx, speedMulQ8: number): void {
  const dir = ctx.dir & 3;
  let spd = Number((BigInt(ctx.speed | 0) * BigInt(speedMulQ8 | 0)) >> 8n) | 0;
  if (spd < 1) spd = 1;

  let dx = 0;
  let dy = 0;
  if (dir === 0) dx = spd;
  else if (dir === 1) dy = -spd;
  else if (dir === 2) dx = -spd;
  else dy = spd;

  const nx = (ctx.ax + dx) | 0;
  const ny = (ctx.ay + dy) | 0;
  const tx = nx >> 8;
  const ty = ny >> 8;

  if (!wallAt(ctx.mapLo >>> 0, ctx.mapHi >>> 0, tx, ty)) {
    ctx.ax = nx;
    ctx.ay = ny;
    return;
  }

  const txOnly = nx >> 8;
  const tyOnly = ctx.ay >> 8;
  const txY = ctx.ax >> 8;
  const tyY = ny >> 8;
  if (!wallAt(ctx.mapLo >>> 0, ctx.mapHi >>> 0, txOnly, tyOnly)) {
    ctx.ax = nx;
  }
  if (!wallAt(ctx.mapLo >>> 0, ctx.mapHi >>> 0, txY, tyY)) {
    ctx.ay = ny;
  }
}

function checkLineImpl(ctx: AiCtx): boolean {
  let x0 = ctx.ax >> 8;
  let y0 = ctx.ay >> 8;
  const x1 = ctx.px >> 8;
  const y1 = ctx.py >> 8;

  const dx = absI32(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -absI32(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    if (wallAt(ctx.mapLo >>> 0, ctx.mapHi >>> 0, x0, y0)) {
      return false;
    }
    if (x0 === x1 && y0 === y1) {
      return true;
    }
    const e2 = err * 2;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function checkSightImpl(ctx: AiCtx): boolean {
  const line = checkLineImpl(ctx);
  const dist = absI32((ctx.px - ctx.ax) | 0) + absI32((ctx.py - ctx.ay) | 0);
  return line && dist < (8 << 8);
}

function selectChaseDirImpl(ctx: AiCtx): void {
  const dx = (ctx.px - ctx.ax) | 0;
  const dy = (ctx.py - ctx.ay) | 0;
  let dir: number;

  if (absI32(dx) > absI32(dy)) {
    dir = dx >= 0 ? 0 : 2;
  } else {
    dir = dy >= 0 ? 3 : 1;
  }

  const testx = ((ctx.ax + ((dir === 0 ? 1 : 0) - (dir === 2 ? 1 : 0)) * (ctx.speed | 0)) >> 8) | 0;
  const testy = ((ctx.ay + ((dir === 3 ? 1 : 0) - (dir === 1 ? 1 : 0)) * (ctx.speed | 0)) >> 8) | 0;
  if (wallAt(ctx.mapLo >>> 0, ctx.mapHi >>> 0, testx, testy)) {
    dir = (dir + ((ctx.rng & 1) !== 0 ? 1 : 3)) & 3;
  }
  ctx.dir = dir | 0;
}

function selectDodgeDirImpl(ctx: AiCtx): void {
  const dx = (ctx.px - ctx.ax) | 0;
  const dy = (ctx.py - ctx.ay) | 0;
  let dir: number;
  if (absI32(dx) > absI32(dy)) {
    dir = dy >= 0 ? 3 : 1;
  } else {
    dir = dx >= 0 ? 0 : 2;
  }
  if ((ctx.rng & 1) !== 0) {
    dir = (dir + 1) & 3;
  }
  ctx.dir = dir | 0;
}

function firstSightingImpl(ctx: AiCtx): void {
  ctx.state = 2;
  ctx.speed = clampI32((ctx.speed * 2) | 0, 1, 0x4000);
  ctx.flags |= 0x2;
  ctx.cooldown = 0;
}

function makeCtx(
  ax: number,
  ay: number,
  px: number,
  py: number,
  dir: number,
  state: number,
  hp: number,
  speed: number,
  cooldown: number,
  flags: number,
  rng: number,
  mapLo: number,
  mapHi: number,
): AiCtx {
  return {
    ax: ax | 0,
    ay: ay | 0,
    px: px | 0,
    py: py | 0,
    dir: dir | 0,
    state: state | 0,
    hp: hp | 0,
    speed: speed | 0,
    cooldown: cooldown | 0,
    flags: flags | 0,
    rng: rng | 0,
    mapLo: mapLo >>> 0,
    mapHi: mapHi >>> 0,
  };
}

export function wlStateSelectDodgeDirHash(
  ax: number, ay: number, px: number, py: number, dir: number, state: number, hp: number, speed: number, cooldown: number, flags: number, rng: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, mapLo, mapHi);
  selectDodgeDirImpl(ctx);
  return hashCtx(ctx, 0x10);
}

export function wlStateSelectChaseDirHash(
  ax: number, ay: number, px: number, py: number, dir: number, state: number, hp: number, speed: number, cooldown: number, flags: number, rng: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, mapLo, mapHi);
  selectChaseDirImpl(ctx);
  return hashCtx(ctx, 0x11);
}

export function wlStateMoveObjHash(
  ax: number, ay: number, px: number, py: number, dir: number, state: number, hp: number, speed: number, cooldown: number, flags: number, rng: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, mapLo, mapHi);
  moveForward(ctx, 0x100);
  return hashCtx(ctx, 0x12);
}

export function wlStateDamageActorHash(
  ax: number, ay: number, px: number, py: number, dir: number, state: number, hp: number, speed: number, cooldown: number, flags: number, rng: number, damage: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, mapLo, mapHi);
  ctx.hp = (ctx.hp - (damage | 0)) | 0;
  if (ctx.hp <= 0) {
    ctx.hp = 0;
    ctx.state = 4;
    ctx.flags |= 1;
  } else {
    ctx.state = 3;
    ctx.cooldown = ((ctx.rng & 7) + 2) | 0;
  }
  return hashCtx(ctx, 0x13);
}

export function wlStateCheckLine(
  ax: number, ay: number, px: number, py: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, 0, 0, 0, 0, 0, 0, 0, mapLo, mapHi);
  return checkLineImpl(ctx) ? 1 : 0;
}

export function wlStateCheckSight(
  ax: number, ay: number, px: number, py: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, 0, 0, 0, 0, 0, 0, 0, mapLo, mapHi);
  return checkSightImpl(ctx) ? 1 : 0;
}

export function wlStateFirstSightingHash(
  ax: number, ay: number, px: number, py: number, dir: number, state: number, hp: number, speed: number, cooldown: number, flags: number, rng: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, mapLo, mapHi);
  firstSightingImpl(ctx);
  return hashCtx(ctx, 0x14);
}

export function wlStateSightPlayerHash(
  ax: number, ay: number, px: number, py: number, dir: number, state: number, hp: number, speed: number, cooldown: number, flags: number, rng: number, canSeeHint: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, mapLo, mapHi);
  const saw = canSeeHint ? 1 : (checkSightImpl(ctx) ? 1 : 0);
  if (saw) {
    firstSightingImpl(ctx);
  }
  return hashCtx(ctx, saw ? 0x15 : 0x16);
}

export function wlAct2TChaseHash(
  ax: number, ay: number, px: number, py: number, dir: number, state: number, hp: number, speed: number, cooldown: number, flags: number, rng: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, mapLo, mapHi);
  if (checkSightImpl(ctx)) {
    selectChaseDirImpl(ctx);
  } else {
    selectDodgeDirImpl(ctx);
  }
  moveForward(ctx, 0x100);
  ctx.cooldown = clampI32((ctx.cooldown - 1) | 0, 0, 255);
  return hashCtx(ctx, 0x20);
}

export function wlAct2TPathHash(
  ax: number, ay: number, px: number, py: number, dir: number, state: number, hp: number, speed: number, cooldown: number, flags: number, rng: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, mapLo, mapHi);
  if ((ctx.rng & 3) === 0) {
    ctx.dir = (ctx.dir + ((ctx.rng & 4) !== 0 ? 1 : 3)) & 3;
  }
  moveForward(ctx, 0x100);
  return hashCtx(ctx, 0x21);
}

export function wlAct2TShootHash(
  ax: number, ay: number, px: number, py: number, dir: number, state: number, hp: number, speed: number, cooldown: number, flags: number, rng: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, mapLo, mapHi);
  let fired = 0;
  if (checkSightImpl(ctx) && ctx.cooldown <= 0) {
    fired = 1;
    ctx.cooldown = (8 + (ctx.rng & 7)) | 0;
    ctx.flags |= 0x10;
  } else {
    ctx.cooldown = clampI32((ctx.cooldown - 1) | 0, 0, 255);
    ctx.flags &= ~0x10;
  }
  return hashCtx(ctx, fired ? 0x22 : 0x23);
}

export function wlAct2TBiteHash(
  ax: number, ay: number, px: number, py: number, dir: number, state: number, hp: number, speed: number, cooldown: number, flags: number, rng: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, mapLo, mapHi);
  const dist = absI32((ctx.px - ctx.ax) | 0) + absI32((ctx.py - ctx.ay) | 0);
  if (dist < (1 << 8)) {
    ctx.flags |= 0x20;
  } else {
    ctx.flags &= ~0x20;
  }
  return hashCtx(ctx, 0x24);
}

export function wlAct2TDogChaseHash(
  ax: number, ay: number, px: number, py: number, dir: number, state: number, hp: number, speed: number, cooldown: number, flags: number, rng: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, mapLo, mapHi);
  selectChaseDirImpl(ctx);
  moveForward(ctx, 0x180);
  const dist = absI32((ctx.px - ctx.ax) | 0) + absI32((ctx.py - ctx.ay) | 0);
  if (dist < (1 << 8)) {
    ctx.flags |= 0x20;
  }
  return hashCtx(ctx, 0x25);
}

export function wlAct2TProjectileHash(
  ax: number, ay: number, px: number, py: number, dir: number, state: number, hp: number, speed: number, cooldown: number, flags: number, rng: number, mapLo: number, mapHi: number,
): number {
  const ctx = makeCtx(ax, ay, px, py, dir, state, hp, speed, cooldown, flags, rng, mapLo, mapHi);
  moveForward(ctx, 0x200);
  const hitWall = wallAt(ctx.mapLo >>> 0, ctx.mapHi >>> 0, ctx.ax >> 8, ctx.ay >> 8);
  if (hitWall) {
    ctx.flags |= 0x40;
  } else {
    const dist = absI32((ctx.px - ctx.ax) | 0) + absI32((ctx.py - ctx.ay) | 0);
    if (dist < (1 << 7)) {
      ctx.flags |= 0x80;
    }
  }
  return hashCtx(ctx, 0x26);
}

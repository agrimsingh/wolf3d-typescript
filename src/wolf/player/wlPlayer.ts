function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
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

function clipMove(lo: number, hi: number, xq8: number, yq8: number, dxq8: number, dyq8: number): { x: number; y: number } {
  const ox = xq8 | 0;
  const oy = yq8 | 0;
  const nx = (ox + (dxq8 | 0)) | 0;
  const ny = (oy + (dyq8 | 0)) | 0;

  let x = ox;
  let y = oy;
  if (wallAt(lo >>> 0, hi >>> 0, nx >> 8, ny >> 8)) {
    if (!wallAt(lo >>> 0, hi >>> 0, nx >> 8, oy >> 8)) {
      x = nx;
    }
    if (!wallAt(lo >>> 0, hi >>> 0, ox >> 8, ny >> 8)) {
      y = ny;
    }
  } else {
    x = nx;
    y = ny;
  }
  return { x: x | 0, y: y | 0 };
}

function hashXY(x: number, y: number, extra: number): number {
  let h = 2166136261 >>> 0;
  h = fnv1a(h, x);
  h = fnv1a(h, y);
  h = fnv1a(h, extra);
  return h >>> 0;
}

export function idInReadControlHash(keyMask: number, mouseDx: number, mouseDy: number, buttonMask: number): number {
  let xmove = 0;
  let ymove = 0;
  if (keyMask & (1 << 0)) xmove -= 127;
  if (keyMask & (1 << 1)) xmove += 127;
  if (keyMask & (1 << 2)) ymove -= 127;
  if (keyMask & (1 << 3)) ymove += 127;
  xmove = clampI32((xmove + mouseDx) | 0, -127, 127);
  ymove = clampI32((ymove + mouseDy) | 0, -127, 127);

  let buttons = 0;
  if ((keyMask & (1 << 4)) || (buttonMask & 1)) buttons |= 1;
  if ((keyMask & (1 << 5)) || (buttonMask & 2)) buttons |= 2;
  if ((keyMask & (1 << 6)) || (buttonMask & 4)) buttons |= 4;

  let h = 2166136261 >>> 0;
  h = fnv1a(h, xmove);
  h = fnv1a(h, ymove);
  h = fnv1a(h, buttons);
  return h >>> 0;
}

export function idInUserInput(delayTics: number, inputMask: number, rng: number): number {
  const delay = delayTics <= 0 ? 1 : (delayTics | 0);
  const v = ((rng ^ Math.imul(inputMask | 0, 1103515245)) & 0x7fffffff) | 0;
  return (v % delay) === 0 ? 1 : 0;
}

export function wlAgentTryMoveHash(mapLo: number, mapHi: number, xq8: number, yq8: number, dxq8: number, dyq8: number): number {
  const nx = (xq8 + dxq8) | 0;
  const ny = (yq8 + dyq8) | 0;
  const blocked = wallAt(mapLo >>> 0, mapHi >>> 0, nx >> 8, ny >> 8) ? 1 : 0;
  let h = 2166136261 >>> 0;
  h = fnv1a(h, nx);
  h = fnv1a(h, ny);
  h = fnv1a(h, blocked);
  return h >>> 0;
}

export function wlAgentClipMoveHash(mapLo: number, mapHi: number, xq8: number, yq8: number, dxq8: number, dyq8: number): number {
  const out = clipMove(mapLo, mapHi, xq8, yq8, dxq8, dyq8);
  return hashXY(out.x, out.y, 0x10);
}

export function wlAgentThrustHash(mapLo: number, mapHi: number, xq8: number, yq8: number, angleDeg: number, speedQ8: number): number {
  const rad = ((angleDeg % 360) * Math.PI) / 180;
  const dx = (Math.cos(rad) * speedQ8) | 0;
  const dy = (Math.sin(rad) * speedQ8) | 0;
  const out = clipMove(mapLo, mapHi, xq8, yq8, dx, dy);
  let h = hashXY(out.x, out.y, 0x11);
  h = fnv1a(h, dx);
  h = fnv1a(h, dy);
  return h >>> 0;
}

export function wlAgentControlMovementHash(
  mapLo: number,
  mapHi: number,
  xq8: number,
  yq8: number,
  angleDeg: number,
  forwardQ8: number,
  strafeQ8: number,
  turnDeg: number,
): number {
  let angle = (angleDeg + turnDeg) % 360;
  if (angle < 0) angle += 360;
  const rad = (angle * Math.PI) / 180;
  const sr = ((angle + 90) * Math.PI) / 180;
  const dx = (Math.cos(rad) * forwardQ8 + Math.cos(sr) * strafeQ8) | 0;
  const dy = (Math.sin(rad) * forwardQ8 + Math.sin(sr) * strafeQ8) | 0;
  const out = clipMove(mapLo, mapHi, xq8, yq8, dx, dy);

  let h = hashXY(out.x, out.y, 0x12);
  h = fnv1a(h, angle);
  h = fnv1a(h, dx);
  h = fnv1a(h, dy);
  return h >>> 0;
}

export function wlAgentCmdFireHash(ammo: number, weaponState: number, cooldown: number, buttonFire: number): number {
  let a = ammo | 0;
  let ws = weaponState | 0;
  let cd = cooldown | 0;
  if (buttonFire && cd <= 0 && a > 0) {
    a--;
    cd = 8;
    ws = 1;
  } else {
    cd = clampI32(cd - 1, 0, 255);
    ws = 0;
  }
  let h = 2166136261 >>> 0;
  h = fnv1a(h, a);
  h = fnv1a(h, ws);
  h = fnv1a(h, cd);
  return h >>> 0;
}

export function wlAgentCmdUseHash(mapLo: number, mapHi: number, xq8: number, yq8: number, angleDeg: number, usePressed: number): number {
  let tx = xq8 >> 8;
  let ty = yq8 >> 8;
  const dir = ((angleDeg % 360) + 360) % 360;
  if (dir < 45 || dir >= 315) tx += 1;
  else if (dir < 135) ty += 1;
  else if (dir < 225) tx -= 1;
  else ty -= 1;

  const success = usePressed && wallAt(mapLo >>> 0, mapHi >>> 0, tx, ty) ? 1 : 0;
  let h = 2166136261 >>> 0;
  h = fnv1a(h, tx);
  h = fnv1a(h, ty);
  h = fnv1a(h, success);
  return h >>> 0;
}

export function wlAgentTPlayerHash(
  mapLo: number,
  mapHi: number,
  xq8: number,
  yq8: number,
  angleDeg: number,
  health: number,
  ammo: number,
  cooldown: number,
  flags: number,
  inputMask: number,
  rng: number,
): number {
  let forward = 0;
  let strafe = 0;
  let turn = 0;
  if (inputMask & (1 << 0)) forward += 32;
  if (inputMask & (1 << 1)) forward -= 32;
  if (inputMask & (1 << 2)) turn -= 8;
  if (inputMask & (1 << 3)) turn += 8;
  if (inputMask & (1 << 4)) strafe -= 24;
  if (inputMask & (1 << 5)) strafe += 24;

  let angle = (angleDeg + turn) % 360;
  if (angle < 0) angle += 360;
  const rad = (angle * Math.PI) / 180;
  const sr = ((angle + 90) * Math.PI) / 180;
  const dx = (Math.cos(rad) * forward + Math.cos(sr) * strafe) | 0;
  const dy = (Math.sin(rad) * forward + Math.sin(sr) * strafe) | 0;
  const moved = clipMove(mapLo, mapHi, xq8, yq8, dx, dy);

  let a = ammo | 0;
  let cd = cooldown | 0;
  let f = flags | 0;
  if ((inputMask & (1 << 6)) !== 0 && cd <= 0 && a > 0) {
    a--;
    cd = 8;
    f |= 0x10;
  } else {
    cd = clampI32(cd - 1, 0, 255);
    f &= ~0x10;
  }

  if ((inputMask & (1 << 7)) !== 0) {
    let tx = moved.x >> 8;
    let ty = moved.y >> 8;
    const facing = ((angle % 360) + 360) % 360;
    if (facing < 45 || facing >= 315) tx += 1;
    else if (facing < 135) ty += 1;
    else if (facing < 225) tx -= 1;
    else ty -= 1;
    if (wallAt(mapLo >>> 0, mapHi >>> 0, tx, ty)) {
      f |= 0x20;
    }
  } else {
    f &= ~0x20;
  }

  let hp = health | 0;
  if (((rng | 0) & 0x1f) === 0 && hp > 0) {
    hp--;
  }

  let h = 2166136261 >>> 0;
  h = fnv1a(h, moved.x);
  h = fnv1a(h, moved.y);
  h = fnv1a(h, angle);
  h = fnv1a(h, hp);
  h = fnv1a(h, a);
  h = fnv1a(h, cd);
  h = fnv1a(h, f);
  return h >>> 0;
}

export function wlPlayPlayLoopHash(stateHash: number, tics: number, inputMask: number, rng: number): number {
  const loops = clampI32(tics, 0, 256);
  let h = stateHash >>> 0;
  for (let i = 0; i < loops; i++) {
    h = fnv1a(h, (inputMask + i) | 0);
    h = fnv1a(h, (rng ^ Math.imul(i, 1103515245)) | 0);
  }
  h = fnv1a(h, loops);
  return h >>> 0;
}

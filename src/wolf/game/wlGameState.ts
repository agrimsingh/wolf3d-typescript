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

export function wlAct1SpawnDoorHash(doorMask: number, doorState: number, tile: number, lock: number, vertical: number): number {
  const bit = 1 << (tile & 31);
  const mask = (doorMask | bit) >>> 0;
  const state = (((doorState & ~bit) | ((lock & 1) << (tile & 31))) >>> 0) >>> 0;
  let h = 2166136261 >>> 0;
  h = fnv1a(h, mask);
  h = fnv1a(h, state);
  h = fnv1a(h, vertical & 1);
  return h >>> 0;
}

export function wlAct1OpenDoorHash(doorMask: number, doorState: number, doorNum: number, speed: number, blocked: number): number {
  const bit = (1 << (doorNum & 31)) >>> 0;
  let state = doorState >>> 0;
  if (!blocked) {
    state = (((state + ((speed & 255) + 1)) & 0xff) | bit) >>> 0;
  }
  let h = 2166136261 >>> 0;
  h = fnv1a(h, (doorMask | bit) >>> 0);
  h = fnv1a(h, state);
  h = fnv1a(h, blocked ? 1 : 0);
  return h >>> 0;
}

export function wlAct1CloseDoorHash(doorMask: number, doorState: number, doorNum: number, speed: number, blocked: number): number {
  const bit = (1 << (doorNum & 31)) >>> 0;
  let state = doorState >>> 0;
  if (!blocked) {
    let next = ((state & 0xff) - ((speed & 255) + 1)) | 0;
    if (next < 0) next = 0;
    state = (((state & ~0xff) | next) & ~bit) >>> 0;
  }
  let h = 2166136261 >>> 0;
  h = fnv1a(h, (doorMask & ~bit) >>> 0);
  h = fnv1a(h, state);
  h = fnv1a(h, blocked ? 1 : 0);
  return h >>> 0;
}

export function wlAct1OperateDoorHash(
  doorMask: number,
  doorState: number,
  doorNum: number,
  action: number,
  speed: number,
  blocked: number,
): number {
  return (action & 1)
    ? wlAct1OpenDoorHash(doorMask, doorState, doorNum, speed, blocked)
    : wlAct1CloseDoorHash(doorMask, doorState, doorNum, speed, blocked);
}

export function wlAct1MoveDoorsHash(doorMask: number, doorState: number, tics: number, speed: number, activeMask: number): number {
  const loops = clampI32(tics, 0, 128);
  let mask = doorMask >>> 0;
  let state = doorState >>> 0;
  for (let i = 0; i < loops; i++) {
    const active = (activeMask >>> (i & 31)) & 1;
    if (active) {
      state = (state + ((speed & 15) + 1)) & 0xff;
      mask = (mask ^ (1 << (i & 31))) >>> 0;
    }
  }
  let h = 2166136261 >>> 0;
  h = fnv1a(h, mask);
  h = fnv1a(h, state);
  h = fnv1a(h, loops);
  return h >>> 0;
}

export function wlAct1PushWallHash(mapLo: number, mapHi: number, pushX: number, pushY: number, dir: number, steps: number): number {
  let x = pushX | 0;
  let y = pushY | 0;
  const maxSteps = clampI32(steps, 0, 8);
  for (let i = 0; i < maxSteps; i++) {
    let nx = x;
    let ny = y;
    switch (dir & 3) {
      case 0:
        nx += 1;
        break;
      case 1:
        ny -= 1;
        break;
      case 2:
        nx -= 1;
        break;
      default:
        ny += 1;
        break;
    }
    if (wallAt(mapLo >>> 0, mapHi >>> 0, nx, ny)) {
      break;
    }
    x = nx;
    y = ny;
  }
  let h = 2166136261 >>> 0;
  h = fnv1a(h, x);
  h = fnv1a(h, y);
  h = fnv1a(h, dir & 3);
  return h >>> 0;
}

export function wlAgentGetBonusHash(
  score: number,
  lives: number,
  health: number,
  ammo: number,
  keys: number,
  bonusKind: number,
  value: number,
): number {
  let s = score | 0;
  let l = lives | 0;
  let hp = health | 0;
  let a = ammo | 0;
  let k = keys | 0;

  switch (bonusKind & 7) {
    case 0:
      s = (s + value) | 0;
      break;
    case 1:
      hp = (hp + value) | 0;
      break;
    case 2:
      a = (a + value) | 0;
      break;
    case 3:
      k |= 1 << (value & 3);
      break;
    case 4:
      l = (l + 1) | 0;
      break;
    default:
      s = (s + (value >> 1)) | 0;
      break;
  }

  hp = clampI32(hp, 0, 100);
  a = clampI32(a, 0, 99);
  l = clampI32(l, 0, 9);

  let h = 2166136261 >>> 0;
  h = fnv1a(h, s);
  h = fnv1a(h, l);
  h = fnv1a(h, hp);
  h = fnv1a(h, a);
  h = fnv1a(h, k);
  return h >>> 0;
}

export function wlAgentGiveAmmoHash(ammo: number, maxAmmo: number, amount: number, weaponOwned: number): number {
  let a = (ammo + amount) | 0;
  if (weaponOwned) {
    a = (a + 1) | 0;
  }
  a = clampI32(a, 0, maxAmmo < 0 ? 0 : (maxAmmo | 0));

  let h = 2166136261 >>> 0;
  h = fnv1a(h, a);
  h = fnv1a(h, maxAmmo);
  h = fnv1a(h, weaponOwned ? 1 : 0);
  return h >>> 0;
}

export function wlAgentGivePointsHash(score: number, lives: number, nextExtra: number, points: number): number {
  let s = (score + points) | 0;
  let l = lives | 0;
  let threshold = nextExtra <= 0 ? 20000 : (nextExtra | 0);
  while (s >= threshold && l < 9) {
    l++;
    threshold += 20000;
  }

  let h = 2166136261 >>> 0;
  h = fnv1a(h, s);
  h = fnv1a(h, l);
  h = fnv1a(h, threshold);
  return h >>> 0;
}

export function wlAgentHealSelfHash(health: number, maxHealth: number, amount: number): number {
  const hp = clampI32((health + amount) | 0, 0, maxHealth < 0 ? 0 : (maxHealth | 0));
  let h = 2166136261 >>> 0;
  h = fnv1a(h, hp);
  h = fnv1a(h, maxHealth);
  return h >>> 0;
}

export function wlAgentTakeDamageHash(health: number, lives: number, damage: number, godMode: number, rng: number): number {
  let hp = health | 0;
  let l = lives | 0;
  if (!godMode) {
    let mitigated = (damage - (rng & 3)) | 0;
    if (mitigated < 0) mitigated = 0;
    hp = (hp - mitigated) | 0;
    if (hp <= 0) {
      if (l > 0) {
        l = (l - 1) | 0;
        hp = 100;
      } else {
        hp = 0;
      }
    }
  }

  let h = 2166136261 >>> 0;
  h = fnv1a(h, hp);
  h = fnv1a(h, l);
  h = fnv1a(h, godMode ? 1 : 0);
  return h >>> 0;
}

export function wlGameGameLoopHash(
  stateHash: number,
  tics: number,
  inputMask: number,
  rng: number,
  doorHash: number,
  playerHash: number,
  actorHash: number,
): number {
  const loops = clampI32(tics, 0, 256);
  let h = stateHash >>> 0;
  for (let i = 0; i < loops; i++) {
    h = fnv1a(h, (inputMask + i) | 0);
    h = fnv1a(h, (rng ^ Math.imul(i, 1103515245)) | 0);
    h = fnv1a(h, doorHash);
    h = fnv1a(h, playerHash);
    h = fnv1a(h, actorHash);
  }
  h = fnv1a(h, loops);
  return h >>> 0;
}

export function wlInterCheckHighScoreHash(newScore: number, s0: number, s1: number, s2: number, s3: number, s4: number): number {
  const board = [s0 | 0, s1 | 0, s2 | 0, s3 | 0, s4 | 0];
  let pos = 5;
  for (let i = 0; i < 5; i++) {
    if ((newScore | 0) > board[i]!) {
      pos = i;
      break;
    }
  }
  if (pos < 5) {
    for (let j = 4; j > pos; j--) {
      board[j] = board[j - 1]!;
    }
    board[pos] = newScore | 0;
  }

  let h = 2166136261 >>> 0;
  for (let i = 0; i < 5; i++) {
    h = fnv1a(h, board[i]!);
  }
  h = fnv1a(h, pos);
  return h >>> 0;
}

export function wlInterLevelCompletedHash(
  score: number,
  timeSec: number,
  parSec: number,
  killsFound: number,
  killsTotal: number,
  secretsFound: number,
  secretsTotal: number,
  treasureFound: number,
  treasureTotal: number,
  lives: number,
): number {
  const killRatio = killsTotal <= 0 ? 0 : (((killsFound | 0) * 100) / (killsTotal | 0)) | 0;
  const secretRatio = secretsTotal <= 0 ? 0 : (((secretsFound | 0) * 100) / (secretsTotal | 0)) | 0;
  const treasureRatio = treasureTotal <= 0 ? 0 : (((treasureFound | 0) * 100) / (treasureTotal | 0)) | 0;
  const timeBonus = parSec > 0 && timeSec < parSec ? ((parSec - timeSec) * 500) | 0 : 0;
  const ratioBonus = ((killRatio + secretRatio + treasureRatio) * 10) | 0;
  const total = (score + timeBonus + ratioBonus + (lives * 1000)) | 0;

  let h = 2166136261 >>> 0;
  h = fnv1a(h, total);
  h = fnv1a(h, killRatio);
  h = fnv1a(h, secretRatio);
  h = fnv1a(h, treasureRatio);
  return h >>> 0;
}

export function wlInterVictoryHash(
  totalScore: number,
  totalTime: number,
  totalKills: number,
  totalSecrets: number,
  totalTreasures: number,
  episode: number,
  difficulty: number,
): number {
  const skillBonus = ((difficulty + 1) * 10000) | 0;
  const completion = clampI32((totalKills + totalSecrets + totalTreasures) | 0, 0, 300);
  const finalScore = (totalScore + skillBonus + completion * 100 - totalTime * 2) | 0;

  let h = 2166136261 >>> 0;
  h = fnv1a(h, finalScore);
  h = fnv1a(h, episode);
  h = fnv1a(h, difficulty);
  return h >>> 0;
}

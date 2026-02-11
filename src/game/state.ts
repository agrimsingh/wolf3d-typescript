function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

export function gameEventHash(
  score: number,
  lives: number,
  health: number,
  ammo: number,
  eventKind: number,
  value: number,
): number {
  switch (eventKind | 0) {
    case 0:
      score += value;
      break;
    case 1:
      health += value;
      break;
    case 2:
      health -= value;
      break;
    case 3:
      ammo += value;
      break;
    case 4:
      lives += value;
      break;
    default:
      break;
  }

  health = Math.max(0, Math.min(100, health | 0));
  ammo = Math.max(0, Math.min(99, ammo | 0));
  lives = Math.max(0, Math.min(9, lives | 0));
  score = Math.max(0, score | 0);

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, score);
  hash = fnv1a(hash, lives);
  hash = fnv1a(hash, health);
  hash = fnv1a(hash, ammo);
  return hash | 0;
}

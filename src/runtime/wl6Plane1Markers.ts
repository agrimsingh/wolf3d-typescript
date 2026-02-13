export const WL6_PLAYER_START_MIN = 19;
export const WL6_PLAYER_START_MAX = 22;
export const WL6_PROP_MIN = 23;
export const WL6_PROP_MAX = 70;
export const WL6_PUSHWALL_MARKER = 98;
export const WL6_DEAD_GUARD_MARKER = 124;

const BLOCKING_PROPS = new Set<number>([
  24, 25, 26, 28, 30, 31, 33, 34, 35, 36, 39, 40, 41, 45, 58, 59, 60, 62, 63, 68, 69,
]);

export type Wl6EnemySpawnTier = 0 | 1 | 2;
export type Wl6EnemySpawnInfo = {
  tier: Wl6EnemySpawnTier;
  patrol: boolean;
  dir: 0 | 1 | 2 | 3;
};

export type Wl6PickupEffect =
  | { kind: 'key'; keyMask: number }
  | { kind: 'health'; amount: number }
  | { kind: 'ammo'; amount: number }
  | { kind: 'weapon'; ammoAmount: number }
  | { kind: 'treasure' }
  | { kind: 'lifeup' };

function normalizeMarker(marker: number): number {
  return marker & 0xffff;
}

export function isWl6PlayerStartMarker(marker: number): boolean {
  const m = normalizeMarker(marker);
  return m >= WL6_PLAYER_START_MIN && m <= WL6_PLAYER_START_MAX;
}

export function isWl6PushwallMarker(marker: number): boolean {
  return normalizeMarker(marker) === WL6_PUSHWALL_MARKER;
}

export function isWl6DeadGuardMarker(marker: number): boolean {
  return normalizeMarker(marker) === WL6_DEAD_GUARD_MARKER;
}

export function isWl6PropMarker(marker: number): boolean {
  const m = normalizeMarker(marker);
  return m >= WL6_PROP_MIN && m <= WL6_PROP_MAX;
}

export function isWl6BlockingPropMarker(marker: number): boolean {
  return BLOCKING_PROPS.has(normalizeMarker(marker));
}

export function wl6EnemySpawnDifficultyTier(marker: number): Wl6EnemySpawnTier | null {
  const info = wl6EnemySpawnInfo(marker);
  return info ? info.tier : null;
}

export function wl6EnemySpawnInfo(marker: number): Wl6EnemySpawnInfo | null {
  const m = normalizeMarker(marker);
  const directional = (base: number, tier: Wl6EnemySpawnTier): Wl6EnemySpawnInfo => ({
    tier,
    patrol: (base | 0) >= 4,
    dir: (base & 0x3) as 0 | 1 | 2 | 3,
  });

  if (m >= 108 && m <= 115) return directional(m - 108, 0);
  if (m >= 144 && m <= 151) return directional(m - 144, 1);
  if (m >= 180 && m <= 187) return directional(m - 180, 2);

  if (m >= 116 && m <= 123) return directional(m - 116, 0);
  if (m >= 152 && m <= 159) return directional(m - 152, 1);
  if (m >= 188 && m <= 195) return directional(m - 188, 2);

  if (m >= 126 && m <= 133) return directional(m - 126, 0);
  if (m >= 162 && m <= 169) return directional(m - 162, 1);
  if (m >= 198 && m <= 205) return directional(m - 198, 2);

  if (m >= 134 && m <= 141) return directional(m - 134, 0);
  if (m >= 170 && m <= 177) return directional(m - 170, 1);
  if (m >= 206 && m <= 213) return directional(m - 206, 2);

  if (m >= 216 && m <= 223) return directional(m - 216, 0);
  if (m >= 234 && m <= 241) return directional(m - 234, 1);
  if (m >= 252 && m <= 259) return directional(m - 252, 2);

  if (m === 160 || m === 178 || m === 179 || m === 196 || m === 197 || m === 214 || m === 215) {
    return { tier: 0, patrol: false, dir: 0 };
  }

  if (m >= 224 && m <= 227) {
    return { tier: 0, patrol: true, dir: ((m - 224) & 0x3) as 0 | 1 | 2 | 3 };
  }
  return null;
}

export function isWl6EnemyMarker(marker: number): boolean {
  return wl6EnemySpawnDifficultyTier(marker) !== null;
}

export function wl6ThingSpriteId(marker: number): number | null {
  const m = normalizeMarker(marker);
  if (m >= 23 && m <= 70) {
    // ScanInfoPlane/SpawnStatic canonical mapping used by reference implementations.
    return (m - 21) | 0;
  }
  if (m === 124) {
    // Dead guard static sprite.
    return 95;
  }
  return null;
}

export function wl6PickupEffect(marker: number): Wl6PickupEffect | null {
  const m = normalizeMarker(marker);
  switch (m) {
    case 43:
      return { kind: 'key', keyMask: 1 << 0 };
    case 44:
      return { kind: 'key', keyMask: 1 << 1 };
    case 29:
      return { kind: 'health', amount: 4 };
    case 47:
      return { kind: 'health', amount: 10 };
    case 48:
      return { kind: 'health', amount: 25 };
    case 58:
      return { kind: 'health', amount: 1 };
    case 49:
      return { kind: 'ammo', amount: 8 };
    case 50:
      return { kind: 'weapon', ammoAmount: 6 };
    case 51:
      return { kind: 'weapon', ammoAmount: 6 };
    case 52:
    case 53:
    case 54:
    case 55:
      return { kind: 'treasure' };
    case 56:
      return { kind: 'lifeup' };
    default:
      return null;
  }
}

export function angleFromWl6PlayerStartMarker(marker: number): number {
  const dir = normalizeMarker(marker) - WL6_PLAYER_START_MIN;
  if (dir < 0 || dir > 3) {
    return 0;
  }
  let angle = (1 - dir) * 90;
  if (angle < 0) {
    angle += 360;
  }
  return angle | 0;
}

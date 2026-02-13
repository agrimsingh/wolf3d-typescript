import { describe, expect, it } from 'vitest';
import {
  angleFromWl6PlayerStartMarker,
  isWl6BlockingPropMarker,
  isWl6DeadGuardMarker,
  isWl6PlayerStartMarker,
  isWl6PushwallMarker,
  wl6EnemySpawnDifficultyTier,
  wl6PickupEffect,
} from '../../src/runtime/wl6Plane1Markers';

describe('runtime WL6 plane1 marker classification', () => {
  it('classifies player starts with canonical orientation mapping', () => {
    expect(isWl6PlayerStartMarker(19)).toBe(true);
    expect(isWl6PlayerStartMarker(22)).toBe(true);
    expect(isWl6PlayerStartMarker(18)).toBe(false);
    expect(angleFromWl6PlayerStartMarker(19)).toBe(90);
    expect(angleFromWl6PlayerStartMarker(20)).toBe(0);
    expect(angleFromWl6PlayerStartMarker(21)).toBe(270);
    expect(angleFromWl6PlayerStartMarker(22)).toBe(180);
  });

  it('classifies dead-guard and pushwall markers distinctly', () => {
    expect(isWl6DeadGuardMarker(124)).toBe(true);
    expect(isWl6DeadGuardMarker(108)).toBe(false);
    expect(isWl6PushwallMarker(98)).toBe(true);
    expect(isWl6PushwallMarker(97)).toBe(false);
  });

  it('maps enemy markers to canonical difficulty tiers', () => {
    expect(wl6EnemySpawnDifficultyTier(108)).toBe(0);
    expect(wl6EnemySpawnDifficultyTier(144)).toBe(1);
    expect(wl6EnemySpawnDifficultyTier(180)).toBe(2);
    expect(wl6EnemySpawnDifficultyTier(124)).toBeNull();
  });

  it('maps canonical pickups and blocking props', () => {
    expect(wl6PickupEffect(43)).toEqual({ kind: 'key', keyMask: 1 << 0 });
    expect(wl6PickupEffect(44)).toEqual({ kind: 'key', keyMask: 1 << 1 });
    expect(wl6PickupEffect(48)).toEqual({ kind: 'health', amount: 25 });
    expect(wl6PickupEffect(49)).toEqual({ kind: 'ammo', amount: 8 });
    expect(wl6PickupEffect(52)).toEqual({ kind: 'treasure' });
    expect(wl6PickupEffect(0)).toBeNull();
    expect(isWl6BlockingPropMarker(24)).toBe(true);
    expect(isWl6BlockingPropMarker(47)).toBe(false);
  });
});

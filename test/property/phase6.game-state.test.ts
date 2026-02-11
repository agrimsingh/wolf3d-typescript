import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { gameEventHash } from '../../src/game/state';
import { propertyNumRuns } from '../helpers/property';

describe('phase 6 game state parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('game event hash matches oracle', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.integer({ min: 0, max: 9 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 0, max: 4 }),
        fc.integer({ min: 0, max: 500 }),
        (score, lives, health, ammo, eventKind, value) => {
          expect(gameEventHash(score, lives, health, ammo, eventKind, value) | 0).toBe(
            oracle.gameEventHash(score, lives, health, ammo, eventKind, value) | 0,
          );
        },
      ),
      { numRuns: propertyNumRuns() },
    );
  });
});

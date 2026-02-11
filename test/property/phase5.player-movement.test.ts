import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { playerMovePacked } from '../../src/player/movement';
import { propertyNumRuns } from '../helpers/property';

describe('phase 5 player movement parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('player move packed matches oracle', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0xffffffff }),
        fc.integer({ min: 0, max: 0xffffffff }),
        fc.integer({ min: 0, max: 7 << 8 }),
        fc.integer({ min: 0, max: 7 << 8 }),
        fc.integer({ min: -64, max: 64 }),
        fc.integer({ min: -64, max: 64 }),
        (mapLo, mapHi, x, y, dx, dy) => {
          expect(playerMovePacked(mapLo, mapHi, x, y, dx, dy) | 0).toBe(oracle.playerMovePacked(mapLo, mapHi, x, y, dx, dy) | 0);
        },
      ),
      { numRuns: propertyNumRuns() },
    );
  });
});

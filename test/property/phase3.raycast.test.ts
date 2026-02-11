import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { raycastDistanceQ16 } from '../../src/render/raycast';
import { propertyNumRuns } from '../helpers/property';

describe('phase 3 raycasting parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('raycast distance matches oracle', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0xffffffff }),
        fc.integer({ min: 0, max: 0xffffffff }),
        fc.integer({ min: 0, max: (7 << 16) }),
        fc.integer({ min: 0, max: (7 << 16) }),
        fc.integer({ min: -32768, max: 32768 }),
        fc.integer({ min: -32768, max: 32768 }),
        fc.integer({ min: 1, max: 2048 }),
        (mapLo, mapHi, sx, sy, dx, dy, maxSteps) => {
          expect(raycastDistanceQ16(mapLo, mapHi, sx, sy, dx, dy, maxSteps) | 0).toBe(
            oracle.raycastDistanceQ16(mapLo, mapHi, sx, sy, dx, dy, maxSteps) | 0,
          );
        },
      ),
      { numRuns: propertyNumRuns() },
    );
  });
});

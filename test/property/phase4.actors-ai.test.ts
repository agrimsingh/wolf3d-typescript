import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { actorStepPacked } from '../../src/actors/ai';
import { propertyNumRuns } from '../helpers/property';

describe('phase 4 actors ai parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('actor step matches oracle', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 8 << 8 }),
        fc.boolean(),
        fc.integer({ min: 0, max: 0xff }),
        (state, dist, canSee, rng) => {
          expect(actorStepPacked(state, dist, canSee, rng) | 0).toBe(oracle.actorStepPacked(state, dist, canSee, rng) | 0);
        },
      ),
      { numRuns: propertyNumRuns() },
    );
  });
});

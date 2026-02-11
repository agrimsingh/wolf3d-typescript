import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { fixedByFrac, fixedMul } from '../../src/math/fixed';
import { propertyNumRuns } from '../helpers/property';

describe('phase 1 math/fixed parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('fixedMul matches oracle', () => {
    fc.assert(
      fc.property(fc.integer({ min: -0x7fffffff, max: 0x7fffffff }), fc.integer({ min: -0x7fffffff, max: 0x7fffffff }), (a, b) => {
        expect(fixedMul(a, b) | 0).toBe(oracle.fixedMul(a, b) | 0);
      }),
      { numRuns: propertyNumRuns() },
    );
  });

  it('fixedByFrac matches oracle', () => {
    fc.assert(
      fc.property(fc.integer({ min: -0x7fffffff, max: 0x7fffffff }), fc.integer({ min: -0x7fffffff, max: 0x7fffffff }), (a, b) => {
        expect(fixedByFrac(a, b) | 0).toBe(oracle.fixedByFrac(a, b) | 0);
      }),
      { numRuns: propertyNumRuns() },
    );
  });
});

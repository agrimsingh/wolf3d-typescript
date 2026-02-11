import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { measureTextPacked, menuReducePacked } from '../../src/ui/menu';
import { propertyNumRuns } from '../helpers/property';

describe('phase 7 menu text parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('menu reduce matches oracle', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 1, max: 16 }),
        (screen, cursor, action, itemCount) => {
          expect(menuReducePacked(screen, cursor, action, itemCount) | 0).toBe(
            oracle.menuReducePacked(screen, cursor, action, itemCount) | 0,
          );
        },
      ),
      { numRuns: propertyNumRuns() },
    );
  });

  it('measure text matches oracle', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 400 }), fc.integer({ min: 1, max: 120 }), (textLen, maxWidthChars) => {
        expect(measureTextPacked(textLen, maxWidthChars) | 0).toBe(oracle.measureTextPacked(textLen, maxWidthChars) | 0);
      }),
      { numRuns: propertyNumRuns() },
    );
  });
});

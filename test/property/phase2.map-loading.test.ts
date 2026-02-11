import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { rlewExpandChecksum } from '../../src/map/rlew';
import { propertyNumRuns } from '../helpers/property';

describe('phase 2 map loading parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('rlew checksum matches oracle', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 0xffff }), { minLength: 1, maxLength: 128 }),
        fc.integer({ min: 0, max: 0xffff }),
        fc.integer({ min: 1, max: 256 }),
        (values, tag, outLen) => {
          const src = new Uint16Array(values);
          expect(rlewExpandChecksum(src, tag, outLen) >>> 0).toBe(oracle.rlewExpandChecksum(src, tag, outLen) >>> 0);
        },
      ),
      { numRuns: propertyNumRuns() },
    );
  });
});

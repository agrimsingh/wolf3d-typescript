import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { getNumRuns, getSeed } from './config';
import { wlDrawFixedByFrac, wlMainBuildTablesHash, wlMainCalcProjectionHash } from '../../src/wolf/math/wlMath';
import { withReplay } from './replay';

describe('phase 1 real WOLFSRC math parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('WL_DRAW.FixedByFrac matches oracle', () => {
    withReplay('phase1.wl_draw.FixedByFrac', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          (a, b) => {
            expect(wlDrawFixedByFrac(a, b) | 0).toBe(oracle.wlDrawFixedByFrac(a, b) | 0);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_DRAW.FixedByFrac deterministic vectors match oracle', () => {
    const vectors = [
      { a: 0, b: 0 },
      { a: 1, b: 1 },
      { a: -1, b: 1 },
      { a: 0x7fffffff, b: 0x7fff },
      { a: -0x7fffffff, b: 0x8000 },
      { a: 0x40000000, b: -0x7fff0000 },
      { a: -0x40000000, b: 0x7fff0000 },
    ];

    for (const { a, b } of vectors) {
      expect(wlDrawFixedByFrac(a, b) | 0).toBe(oracle.wlDrawFixedByFrac(a, b) | 0);
    }
  });

  it('WL_MAIN.BuildTables hash matches oracle', () => {
    expect(wlMainBuildTablesHash() >>> 0).toBe(oracle.wlMainBuildTablesHash() >>> 0);
  });

  it('WL_MAIN.CalcProjection hash matches oracle', () => {
    withReplay('phase1.wl_main.CalcProjection', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 320 }).filter((w) => w % 2 === 0),
          fc.integer({ min: 0x1000, max: 0x7fff }),
          (viewWidth, focal) => {
            expect(wlMainCalcProjectionHash(viewWidth, focal) >>> 0).toBe(oracle.wlMainCalcProjectionHash(viewWidth, focal) >>> 0);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_MAIN.CalcProjection deterministic vectors match oracle', () => {
    const vectors = [
      { viewWidth: 64, focal: 0x1200 },
      { viewWidth: 160, focal: 0x2000 },
      { viewWidth: 320, focal: 0x3000 },
      { viewWidth: 318, focal: 0x7fff },
    ];

    for (const { viewWidth, focal } of vectors) {
      expect(wlMainCalcProjectionHash(viewWidth, focal) >>> 0).toBe(oracle.wlMainCalcProjectionHash(viewWidth, focal) >>> 0);
    }
  });
});

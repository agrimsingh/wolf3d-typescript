import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { WolfsrcOraclePort } from '../../src/oracle/runtimeOracle';
import { getNumRuns, getSeed } from './config';

function makeMapBits(seed: number): { lo: number; hi: number } {
  let lo = 0;
  let hi = 0;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const border = x === 0 || y === 0 || x === 7 || y === 7;
      const randomWall = ((seed >>> ((x + y) & 31)) & 1) === 1 && x > 1 && y > 1 && x < 6 && y < 6;
      if (!(border || randomWall)) continue;
      const bit = y * 8 + x;
      if (bit < 32) lo |= 1 << bit;
      else hi |= 1 << (bit - 32);
    }
  }
  return { lo: lo >>> 0, hi: hi >>> 0 };
}

describe('runtime oracle determinism', () => {
  let oracle: WolfsrcOraclePort;

  beforeAll(async () => {
    oracle = new WolfsrcOraclePort();
  });

  afterAll(async () => {
    await oracle.shutdown();
  });

  it('replays identical traces exactly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 0xffffffff }),
        fc.array(
          fc.record({
            inputMask: fc.integer({ min: 0, max: 0xff }),
            tics: fc.integer({ min: 1, max: 8 }),
            rng: fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          }),
          { minLength: 1, maxLength: 32 },
        ),
        async (mapSeed, steps) => {
          const map = makeMapBits(mapSeed >>> 0);
          const config = {
            mapLo: map.lo >>> 0,
            mapHi: map.hi >>> 0,
            startXQ8: 3 * 256 + 128,
            startYQ8: 3 * 256 + 128,
            startAngleDeg: 0,
            startHealth: 100,
            startAmmo: 8,
          };

          const runTrace = async (): Promise<{ digest: number; finalSnapshotHash: number; finalFrameHash: number; saved: Uint8Array }> => {
            await oracle.init(config);
            oracle.reset();
            let digest = 2166136261 >>> 0;
            for (const step of steps) {
              const out = oracle.step({
                inputMask: step.inputMask | 0,
                tics: step.tics | 0,
                rng: step.rng | 0,
              });
              digest = Math.imul((digest ^ (out.snapshotHash >>> 0)) >>> 0, 16777619) >>> 0;
              digest = Math.imul((digest ^ (out.frameHash >>> 0)) >>> 0, 16777619) >>> 0;
              digest = Math.imul((digest ^ (out.tick | 0)) >>> 0, 16777619) >>> 0;
            }
            const finalSnapshot = oracle.snapshot();
            const finalFrameHash = oracle.renderHash(320, 200) >>> 0;
            const saved = oracle.saveState();
            digest = Math.imul((digest ^ (finalSnapshot.hash >>> 0)) >>> 0, 16777619) >>> 0;
            digest = Math.imul((digest ^ finalFrameHash) >>> 0, 16777619) >>> 0;
            return {
              digest: digest >>> 0,
              finalSnapshotHash: finalSnapshot.hash >>> 0,
              finalFrameHash,
              saved,
            };
          };

          const a = await runTrace();
          const b = await runTrace();
          expect(b.digest >>> 0).toBe(a.digest >>> 0);
          expect(b.finalSnapshotHash >>> 0).toBe(a.finalSnapshotHash >>> 0);
          expect(b.finalFrameHash >>> 0).toBe(a.finalFrameHash >>> 0);
          expect([...b.saved]).toEqual([...a.saved]);
        },
      ),
      { numRuns: getNumRuns(), seed: getSeed() },
    );
  });
});

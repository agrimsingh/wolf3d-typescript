import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { withReplay } from './replay';
import { getNumRuns, getSeed } from './config';
import { WolfsrcOraclePort } from '../../src/oracle/runtimeOracle';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import type { RuntimeConfig } from '../../src/runtime/contracts';

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

describe('runtime step parity', () => {
  let oracle: WolfsrcOraclePort;
  let tsRuntime: TsRuntimePort;

  beforeAll(async () => {
    oracle = new WolfsrcOraclePort();
    tsRuntime = new TsRuntimePort();
  });

  afterAll(async () => {
    await oracle.shutdown();
    await tsRuntime.shutdown();
  });

  it('step/replay parity matches between oracle and ts runtime', async () => {
    await withReplay('runtime.step-parity.sequence', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 256, max: 6 * 256 }),
          fc.integer({ min: 256, max: 6 * 256 }),
          fc.integer({ min: -720, max: 720 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 99 }),
          fc.array(
            fc.record({
              inputMask: fc.integer({ min: 0, max: 0xff }),
              tics: fc.integer({ min: 0, max: 8 }),
              rng: fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
            }),
            { minLength: 1, maxLength: 25 },
          ),
          async (mapSeed, startXQ8, startYQ8, startAngleDeg, startHealth, startAmmo, steps) => {
            const map = makeMapBits(mapSeed >>> 0);
            const config: RuntimeConfig = {
              mapLo: map.lo,
              mapHi: map.hi,
              startXQ8,
              startYQ8,
              startAngleDeg,
              startHealth,
              startAmmo,
            };

            await oracle.init(config);
            await tsRuntime.init(config);

            for (const stepInput of steps) {
              const oracleStep = oracle.step(stepInput);
              const tsStep = tsRuntime.step(stepInput);
              expect(tsStep.snapshotHash >>> 0).toBe(oracleStep.snapshotHash >>> 0);
              expect(tsStep.frameHash >>> 0).toBe(oracleStep.frameHash >>> 0);
              expect(tsStep.tick | 0).toBe(oracleStep.tick | 0);
            }

            const oracleSnap = oracle.snapshot();
            const tsSnap = tsRuntime.snapshot();
            expect(tsSnap.hash >>> 0).toBe(oracleSnap.hash >>> 0);
            expect(tsSnap.xQ8 | 0).toBe(oracleSnap.xQ8 | 0);
            expect(tsSnap.yQ8 | 0).toBe(oracleSnap.yQ8 | 0);
            expect(tsSnap.angleDeg | 0).toBe(oracleSnap.angleDeg | 0);
            expect(tsSnap.health | 0).toBe(oracleSnap.health | 0);
            expect(tsSnap.ammo | 0).toBe(oracleSnap.ammo | 0);
            expect(tsSnap.cooldown | 0).toBe(oracleSnap.cooldown | 0);
            expect(tsSnap.flags | 0).toBe(oracleSnap.flags | 0);
            expect(tsSnap.tick | 0).toBe(oracleSnap.tick | 0);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('serialize/deserialize parity preserves state', async () => {
    await withReplay('runtime.step-parity.serialize', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 256, max: 6 * 256 }),
          fc.integer({ min: 256, max: 6 * 256 }),
          fc.integer({ min: -720, max: 720 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 99 }),
          fc.array(
            fc.record({
              inputMask: fc.integer({ min: 0, max: 0xff }),
              tics: fc.integer({ min: 0, max: 8 }),
              rng: fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
            }),
            { minLength: 3, maxLength: 20 },
          ),
          async (mapSeed, startXQ8, startYQ8, startAngleDeg, startHealth, startAmmo, steps) => {
            const map = makeMapBits(mapSeed >>> 0);
            const config: RuntimeConfig = {
              mapLo: map.lo,
              mapHi: map.hi,
              startXQ8,
              startYQ8,
              startAngleDeg,
              startHealth,
              startAmmo,
            };

            await oracle.init(config);
            await tsRuntime.init(config);

            for (const stepInput of steps) {
              oracle.step(stepInput);
              tsRuntime.step(stepInput);
            }

            const oracleBlob = oracle.serialize();
            const tsBlob = tsRuntime.serialize();

            await oracle.init(config);
            await tsRuntime.init(config);

            oracle.deserialize(oracleBlob);
            tsRuntime.deserialize(tsBlob);

            const oracleSnap = oracle.snapshot();
            const tsSnap = tsRuntime.snapshot();
            expect(tsSnap.hash >>> 0).toBe(oracleSnap.hash >>> 0);
            expect(tsSnap.tick | 0).toBe(oracleSnap.tick | 0);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('oracle runtime trace symbols are deterministic for identical scenarios', async () => {
    const config: RuntimeConfig = {
      mapLo: 0xff818181,
      mapHi: 0x818181ff,
      startXQ8: 3 * 256,
      startYQ8: 4 * 256,
      startAngleDeg: 90,
      startHealth: 75,
      startAmmo: 12,
    };

    const runTrace = async (): Promise<number[]> => {
      await oracle.init(config);
      oracle.resetTrace();
      await oracle.init(config);
      oracle.reset();
      oracle.snapshot();
      oracle.step({ inputMask: 0xbf, tics: 4, rng: 0x12345678 });
      oracle.renderHash(320, 200);
      return oracle.traceSymbolIds();
    };

    const a = await runTrace();
    const b = await runTrace();

    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
    expect(a.includes(1)).toBe(true); // oracle_runtime_init
    expect(a.includes(2)).toBe(true); // oracle_runtime_reset
    expect(a.includes(3)).toBe(true); // oracle_runtime_step
    expect(a.includes(17)).toBe(true); // real WL_AGENT.ClipMove
  });
});

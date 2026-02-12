import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { withReplay } from './replay';
import { getNumRuns, getSeed } from './config';
import { WolfsrcOraclePort } from '../../src/oracle/runtimeOracle';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import type { RuntimeConfig, RuntimeInput } from '../../src/runtime/contracts';

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

function expectSnapshotsEqual(a: ReturnType<WolfsrcOraclePort['snapshot']>, b: ReturnType<TsRuntimePort['snapshot']>): void {
  expect(b.mapLo >>> 0).toBe(a.mapLo >>> 0);
  expect(b.mapHi >>> 0).toBe(a.mapHi >>> 0);
  expect(b.xQ8 | 0).toBe(a.xQ8 | 0);
  expect(b.yQ8 | 0).toBe(a.yQ8 | 0);
  expect(b.angleDeg | 0).toBe(a.angleDeg | 0);
  expect(b.health | 0).toBe(a.health | 0);
  expect(b.ammo | 0).toBe(a.ammo | 0);
  expect(b.cooldown | 0).toBe(a.cooldown | 0);
  expect(b.flags | 0).toBe(a.flags | 0);
  expect(b.tick | 0).toBe(a.tick | 0);
  expect(b.hash >>> 0).toBe(a.hash >>> 0);
}

describe('runtime required symbols parity', () => {
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

  it('required runtime API symbols stay in parity', async () => {
    await withReplay('runtime.required-symbols.api-parity', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 256, max: 6 * 256 }),
          fc.integer({ min: 256, max: 6 * 256 }),
          fc.integer({ min: -720, max: 720 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 99 }),
          fc.integer({ min: 1, max: 640 }),
          fc.integer({ min: 1, max: 400 }),
          fc.array(
            fc.record({
              inputMask: fc.integer({ min: 0, max: 0xff }),
              tics: fc.integer({ min: 1, max: 8 }),
              rng: fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
            }),
            { minLength: 1, maxLength: 6 },
          ),
          async (mapSeed, startXQ8, startYQ8, startAngleDeg, startHealth, startAmmo, viewWidth, viewHeight, steps) => {
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

            // init + getters + snapshot_hash
            const initOracle = oracle.snapshot();
            const initTs = tsRuntime.snapshot();
            expectSnapshotsEqual(initOracle, initTs);

            // step + clipmove path + frame hash
            for (const stepInput of steps) {
              const input: RuntimeInput = {
                inputMask: stepInput.inputMask | 0,
                tics: stepInput.tics | 0,
                rng: stepInput.rng | 0,
              };
              const oracleStep = oracle.step(input);
              const tsStep = tsRuntime.step(input);
              expect(tsStep.snapshotHash >>> 0).toBe(oracleStep.snapshotHash >>> 0);
              expect(tsStep.frameHash >>> 0).toBe(oracleStep.frameHash >>> 0);
              expect(tsStep.tick | 0).toBe(oracleStep.tick | 0);
            }

            // render_frame_hash
            expect(tsRuntime.renderHash(viewWidth, viewHeight) >>> 0).toBe(oracle.renderHash(viewWidth, viewHeight) >>> 0);

            // set_state path (oracle set_state via deserialize)
            const oracleBlob = oracle.serialize();
            await oracle.init(config);
            await tsRuntime.init(config);
            oracle.deserialize(oracleBlob);
            tsRuntime.deserialize(oracleBlob);
            expectSnapshotsEqual(oracle.snapshot(), tsRuntime.snapshot());

            // reset path
            const forceMove: RuntimeInput = { inputMask: 0x03, tics: 3, rng: 0x12345678 };
            oracle.step(forceMove);
            tsRuntime.step(forceMove);
            oracle.reset();
            tsRuntime.reset();
            expectSnapshotsEqual(oracle.snapshot(), tsRuntime.snapshot());
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });
});

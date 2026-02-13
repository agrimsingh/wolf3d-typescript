import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { withReplay } from './replay';
import { getNumRuns, getSeed } from './config';
import { WolfsrcOraclePort } from '../../src/oracle/runtimeOracle';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import type { RuntimeConfig, RuntimeFrameInput } from '../../src/runtime/contracts';

function makeMapBits(seed: number): { lo: number; hi: number } {
  let lo = 0;
  let hi = 0;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const border = x === 0 || y === 0 || x === 7 || y === 7;
      const randomWall = ((seed >>> ((x + y) & 31)) & 1) === 1 && x > 1 && y > 1 && x < 6 && y < 6;
      if (!(border || randomWall)) {
        continue;
      }
      const bit = y * 8 + x;
      if (bit < 32) {
        lo |= 1 << bit;
      } else {
        hi |= 1 << (bit - 32);
      }
    }
  }
  return { lo: lo >>> 0, hi: hi >>> 0 };
}

describe('runtime lifecycle api parity', () => {
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

  it('bootWl6/stepFrame/framebuffer/save-load parity remains deterministic', async () => {
    await withReplay('runtime.lifecycle.api', async () => {
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
              keyboardMask: fc.integer({ min: 0, max: 0xff }),
              mouseDeltaX: fc.integer({ min: -32, max: 32 }),
              mouseDeltaY: fc.integer({ min: -32, max: 32 }),
              buttonMask: fc.integer({ min: 0, max: 0x07 }),
              tics: fc.integer({ min: 0, max: 8 }),
              rng: fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
            }),
            { minLength: 1, maxLength: 20 },
          ),
          async (mapSeed, startXQ8, startYQ8, startAngleDeg, startHealth, startAmmo, frameInputs) => {
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

            await oracle.bootWl6(config);
            await tsRuntime.bootWl6(config);

            for (const input of frameInputs as RuntimeFrameInput[]) {
              const oracleStep = oracle.stepFrame(input);
              const tsStep = tsRuntime.stepFrame(input);
              expect(tsStep).toEqual(oracleStep);
              expect(tsRuntime.snapshot()).toEqual(oracle.snapshot());
            }

            const oracleFrame = oracle.framebuffer(false);
            const tsFrame = tsRuntime.framebuffer(false);
            expect(tsFrame.indexedHash >>> 0).toBe(oracleFrame.indexedHash >>> 0);

            const oracleSave = oracle.saveState();
            const tsSave = tsRuntime.saveState();

            await oracle.bootWl6(config);
            await tsRuntime.bootWl6(config);

            oracle.loadState(oracleSave);
            tsRuntime.loadState(tsSave);

            expect(tsRuntime.snapshot()).toEqual(oracle.snapshot());
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('framebuffer raw payload remains deterministic and parity-equal', async () => {
    const map = makeMapBits(0xfaceb00c);
    const config: RuntimeConfig = {
      mapLo: map.lo,
      mapHi: map.hi,
      startXQ8: 3 * 256,
      startYQ8: 3 * 256,
      startAngleDeg: 90,
      startHealth: 100,
      startAmmo: 8,
    };

    await oracle.bootWl6(config);
    await tsRuntime.bootWl6(config);

    const stepInput: RuntimeFrameInput = {
      keyboardMask: 0x13,
      mouseDeltaX: 4,
      mouseDeltaY: -2,
      buttonMask: 0x03,
      tics: 5,
      rng: 0x12345678,
    };

    oracle.stepFrame(stepInput);
    tsRuntime.stepFrame(stepInput);

    const oracleFrame = oracle.framebuffer(true);
    const tsFrame = tsRuntime.framebuffer(true);
    expect(tsFrame.indexedHash >>> 0).toBe(oracleFrame.indexedHash >>> 0);
    expect(tsFrame.indexedBuffer?.length).toBe(320 * 200);
    expect(tsFrame.indexedBuffer).toEqual(oracleFrame.indexedBuffer);
  });
});

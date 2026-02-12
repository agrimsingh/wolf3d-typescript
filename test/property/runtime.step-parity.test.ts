import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { withReplay } from './replay';
import { getNumRuns, getSeed } from './config';
import { WolfsrcOraclePort } from '../../src/oracle/runtimeOracle';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import type { RuntimeConfig, RuntimeInput } from '../../src/runtime/contracts';
import {
  assertRuntimeTraceParity,
  captureRuntimeTrace,
  RuntimeParityError,
  type RuntimeParityScenario,
} from '../../src/runtime/parityHarness';
import { persistRuntimeRepro } from './runtimeRepro';

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

  function buildScenario(
    mapSeed: number,
    startXQ8: number,
    startYQ8: number,
    startAngleDeg: number,
    startHealth: number,
    startAmmo: number,
    steps: RuntimeInput[],
  ): RuntimeParityScenario {
    const map = makeMapBits(mapSeed >>> 0);
    return {
      id: `seed-${mapSeed >>> 0}`,
      config: {
        mapLo: map.lo,
        mapHi: map.hi,
        startXQ8,
        startYQ8,
        startAngleDeg,
        startHealth,
        startAmmo,
      },
      steps,
    };
  }

  async function captureParityOrPersist(suite: string, scenario: RuntimeParityScenario): Promise<void> {
    let oracleTrace;
    let tsTrace;
    try {
      oracleTrace = await captureRuntimeTrace(oracle, scenario);
      tsTrace = await captureRuntimeTrace(tsRuntime, scenario);
      assertRuntimeTraceParity(scenario, oracleTrace, tsTrace);
    } catch (error) {
      const jsonError =
        error instanceof RuntimeParityError
          ? error.toJSON()
          : {
              error: error instanceof Error ? error.message : String(error),
            };
      persistRuntimeRepro({
        suite,
        timestamp: new Date().toISOString(),
        scenario,
        oracleTrace,
        tsTrace,
        error: jsonError,
      });
      throw error;
    }
  }

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
            const scenario = buildScenario(mapSeed, startXQ8, startYQ8, startAngleDeg, startHealth, startAmmo, steps);
            await captureParityOrPersist('runtime.step-parity.sequence', scenario);
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
            const scenario = buildScenario(mapSeed, startXQ8, startYQ8, startAngleDeg, startHealth, startAmmo, steps);
            const config: RuntimeConfig = scenario.config;

            await oracle.init(config);
            await tsRuntime.init(config);

            for (const stepInput of scenario.steps) {
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
    expect(a.includes(18)).toBe(true); // real WL_AGENT.TryMove
    expect(a.includes(19)).toBe(true); // real WL_AGENT.ControlMovement
    expect(a.includes(21)).toBe(true); // real WL_DRAW.WallRefresh
    expect(a.includes(22)).toBe(true); // real WL_DRAW.ThreeDRefresh
    expect(a.includes(23)).toBe(true); // real WL_STATE.CheckLine
    expect(a.includes(24)).toBe(true); // real WL_STATE.CheckSight
  });

  it('oracle runtime is self-consistent across deterministic scenarios', async () => {
    const scenarios: RuntimeParityScenario[] = [
      buildScenario(0x1234abcd, 2 * 256, 2 * 256, 90, 80, 12, [
        { inputMask: 0xbf, tics: 4, rng: 0x12345678 },
        { inputMask: 0x33, tics: 2, rng: 0x87654321 },
        { inputMask: 0xa5, tics: 5, rng: 0x13579bdf },
      ]),
      buildScenario(0xfeedface, 4 * 256, 3 * 256, -45, 65, 20, [
        { inputMask: 0x41, tics: 6, rng: -12345 },
        { inputMask: 0x9d, tics: 1, rng: 0x0badf00d },
        { inputMask: 0x07, tics: 8, rng: 0x11223344 },
      ]),
    ];

    for (const scenario of scenarios) {
      const a = await captureRuntimeTrace(oracle, scenario);
      const b = await captureRuntimeTrace(oracle, scenario);
      assertRuntimeTraceParity(scenario, a, b);
      expect(a.traceHash >>> 0).toBe(b.traceHash >>> 0);
    }
  });

  it('ts runtime is self-consistent across deterministic scenarios', async () => {
    const scenarios: RuntimeParityScenario[] = [
      buildScenario(0x27182818, 2 * 256, 5 * 256, 180, 90, 8, [
        { inputMask: 0xc0, tics: 2, rng: 3333 },
        { inputMask: 0x12, tics: 7, rng: 4444 },
        { inputMask: 0xee, tics: 3, rng: 5555 },
      ]),
      buildScenario(0x31415926, 5 * 256, 2 * 256, 270, 50, 15, [
        { inputMask: 0x44, tics: 5, rng: 0x55aa55aa },
        { inputMask: 0x18, tics: 4, rng: -999999 },
        { inputMask: 0x80, tics: 2, rng: 0x7fffffff },
      ]),
    ];

    for (const scenario of scenarios) {
      const a = await captureRuntimeTrace(tsRuntime, scenario);
      const b = await captureRuntimeTrace(tsRuntime, scenario);
      assertRuntimeTraceParity(scenario, a, b);
      expect(a.traceHash >>> 0).toBe(b.traceHash >>> 0);
    }
  });
});

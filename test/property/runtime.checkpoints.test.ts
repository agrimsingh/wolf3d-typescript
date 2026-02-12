import { readFile } from 'node:fs/promises';
import path from 'node:path';
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
import { loadWl1RuntimeScenarios } from '../../scripts/runtime/runtime-fixtures';
import { computeRuntimeCheckpoints, type RuntimeCheckpointArtifact } from '../../scripts/runtime/runtime-checkpoints';

describe('runtime fixture checkpoints', () => {
  let oracle: WolfsrcOraclePort;
  let tsRuntime: TsRuntimePort;
  let tsRuntimeMirror: TsRuntimePort;
  let fixtureScenarios: Awaited<ReturnType<typeof loadWl1RuntimeScenarios>>;

  beforeAll(async () => {
    oracle = new WolfsrcOraclePort();
    tsRuntime = new TsRuntimePort();
    tsRuntimeMirror = new TsRuntimePort();
    fixtureScenarios = await loadWl1RuntimeScenarios(process.cwd(), 64);
  });

  afterAll(async () => {
    await oracle.shutdown();
    await tsRuntime.shutdown();
    await tsRuntimeMirror.shutdown();
  });

  async function captureParityOrPersist(suite: string, scenario: RuntimeParityScenario): Promise<void> {
    let oracleTrace: Awaited<ReturnType<typeof captureRuntimeTrace>> | undefined;
    let tsTrace: Awaited<ReturnType<typeof captureRuntimeTrace>> | undefined;
    try {
      const useOracleParity = (scenario.config.variant ?? 'WL1') !== 'WL6';
      if (useOracleParity) {
        oracleTrace = await captureRuntimeTrace(oracle, scenario);
      }
      tsTrace = await captureRuntimeTrace(tsRuntime, scenario);
      if (useOracleParity) {
        if (!oracleTrace || !tsTrace) {
          throw new Error(`Missing oracle/ts traces for oracle parity scenario "${scenario.id}"`);
        }
        assertRuntimeTraceParity(scenario, oracleTrace, tsTrace);
      }
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

  it('checkpoint lock stays stable across deterministic WL1 fixtures', async () => {
    const lockPath = path.join(process.cwd(), 'specs', 'generated', 'runtime-checkpoints-lock.json');
    const lock = JSON.parse(await readFile(lockPath, 'utf8')) as RuntimeCheckpointArtifact;
    const generated = await computeRuntimeCheckpoints(process.cwd(), 64);
    expect(generated).toEqual(lock);
  });

  it('fixture-prefix parity has no tick/frame drift', async () => {
    expect(fixtureScenarios.length).toBeGreaterThan(0);

    await withReplay('runtime.checkpoints.fixture-prefix-parity', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: fixtureScenarios.length - 1 }),
          fc.integer({ min: 1, max: 24 }),
          fc.integer({ min: 64, max: 640 }),
          fc.integer({ min: 64, max: 400 }),
          async (scenarioIndex, prefixSteps, viewWidth, viewHeight) => {
            const fixture = fixtureScenarios[scenarioIndex]!;
            const useOracleParity = (fixture.config.variant ?? 'WL1') !== 'WL6';
            const scenario: RuntimeParityScenario = {
              id: `${fixture.id}-prefix-${prefixSteps}`,
              config: fixture.config,
              steps: fixture.steps.slice(0, Math.min(prefixSteps, fixture.steps.length)),
            };

            await captureParityOrPersist('runtime.checkpoints.fixture-prefix-parity', scenario);

            const config: RuntimeConfig = scenario.config;
            await oracle.init(config);
            await tsRuntime.init(config);
            if (!useOracleParity) {
              await tsRuntimeMirror.init(config);
            }
            for (const input of scenario.steps) {
              const stepInput: RuntimeInput = {
                inputMask: input.inputMask | 0,
                tics: input.tics | 0,
                rng: input.rng | 0,
              };
              if (useOracleParity) {
                const oracleStep = oracle.step(stepInput);
                const tsStep = tsRuntime.step(stepInput);
                expect(tsStep.snapshotHash >>> 0).toBe(oracleStep.snapshotHash >>> 0);
                expect(tsStep.frameHash >>> 0).toBe(oracleStep.frameHash >>> 0);
                expect(tsStep.tick | 0).toBe(oracleStep.tick | 0);
              } else {
                const left = tsRuntime.step(stepInput);
                const right = tsRuntimeMirror.step(stepInput);
                expect(left.snapshotHash >>> 0).toBe(right.snapshotHash >>> 0);
                expect(left.frameHash >>> 0).toBe(right.frameHash >>> 0);
                expect(left.tick | 0).toBe(right.tick | 0);
              }
            }
            if (useOracleParity) {
              expect(tsRuntime.renderHash(viewWidth, viewHeight) >>> 0).toBe(oracle.renderHash(viewWidth, viewHeight) >>> 0);
            } else {
              expect(tsRuntime.renderHash(viewWidth, viewHeight) >>> 0).toBe(tsRuntimeMirror.renderHash(viewWidth, viewHeight) >>> 0);
            }
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });
});

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
  let fixtureScenarios: Awaited<ReturnType<typeof loadWl1RuntimeScenarios>>;

  beforeAll(async () => {
    oracle = new WolfsrcOraclePort();
    tsRuntime = new TsRuntimePort();
    fixtureScenarios = await loadWl1RuntimeScenarios(process.cwd(), 64);
  });

  afterAll(async () => {
    await oracle.shutdown();
    await tsRuntime.shutdown();
  });

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
            const scenario: RuntimeParityScenario = {
              id: `${fixture.id}-prefix-${prefixSteps}`,
              config: fixture.config,
              steps: fixture.steps.slice(0, Math.min(prefixSteps, fixture.steps.length)),
            };

            await captureParityOrPersist('runtime.checkpoints.fixture-prefix-parity', scenario);

            const config: RuntimeConfig = scenario.config;
            await oracle.init(config);
            await tsRuntime.init(config);
            for (const input of scenario.steps) {
              const stepInput: RuntimeInput = {
                inputMask: input.inputMask | 0,
                tics: input.tics | 0,
                rng: input.rng | 0,
              };
              const oracleStep = oracle.step(stepInput);
              const tsStep = tsRuntime.step(stepInput);
              expect(tsStep.snapshotHash >>> 0).toBe(oracleStep.snapshotHash >>> 0);
              expect(tsStep.frameHash >>> 0).toBe(oracleStep.frameHash >>> 0);
              expect(tsStep.tick | 0).toBe(oracleStep.tick | 0);
            }
            expect(tsRuntime.renderHash(viewWidth, viewHeight) >>> 0).toBe(oracle.renderHash(viewWidth, viewHeight) >>> 0);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });
});

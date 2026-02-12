import { WolfsrcOraclePort } from '../../src/oracle/runtimeOracle';
import type { RuntimeConfig, RuntimeInput, RuntimeSnapshot, RuntimeStepResult } from '../../src/runtime/contracts';
import {
  assertRuntimeTraceParity,
  captureRuntimeTrace,
  type RuntimeParityScenario,
  type RuntimeTraceCapture,
} from '../../src/runtime/parityHarness';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import { loadWl1RuntimeScenarios } from './runtime-fixtures';

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function hashConfig(hash: number, config: RuntimeConfig): number {
  let h = hash >>> 0;
  h = fnv1a(h, (config.mapLo ?? 0) >>> 0);
  h = fnv1a(h, (config.mapHi ?? 0) >>> 0);
  h = fnv1a(h, config.startXQ8 | 0);
  h = fnv1a(h, config.startYQ8 | 0);
  h = fnv1a(h, config.startAngleDeg | 0);
  h = fnv1a(h, config.startHealth | 0);
  h = fnv1a(h, config.startAmmo | 0);
  return h >>> 0;
}

function hashInput(hash: number, input: RuntimeInput): number {
  let h = hash >>> 0;
  h = fnv1a(h, input.inputMask | 0);
  h = fnv1a(h, input.tics | 0);
  h = fnv1a(h, input.rng | 0);
  return h >>> 0;
}

function hashStep(hash: number, step: RuntimeStepResult): number {
  let h = hash >>> 0;
  h = fnv1a(h, step.snapshotHash >>> 0);
  h = fnv1a(h, step.frameHash >>> 0);
  h = fnv1a(h, step.tick | 0);
  return h >>> 0;
}

function hashSnapshot(hash: number, snapshot: RuntimeSnapshot): number {
  let h = hash >>> 0;
  h = fnv1a(h, snapshot.mapLo >>> 0);
  h = fnv1a(h, snapshot.mapHi >>> 0);
  h = fnv1a(h, snapshot.xQ8 | 0);
  h = fnv1a(h, snapshot.yQ8 | 0);
  h = fnv1a(h, snapshot.angleDeg | 0);
  h = fnv1a(h, snapshot.health | 0);
  h = fnv1a(h, snapshot.ammo | 0);
  h = fnv1a(h, snapshot.cooldown | 0);
  h = fnv1a(h, snapshot.flags | 0);
  h = fnv1a(h, snapshot.tick | 0);
  h = fnv1a(h, snapshot.hash >>> 0);
  return h >>> 0;
}

function toSeedHex(seed: number): string {
  return `0x${(seed >>> 0).toString(16).padStart(8, '0')}`;
}

function buildScenarioDigest(scenario: RuntimeParityScenario, trace: RuntimeTraceCapture): number {
  let hash = 2166136261 >>> 0;
  hash = hashConfig(hash, scenario.config);
  hash = fnv1a(hash, trace.traceHash >>> 0);
  for (let i = 0; i < scenario.steps.length; i++) {
    hash = hashInput(hash, scenario.steps[i]!);
    hash = hashStep(hash, trace.steps[i]!);
  }
  hash = hashSnapshot(hash, trace.finalSnapshot);
  return hash >>> 0;
}

export interface RuntimeScenarioCheckpoint {
  id: string;
  mapIndex: number;
  mapName: string;
  seedHex: string;
  stepCount: number;
  traceHash: number;
  stepDigest: number;
  finalSnapshotHash: number;
  finalFrameHash: number;
  finalTick: number;
}

export interface RuntimeCheckpointArtifact {
  phase: 'K12';
  stepsPerScenario: number;
  scenarioCount: number;
  checkpointDigest: number;
  checkpoints: RuntimeScenarioCheckpoint[];
}

export async function computeRuntimeCheckpoints(rootDir: string, stepsPerScenario = 64): Promise<RuntimeCheckpointArtifact> {
  const fixtures = await loadWl1RuntimeScenarios(rootDir, stepsPerScenario);
  if (fixtures.length === 0) {
    throw new Error('No WL1 runtime fixtures found. Run `pnpm verify:assets` to install and validate shareware data files.');
  }

  const oracle = new WolfsrcOraclePort();
  const tsRuntime = new TsRuntimePort();
  const checkpoints: RuntimeScenarioCheckpoint[] = [];
  let digest = 2166136261 >>> 0;

  try {
    for (const fixture of fixtures) {
      const scenario: RuntimeParityScenario = {
        id: fixture.id,
        config: fixture.config,
        steps: fixture.steps,
      };
      const useOracleParity = (fixture.config.variant ?? 'WL1') !== 'WL6';
      let canonicalTrace: RuntimeTraceCapture;
      if (useOracleParity) {
        const oracleTrace = await captureRuntimeTrace(oracle, scenario);
        const tsTrace = await captureRuntimeTrace(tsRuntime, scenario);
        assertRuntimeTraceParity(scenario, oracleTrace, tsTrace);
        canonicalTrace = oracleTrace;
      } else {
        canonicalTrace = await captureRuntimeTrace(tsRuntime, scenario);
      }

      const stepDigest = buildScenarioDigest(scenario, canonicalTrace);
      const lastStep = canonicalTrace.steps[canonicalTrace.steps.length - 1];
      const finalFrameHash = lastStep ? (lastStep.frameHash >>> 0) : (tsRuntime.renderHash(320, 200) >>> 0);
      const checkpoint: RuntimeScenarioCheckpoint = {
        id: fixture.id,
        mapIndex: fixture.mapIndex,
        mapName: fixture.mapName,
        seedHex: toSeedHex(fixture.seed),
        stepCount: fixture.steps.length | 0,
        traceHash: canonicalTrace.traceHash >>> 0,
        stepDigest: stepDigest >>> 0,
        finalSnapshotHash: canonicalTrace.finalSnapshot.hash >>> 0,
        finalFrameHash,
        finalTick: canonicalTrace.finalSnapshot.tick | 0,
      };
      checkpoints.push(checkpoint);

      digest = fnv1a(digest, checkpoint.mapIndex | 0);
      digest = fnv1a(digest, checkpoint.stepCount | 0);
      digest = fnv1a(digest, checkpoint.traceHash >>> 0);
      digest = fnv1a(digest, checkpoint.stepDigest >>> 0);
      digest = fnv1a(digest, checkpoint.finalSnapshotHash >>> 0);
      digest = fnv1a(digest, checkpoint.finalFrameHash >>> 0);
      digest = fnv1a(digest, checkpoint.finalTick | 0);
    }
  } finally {
    await oracle.shutdown();
    await tsRuntime.shutdown();
  }

  checkpoints.sort((a, b) => a.mapIndex - b.mapIndex);
  return {
    phase: 'K12',
    stepsPerScenario: stepsPerScenario | 0,
    scenarioCount: checkpoints.length,
    checkpointDigest: digest >>> 0,
    checkpoints,
  };
}

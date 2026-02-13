import { WolfsrcOraclePort } from '../../src/oracle/runtimeOracle';
import type { RuntimeConfig, RuntimeInput, RuntimeSnapshot, RuntimeStepResult } from '../../src/runtime/contracts';
import {
  assertRuntimeTraceParity,
  captureRuntimeTrace,
  type RuntimeParityScenario,
  type RuntimeTraceCapture,
} from '../../src/runtime/parityHarness';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import { loadRuntimeScenarios } from './runtime-fixtures';

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

function buildMapDigest(scenario: RuntimeParityScenario, trace: RuntimeTraceCapture): number {
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

export interface RuntimeEpisodeMapCheckpoint {
  id: string;
  mapIndex: number;
  mapName: string;
  seedHex: string;
  stepCount: number;
  stepTrace: RuntimeEpisodeStepTrace[];
  traceHash: number;
  mapDigest: number;
  finalSnapshotHash: number;
  finalFrameHash: number;
  finalTick: number;
}

export interface RuntimeEpisodeStepTrace {
  inputMask: number;
  tics: number;
  rng: number;
  snapshotHash: number;
  frameHash: number;
  tick: number;
}

export interface RuntimeEpisodeArtifact {
  phase: 'K12';
  stepsPerMap: number;
  scenarioCount: number;
  mapOrder: number[];
  episodeDigest: number;
  maps: RuntimeEpisodeMapCheckpoint[];
}

export async function computeRuntimeEpisodeArtifact(rootDir: string, stepsPerMap = 64): Promise<RuntimeEpisodeArtifact> {
  const fixtures = await loadRuntimeScenarios(rootDir, stepsPerMap);
  if (fixtures.length === 0) {
    throw new Error('No runtime fixtures found. Run `pnpm verify:assets:wl6` to install/validate WL6 data files.');
  }

  const oracle = new WolfsrcOraclePort();
  const tsRuntime = new TsRuntimePort();
  const maps: RuntimeEpisodeMapCheckpoint[] = [];
  let episodeDigest = 2166136261 >>> 0;

  try {
    for (const fixture of fixtures) {
      const scenario: RuntimeParityScenario = {
        id: fixture.id,
        config: fixture.config,
        steps: fixture.steps,
      };
      const useOracleParity = (fixture.config.variant ?? 'WL6') !== 'WL6';
      let canonicalTrace: RuntimeTraceCapture;
      if (useOracleParity) {
        const oracleTrace = await captureRuntimeTrace(oracle, scenario);
        const tsTrace = await captureRuntimeTrace(tsRuntime, scenario);
        assertRuntimeTraceParity(scenario, oracleTrace, tsTrace);
        canonicalTrace = oracleTrace;
      } else {
        canonicalTrace = await captureRuntimeTrace(tsRuntime, scenario);
      }

      const mapDigest = buildMapDigest(scenario, canonicalTrace);
      const lastStep = canonicalTrace.steps[canonicalTrace.steps.length - 1];
      const finalFrameHash = lastStep ? (lastStep.frameHash >>> 0) : (tsRuntime.renderHash(320, 200) >>> 0);

      const stepTrace: RuntimeEpisodeStepTrace[] = scenario.steps.map((input, index) => {
        const step = canonicalTrace.steps[index];
        if (!step) {
          throw new Error(`Missing canonical step trace at index ${index} for scenario ${scenario.id}`);
        }
        return {
          inputMask: input.inputMask | 0,
          tics: input.tics | 0,
          rng: input.rng | 0,
          snapshotHash: step.snapshotHash >>> 0,
          frameHash: step.frameHash >>> 0,
          tick: step.tick | 0,
        };
      });

      const checkpoint: RuntimeEpisodeMapCheckpoint = {
        id: fixture.id,
        mapIndex: fixture.mapIndex,
        mapName: fixture.mapName,
        seedHex: toSeedHex(fixture.seed),
        stepCount: stepTrace.length | 0,
        stepTrace,
        traceHash: canonicalTrace.traceHash >>> 0,
        mapDigest: mapDigest >>> 0,
        finalSnapshotHash: canonicalTrace.finalSnapshot.hash >>> 0,
        finalFrameHash,
        finalTick: canonicalTrace.finalSnapshot.tick | 0,
      };
      maps.push(checkpoint);

      episodeDigest = fnv1a(episodeDigest, checkpoint.mapIndex | 0);
      episodeDigest = fnv1a(episodeDigest, checkpoint.stepCount | 0);
      episodeDigest = fnv1a(episodeDigest, checkpoint.traceHash >>> 0);
      episodeDigest = fnv1a(episodeDigest, checkpoint.mapDigest >>> 0);
      episodeDigest = fnv1a(episodeDigest, checkpoint.finalSnapshotHash >>> 0);
      episodeDigest = fnv1a(episodeDigest, checkpoint.finalFrameHash >>> 0);
      episodeDigest = fnv1a(episodeDigest, checkpoint.finalTick | 0);
      for (const step of checkpoint.stepTrace) {
        episodeDigest = fnv1a(episodeDigest, step.inputMask | 0);
        episodeDigest = fnv1a(episodeDigest, step.tics | 0);
        episodeDigest = fnv1a(episodeDigest, step.rng | 0);
        episodeDigest = fnv1a(episodeDigest, step.snapshotHash >>> 0);
        episodeDigest = fnv1a(episodeDigest, step.frameHash >>> 0);
        episodeDigest = fnv1a(episodeDigest, step.tick | 0);
      }
    }
  } finally {
    await oracle.shutdown();
    await tsRuntime.shutdown();
  }

  maps.sort((a, b) => a.mapIndex - b.mapIndex);
  return {
    phase: 'K12',
    stepsPerMap: stepsPerMap | 0,
    scenarioCount: maps.length,
    mapOrder: maps.map((entry) => entry.mapIndex | 0),
    episodeDigest: episodeDigest >>> 0,
    maps,
  };
}

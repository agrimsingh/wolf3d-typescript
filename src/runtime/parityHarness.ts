import type { RuntimeConfig, RuntimeInput, RuntimePort, RuntimeSnapshot, RuntimeStepResult } from './contracts';

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function hashStepInput(hash: number, input: RuntimeInput): number {
  let h = hash >>> 0;
  h = fnv1a(h, input.inputMask | 0);
  h = fnv1a(h, input.tics | 0);
  h = fnv1a(h, input.rng | 0);
  return h >>> 0;
}

function hashStepResult(hash: number, step: RuntimeStepResult): number {
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

function hashConfig(hash: number, config: RuntimeConfig): number {
  let h = hash >>> 0;
  h = fnv1a(h, config.mapLo >>> 0);
  h = fnv1a(h, config.mapHi >>> 0);
  h = fnv1a(h, config.startXQ8 | 0);
  h = fnv1a(h, config.startYQ8 | 0);
  h = fnv1a(h, config.startAngleDeg | 0);
  h = fnv1a(h, config.startHealth | 0);
  h = fnv1a(h, config.startAmmo | 0);
  return h >>> 0;
}

function sameStep(a: RuntimeStepResult, b: RuntimeStepResult): boolean {
  return (a.snapshotHash >>> 0) === (b.snapshotHash >>> 0) && (a.frameHash >>> 0) === (b.frameHash >>> 0) && (a.tick | 0) === (b.tick | 0);
}

function sameSnapshot(a: RuntimeSnapshot, b: RuntimeSnapshot): boolean {
  return (
    (a.mapLo >>> 0) === (b.mapLo >>> 0) &&
    (a.mapHi >>> 0) === (b.mapHi >>> 0) &&
    (a.xQ8 | 0) === (b.xQ8 | 0) &&
    (a.yQ8 | 0) === (b.yQ8 | 0) &&
    (a.angleDeg | 0) === (b.angleDeg | 0) &&
    (a.health | 0) === (b.health | 0) &&
    (a.ammo | 0) === (b.ammo | 0) &&
    (a.cooldown | 0) === (b.cooldown | 0) &&
    (a.flags | 0) === (b.flags | 0) &&
    (a.tick | 0) === (b.tick | 0) &&
    (a.hash >>> 0) === (b.hash >>> 0)
  );
}

export interface RuntimeParityScenario {
  id: string;
  config: RuntimeConfig;
  steps: RuntimeInput[];
}

export interface RuntimeTraceCapture {
  traceHash: number;
  steps: RuntimeStepResult[];
  finalSnapshot: RuntimeSnapshot;
}

export interface RuntimeParityMismatch {
  kind: 'step' | 'snapshot';
  index: number;
  input?: RuntimeInput;
  lhsStep?: RuntimeStepResult;
  rhsStep?: RuntimeStepResult;
  lhsSnapshot: RuntimeSnapshot;
  rhsSnapshot: RuntimeSnapshot;
}

export class RuntimeParityError extends Error {
  readonly scenario: RuntimeParityScenario;
  readonly mismatch: RuntimeParityMismatch;
  readonly lhsTraceHash: number;
  readonly rhsTraceHash: number;

  constructor(scenario: RuntimeParityScenario, mismatch: RuntimeParityMismatch, lhsTraceHash: number, rhsTraceHash: number) {
    super(`Runtime parity mismatch (${mismatch.kind}) at step ${mismatch.index} for scenario "${scenario.id}"`);
    this.scenario = scenario;
    this.mismatch = mismatch;
    this.lhsTraceHash = lhsTraceHash >>> 0;
    this.rhsTraceHash = rhsTraceHash >>> 0;
  }

  toJSON(): Record<string, unknown> {
    return {
      error: this.message,
      scenario: this.scenario,
      mismatch: this.mismatch,
      lhsTraceHash: this.lhsTraceHash >>> 0,
      rhsTraceHash: this.rhsTraceHash >>> 0,
    };
  }
}

export async function captureRuntimeTrace(port: RuntimePort, scenario: RuntimeParityScenario): Promise<RuntimeTraceCapture> {
  const steps: RuntimeStepResult[] = [];

  await port.init(scenario.config);
  port.reset();

  let hash = 2166136261 >>> 0;
  hash = hashConfig(hash, scenario.config);

  for (const input of scenario.steps) {
    hash = hashStepInput(hash, input);
    const step = port.step(input);
    steps.push(step);
    hash = hashStepResult(hash, step);
  }

  const finalSnapshot = port.snapshot();
  hash = hashSnapshot(hash, finalSnapshot);

  return {
    traceHash: hash >>> 0,
    steps,
    finalSnapshot,
  };
}

export function assertRuntimeTraceParity(
  scenario: RuntimeParityScenario,
  lhsTrace: RuntimeTraceCapture,
  rhsTrace: RuntimeTraceCapture,
): void {
  const len = Math.max(lhsTrace.steps.length, rhsTrace.steps.length);
  for (let i = 0; i < len; i++) {
    const lhsStep = lhsTrace.steps[i];
    const rhsStep = rhsTrace.steps[i];
    if (!lhsStep || !rhsStep || !sameStep(lhsStep, rhsStep)) {
      throw new RuntimeParityError(
        scenario,
        {
          kind: 'step',
          index: i,
          input: scenario.steps[i],
          lhsStep,
          rhsStep,
          lhsSnapshot: lhsTrace.finalSnapshot,
          rhsSnapshot: rhsTrace.finalSnapshot,
        },
        lhsTrace.traceHash,
        rhsTrace.traceHash,
      );
    }
  }

  if (!sameSnapshot(lhsTrace.finalSnapshot, rhsTrace.finalSnapshot)) {
    throw new RuntimeParityError(
      scenario,
      {
        kind: 'snapshot',
        index: scenario.steps.length,
        lhsSnapshot: lhsTrace.finalSnapshot,
        rhsSnapshot: rhsTrace.finalSnapshot,
      },
      lhsTrace.traceHash,
      rhsTrace.traceHash,
    );
  }
}

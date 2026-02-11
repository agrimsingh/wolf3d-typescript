export interface PhaseGateConfig {
  localRuns: number;
  ciRuns: number;
  seedPolicy: 'random' | 'fixed' | 'from-env';
}

export const phaseGateConfig: PhaseGateConfig = {
  localRuns: 1000,
  ciRuns: 10000,
  seedPolicy: 'from-env',
};

export function getNumRuns(): number {
  const raw = process.env.FAST_CHECK_NUM_RUNS;
  if (!raw) {
    return phaseGateConfig.localRuns;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return phaseGateConfig.localRuns;
  }
  return Math.floor(parsed);
}

export function getSeed(): number | undefined {
  const raw = process.env.FAST_CHECK_SEED;
  if (!raw) {
    return undefined;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return Math.floor(parsed);
}

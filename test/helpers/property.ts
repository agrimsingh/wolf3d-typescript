export function propertyNumRuns(): number {
  const raw = process.env.FAST_CHECK_NUM_RUNS;
  if (!raw) {
    return 1000;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1000;
  }
  return Math.floor(parsed);
}

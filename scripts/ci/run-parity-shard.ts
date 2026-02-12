import { execSync } from 'node:child_process';

const SHARDS: Record<string, string[]> = {
  '1': ['test/property/phase0.bridge.test.ts', 'test/property/phase1.math-fixed.test.ts', 'test/property/phase2.map-loading.test.ts'],
  '2': ['test/property/phase3.raycast.test.ts', 'test/property/phase4.actors-ai.test.ts', 'test/property/phase5.player-movement.test.ts'],
  '3': ['test/property/phase6.game-state.test.ts', 'test/property/phase7.menu-text.test.ts', 'test/property/phase8.audio.test.ts'],
  '4': [
    'test/property/runtime.required-symbols.test.ts',
    'test/property/runtime.step-parity.test.ts',
    'test/property/runtime.checkpoints.test.ts',
    'test/property/runtime.episode.test.ts',
  ],
};

function quoteArg(value: string): string {
  return `'${value.replace(/'/g, "'\"'\"'")}'`;
}

function main(): void {
  const shard = process.env.CI_PARITY_SHARD?.trim() || process.argv[2]?.trim() || '1';
  const tests = SHARDS[shard];
  if (!tests) {
    throw new Error(`Unknown parity shard "${shard}". Expected one of: ${Object.keys(SHARDS).join(', ')}`);
  }

  const numRuns = process.env.FAST_CHECK_NUM_RUNS?.trim() || '10000';
  const fileArgs = tests.map(quoteArg).join(' ');
  console.log(`Running parity shard ${shard} (${tests.length} files) at FAST_CHECK_NUM_RUNS=${numRuns}`);
  for (const testFile of tests) {
    console.log(` - ${testFile}`);
  }

  execSync(`FAST_CHECK_NUM_RUNS=${numRuns} pnpm vitest run ${fileArgs}`, { stdio: 'inherit' });
}

main();

import { execSync } from 'node:child_process';

type Rule = {
  match: RegExp;
  tests: string[];
};

const RULES: Rule[] = [
  { match: /^src\/wolf\/math\//, tests: ['test/property/phase1.math-fixed.test.ts'] },
  { match: /^src\/math\//, tests: ['test/property/phase1.math-fixed.test.ts'] },
  { match: /^src\/wolf\/map\//, tests: ['test/property/phase2.map-loading.test.ts'] },
  { match: /^src\/map\//, tests: ['test/property/phase2.map-loading.test.ts'] },
  { match: /^src\/wolf\/render\//, tests: ['test/property/phase3.raycast.test.ts'] },
  { match: /^src\/render\//, tests: ['test/property/phase3.raycast.test.ts'] },
  { match: /^src\/wolf\/ai\//, tests: ['test/property/phase4.actors-ai.test.ts'] },
  { match: /^src\/actors\//, tests: ['test/property/phase4.actors-ai.test.ts'] },
  { match: /^src\/wolf\/player\//, tests: ['test/property/phase5.player-movement.test.ts'] },
  { match: /^src\/player\//, tests: ['test/property/phase5.player-movement.test.ts'] },
  { match: /^src\/wolf\/game\//, tests: ['test/property/phase6.game-state.test.ts'] },
  { match: /^src\/game\//, tests: ['test/property/phase6.game-state.test.ts'] },
  { match: /^src\/wolf\/menu\//, tests: ['test/property/phase7.menu-text.test.ts'] },
  { match: /^src\/ui\//, tests: ['test/property/phase7.menu-text.test.ts'] },
  { match: /^src\/wolf\/audio\//, tests: ['test/property/phase8.audio.test.ts'] },
  { match: /^src\/audio\//, tests: ['test/property/phase8.audio.test.ts'] },
  {
    match: /^src\/runtime\//,
    tests: [
      'test/property/runtime.required-symbols.test.ts',
      'test/property/runtime.step-parity.test.ts',
      'test/property/runtime.checkpoints.test.ts',
      'test/property/runtime.episode.test.ts',
    ],
  },
  {
    match: /^src\/oracle\//,
    tests: [
      'test/property/phase0.bridge.test.ts',
      'test/property/runtime.required-symbols.test.ts',
      'test/property/runtime.step-parity.test.ts',
      'test/property/runtime.checkpoints.test.ts',
      'test/property/runtime.episode.test.ts',
    ],
  },
  {
    match: /^src\/app\//,
    tests: [
      'test/property/runtime.required-symbols.test.ts',
      'test/property/runtime.step-parity.test.ts',
      'test/property/runtime.checkpoints.test.ts',
      'test/property/runtime.episode.test.ts',
    ],
  },
  {
    match: /^scripts\/runtime\//,
    tests: [
      'test/property/runtime.required-symbols.test.ts',
      'test/property/runtime.step-parity.test.ts',
      'test/property/runtime.checkpoints.test.ts',
      'test/property/runtime.episode.test.ts',
    ],
  },
];

const FORCE_FULL_PATTERNS: RegExp[] = [/^c-oracle\//, /^scripts\/wasm\//, /^package\.json$/, /^pnpm-lock\.yaml$/, /^tsconfig\.json$/];

function execText(command: string): string {
  return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' });
}

function detectChangedFiles(): string[] {
  const baseRef = process.env.GITHUB_BASE_REF?.trim();
  const baseSha = process.env.GITHUB_BASE_SHA?.trim();

  if (baseSha) {
    return execText(`git diff --name-only ${baseSha}...HEAD`)
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  if (baseRef) {
    try {
      execSync(`git fetch --no-tags --depth=1 origin ${baseRef}`, { stdio: 'ignore' });
    } catch {
      // best effort
    }
    return execText(`git diff --name-only origin/${baseRef}...HEAD`)
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  return [];
}

function selectTests(changedFiles: string[]): { full: boolean; tests: string[] } {
  const tests = new Set<string>();
  let full = false;

  for (const file of changedFiles) {
    if (FORCE_FULL_PATTERNS.some((pattern) => pattern.test(file))) {
      full = true;
      break;
    }
    for (const rule of RULES) {
      if (rule.match.test(file)) {
        for (const test of rule.tests) {
          tests.add(test);
        }
      }
    }

    if (file.startsWith('test/property/')) {
      tests.add(file);
    }
  }

  if (changedFiles.length === 0) {
    full = true;
  }
  if (tests.size === 0 && !full) {
    tests.add('test/property/runtime.required-symbols.test.ts');
    tests.add('test/property/runtime.step-parity.test.ts');
  }

  return {
    full,
    tests: Array.from(tests).sort(),
  };
}

function quoteArg(value: string): string {
  return `'${value.replace(/'/g, "'\"'\"'")}'`;
}

function main(): void {
  const changedFiles = detectChangedFiles();
  const selection = selectTests(changedFiles);
  const numRuns = process.env.FAST_CHECK_NUM_RUNS?.trim() || '1000';

  if (selection.full) {
    console.log('PR parity selection: running full property suite.');
    execSync(`FAST_CHECK_NUM_RUNS=${numRuns} pnpm vitest run test/property`, { stdio: 'inherit' });
    return;
  }

  console.log('PR parity selection: running targeted property tests:');
  for (const file of selection.tests) {
    console.log(` - ${file}`);
  }
  const fileArgs = selection.tests.map(quoteArg).join(' ');
  execSync(`FAST_CHECK_NUM_RUNS=${numRuns} pnpm vitest run ${fileArgs}`, { stdio: 'inherit' });
}

main();

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type RuntimeHits = {
  requiredRuntimeSymbolIds: number[];
};

const REQUIRED_SYMBOL_TEST_COVERAGE = new Map<number, string>([
  [1, 'test/property/runtime.required-symbols.test.ts'],
  [2, 'test/property/runtime.required-symbols.test.ts'],
  [3, 'test/property/runtime.required-symbols.test.ts'],
  [4, 'test/property/runtime.required-symbols.test.ts'],
  [5, 'test/property/runtime.required-symbols.test.ts'],
  [6, 'test/property/runtime.required-symbols.test.ts'],
  [7, 'test/property/runtime.required-symbols.test.ts'],
  [8, 'test/property/runtime.required-symbols.test.ts'],
  [9, 'test/property/runtime.required-symbols.test.ts'],
  [10, 'test/property/runtime.required-symbols.test.ts'],
  [11, 'test/property/runtime.required-symbols.test.ts'],
  [12, 'test/property/runtime.required-symbols.test.ts'],
  [13, 'test/property/runtime.required-symbols.test.ts'],
  [14, 'test/property/runtime.required-symbols.test.ts'],
  [15, 'test/property/runtime.required-symbols.test.ts'],
  [16, 'test/property/runtime.required-symbols.test.ts'],
  [17, 'test/property/runtime.required-symbols.test.ts'],
  [18, 'test/property/runtime.required-symbols.test.ts'],
  [19, 'test/property/runtime.required-symbols.test.ts'],
]);

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const hitsPath = path.join(root, 'specs', 'generated', 'runtime-symbol-hits.json');
  const hits = JSON.parse(await readFile(hitsPath, 'utf8')) as RuntimeHits;

  const missingCoverage = hits.requiredRuntimeSymbolIds.filter((id) => !REQUIRED_SYMBOL_TEST_COVERAGE.has(id));
  if (missingCoverage.length > 0) {
    throw new Error(`Missing parity coverage mapping for required runtime symbols: ${missingCoverage.join(', ')}`);
  }

  console.log(`Required runtime symbol parity coverage verified (${hits.requiredRuntimeSymbolIds.length} symbols).`);
}

void main();

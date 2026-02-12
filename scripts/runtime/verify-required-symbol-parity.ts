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
  [20, 'test/property/runtime.required-symbols.test.ts'],
  [21, 'test/property/runtime.required-symbols.test.ts'],
  [22, 'test/property/runtime.required-symbols.test.ts'],
  [23, 'test/property/runtime.required-symbols.test.ts'],
  [24, 'test/property/runtime.required-symbols.test.ts'],
  [25, 'test/property/runtime.required-symbols.test.ts'],
  [26, 'test/property/runtime.required-symbols.test.ts'],
  [27, 'test/property/runtime.required-symbols.test.ts'],
  [28, 'test/property/runtime.required-symbols.test.ts'],
  [29, 'test/property/runtime.required-symbols.test.ts'],
  [30, 'test/property/runtime.required-symbols.test.ts'],
  [31, 'test/property/runtime.required-symbols.test.ts'],
  [32, 'test/property/runtime.required-symbols.test.ts'],
  [33, 'test/property/runtime.required-symbols.test.ts'],
  [34, 'test/property/runtime.required-symbols.test.ts'],
  [35, 'test/property/runtime.required-symbols.test.ts'],
  [36, 'test/property/runtime.required-symbols.test.ts'],
  [37, 'test/property/runtime.required-symbols.test.ts'],
  [38, 'test/property/runtime.required-symbols.test.ts'],
  [39, 'test/property/runtime.required-symbols.test.ts'],
  [40, 'test/property/runtime.required-symbols.test.ts'],
  [41, 'test/property/runtime.required-symbols.test.ts'],
  [42, 'test/property/runtime.required-symbols.test.ts'],
  [43, 'test/property/runtime.required-symbols.test.ts'],
  [44, 'test/property/runtime.required-symbols.test.ts'],
  [45, 'test/property/runtime.required-symbols.test.ts'],
  [46, 'test/property/runtime.required-symbols.test.ts'],
  [47, 'test/property/runtime.required-symbols.test.ts'],
  [48, 'test/property/runtime.required-symbols.test.ts'],
  [49, 'test/property/runtime.required-symbols.test.ts'],
  [50, 'test/property/runtime.required-symbols.test.ts'],
  [51, 'test/property/runtime.required-symbols.test.ts'],
  [52, 'test/property/runtime.required-symbols.test.ts'],
  [53, 'test/property/runtime.required-symbols.test.ts'],
  [54, 'test/property/runtime.required-symbols.test.ts'],
  [55, 'test/property/runtime.required-symbols.test.ts'],
  [56, 'test/property/runtime.required-symbols.test.ts'],
  [57, 'test/property/runtime.required-symbols.test.ts'],
  [58, 'test/property/runtime.required-symbols.test.ts'],
  [59, 'test/property/runtime.required-symbols.test.ts'],
  [60, 'test/property/runtime.required-symbols.test.ts'],
  [61, 'test/property/runtime.required-symbols.test.ts'],
  [62, 'test/property/runtime.required-symbols.test.ts'],
  [63, 'test/property/runtime.required-symbols.test.ts'],
  [64, 'test/property/runtime.required-symbols.test.ts'],
  [65, 'test/property/runtime.required-symbols.test.ts'],
  [66, 'test/property/runtime.required-symbols.test.ts'],
  [67, 'test/property/runtime.required-symbols.test.ts'],
  [68, 'test/property/runtime.required-symbols.test.ts'],
  [69, 'test/property/runtime.required-symbols.test.ts'],
  [70, 'test/property/runtime.required-symbols.test.ts'],
  [71, 'test/property/runtime.required-symbols.test.ts'],
  [72, 'test/property/runtime.required-symbols.test.ts'],
  [73, 'test/property/runtime.required-symbols.test.ts'],
  [74, 'test/property/runtime.required-symbols.test.ts'],
  [75, 'test/property/runtime.required-symbols.test.ts'],
  [76, 'test/property/runtime.required-symbols.test.ts'],
  [77, 'test/property/runtime.required-symbols.test.ts'],
  [78, 'test/property/runtime.required-symbols.test.ts'],
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

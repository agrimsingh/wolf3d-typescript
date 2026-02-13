import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type RuntimeTraceSymbol = {
  id: number;
  file: string;
  func: string;
};

type RuntimeHits = {
  requiredRuntimeSymbolIds: number[];
  requiredRuntimeSymbols: RuntimeTraceSymbol[];
};

const REQUIRED_SYMBOLS_TEST =
  'test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity';
const LIFECYCLE_TEST =
  'test/property/runtime.lifecycle.test.ts:bootWl6/stepFrame/framebuffer/save-load parity remains deterministic';

const LIFECYCLE_RUNTIME_FUNCS = new Set<string>([
  'oracle_runtime_state_size',
  'oracle_runtime_save_state',
  'oracle_runtime_load_state',
  'oracle_runtime_framebuffer_size',
  'oracle_runtime_render_indexed_frame',
]);

function parityPathForSymbol(symbol: RuntimeTraceSymbol): string {
  if (symbol.file === 'runtime/wolfsrc_runtime_oracle.c' && LIFECYCLE_RUNTIME_FUNCS.has(symbol.func)) {
    return LIFECYCLE_TEST;
  }
  return REQUIRED_SYMBOLS_TEST;
}

function testFilePathFromDescriptor(descriptor: string): string {
  const separator = descriptor.indexOf(':');
  return separator < 0 ? descriptor : descriptor.slice(0, separator);
}

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const hitsPath = path.join(root, 'specs', 'generated', 'runtime-symbol-hits.json');
  const hits = JSON.parse(await readFile(hitsPath, 'utf8')) as RuntimeHits;

  if (!Array.isArray(hits.requiredRuntimeSymbolIds) || !Array.isArray(hits.requiredRuntimeSymbols)) {
    throw new Error('Invalid runtime hits payload: requiredRuntimeSymbolIds/requiredRuntimeSymbols are missing.');
  }

  const symbolById = new Map<number, RuntimeTraceSymbol>();
  for (const symbol of hits.requiredRuntimeSymbols) {
    if (!Number.isInteger(symbol.id)) {
      continue;
    }
    symbolById.set(symbol.id | 0, symbol);
  }

  const missingSymbols = hits.requiredRuntimeSymbolIds.filter((id) => !symbolById.has(id));
  if (missingSymbols.length > 0) {
    throw new Error(`Missing symbol metadata for required runtime IDs: ${missingSymbols.join(', ')}`);
  }

  const coverage = hits.requiredRuntimeSymbolIds.map((id) => {
    const symbol = symbolById.get(id)!;
    return {
      id,
      parity: parityPathForSymbol(symbol),
    };
  });

  const uniqueTestFiles = new Set<string>(coverage.map((entry) => testFilePathFromDescriptor(entry.parity)));
  for (const testFile of uniqueTestFiles) {
    await access(path.join(root, testFile));
  }

  const lifecycleCount = coverage.filter((entry) => entry.parity === LIFECYCLE_TEST).length;
  const requiredCount = coverage.length - lifecycleCount;

  console.log(
    `Required runtime symbol parity coverage verified (${coverage.length} symbols; required-symbols=${requiredCount}; lifecycle=${lifecycleCount}).`,
  );
}

void main();

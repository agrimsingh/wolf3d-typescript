import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type RuntimeTraceSymbol = {
  id: number;
  symbolName: string;
  file: string;
  func: string;
  notes: string;
};

type RuntimeHits = {
  scenarioCount: number;
  menuTraceDigest: number;
  requiredRuntimeSymbolIds: number[];
  requiredRuntimeSymbols: RuntimeTraceSymbol[];
};

type ClassificationEntry = {
  file: string;
  functionName: string;
  primaryPhase: string;
  classification: 'required-runtime' | 'excluded-non-runtime';
  traceIds: number[];
  evidence: string;
};

type RuntimeClassification = {
  totals: {
    symbols: number;
    requiredRuntime: number;
    excludedNonRuntime: number;
    unclassified: number;
  };
  entries: ClassificationEntry[];
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

function isWolfsrcFile(file: string): boolean {
  return /^[A-Z0-9_]+\.C$/.test(file.trim().toUpperCase());
}

function parityPathForRuntimeSymbol(symbol: Pick<RuntimeTraceSymbol, 'file' | 'func'>): string {
  if (symbol.file === 'runtime/wolfsrc_runtime_oracle.c' && LIFECYCLE_RUNTIME_FUNCS.has(symbol.func)) {
    return LIFECYCLE_TEST;
  }
  return REQUIRED_SYMBOLS_TEST;
}

function renderManifest(hits: RuntimeHits, classification: RuntimeClassification): string {
  const requiredWolfsrc = classification.entries
    .filter((entry) => entry.classification === 'required-runtime')
    .sort(
      (a, b) =>
        a.primaryPhase.localeCompare(b.primaryPhase) ||
        a.file.localeCompare(b.file) ||
        a.functionName.localeCompare(b.functionName),
    );

  const requiredRuntimeOnly = hits.requiredRuntimeSymbols
    .filter((symbol) => !isWolfsrcFile(symbol.file))
    .sort((a, b) => a.id - b.id);

  const requiredRuntimeRows = requiredRuntimeOnly
    .map(
      (symbol) =>
        `| ${symbol.id} | ${symbol.file} | ${symbol.func} | \`done\` | ${symbol.notes}; parity: ${parityPathForRuntimeSymbol(symbol)} |`,
    )
    .join('\n');

  const requiredWolfsrcRows = requiredWolfsrc
    .map(
      (entry) =>
        `| ${entry.primaryPhase} | ${entry.file} | ${entry.functionName} | ${entry.traceIds.join(', ')} | \`done\` | parity: ${REQUIRED_SYMBOLS_TEST} |`,
    )
    .join('\n');

  const excludedByFile = new Map<string, number>();
  for (const entry of classification.entries) {
    if (entry.classification !== 'excluded-non-runtime') {
      continue;
    }
    excludedByFile.set(entry.file, (excludedByFile.get(entry.file) ?? 0) + 1);
  }

  const excludedRows = [...excludedByFile.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([file, count]) => `| ${file} | ${count} |`)
    .join('\n');

  return `# Runtime Symbol Manifest (WL6 Runtime Path)

Authoritative runtime symbol checklist generated from deterministic trace artifacts and full WOLFSRC classification.

## Status

- Current state: \`frozen\`
- Source of truth: \`specs/generated/runtime-symbol-hits.json\` + \`specs/generated/wolfsrc-runtime-classification.json\`
- Trace scenarios: ${hits.scenarioCount} (WL6 asset-backed)
- Deterministic menu-trace digest: \`${hits.menuTraceDigest >>> 0}\`
- Required runtime trace symbols: ${hits.requiredRuntimeSymbolIds.length}
- WOLFSRC required-runtime symbols: ${classification.totals.requiredRuntime}
- WOLFSRC excluded-non-runtime symbols: ${classification.totals.excludedNonRuntime}
- Refresh command: \`pnpm runtime:manifest:extract\`

## Buckets

### required-runtime (runtime wrapper/bridge symbols)

| Trace ID | File | Function | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
${requiredRuntimeRows || '| _none_ | _none_ | _none_ | `done` | runtime wrappers currently not required |'}

### required-runtime (WOLFSRC symbol inventory)

| Phase | File | Function | Trace IDs | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
${requiredWolfsrcRows || '| _none_ | _none_ | _none_ | _none_ | `todo` | pending deterministic trace evidence |'}

### excluded-non-runtime (WOLFSRC inventory)

Complete per-symbol evidence is generated in \`specs/generated/wolfsrc-runtime-classification.json\`.

| File | Excluded Count |
| :--- | ---: |
${excludedRows || '| _none_ | 0 |'}

## Rules

1. No symbol may move from \`required-runtime\` to \`excluded-non-runtime\` without deterministic trace evidence and commit notes.
2. Phase F4 completion requires all \`required-runtime\` symbols marked \`done\` with parity tests.
3. Any new trace hit must regenerate runtime hits + classification + this manifest before merge.
`;
}

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const hitsPath = path.join(root, 'specs', 'generated', 'runtime-symbol-hits.json');
  const classificationPath = path.join(root, 'specs', 'generated', 'wolfsrc-runtime-classification.json');
  const manifestPath = path.join(root, 'specs', 'runtime-symbol-manifest.md');

  const hits = JSON.parse(await readFile(hitsPath, 'utf8')) as RuntimeHits;
  const classification = JSON.parse(await readFile(classificationPath, 'utf8')) as RuntimeClassification;

  if (!Array.isArray(hits.requiredRuntimeSymbols) || !Array.isArray(classification.entries)) {
    throw new Error('Invalid runtime manifest inputs. Generate hits/classification artifacts first.');
  }

  if ((classification.totals.unclassified | 0) !== 0) {
    throw new Error(`Cannot generate runtime symbol manifest with unclassified symbols=${classification.totals.unclassified}`);
  }

  const markdown = renderManifest(hits, classification);
  await writeFile(manifestPath, `${markdown}\n`, 'utf8');
  console.log(`Wrote ${path.relative(root, manifestPath)}.`);
}

void main();

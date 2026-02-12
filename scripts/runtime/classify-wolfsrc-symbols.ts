import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type WolfsrcManifestEntry = {
  file: string;
  functionName: string;
  returnType: string;
  signature: string;
  line: number;
  phases: string[];
  primaryPhase: string;
};

type WolfsrcManifest = {
  generatedAt: string;
  total: number;
  entries: WolfsrcManifestEntry[];
};

type RuntimeRequiredSymbol = {
  id: number;
  file: string;
  func: string;
  notes: string;
};

type RuntimeHits = {
  scenarioCount: number;
  menuTraceDigest: number;
  requiredRuntimeSymbols: RuntimeRequiredSymbol[];
};

type SymbolClassification = 'required-runtime' | 'excluded-non-runtime';

type ClassificationEntry = {
  file: string;
  functionName: string;
  signature: string;
  line: number;
  primaryPhase: string;
  classification: SymbolClassification;
  traceIds: number[];
  evidence: string;
};

type RuntimeClassification = {
  generatedAt: string;
  sourceManifestPath: string;
  sourceRuntimeHitsPath: string;
  scenarioCount: number;
  menuTraceDigest: number;
  totals: {
    symbols: number;
    requiredRuntime: number;
    excludedNonRuntime: number;
    unclassified: number;
  };
  unmatchedRuntimeSymbols: Array<{
    file: string;
    func: string;
    traceIds: number[];
  }>;
  entries: ClassificationEntry[];
};

function toKey(file: string, func: string): string {
  return `${file.trim().toUpperCase()}::${func.trim()}`;
}

function isWolfsrcFile(file: string): boolean {
  return /^[A-Z0-9_]+\.C$/.test(file.trim().toUpperCase());
}

function normalizeRuntimeFunctionName(file: string, func: string): string {
  const fileName = file.trim().toUpperCase();
  const fn = func.trim();
  const alias = new Map<string, string>([
    ['ID_CA.C::CacheMap', 'CA_CacheMap'],
    ['ID_CA.C::CarmackExpand', 'CAL_CarmackExpand'],
    ['ID_CA.C::RLEWExpand', 'CA_RLEWexpand'],
    ['ID_CA.C::SetupMapFile', 'CAL_SetupMapFile'],
  ]);
  return alias.get(`${fileName}::${fn}`) ?? fn;
}

function renderSummaryMarkdown(classification: RuntimeClassification): string {
  const lines: string[] = [];
  lines.push('# WOLFSRC Runtime Symbol Classification');
  lines.push('');
  lines.push(`- Generated: ${classification.generatedAt}`);
  lines.push(`- Source manifest: \`${classification.sourceManifestPath}\``);
  lines.push(`- Runtime hits: \`${classification.sourceRuntimeHitsPath}\``);
  lines.push(`- Trace scenarios: ${classification.scenarioCount}`);
  lines.push(`- Menu trace digest: ${classification.menuTraceDigest >>> 0}`);
  lines.push('');
  lines.push('## Totals');
  lines.push('');
  lines.push(`- Total symbols: ${classification.totals.symbols}`);
  lines.push(`- Required runtime: ${classification.totals.requiredRuntime}`);
  lines.push(`- Excluded non-runtime: ${classification.totals.excludedNonRuntime}`);
  lines.push(`- Unclassified: ${classification.totals.unclassified}`);
  lines.push('');

  if (classification.unmatchedRuntimeSymbols.length > 0) {
    lines.push('## Unmatched Runtime Symbols');
    lines.push('');
    lines.push('| File | Function | Trace IDs |');
    lines.push('| :--- | :--- | :--- |');
    for (const symbol of classification.unmatchedRuntimeSymbols) {
      lines.push(`| ${symbol.file} | ${symbol.func} | ${symbol.traceIds.join(', ')} |`);
    }
    lines.push('');
  }

  lines.push('## Required Runtime Symbols');
  lines.push('');
  lines.push('| File | Function | Trace IDs | Primary Phase |');
  lines.push('| :--- | :--- | :--- | :--- |');
  for (const entry of classification.entries) {
    if (entry.classification !== 'required-runtime') {
      continue;
    }
    lines.push(`| ${entry.file} | ${entry.functionName} | ${entry.traceIds.join(', ')} | ${entry.primaryPhase} |`);
  }
  lines.push('');

  lines.push('## Excluded Non-Runtime Summary');
  lines.push('');
  lines.push('| File | Excluded Count |');
  lines.push('| :--- | ---: |');
  const excludedByFile = new Map<string, number>();
  for (const entry of classification.entries) {
    if (entry.classification !== 'excluded-non-runtime') {
      continue;
    }
    excludedByFile.set(entry.file, (excludedByFile.get(entry.file) ?? 0) + 1);
  }
  for (const [file, count] of [...excludedByFile.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`| ${file} | ${count} |`);
  }
  lines.push('');

  return `${lines.join('\n')}\n`;
}

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const manifestPath = path.join(root, 'specs', 'generated', 'wolfsrc-manifest.json');
  const runtimeHitsPath = path.join(root, 'specs', 'generated', 'runtime-symbol-hits.json');
  const outJsonPath = path.join(root, 'specs', 'generated', 'wolfsrc-runtime-classification.json');
  const outMdPath = path.join(root, 'specs', 'runtime-symbol-classification.md');

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as WolfsrcManifest;
  const runtimeHits = JSON.parse(await readFile(runtimeHitsPath, 'utf8')) as RuntimeHits;
  if (!Array.isArray(manifest.entries) || !Array.isArray(runtimeHits.requiredRuntimeSymbols)) {
    throw new Error('Invalid manifest inputs. Ensure runtime and symbol manifests are generated first.');
  }

  const requiredByKey = new Map<string, { file: string; func: string; traceIds: number[] }>();
  for (const symbol of runtimeHits.requiredRuntimeSymbols) {
    const file = symbol.file?.trim() ?? '';
    const func = normalizeRuntimeFunctionName(file, symbol.func?.trim() ?? '');
    if (!isWolfsrcFile(file) || func.length === 0) {
      continue;
    }
    const key = toKey(file, func);
    const current = requiredByKey.get(key);
    if (current) {
      current.traceIds.push(symbol.id | 0);
    } else {
      requiredByKey.set(key, { file, func, traceIds: [symbol.id | 0] });
    }
  }
  for (const value of requiredByKey.values()) {
    value.traceIds.sort((a, b) => a - b);
  }

  const matchedKeys = new Set<string>();
  const entries: ClassificationEntry[] = manifest.entries.map((entry) => {
    const key = toKey(entry.file, entry.functionName);
    const required = requiredByKey.get(key);
    if (required) {
      matchedKeys.add(key);
      return {
        file: entry.file,
        functionName: entry.functionName,
        signature: entry.signature,
        line: entry.line | 0,
        primaryPhase: entry.primaryPhase,
        classification: 'required-runtime',
        traceIds: required.traceIds,
        evidence: `Trace-hit via runtime manifest IDs ${required.traceIds.join(', ')}; scenarios=${runtimeHits.scenarioCount}; digest=${runtimeHits.menuTraceDigest >>> 0}.`,
      };
    }

    return {
      file: entry.file,
      functionName: entry.functionName,
      signature: entry.signature,
      line: entry.line | 0,
      primaryPhase: entry.primaryPhase,
      classification: 'excluded-non-runtime',
      traceIds: [],
      evidence: `No trace-hit in deterministic runtime manifest (${runtimeHits.scenarioCount} WL1 scenarios; digest=${runtimeHits.menuTraceDigest >>> 0}).`,
    };
  });

  const unmatchedRuntimeSymbols = [...requiredByKey.entries()]
    .filter(([key]) => !matchedKeys.has(key))
    .map(([, symbol]) => ({
      file: symbol.file,
      func: symbol.func,
      traceIds: symbol.traceIds,
    }))
    .sort((a, b) => `${a.file}::${a.func}`.localeCompare(`${b.file}::${b.func}`));

  const requiredRuntime = entries.filter((entry) => entry.classification === 'required-runtime').length;
  const excludedNonRuntime = entries.length - requiredRuntime;
  const classification: RuntimeClassification = {
    generatedAt: new Date().toISOString(),
    sourceManifestPath: 'specs/generated/wolfsrc-manifest.json',
    sourceRuntimeHitsPath: 'specs/generated/runtime-symbol-hits.json',
    scenarioCount: runtimeHits.scenarioCount | 0,
    menuTraceDigest: runtimeHits.menuTraceDigest >>> 0,
    totals: {
      symbols: entries.length,
      requiredRuntime,
      excludedNonRuntime,
      unclassified: 0,
    },
    unmatchedRuntimeSymbols,
    entries,
  };

  await mkdir(path.dirname(outJsonPath), { recursive: true });
  await writeFile(outJsonPath, `${JSON.stringify(classification, null, 2)}\n`, 'utf8');
  await writeFile(outMdPath, renderSummaryMarkdown(classification), 'utf8');

  console.log(
    `Wrote ${path.relative(root, outJsonPath)} (${classification.totals.symbols} symbols; required=${requiredRuntime}; excluded=${excludedNonRuntime}; unmatched=${unmatchedRuntimeSymbols.length}).`,
  );
  console.log(`Wrote ${path.relative(root, outMdPath)}.`);
}

void main();

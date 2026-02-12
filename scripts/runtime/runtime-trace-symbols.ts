import { readFile } from 'node:fs/promises';
import path from 'node:path';

const RUNTIME_TRACE_SOURCE_PATH = ['c-oracle', 'runtime', 'wolfsrc_runtime_oracle.c'] as const;
const RUNTIME_HITS_PATH = ['specs', 'generated', 'runtime-symbol-hits.json'] as const;

export type RuntimeTraceSymbolIndexEntry = {
  id: number;
  symbolName: string;
};

export type RuntimeTraceSymbolMetadata = RuntimeTraceSymbolIndexEntry & {
  file: string;
  func: string;
  notes: string;
};

type RuntimeHitsSymbol = {
  id: number;
  file: string;
  func: string;
  notes: string;
  symbolName?: string;
};

type RuntimeHitsPayload = {
  requiredRuntimeSymbols?: RuntimeHitsSymbol[];
  excludedRuntimeSymbols?: RuntimeHitsSymbol[];
};

function inferTraceMetadata(symbolName: string): Omit<RuntimeTraceSymbolMetadata, 'id' | 'symbolName'> {
  if (symbolName.startsWith('TRACE_ORACLE_RUNTIME_')) {
    const suffix = symbolName.slice('TRACE_ORACLE_RUNTIME_'.length).toLowerCase();
    return {
      file: 'runtime/wolfsrc_runtime_oracle.c',
      func: `oracle_runtime_${suffix}`,
      notes: `trace symbol ${symbolName}`,
    };
  }

  if (symbolName.startsWith('TRACE_ORACLE_')) {
    const suffix = symbolName.slice('TRACE_ORACLE_'.length).toLowerCase();
    return {
      file: 'c-oracle/wolf_oracle.c',
      func: `oracle_${suffix}`,
      notes: `trace symbol ${symbolName}`,
    };
  }

  return {
    file: 'unknown',
    func: `unknown_${symbolName.toLowerCase()}`,
    notes: `trace symbol ${symbolName} has no metadata mapping yet`,
  };
}

export async function parseRuntimeTraceSymbolIndex(root: string): Promise<RuntimeTraceSymbolIndexEntry[]> {
  const sourcePath = path.join(root, ...RUNTIME_TRACE_SOURCE_PATH);
  const source = await readFile(sourcePath, 'utf8');
  const enumMatch = source.match(/enum\s+runtime_trace_symbol_e\s*\{([\s\S]*?)\};/m);
  if (!enumMatch) {
    throw new Error(`Unable to find runtime trace enum in ${path.relative(root, sourcePath)}`);
  }

  const body = enumMatch[1] ?? '';
  const entryRegex = /\b(TRACE_[A-Z0-9_]+)\s*=\s*([0-9]+)\s*,?/g;
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  const entries: RuntimeTraceSymbolIndexEntry[] = [];

  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(body)) !== null) {
    const symbolName = match[1] ?? '';
    const id = Number(match[2]);
    if (!symbolName || !Number.isInteger(id)) {
      continue;
    }
    if (seenIds.has(id)) {
      throw new Error(`Duplicate runtime trace id ${id} in ${path.relative(root, sourcePath)}`);
    }
    if (seenNames.has(symbolName)) {
      throw new Error(`Duplicate runtime trace symbol ${symbolName} in ${path.relative(root, sourcePath)}`);
    }
    seenIds.add(id);
    seenNames.add(symbolName);
    entries.push({ id, symbolName });
  }

  if (entries.length === 0) {
    throw new Error(`No runtime trace symbols parsed from ${path.relative(root, sourcePath)}`);
  }

  return entries.sort((a, b) => a.id - b.id);
}

async function loadExistingRuntimeSymbolMetadata(root: string): Promise<Map<number, RuntimeHitsSymbol>> {
  const existingPath = path.join(root, ...RUNTIME_HITS_PATH);
  let payload: RuntimeHitsPayload | null = null;
  try {
    payload = JSON.parse(await readFile(existingPath, 'utf8')) as RuntimeHitsPayload;
  } catch {
    return new Map();
  }

  const map = new Map<number, RuntimeHitsSymbol>();
  for (const symbol of payload.requiredRuntimeSymbols ?? []) {
    if (!Number.isInteger(symbol.id)) {
      continue;
    }
    map.set(symbol.id | 0, symbol);
  }
  for (const symbol of payload.excludedRuntimeSymbols ?? []) {
    if (!Number.isInteger(symbol.id)) {
      continue;
    }
    if (!map.has(symbol.id | 0)) {
      map.set(symbol.id | 0, symbol);
    }
  }
  return map;
}

export async function buildRuntimeTraceSymbolMetadata(root: string): Promise<RuntimeTraceSymbolMetadata[]> {
  const [traceSymbols, existingById] = await Promise.all([
    parseRuntimeTraceSymbolIndex(root),
    loadExistingRuntimeSymbolMetadata(root),
  ]);

  return traceSymbols.map((entry) => {
    const existing = existingById.get(entry.id);
    if (existing?.file && existing.func) {
      return {
        id: entry.id,
        symbolName: entry.symbolName,
        file: existing.file,
        func: existing.func,
        notes: existing.notes || `trace symbol ${entry.symbolName}`,
      };
    }

    const inferred = inferTraceMetadata(entry.symbolName);
    return {
      id: entry.id,
      symbolName: entry.symbolName,
      ...inferred,
    };
  });
}

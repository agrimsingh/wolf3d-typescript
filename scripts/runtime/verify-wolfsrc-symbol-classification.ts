import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type WolfsrcManifestEntry = {
  file: string;
  functionName: string;
};

type WolfsrcManifest = {
  total: number;
  entries: WolfsrcManifestEntry[];
};

type ClassificationEntry = {
  file: string;
  functionName: string;
  classification: 'required-runtime' | 'excluded-non-runtime' | 'unclassified';
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

function toKey(file: string, functionName: string): string {
  return `${file.trim().toUpperCase()}::${functionName.trim()}`;
}

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const manifestPath = path.join(root, 'specs', 'generated', 'wolfsrc-manifest.json');
  const classificationPath = path.join(root, 'specs', 'generated', 'wolfsrc-runtime-classification.json');

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as WolfsrcManifest;
  const classification = JSON.parse(await readFile(classificationPath, 'utf8')) as RuntimeClassification;

  if (!Array.isArray(manifest.entries) || !Array.isArray(classification.entries)) {
    throw new Error('Invalid symbol manifest or runtime classification payload.');
  }

  if ((manifest.total | 0) !== manifest.entries.length) {
    throw new Error(`Manifest total mismatch: total=${manifest.total} entries=${manifest.entries.length}`);
  }
  if ((classification.totals.symbols | 0) !== classification.entries.length) {
    throw new Error(`Classification total mismatch: totals.symbols=${classification.totals.symbols} entries=${classification.entries.length}`);
  }
  if (classification.entries.length !== manifest.entries.length) {
    throw new Error(`Classification entries mismatch: classification=${classification.entries.length} manifest=${manifest.entries.length}`);
  }
  if ((classification.totals.unclassified | 0) !== 0) {
    throw new Error(`Expected zero unclassified symbols, got ${classification.totals.unclassified}`);
  }

  const manifestKeys = new Set<string>();
  const manifestKeyCounts = new Map<string, number>();
  for (const entry of manifest.entries) {
    const key = toKey(entry.file, entry.functionName);
    manifestKeys.add(key);
    manifestKeyCounts.set(key, (manifestKeyCounts.get(key) ?? 0) + 1);
  }

  const classificationKeyCounts = new Map<string, number>();
  let requiredCount = 0;
  let excludedCount = 0;
  for (const entry of classification.entries) {
    const key = toKey(entry.file, entry.functionName);
    if (!manifestKeys.has(key)) {
      throw new Error(`Classification entry not present in manifest: ${entry.file}::${entry.functionName}`);
    }
    classificationKeyCounts.set(key, (classificationKeyCounts.get(key) ?? 0) + 1);

    if (!entry.evidence || entry.evidence.trim().length === 0) {
      throw new Error(`Classification evidence is empty for ${entry.file}::${entry.functionName}`);
    }

    if (entry.classification === 'required-runtime') {
      requiredCount += 1;
      if (!Array.isArray(entry.traceIds) || entry.traceIds.length === 0) {
        throw new Error(`Required runtime symbol missing trace IDs: ${entry.file}::${entry.functionName}`);
      }
    } else if (entry.classification === 'excluded-non-runtime') {
      excludedCount += 1;
    } else {
      throw new Error(`Unsupported classification value for ${entry.file}::${entry.functionName}: ${entry.classification}`);
    }
  }

  if (classificationKeyCounts.size !== manifestKeyCounts.size) {
    throw new Error(`Classification key mismatch: classified=${classificationKeyCounts.size} manifest=${manifestKeyCounts.size}`);
  }
  for (const [key, expected] of manifestKeyCounts.entries()) {
    const actual = classificationKeyCounts.get(key) ?? 0;
    if (actual !== expected) {
      throw new Error(`Classification multiplicity mismatch for ${key}: expected=${expected} actual=${actual}`);
    }
  }
  if ((classification.totals.requiredRuntime | 0) !== requiredCount) {
    throw new Error(`Required count mismatch: totals.requiredRuntime=${classification.totals.requiredRuntime} actual=${requiredCount}`);
  }
  if ((classification.totals.excludedNonRuntime | 0) !== excludedCount) {
    throw new Error(`Excluded count mismatch: totals.excludedNonRuntime=${classification.totals.excludedNonRuntime} actual=${excludedCount}`);
  }

  console.log(
    `WOLFSRC symbol classification verified (${classification.entries.length} total; required=${requiredCount}; excluded=${excludedCount}; unclassified=0).`,
  );
}

void main();

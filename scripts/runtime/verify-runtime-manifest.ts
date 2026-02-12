import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type RuntimeHits = {
  scenarioCount: number;
  menuTraceDigest: number;
  requiredRuntimeSymbolIds: number[];
};

type RuntimeLock = {
  phase: string;
  scenarioCount: number;
  menuTraceDigest: number;
  requiredRuntimeSymbolIds: number[];
};

function isSortedUnique(values: number[]): boolean {
  for (let i = 0; i < values.length; i++) {
    if (!Number.isInteger(values[i])) return false;
    if (i > 0 && values[i]! <= values[i - 1]!) return false;
  }
  return true;
}

function sameArray(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if ((a[i]! | 0) !== (b[i]! | 0)) return false;
  }
  return true;
}

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const hitsPath = path.join(root, 'specs', 'generated', 'runtime-symbol-hits.json');
  const lockPath = path.join(root, 'specs', 'generated', 'runtime-symbol-lock.json');

  const hits = JSON.parse(await readFile(hitsPath, 'utf8')) as RuntimeHits;
  const lock = JSON.parse(await readFile(lockPath, 'utf8')) as RuntimeLock;

  if (lock.phase !== 'R2') {
    throw new Error(`Expected lock.phase to be "R2", got "${lock.phase}"`);
  }
  if (!isSortedUnique(hits.requiredRuntimeSymbolIds)) {
    throw new Error('requiredRuntimeSymbolIds must be sorted unique integers');
  }
  if (hits.scenarioCount !== lock.scenarioCount) {
    throw new Error(`scenarioCount mismatch: generated=${hits.scenarioCount}, lock=${lock.scenarioCount}`);
  }
  if ((hits.menuTraceDigest >>> 0) !== (lock.menuTraceDigest >>> 0)) {
    throw new Error(`menuTraceDigest mismatch: generated=${hits.menuTraceDigest >>> 0}, lock=${lock.menuTraceDigest >>> 0}`);
  }
  if (!sameArray(hits.requiredRuntimeSymbolIds, lock.requiredRuntimeSymbolIds)) {
    throw new Error('requiredRuntimeSymbolIds mismatch against lock file');
  }

  console.log('Runtime manifest lock verification passed.');
}

void main();

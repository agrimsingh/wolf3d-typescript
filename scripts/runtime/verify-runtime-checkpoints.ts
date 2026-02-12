import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RuntimeCheckpointArtifact } from './runtime-checkpoints';

function equalCheckpoints(generated: RuntimeCheckpointArtifact, lock: RuntimeCheckpointArtifact): boolean {
  return JSON.stringify(generated) === JSON.stringify(lock);
}

function assertSortedUniqueMapIndexes(checkpoints: RuntimeCheckpointArtifact): void {
  let previous = -1;
  for (const checkpoint of checkpoints.checkpoints) {
    if (!Number.isInteger(checkpoint.mapIndex) || checkpoint.mapIndex < 0) {
      throw new Error(`Invalid mapIndex in checkpoint ${checkpoint.id}: ${checkpoint.mapIndex}`);
    }
    if (checkpoint.mapIndex <= previous) {
      throw new Error('Runtime checkpoints must be sorted by unique ascending mapIndex.');
    }
    previous = checkpoint.mapIndex;
  }
}

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const generatedPath = path.join(root, 'specs', 'generated', 'runtime-checkpoints.json');
  const lockPath = path.join(root, 'specs', 'generated', 'runtime-checkpoints-lock.json');

  const generated = JSON.parse(await readFile(generatedPath, 'utf8')) as RuntimeCheckpointArtifact;
  const lock = JSON.parse(await readFile(lockPath, 'utf8')) as RuntimeCheckpointArtifact;

  if (lock.phase !== 'R5') {
    throw new Error(`Expected lock.phase to be "R5", got "${lock.phase}"`);
  }
  if (generated.phase !== 'R5') {
    throw new Error(`Expected generated.phase to be "R5", got "${generated.phase}"`);
  }
  assertSortedUniqueMapIndexes(generated);
  assertSortedUniqueMapIndexes(lock);

  if (!equalCheckpoints(generated, lock)) {
    throw new Error('Runtime checkpoint artifact drifted from lock. Re-run `pnpm runtime:checkpoints:generate` and update lock if intentional.');
  }

  console.log(`Runtime checkpoint lock verification passed (${generated.scenarioCount} scenarios).`);
  console.log(`checkpointDigest=${generated.checkpointDigest >>> 0}`);
}

void main();

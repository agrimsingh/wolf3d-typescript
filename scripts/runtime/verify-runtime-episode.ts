import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RuntimeEpisodeArtifact } from './runtime-episode';

function sameJson(a: RuntimeEpisodeArtifact, b: RuntimeEpisodeArtifact): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function assertContiguousMapOrder(artifact: RuntimeEpisodeArtifact): void {
  for (let i = 0; i < artifact.mapOrder.length; i++) {
    const expected = i | 0;
    if ((artifact.mapOrder[i] | 0) !== expected) {
      throw new Error(`Expected contiguous map order; found ${artifact.mapOrder[i]} at index ${i}`);
    }
  }
}

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const generatedPath = path.join(root, 'specs', 'generated', 'runtime-episode-checkpoints.json');
  const lockPath = path.join(root, 'specs', 'generated', 'runtime-episode-checkpoints-lock.json');

  const generated = JSON.parse(await readFile(generatedPath, 'utf8')) as RuntimeEpisodeArtifact;
  const lock = JSON.parse(await readFile(lockPath, 'utf8')) as RuntimeEpisodeArtifact;

  if (generated.phase !== 'R7' || lock.phase !== 'R7') {
    throw new Error(`Expected phase R7 in generated/lock artifacts (got ${generated.phase} and ${lock.phase})`);
  }
  assertContiguousMapOrder(generated);
  assertContiguousMapOrder(lock);

  if (!sameJson(generated, lock)) {
    throw new Error('Runtime episode artifact drifted from lock. Re-run `pnpm runtime:episode:generate` and update lock if intentional.');
  }

  console.log(`Runtime episode lock verification passed (${generated.scenarioCount} maps).`);
  console.log(`episodeDigest=${generated.episodeDigest >>> 0}`);
}

void main();

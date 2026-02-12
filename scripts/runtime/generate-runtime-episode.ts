import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeRuntimeEpisodeArtifact } from './runtime-episode';

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const generatedDir = path.join(root, 'specs', 'generated');
  const outputPath = path.join(generatedDir, 'runtime-episode-checkpoints.json');

  const artifact = await computeRuntimeEpisodeArtifact(root, 64);
  await mkdir(generatedDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');

  console.log(`Wrote runtime episode artifact to ${outputPath}`);
  console.log(`episodeDigest=${artifact.episodeDigest >>> 0}`);
}

void main();

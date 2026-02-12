import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeRuntimeCheckpoints } from './runtime-checkpoints';

async function main(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const generatedDir = path.join(root, 'specs', 'generated');
  const outputPath = path.join(generatedDir, 'runtime-checkpoints.json');

  const checkpoints = await computeRuntimeCheckpoints(root);
  await mkdir(generatedDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(checkpoints, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${checkpoints.scenarioCount} runtime checkpoints to ${outputPath}`);
  console.log(`checkpointDigest=${checkpoints.checkpointDigest >>> 0}`);
}

void main();

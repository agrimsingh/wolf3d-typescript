import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function listJsonFiles(root: string): Promise<string[]> {
  try {
    const entries = await readdir(root, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const full = path.join(root, entry.name);
      if (entry.isDirectory()) {
        const child = await listJsonFiles(full);
        files.push(...child);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(full);
      }
    }
    return files.sort();
  } catch {
    return [];
  }
}

async function maybeReadJson(filePath: string): Promise<Record<string, unknown> | null> {
  try {
    const text = await readFile(filePath, 'utf8');
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const root = process.cwd();
  const reproRoot = path.join(root, 'test', 'repro');
  const artifactsDir = path.join(root, 'artifacts');
  const summaryPath = path.join(artifactsDir, 'ci-triage-summary.md');

  const reproFiles = await listJsonFiles(reproRoot);
  const runtimeEpisode = await maybeReadJson(path.join(root, 'specs', 'generated', 'runtime-episode-checkpoints.json'));
  const runtimeCheckpoints = await maybeReadJson(path.join(root, 'specs', 'generated', 'runtime-checkpoints.json'));

  const lines: string[] = [];
  lines.push('# CI Triage Summary');
  lines.push('');
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Repro Artifacts');
  if (reproFiles.length === 0) {
    lines.push('- none');
  } else {
    for (const file of reproFiles) {
      lines.push(`- ${path.relative(root, file)}`);
    }
  }
  lines.push('');
  lines.push('## Runtime Digests');
  const episodeDigest = Number(runtimeEpisode?.episodeDigest ?? NaN);
  const checkpointDigest = Number(runtimeCheckpoints?.checkpointDigest ?? NaN);
  lines.push(`- runtime episode digest: ${Number.isFinite(episodeDigest) ? (episodeDigest >>> 0).toString() : 'n/a'}`);
  lines.push(`- runtime checkpoint digest: ${Number.isFinite(checkpointDigest) ? (checkpointDigest >>> 0).toString() : 'n/a'}`);
  lines.push('');

  await mkdir(artifactsDir, { recursive: true });
  await writeFile(summaryPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Wrote triage summary to ${summaryPath}`);
}

void main();

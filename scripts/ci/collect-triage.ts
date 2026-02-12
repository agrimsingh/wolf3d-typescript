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

function asUint(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return null;
  }
  return n >>> 0;
}

function formatDigestDiff(label: string, generated: Record<string, unknown> | null, lock: Record<string, unknown> | null, key: string): string {
  const generatedDigest = asUint(generated?.[key]);
  const lockDigest = asUint(lock?.[key]);
  if (generatedDigest === null || lockDigest === null) {
    return `- ${label}: n/a`;
  }
  const status = generatedDigest === lockDigest ? 'match' : 'drift';
  return `- ${label}: generated=${generatedDigest} lock=${lockDigest} status=${status}`;
}

function describeRepro(record: Record<string, unknown>, fallbackPath: string): string {
  const suite = String(record.suite ?? 'unknown');
  const seed = Number(record.seed ?? NaN);
  const path = String(record.path ?? '');
  const seedText = Number.isFinite(seed) ? String(seed | 0) : 'n/a';
  const pathText = path.trim().length > 0 ? path : 'n/a';
  return `- ${fallbackPath} (suite=${suite}, seed=${seedText}, path=${pathText})`;
}

async function main(): Promise<void> {
  const root = process.cwd();
  const reproRoot = path.join(root, 'test', 'repro');
  const artifactsDir = path.join(root, 'artifacts');
  const summaryPath = path.join(artifactsDir, 'ci-triage-summary.md');

  const reproFiles = await listJsonFiles(reproRoot);
  const runtimeEpisode = await maybeReadJson(path.join(root, 'specs', 'generated', 'runtime-episode-checkpoints.json'));
  const runtimeEpisodeLock = await maybeReadJson(path.join(root, 'specs', 'generated', 'runtime-episode-checkpoints-lock.json'));
  const runtimeCheckpoints = await maybeReadJson(path.join(root, 'specs', 'generated', 'runtime-checkpoints.json'));
  const runtimeCheckpointsLock = await maybeReadJson(path.join(root, 'specs', 'generated', 'runtime-checkpoints-lock.json'));

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
      const rel = path.relative(root, file);
      const record = await maybeReadJson(file);
      if (!record) {
        lines.push(`- ${rel}`);
        continue;
      }
      lines.push(describeRepro(record, rel));
    }
  }
  lines.push('');
  lines.push('## Runtime Trace Diffs');
  lines.push(formatDigestDiff('runtime episode digest', runtimeEpisode, runtimeEpisodeLock, 'episodeDigest'));
  lines.push(formatDigestDiff('runtime checkpoint digest', runtimeCheckpoints, runtimeCheckpointsLock, 'checkpointDigest'));
  lines.push('');

  await mkdir(artifactsDir, { recursive: true });
  await writeFile(summaryPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Wrote triage summary to ${summaryPath}`);
}

void main();

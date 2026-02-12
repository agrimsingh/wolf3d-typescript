import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

interface LockedFile {
  path: string;
  size: number;
  sha256: string;
}

interface LockFile {
  kind: 'wl6-raw' | 'wl6-modern';
  generatedAt: string;
  source: Record<string, string>;
  files: LockedFile[];
}

const rootDir = resolve(process.cwd());
const manifestDir = resolve(rootDir, 'assets', 'manifests');
const wl6RawDir = resolve(rootDir, 'assets', 'wl6', 'raw');
const wl6ModernDir = resolve(rootDir, 'assets', 'wl6-modern');

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true })
    .map((entry) => entry)
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function fileDigest(path: string): LockedFile {
  const bytes = readFileSync(path);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  return {
    path: relative(rootDir, path).replace(/\\/g, '/'),
    size: bytes.length,
    sha256,
  };
}

function readSource(path: string): Record<string, string> {
  if (!existsSync(path)) {
    return {};
  }
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>;
  return parsed;
}

function buildLock(kind: 'wl6-raw' | 'wl6-modern', dir: string, sourceFile: string): LockFile {
  if (!existsSync(dir)) {
    throw new Error(`Directory missing: ${relative(rootDir, dir)}`);
  }
  const files = walkFiles(dir).map(fileDigest);
  return {
    kind,
    generatedAt: new Date().toISOString(),
    source: readSource(sourceFile),
    files,
  };
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function main(): void {
  const rawLock = buildLock('wl6-raw', wl6RawDir, resolve(manifestDir, 'wl6-source.json'));
  const modernLock = buildLock('wl6-modern', wl6ModernDir, resolve(manifestDir, 'wl6-modern-source.json'));

  writeJson(resolve(manifestDir, 'wl6-raw-lock.json'), rawLock);
  writeJson(resolve(manifestDir, 'wl6-modern-lock.json'), modernLock);

  console.log(`Wrote ${rawLock.files.length} WL6 raw file lock entries.`);
  console.log(`Wrote ${modernLock.files.length} WL6 modern file lock entries.`);
}

main();

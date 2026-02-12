import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

interface LockedFile {
  path: string;
  size: number;
  sha256: string;
}

interface LockFile {
  kind: 'wl6-raw' | 'wl6-modern';
  files: LockedFile[];
}

const root = resolve(process.cwd());
const manifestsRoot = resolve(root, 'assets', 'manifests');
const rawRoot = resolve(root, 'assets', 'wl6', 'raw');
const modernRoot = resolve(root, 'assets', 'wl6-modern');

const requiredRaw = ['MAPHEAD.WL6', 'GAMEMAPS.WL6', 'VSWAP.WL6'];
const requiredModernAnchors = [
  'textures/walls.png',
  'sprites/ui/menu-and-miscellaneous.png',
  'sprites/ui/hud.png',
  'sprites/objects/objects.png',
  'sounds/misc/opendoorsnd.wav',
  'sounds/weapons/atkpistolsnd.wav',
];

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const entries = readdirSync(dir).sort((a, b) => a.localeCompare(b));
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else if (st.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function loadLock(path: string): LockFile {
  if (!existsSync(path)) {
    throw new Error(`Missing lock file: ${relative(root, path)}`);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as LockFile;
}

function verifyLock(lock: LockFile): void {
  for (const entry of lock.files) {
    const full = resolve(root, entry.path);
    if (!existsSync(full)) {
      throw new Error(`Missing locked file: ${entry.path}`);
    }
    const size = statSync(full).size;
    if (size !== entry.size) {
      throw new Error(`Size mismatch for ${entry.path}: expected ${entry.size}, got ${size}`);
    }
    const digest = sha256(full);
    if (digest !== entry.sha256) {
      throw new Error(`Checksum mismatch for ${entry.path}: expected ${entry.sha256}, got ${digest}`);
    }
  }
}

function verifyNoExtras(lock: LockFile, dir: string): void {
  const actual = walk(dir)
    .map((file) => relative(root, file).replace(/\\/g, '/'))
    .sort((a, b) => a.localeCompare(b));
  const locked = lock.files.map((entry) => entry.path).sort((a, b) => a.localeCompare(b));

  if (actual.length !== locked.length) {
    throw new Error(
      `File count mismatch for ${relative(root, dir)}: expected ${locked.length}, got ${actual.length}`,
    );
  }

  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== locked[i]) {
      throw new Error(
        `File set mismatch for ${relative(root, dir)}: expected ${locked[i]} at index ${i}, got ${actual[i]}`,
      );
    }
  }
}

function main(): void {
  for (const file of requiredRaw) {
    const path = resolve(rawRoot, file);
    if (!existsSync(path)) {
      throw new Error(`Missing required WL6 raw file: assets/wl6/raw/${file}`);
    }
  }

  for (const rel of requiredModernAnchors) {
    const path = resolve(modernRoot, rel);
    if (!existsSync(path)) {
      throw new Error(`Missing required modern WL6 asset: assets/wl6-modern/${rel}`);
    }
  }

  const rawLock = loadLock(resolve(manifestsRoot, 'wl6-raw-lock.json'));
  const modernLock = loadLock(resolve(manifestsRoot, 'wl6-modern-lock.json'));

  verifyLock(rawLock);
  verifyLock(modernLock);
  verifyNoExtras(rawLock, rawRoot);
  verifyNoExtras(modernLock, modernRoot);

  console.log('WL6 assets valid.');
  console.log(`Raw files locked: ${rawLock.files.length}`);
  console.log(`Modern files locked: ${modernLock.files.length}`);
}

main();

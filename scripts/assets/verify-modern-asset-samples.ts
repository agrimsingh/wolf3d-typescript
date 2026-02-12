import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PNG } from 'pngjs';
import {
  type ModernAssetMap,
  type ModernAssetMapEntry,
  indexModernAssetMap,
} from '../../src/assets/modernAssetMap';

interface SampleLockEntry {
  targetKind: string;
  targetId: string;
  sha256: string;
}

interface SampleLockFile {
  version: number;
  generatedAt?: string;
  samples: SampleLockEntry[];
}

const root = resolve(process.cwd());
const manifestPath = resolve(root, 'assets', 'manifests', 'modern-asset-map.json');
const lockPath = resolve(root, 'assets', 'manifests', 'modern-asset-samples-lock.json');
const modernRoot = resolve(root, 'assets', 'wl6-modern');
const writeMode = process.argv.includes('--write');

const SAMPLE_KEYS = [
  'wallTexture:wall.stone.01',
  'wallTexture:ui.achtung.sign',
  'uiSprite:ui.hud.panel',
  'actorSheet:actor.guard.sheet',
  'soundEffect:sfx.door.open',
  'soundEffect:sfx.weapon.pistol',
] as const;

function hashBytes(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function materializeImageHash(entry: ModernAssetMapEntry): string {
  if (!entry.rect) {
    throw new Error(`Image entry ${entry.targetId} missing rect`);
  }
  const bytes = readFileSync(resolve(modernRoot, entry.sourceFile));
  const png = PNG.sync.read(bytes);
  const { x, y, w, h } = entry.rect;

  const out = Buffer.allocUnsafe(w * h * 4);
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      let srcX = x + col;
      let srcY = y + row;

      if (entry.flipX) srcX = x + (w - 1 - col);
      if (entry.flipY) srcY = y + (h - 1 - row);
      if (entry.rotate90) {
        srcX = x + row;
        srcY = y + (w - 1 - col);
      }

      const srcOffset = (srcY * png.width + srcX) * 4;
      const dstOffset = (row * w + col) * 4;
      out[dstOffset] = png.data[srcOffset] ?? 0;
      out[dstOffset + 1] = png.data[srcOffset + 1] ?? 0;
      out[dstOffset + 2] = png.data[srcOffset + 2] ?? 0;
      out[dstOffset + 3] = png.data[srcOffset + 3] ?? 0;
    }
  }

  return hashBytes(out);
}

function materializeSoundHash(entry: ModernAssetMapEntry): string {
  const bytes = readFileSync(resolve(modernRoot, entry.sourceFile));
  return hashBytes(bytes);
}

function computeHash(entry: ModernAssetMapEntry): string {
  if (entry.targetKind === 'soundEffect') {
    return materializeSoundHash(entry);
  }
  return materializeImageHash(entry);
}

function main(): void {
  if (!existsSync(manifestPath)) {
    throw new Error(`Missing manifest file: ${manifestPath}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ModernAssetMap;
  const indexed = indexModernAssetMap(manifest);

  const samples: SampleLockEntry[] = SAMPLE_KEYS.map((key) => {
    const entry = indexed.get(key);
    if (!entry) {
      throw new Error(`Sample key not found in manifest: ${key}`);
    }
    return {
      targetKind: entry.targetKind,
      targetId: entry.targetId,
      sha256: computeHash(entry),
    };
  });

  if (writeMode) {
    const lock: SampleLockFile = {
      version: 1,
      generatedAt: new Date().toISOString(),
      samples,
    };
    writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
    console.log(`Wrote sample lock file: ${lockPath}`);
    return;
  }

  if (!existsSync(lockPath)) {
    throw new Error(`Missing sample lock file: ${lockPath}`);
  }

  const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as SampleLockFile;
  const expected = new Map(lock.samples.map((entry) => [`${entry.targetKind}:${entry.targetId}`, entry.sha256]));

  for (const sample of samples) {
    const key = `${sample.targetKind}:${sample.targetId}`;
    const expectedHash = expected.get(key);
    if (!expectedHash) {
      throw new Error(`Lock file missing sample: ${key}`);
    }
    if (expectedHash !== sample.sha256) {
      throw new Error(`Sample hash mismatch for ${key}: expected ${expectedHash}, got ${sample.sha256}`);
    }
  }

  console.log(`Modern asset sample hashes verified (${samples.length} samples).`);
}

main();

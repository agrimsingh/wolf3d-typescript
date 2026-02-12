import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PNG } from 'pngjs';
import {
  type ModernAssetMap,
  validateModernAssetMap,
} from '../../src/assets/modernAssetMap';

const root = resolve(process.cwd());
const manifestPath = resolve(root, 'assets', 'manifests', 'modern-asset-map.json');
const modernRoot = resolve(root, 'assets', 'wl6-modern');

function loadManifest(): ModernAssetMap {
  if (!existsSync(manifestPath)) {
    throw new Error(`Missing manifest: ${manifestPath}`);
  }
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as ModernAssetMap;
}

function main(): void {
  const manifest = loadManifest();
  const validation = validateModernAssetMap(manifest);

  for (const warning of validation.warnings) {
    console.warn(`WARN: ${warning}`);
  }

  for (const entry of manifest.entries) {
    const sourcePath = resolve(modernRoot, entry.sourceFile);
    if (!existsSync(sourcePath)) {
      validation.errors.push(`Missing source file for ${entry.targetId}: ${entry.sourceFile}`);
      continue;
    }

    if (entry.targetKind !== 'soundEffect') {
      const bytes = readFileSync(sourcePath);
      const png = PNG.sync.read(bytes);
      if (!entry.rect) {
        validation.errors.push(`Missing rect for image entry ${entry.targetId}`);
        continue;
      }
      const maxX = entry.rect.x + entry.rect.w;
      const maxY = entry.rect.y + entry.rect.h;
      if (maxX > png.width || maxY > png.height) {
        validation.errors.push(
          `Out-of-bounds rect for ${entry.targetId}: rect=${JSON.stringify(entry.rect)} image=${png.width}x${png.height}`,
        );
      }

      if (entry.targetId === 'ui.achtung.sign') {
        if (entry.flipX || entry.flipY || entry.rotate90) {
          validation.errors.push('ui.achtung.sign must not be flipped or rotated.');
        }
      }
    }
  }

  if (validation.errors.length > 0) {
    for (const error of validation.errors) {
      console.error(`ERROR: ${error}`);
    }
    process.exit(1);
  }

  console.log(`Modern asset map valid: ${manifest.entries.length} entries`);
}

main();

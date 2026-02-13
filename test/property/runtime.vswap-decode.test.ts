import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildMapPlanes,
  decodeSpriteColumnPosts,
  decodeVswapIndex,
  decodeWallTexture,
} from '../../src/runtime/wl6AssetDecode';

function fnv1a(bytes: Uint8Array): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < bytes.length; i++) {
    hash = Math.imul((hash ^ (bytes[i] ?? 0)) >>> 0, 16777619) >>> 0;
  }
  return hash >>> 0;
}

function loadRaw(name: string): Uint8Array {
  const file = resolve(process.cwd(), 'assets', 'wl6', 'raw', name);
  return new Uint8Array(readFileSync(file));
}

describe('runtime vswap/map decode', () => {
  it('decodes vswap index deterministically and matches wall count', () => {
    const bytes = loadRaw('VSWAP.WL6');
    const a = decodeVswapIndex(bytes);
    const b = decodeVswapIndex(bytes);
    expect(a.chunkCount).toBe(b.chunkCount);
    expect(a.spriteStart).toBe(b.spriteStart);
    expect(a.soundStart).toBe(b.soundStart);
    expect(a.wallCount).toBe(a.spriteStart);
    expect(a.chunkOffsets.length).toBe(a.chunkCount);
    expect(a.chunkLengths.length).toBe(a.chunkCount);
  });

  it('decodes wall texture chunks with stable hashes', () => {
    const bytes = loadRaw('VSWAP.WL6');
    const index = decodeVswapIndex(bytes);
    const wall0a = decodeWallTexture(bytes, index, 0);
    const wall0b = decodeWallTexture(bytes, index, 0);
    expect(wall0a.length).toBe(4096);
    expect(fnv1a(wall0a)).toBe(fnv1a(wall0b));
  });

  it('decodes sprite posts with valid bounds and stable output', () => {
    const bytes = loadRaw('VSWAP.WL6');
    const index = decodeVswapIndex(bytes);
    const sprite = decodeSpriteColumnPosts(bytes, index, 50);
    expect(sprite.lastCol).toBeGreaterThanOrEqual(sprite.firstCol);
    expect(sprite.postsByColumn.length).toBeGreaterThan(0);
    for (const posts of sprite.postsByColumn) {
      for (const post of posts) {
        expect(post.endRow).toBeGreaterThanOrEqual(post.startRow);
        expect(post.pixelOffset).toBeGreaterThanOrEqual(0);
      }
    }
    const sprite2 = decodeSpriteColumnPosts(bytes, index, 50);
    expect(sprite.pixelPool.length).toBe(sprite2.pixelPool.length);
    expect(fnv1a(sprite.pixelPool)).toBe(fnv1a(sprite2.pixelPool));
  });

  it('builds map planes for a valid level', () => {
    const maphead = loadRaw('MAPHEAD.WL6');
    const gamemaps = loadRaw('GAMEMAPS.WL6');
    const level = buildMapPlanes(maphead, gamemaps, 0);
    expect(level.width).toBeGreaterThan(0);
    expect(level.height).toBeGreaterThan(0);
    expect(level.plane0.length).toBe(level.width * level.height);
    expect(level.plane1.length).toBe(level.width * level.height);
  });

  it('handles malformed input safely', () => {
    const bad = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
    const index = decodeVswapIndex(bad);
    expect(index.chunkOffsets.length).toBe(0);
    const wall = decodeWallTexture(bad, index, 0);
    expect(wall.length).toBe(4096);
  });
});

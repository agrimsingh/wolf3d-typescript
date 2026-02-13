import { describe, expect, it } from 'vitest';
import type { DecodedSpriteChunk } from '../../src/wolf/io/types';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import type { RuntimeConfig } from '../../src/runtime/contracts';

const AREATILE = 107;

function plane(width: number, height: number, fill: number): Uint16Array {
  const out = new Uint16Array(width * height);
  out.fill(fill & 0xffff);
  return out;
}

function bordered(width: number, height: number): Uint16Array {
  const p = plane(width, height, AREATILE);
  for (let x = 0; x < width; x++) {
    p[x] = 1;
    p[(height - 1) * width + x] = 1;
  }
  for (let y = 0; y < height; y++) {
    p[y * width] = 1;
    p[y * width + (width - 1)] = 1;
  }
  return p;
}

function baseConfig(plane0: Uint16Array, plane1: Uint16Array, width: number, height: number): RuntimeConfig {
  return {
    variant: 'WL6',
    mapLo: 0,
    mapHi: 0,
    enableFullMapRuntime: true,
    mapWidth: width,
    mapHeight: height,
    plane0,
    plane1,
    startXQ8: (3 * 256 + 128) | 0,
    startYQ8: (3 * 256 + 128) | 0,
    worldStartXQ8: (3 * 256 + 128) | 0,
    worldStartYQ8: (3 * 256 + 128) | 0,
    startAngleDeg: 0,
    startHealth: 100,
    startAmmo: 8,
  };
}

function simpleSprite(color = 200): DecodedSpriteChunk {
  return {
    id: 50,
    chunkId: 156,
    firstCol: 24,
    lastCol: 40,
    columnOffsets: new Uint16Array(17),
    postsByColumn: new Array(17).fill(null).map(() => [{ startRow: 20, endRow: 44, pixelOffset: 0, pixelCount: 24 }]),
    pixelPool: new Uint8Array(64).fill(color),
  };
}

describe('runtime actor sprite rendering', () => {
  it('is deterministic for identical seed/config', async () => {
    const width = 16;
    const height = 16;
    const plane0 = bordered(width, height);
    const plane1 = plane(width, height, 0);

    const runtime = new TsRuntimePort();
    runtime.setProceduralActorSpritesEnabled(false);
    runtime.setSpriteDecoder({
      decodeSprite: () => simpleSprite(201),
    });
    runtime.setWallTextures([new Uint8Array(4096).fill(40)]);
    await runtime.init(baseConfig(plane0, plane1, width, height));

    const internal = runtime as unknown as {
      fullMap: { actors: Array<{ id: number; kind: number; xQ8: number; yQ8: number; hp: number; mode: number; cooldown: number }> };
    };
    internal.fullMap.actors = [{
      id: 1,
      kind: 108,
      xQ8: (6 * 256 + 128) | 0,
      yQ8: (3 * 256 + 128) | 0,
      hp: 40,
      mode: 0,
      cooldown: 0,
    }];

    const frameA = runtime.framebuffer(true);
    const frameB = runtime.framebuffer(true);
    expect(frameA.indexedHash >>> 0).toBe(frameB.indexedHash >>> 0);
    await runtime.shutdown();
  });

  it('keeps sprite occluded behind wall columns', async () => {
    const width = 16;
    const height = 16;
    const plane0 = bordered(width, height);
    const plane1 = plane(width, height, 0);
    // Vertical wall between player and actor.
    for (let y = 2; y <= 5; y++) {
      plane0[y * width + 5] = 2;
    }

    const runtime = new TsRuntimePort();
    runtime.setProceduralActorSpritesEnabled(false);
    runtime.setSpriteDecoder({
      decodeSprite: () => simpleSprite(220),
    });
    runtime.setWallTextures([new Uint8Array(4096).fill(32), new Uint8Array(4096).fill(33), new Uint8Array(4096).fill(34)]);
    await runtime.init(baseConfig(plane0, plane1, width, height));

    const internal = runtime as unknown as {
      fullMap: { actors: Array<{ id: number; kind: number; xQ8: number; yQ8: number; hp: number; mode: number; cooldown: number }> };
    };
    internal.fullMap.actors = [{
      id: 1,
      kind: 108,
      xQ8: (7 * 256 + 128) | 0,
      yQ8: (3 * 256 + 128) | 0,
      hp: 40,
      mode: 0,
      cooldown: 0,
    }];

    const frame = runtime.framebuffer(true).indexedBuffer!;
    // Center column should still show wall color, not actor color 220.
    const center = frame[(100 * 320) + 160] ?? 0;
    expect(center).not.toBe(220);
    await runtime.shutdown();
  });
});

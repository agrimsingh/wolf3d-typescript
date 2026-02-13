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

function weaponSprite(color = 210): DecodedSpriteChunk {
  const firstCol = 12;
  const lastCol = 52;
  const colCount = (lastCol - firstCol + 1) | 0;
  return {
    id: 421,
    chunkId: 527,
    firstCol,
    lastCol,
    columnOffsets: new Uint16Array(colCount),
    postsByColumn: new Array(colCount).fill(null).map(() => [{ startRow: 26, endRow: 63, pixelOffset: 0, pixelCount: 37 }]),
    pixelPool: new Uint8Array(128).fill(color),
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

  it('reduces visible sprite columns when a wall barrier is present', async () => {
    const width = 16;
    const height = 16;
    const plane0Blocked = bordered(width, height);
    const plane0Open = bordered(width, height);
    const plane1 = plane(width, height, 0);
    // Full vertical wall barrier between player and actor.
    for (let y = 1; y < height - 1; y++) {
      plane0Blocked[y * width + 5] = 2;
    }

    const setup = async (runtime: TsRuntimePort, p0: Uint16Array): Promise<void> => {
      runtime.setProceduralActorSpritesEnabled(false);
      runtime.setSpriteDecoder({
        decodeSprite: () => simpleSprite(220),
      });
      runtime.setWallTextures([new Uint8Array(4096).fill(32), new Uint8Array(4096).fill(33), new Uint8Array(4096).fill(34)]);
      await runtime.init(baseConfig(p0, plane1, width, height));
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
    };

    const actorPixels = (frame: Uint8Array): number => {
      let count = 0;
      for (let y = 40; y < 160; y++) {
        for (let x = 120; x < 200; x++) {
          if ((frame[(y * 320) + x] ?? 0) === 220) {
            count++;
          }
        }
      }
      return count;
    };

    const runtimeBlocked = new TsRuntimePort();
    await setup(runtimeBlocked, plane0Blocked);
    const blockedCount = actorPixels(runtimeBlocked.framebuffer(true).indexedBuffer!);
    await runtimeBlocked.shutdown();

    const runtimeOpen = new TsRuntimePort();
    await setup(runtimeOpen, plane0Open);
    const openCount = actorPixels(runtimeOpen.framebuffer(true).indexedBuffer!);
    await runtimeOpen.shutdown();

    expect(blockedCount).toBeLessThan(openCount);
  });

  it('draws weapon overlay from decoded vswap sprite when available', async () => {
    const width = 16;
    const height = 16;
    const plane0 = bordered(width, height);
    const plane1 = plane(width, height, 0);

    const runtime = new TsRuntimePort();
    runtime.setProceduralActorSpritesEnabled(false);
    runtime.setSpriteDecoder({
      decodeSprite: (id: number) => {
        if (id >= 421 && id <= 425) {
          return weaponSprite(211);
        }
        return null;
      },
    });
    runtime.setWallTextures([new Uint8Array(4096).fill(40)]);
    await runtime.init(baseConfig(plane0, plane1, width, height));

    const frame = runtime.framebuffer(true).indexedBuffer!;
    let weaponPixels = 0;
    for (let y = 110; y < 200; y++) {
      for (let x = 120; x < 200; x++) {
        if ((frame[(y * 320) + x] ?? 0) === 211) {
          weaponPixels++;
        }
      }
    }
    expect(weaponPixels).toBeGreaterThan(200);
    await runtime.shutdown();
  });
});

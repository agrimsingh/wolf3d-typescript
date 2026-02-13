import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import type { RuntimeConfig } from '../../src/runtime/contracts';

const FRAME_WIDTH = 320;
const FRAME_HEIGHT = 200;
const RENDER_FOV = Math.PI / 3;
const AREATILE = 107;

type RayHit = {
  distance: number;
  texX: number;
};

function buildOrientationPlane(width: number, height: number): Uint16Array {
  const plane = new Uint16Array(width * height);
  plane.fill(AREATILE);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        plane[y * width + x] = 1;
      }
    }
  }
  for (let y = 1; y < height - 1; y++) {
    plane[y * width + 4] = 2;
  }
  return plane;
}

function castRayForTest(
  plane0: Uint16Array,
  mapWidth: number,
  mapHeight: number,
  posX: number,
  posY: number,
  dirX: number,
  dirY: number,
): RayHit | null {
  const deltaDistX = dirX === 0 ? 1e30 : Math.abs(1 / dirX);
  const deltaDistY = dirY === 0 ? 1e30 : Math.abs(1 / dirY);

  let mapX = Math.floor(posX);
  let mapY = Math.floor(posY);
  const stepX = dirX < 0 ? -1 : 1;
  const stepY = dirY < 0 ? -1 : 1;

  let sideDistX = dirX < 0 ? (posX - mapX) * deltaDistX : (mapX + 1 - posX) * deltaDistX;
  let sideDistY = dirY < 0 ? (posY - mapY) * deltaDistY : (mapY + 1 - posY) * deltaDistY;
  let side: 0 | 1 = 0;

  for (let steps = 0; steps < 128; steps++) {
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      mapX += stepX;
      side = 0;
    } else {
      sideDistY += deltaDistY;
      mapY += stepY;
      side = 1;
    }

    if (mapX < 0 || mapX >= mapWidth || mapY < 0 || mapY >= mapHeight) {
      return null;
    }
    const tile = plane0[mapY * mapWidth + mapX] ?? 0;
    if ((tile & 0xffff) < AREATILE) {
      const perpDist = side === 0
        ? (mapX - posX + (1 - stepX) / 2) / dirX
        : (mapY - posY + (1 - stepY) / 2) / dirY;
      let wallX = side === 0 ? posY + perpDist * dirY : posX + perpDist * dirX;
      wallX -= Math.floor(wallX);
      let texX = Math.floor(wallX * 64) & 63;
      if (side === 0 && dirX > 0) texX = 63 - texX;
      if (side === 1 && dirY < 0) texX = 63 - texX;
      return {
        distance: Math.max(0.0001, perpDist),
        texX: texX & 63,
      };
    }
  }

  return null;
}

function buildColumnMajorTexture(): Uint8Array {
  const texture = new Uint8Array(64 * 64);
  for (let x = 0; x < 64; x++) {
    for (let y = 0; y < 64; y++) {
      texture[x * 64 + y] = x & 0xff;
    }
  }
  return texture;
}

describe('runtime renderer orientation', () => {
  let runtime: TsRuntimePort;

  beforeAll(() => {
    runtime = new TsRuntimePort();
  });

  afterAll(async () => {
    await runtime.shutdown();
  });

  it('samples VSWAP wall columns with row-major texture layout', async () => {
    const mapWidth = 8;
    const mapHeight = 8;
    const plane0 = buildOrientationPlane(mapWidth, mapHeight);
    const startXQ8 = (2 * 256 + 128) | 0;
    const startYQ8 = (4 * 256 + 128) | 0;
    const config: RuntimeConfig = {
      variant: 'WL6',
      mapLo: 0,
      mapHi: 0,
      mapIndex: 0,
      mapName: 'orientation-test',
      mapWidth,
      mapHeight,
      plane0,
      runtimeWindowOriginX: 0,
      runtimeWindowOriginY: 0,
      worldStartXQ8: startXQ8,
      worldStartYQ8: startYQ8,
      startXQ8,
      startYQ8,
      startAngleDeg: 0,
      startHealth: 100,
      startAmmo: 8,
    };

    runtime.setWallTextures([buildColumnMajorTexture()]);
    await runtime.init(config);
    runtime.reset();

    const frame = runtime.framebuffer(true);
    const indexed = frame.indexedBuffer;
    expect(indexed).toBeDefined();
    if (!indexed) {
      return;
    }

    const sampleColumn = 96;
    const camera = sampleColumn / FRAME_WIDTH - 0.5;
    const rayAngle = -camera * RENDER_FOV;
    const dirX = Math.cos(rayAngle);
    const dirY = -Math.sin(rayAngle);
    const hit = castRayForTest(plane0, mapWidth, mapHeight, startXQ8 / 256, startYQ8 / 256, dirX, dirY);
    expect(hit).not.toBeNull();
    if (!hit) {
      return;
    }

    const wallHeight = Math.min(FRAME_HEIGHT, Math.max(2, (FRAME_HEIGHT / hit.distance) | 0));
    const top = Math.max(0, (FRAME_HEIGHT / 2 - wallHeight / 2) | 0);
    const sampleRow = Math.min(FRAME_HEIGHT - 1, top + ((wallHeight / 2) | 0));

    const expected = hit.texX & 63;
    const actual = indexed[sampleRow * FRAME_WIDTH + sampleColumn] ?? -1;

    expect(actual).toBe(expected);
  });
});

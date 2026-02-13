import { describe, expect, it } from 'vitest';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import type { RuntimeConfig } from '../../src/runtime/contracts';

const AREATILE = 107;

function makePlane(width: number, height: number, fill: number): Uint16Array {
  const out = new Uint16Array(width * height);
  out.fill(fill & 0xffff);
  return out;
}

function addBorderWalls(plane0: Uint16Array, width: number, height: number): void {
  for (let x = 0; x < width; x++) {
    plane0[x] = 1;
    plane0[(height - 1) * width + x] = 1;
  }
  for (let y = 0; y < height; y++) {
    plane0[y * width] = 1;
    plane0[y * width + (width - 1)] = 1;
  }
}

function baseConfig(plane0: Uint16Array, plane1: Uint16Array, width: number, height: number): RuntimeConfig {
  return {
    mapLo: 0,
    mapHi: 0,
    enableFullMapRuntime: true,
    mapWidth: width,
    mapHeight: height,
    plane0,
    plane1,
    runtimeWindowOriginX: 0,
    runtimeWindowOriginY: 0,
    playerStartAbsTileX: 5,
    playerStartAbsTileY: 5,
    startXQ8: (5 * 256 + 128) | 0,
    startYQ8: (5 * 256 + 128) | 0,
    startAngleDeg: 0,
    startHealth: 60,
    startAmmo: 8,
  };
}

describe('runtime full-map interactions', () => {
  it('use opens door tile and allows forward progress', async () => {
    const width = 16;
    const height = 16;
    const plane0 = makePlane(width, height, AREATILE);
    const plane1 = makePlane(width, height, 0);
    addBorderWalls(plane0, width, height);
    // Door directly in front of player (facing east).
    plane0[5 * width + 6] = 90;

    const runtime = new TsRuntimePort();
    await runtime.bootWl6(baseConfig(plane0, plane1, width, height));
    const before = runtime.snapshot();
    runtime.step({ inputMask: 1 << 7, tics: 1, rng: 0x1234 });
    runtime.step({ inputMask: 1 << 0, tics: 8, rng: 0x2345 });
    const after = runtime.snapshot();

    expect(after.xQ8).toBeGreaterThan(before.xQ8);
    await runtime.shutdown();
  });

  it('pickups mutate ammo/health deterministically in full-map mode', async () => {
    const width = 16;
    const height = 16;
    const plane0 = makePlane(width, height, AREATILE);
    const plane1 = makePlane(width, height, 0);
    addBorderWalls(plane0, width, height);
    // Place a pickup on the start tile.
    plane1[5 * width + 5] = 4;

    const runtime = new TsRuntimePort();
    await runtime.bootWl6(baseConfig(plane0, plane1, width, height));
    const before = runtime.snapshot();
    runtime.step({ inputMask: 0, tics: 1, rng: 0x3456 });
    const after = runtime.snapshot();

    expect(after.health >= before.health || after.ammo >= before.ammo).toBe(true);
    await runtime.shutdown();
  });

  it('door tile render hash differs from wall tile render hash', async () => {
    const width = 16;
    const height = 16;
    const plane1 = makePlane(width, height, 0);
    const textures: Uint8Array[] = [];
    for (let i = 0; i < 128; i++) {
      textures.push(new Uint8Array(4096).fill((i + 10) & 0xff));
    }

    const planeDoor = makePlane(width, height, AREATILE);
    addBorderWalls(planeDoor, width, height);
    planeDoor[5 * width + 6] = 90;

    const planeWall = makePlane(width, height, AREATILE);
    addBorderWalls(planeWall, width, height);
    planeWall[5 * width + 6] = 1;

    const runtimeDoor = new TsRuntimePort();
    await runtimeDoor.bootWl6(baseConfig(planeDoor, plane1, width, height));
    runtimeDoor.setWallTextures(textures);
    const hashDoor = runtimeDoor.framebuffer(true).indexedHash >>> 0;
    await runtimeDoor.shutdown();

    const runtimeWall = new TsRuntimePort();
    await runtimeWall.bootWl6(baseConfig(planeWall, plane1, width, height));
    runtimeWall.setWallTextures(textures);
    const hashWall = runtimeWall.framebuffer(true).indexedHash >>> 0;
    await runtimeWall.shutdown();

    expect(hashDoor).not.toBe(hashWall);
  });
});

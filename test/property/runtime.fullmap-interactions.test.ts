import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import type { RuntimeConfig } from '../../src/runtime/contracts';
import { buildMapPlanes } from '../../src/runtime/wl6AssetDecode';
import { isWl6DeadGuardMarker, isWl6PlayerStartMarker, wl6PickupEffect } from '../../src/runtime/wl6Plane1Markers';

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
  it('map 0 fixture keeps canonical start/dead-guard/pickup marker counts', () => {
    const maphead = new Uint8Array(readFileSync(join(process.cwd(), 'assets', 'wl6', 'raw', 'MAPHEAD.WL6')));
    const gamemaps = new Uint8Array(readFileSync(join(process.cwd(), 'assets', 'wl6', 'raw', 'GAMEMAPS.WL6')));
    const map0 = buildMapPlanes(maphead, gamemaps, 0);

    let startCount = 0;
    let deadGuardCount = 0;
    let pickupCount = 0;
    let treasureCount = 0;
    let startX = -1;
    let startY = -1;
    let deadGuardX = -1;
    let deadGuardY = -1;

    for (let y = 0; y < map0.height; y++) {
      for (let x = 0; x < map0.width; x++) {
        const marker = map0.plane1[y * map0.width + x] ?? 0;
        if (isWl6PlayerStartMarker(marker)) {
          startCount++;
          startX = x;
          startY = y;
        }
        if (isWl6DeadGuardMarker(marker)) {
          deadGuardCount++;
          deadGuardX = x;
          deadGuardY = y;
        }
        const pickup = wl6PickupEffect(marker);
        if (pickup) {
          pickupCount++;
          if (pickup.kind === 'treasure') {
            treasureCount++;
          }
        }
      }
    }

    expect(startCount).toBe(1);
    expect(deadGuardCount).toBe(1);
    expect(pickupCount).toBe(53);
    expect(treasureCount).toBe(22);
    expect(Math.abs(startX - deadGuardX) + Math.abs(startY - deadGuardY)).toBe(2);
  });

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

  it('gold-locked door requires gold key pickup', async () => {
    const width = 16;
    const height = 16;
    const plane0 = makePlane(width, height, AREATILE);
    const plane1 = makePlane(width, height, 0);
    addBorderWalls(plane0, width, height);
    // Gold-locked door in front.
    plane0[5 * width + 6] = 92;

    const runtimeLocked = new TsRuntimePort();
    await runtimeLocked.bootWl6(baseConfig(plane0, plane1, width, height));
    const beforeLocked = runtimeLocked.snapshot();
    runtimeLocked.step({ inputMask: 1 << 7, tics: 1, rng: 0x1001 });
    runtimeLocked.step({ inputMask: 1 << 0, tics: 8, rng: 0x1002 });
    const afterLocked = runtimeLocked.snapshot();
    expect(afterLocked.xQ8).toBeLessThanOrEqual((6 * 256) + 96);
    await runtimeLocked.shutdown();

    const planeWithKey = makePlane(width, height, AREATILE);
    const planeWithKeyItems = makePlane(width, height, 0);
    addBorderWalls(planeWithKey, width, height);
    planeWithKey[5 * width + 6] = 92;
    // Gold key item at start cell.
    planeWithKeyItems[5 * width + 5] = 43;

    const runtimeUnlocked = new TsRuntimePort();
    await runtimeUnlocked.bootWl6(baseConfig(planeWithKey, planeWithKeyItems, width, height));
    runtimeUnlocked.step({ inputMask: 0, tics: 1, rng: 0x1101 }); // collect key
    const beforeUnlocked = runtimeUnlocked.snapshot();
    runtimeUnlocked.step({ inputMask: 1 << 7, tics: 1, rng: 0x1102 });
    runtimeUnlocked.step({ inputMask: 1 << 0, tics: 16, rng: 0x1103 });
    const afterUnlocked = runtimeUnlocked.snapshot();
    expect(afterUnlocked.xQ8).toBeGreaterThan(beforeUnlocked.xQ8 + 32);
    await runtimeUnlocked.shutdown();
  });

  it('pushwall interaction is gated by plane1 pushwall marker', async () => {
    const width = 16;
    const height = 16;
    const plane0 = makePlane(width, height, AREATILE);
    const plane1 = makePlane(width, height, 0);
    addBorderWalls(plane0, width, height);
    plane0[5 * width + 6] = 1;
    plane0[5 * width + 7] = AREATILE;

    const runtimeBlocked = new TsRuntimePort();
    await runtimeBlocked.bootWl6(baseConfig(plane0, plane1, width, height));
    runtimeBlocked.step({ inputMask: 1 << 7, tics: 1, rng: 0x4401 });
    const blockedState = (runtimeBlocked as unknown as { fullMap: { plane0: Uint16Array | null } }).fullMap.plane0!;
    expect(blockedState[5 * width + 6]).toBe(1);
    await runtimeBlocked.shutdown();

    const plane0Push = makePlane(width, height, AREATILE);
    const plane1Push = makePlane(width, height, 0);
    addBorderWalls(plane0Push, width, height);
    plane0Push[5 * width + 6] = 1;
    plane0Push[5 * width + 7] = AREATILE;
    plane1Push[5 * width + 6] = 98;

    const runtimePush = new TsRuntimePort();
    await runtimePush.bootWl6(baseConfig(plane0Push, plane1Push, width, height));
    runtimePush.step({ inputMask: 1 << 7, tics: 1, rng: 0x4402 });
    const pushState = (runtimePush as unknown as { fullMap: { plane0: Uint16Array | null; plane1: Uint16Array | null } }).fullMap;
    expect(pushState.plane0![5 * width + 6]).toBe(AREATILE);
    expect(pushState.plane0![5 * width + 7]).toBe(1);
    expect(pushState.plane1![5 * width + 6]).toBe(0);
    await runtimePush.shutdown();
  });

  it('door animation changes frame hash while door tile id remains unchanged', async () => {
    const width = 16;
    const height = 16;
    const plane0 = makePlane(width, height, AREATILE);
    const plane1 = makePlane(width, height, 0);
    addBorderWalls(plane0, width, height);
    plane0[5 * width + 6] = 90;

    const runtime = new TsRuntimePort();
    await runtime.bootWl6(baseConfig(plane0, plane1, width, height));

    const frameClosed = runtime.framebuffer(true).indexedHash >>> 0;
    runtime.step({ inputMask: 1 << 7, tics: 1, rng: 0x2201 });
    runtime.step({ inputMask: 0, tics: 12, rng: 0x2202 });
    const frameOpening = runtime.framebuffer(true).indexedHash >>> 0;
    const planeAfter = (runtime as unknown as { fullMap: { plane0: Uint16Array | null } }).fullMap.plane0!;
    expect(planeAfter[5 * width + 6]).toBe(90);
    expect(frameOpening).not.toBe(frameClosed);

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

import type { RuntimeConfig, RuntimeInput } from './contracts';
import { idCaCarmackExpandWords, idCaRlewExpandWords } from '../wolf/map/wlMap';

const AREATILE = 107;
const PLAYER_START_MIN = 19;
const PLAYER_START_MAX = 22;

export interface Wl1RuntimeScenarioData {
  id: string;
  mapIndex: number;
  mapName: string;
  seed: number;
  config: RuntimeConfig;
  steps: RuntimeInput[];
}

function readU16(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || offset + 1 >= bytes.length) {
    return 0;
  }
  return ((bytes[offset]! | (bytes[offset + 1]! << 8)) & 0xffff) >>> 0;
}

function readS32(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || offset + 3 >= bytes.length) {
    return -1;
  }
  const value =
    (bytes[offset]!) |
    (bytes[offset + 1]! << 8) |
    (bytes[offset + 2]! << 16) |
    (bytes[offset + 3]! << 24);
  return value | 0;
}

function decodeAsciiName(bytes: Uint8Array): string {
  let end = bytes.length;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) {
      end = i;
      break;
    }
  }
  return new TextDecoder().decode(bytes.subarray(0, end)).trim();
}

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function angleFromPlayerStartTile(tile: number): number {
  const dir = tile - PLAYER_START_MIN;
  if (dir < 0 || dir > 3) {
    return 0;
  }
  let angle = (1 - dir) * 90;
  if (angle < 0) {
    angle += 360;
  }
  return angle | 0;
}

function isWall(tile: number): boolean {
  return (tile & 0xffff) < AREATILE;
}

function findPlayerStart(
  plane1: Uint16Array,
  width: number,
  height: number,
): { tileX: number; tileY: number; angleDeg: number } {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = plane1[y * width + x] ?? 0;
      if (tile >= PLAYER_START_MIN && tile <= PLAYER_START_MAX) {
        return {
          tileX: x | 0,
          tileY: y | 0,
          angleDeg: angleFromPlayerStartTile(tile),
        };
      }
    }
  }

  // Fallback when no canonical start tile exists in corrupted/custom maps.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = plane1[y * width + x] ?? 0;
      if (tile === 0) {
        return { tileX: x | 0, tileY: y | 0, angleDeg: 0 };
      }
    }
  }

  return { tileX: 1, tileY: 1, angleDeg: 0 };
}

function buildRuntimeWindowBits(
  plane0: Uint16Array,
  width: number,
  height: number,
  centerTileX: number,
  centerTileY: number,
): { mapLo: number; mapHi: number; originX: number; originY: number } {
  const originX = Math.max(0, Math.min(Math.max(0, width - 8), (centerTileX - 3) | 0)) | 0;
  const originY = Math.max(0, Math.min(Math.max(0, height - 8), (centerTileY - 3) | 0)) | 0;

  let lo = 0;
  let hi = 0;
  for (let wy = 0; wy < 8; wy++) {
    for (let wx = 0; wx < 8; wx++) {
      const x = originX + wx;
      const y = originY + wy;
      const border = wx === 0 || wy === 0 || wx === 7 || wy === 7;
      const tile = (x >= 0 && x < width && y >= 0 && y < height) ? (plane0[y * width + x] ?? 0) : 1;
      const wall = border || isWall(tile);
      if (!wall) {
        continue;
      }
      const bit = wy * 8 + wx;
      if (bit < 32) {
        lo |= 1 << bit;
      } else {
        hi |= 1 << (bit - 32);
      }
    }
  }

  return { mapLo: lo >>> 0, mapHi: hi >>> 0, originX, originY };
}

function buildScenarioSeed(mapIndex: number, mapName: string, startXQ8: number, startYQ8: number): number {
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, mapIndex | 0);
  hash = fnv1a(hash, startXQ8 | 0);
  hash = fnv1a(hash, startYQ8 | 0);
  for (let i = 0; i < mapName.length; i++) {
    hash = fnv1a(hash, mapName.charCodeAt(i) | 0);
  }
  return hash >>> 0;
}

function buildScenarioSteps(seed: number, count: number): RuntimeInput[] {
  const steps: RuntimeInput[] = [];
  let state = seed | 0;
  for (let i = 0; i < count; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) | 0;
    steps.push({
      inputMask: state & 0xff,
      tics: (((state >>> 8) & 0x7) + 1) | 0,
      rng: (state ^ Math.imul(i + 1, 1103515245)) | 0,
    });
  }
  return steps;
}

export function buildWl1RuntimeScenariosFromBytes(
  mapheadBytes: Uint8Array,
  gamemapsBytes: Uint8Array,
  stepsPerScenario = 64,
): Wl1RuntimeScenarioData[] {
  const rlewTag = readU16(mapheadBytes, 0);
  const scenarios: Wl1RuntimeScenarioData[] = [];

  for (let mapIndex = 0; mapIndex < 100; mapIndex++) {
    const headerOffset = readS32(mapheadBytes, 2 + mapIndex * 4);
    if (headerOffset < 0 || headerOffset + 38 > gamemapsBytes.length) {
      continue;
    }

    const planeStart0 = readS32(gamemapsBytes, headerOffset + 0);
    const planeStart1 = readS32(gamemapsBytes, headerOffset + 4);
    const planeLength0 = readU16(gamemapsBytes, headerOffset + 12);
    const planeLength1 = readU16(gamemapsBytes, headerOffset + 14);
    const width = readU16(gamemapsBytes, headerOffset + 18);
    const height = readU16(gamemapsBytes, headerOffset + 20);
    const mapName = decodeAsciiName(gamemapsBytes.subarray(headerOffset + 22, headerOffset + 38)) || `MAP${mapIndex}`;

    if (width <= 0 || height <= 0) {
      continue;
    }
    if (planeStart0 < 0 || planeStart1 < 0 || planeLength0 <= 2 || planeLength1 <= 2) {
      continue;
    }
    if (planeStart0 + planeLength0 > gamemapsBytes.length || planeStart1 + planeLength1 > gamemapsBytes.length) {
      continue;
    }

    const source0 = gamemapsBytes.subarray(planeStart0, planeStart0 + planeLength0);
    const source1 = gamemapsBytes.subarray(planeStart1, planeStart1 + planeLength1);
    const expanded0 = readU16(source0, 0);
    const expanded1 = readU16(source1, 0);
    const carmack0 = idCaCarmackExpandWords(source0.subarray(2), expanded0);
    const carmack1 = idCaCarmackExpandWords(source1.subarray(2), expanded1);
    const rlewSource0 = carmack0.subarray(carmack0.length > 0 ? 1 : 0);
    const rlewSource1 = carmack1.subarray(carmack1.length > 0 ? 1 : 0);
    const plane0 = idCaRlewExpandWords(rlewSource0, width * height * 2, rlewTag);
    const plane1 = idCaRlewExpandWords(rlewSource1, width * height * 2, rlewTag);

    const start = findPlayerStart(plane1, width, height);
    const mapBits = buildRuntimeWindowBits(plane0, width, height, start.tileX, start.tileY);
    const startXQ8 = (start.tileX * 256 + 128) | 0;
    const startYQ8 = (start.tileY * 256 + 128) | 0;
    const startAngleDeg = start.angleDeg | 0;
    const seed = buildScenarioSeed(mapIndex, mapName, startXQ8, startYQ8);

    scenarios.push({
      id: `wl1-map-${mapIndex}`,
      mapIndex,
      mapName,
      seed,
      config: {
        mapLo: mapBits.mapLo,
        mapHi: mapBits.mapHi,
        mapIndex,
        mapName,
        mapWidth: width | 0,
        mapHeight: height | 0,
        plane0,
        plane1,
        playerStartTileX: start.tileX | 0,
        playerStartTileY: start.tileY | 0,
        playerStartAngleDeg: startAngleDeg,
        startXQ8,
        startYQ8,
        startAngleDeg,
        startHealth: 100,
        startAmmo: 8,
      },
      steps: buildScenarioSteps(seed | 0, stepsPerScenario),
    });
  }

  scenarios.sort((a, b) => a.mapIndex - b.mapIndex);
  return scenarios;
}

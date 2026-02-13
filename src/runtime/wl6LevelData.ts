import type { RuntimeConfig, RuntimeInput } from './contracts';
import { buildMapPlanes } from './wl6AssetDecode';

const PLAYER_START_MIN = 19;
const PLAYER_START_MAX = 22;

export interface Wl6RuntimeScenarioData {
  id: string;
  mapIndex: number;
  mapName: string;
  seed: number;
  config: RuntimeConfig;
  steps: RuntimeInput[];
}

export type RuntimeScenarioData = Wl6RuntimeScenarioData;

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

function buildScenarioSeed(
  mapIndex: number,
  mapName: string,
  startXQ8: number,
  startYQ8: number,
): number {
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

export function buildWl6RuntimeScenariosFromBytes(
  mapheadBytes: Uint8Array,
  gamemapsBytes: Uint8Array,
  stepsPerScenario = 64,
  variant: 'WL6' = 'WL6',
): RuntimeScenarioData[] {
  const scenarios: RuntimeScenarioData[] = [];

  for (let mapIndex = 0; mapIndex < 100; mapIndex++) {
    const planes = buildMapPlanes(mapheadBytes, gamemapsBytes, mapIndex);
    const width = planes.width | 0;
    const height = planes.height | 0;
    const mapName = planes.mapName || `MAP${mapIndex}`;
    const plane0 = planes.plane0;
    const plane1 = planes.plane1;
    if (width <= 0 || height <= 0 || plane0.length === 0 || plane1.length === 0) {
      continue;
    }

    const start = findPlayerStart(plane1, width, height);
    const startXQ8 = (start.tileX * 256 + 128) | 0;
    const startYQ8 = (start.tileY * 256 + 128) | 0;
    const startAngleDeg = start.angleDeg | 0;
    const seed = buildScenarioSeed(mapIndex, mapName, startXQ8, startYQ8);

    const config: RuntimeConfig = {
      variant,
      mapLo: 0,
      mapHi: 0,
      mapIndex,
      mapName,
      mapWidth: width | 0,
      mapHeight: height | 0,
      runtimeWindowOriginX: 0,
      runtimeWindowOriginY: 0,
      plane0,
      plane1,
      worldStartXQ8: startXQ8,
      worldStartYQ8: startYQ8,
      playerStartAbsTileX: start.tileX | 0,
      playerStartAbsTileY: start.tileY | 0,
      playerStartTileX: start.tileX | 0,
      playerStartTileY: start.tileY | 0,
      playerStartAngleDeg: startAngleDeg,
      startXQ8,
      startYQ8,
      startAngleDeg,
      startHealth: 100,
      startAmmo: 8,
      difficulty: 2,
    };

    scenarios.push({
      id: `${variant.toLowerCase()}-map-${mapIndex}`,
      mapIndex,
      mapName,
      seed,
      config,
      steps: buildScenarioSteps(seed | 0, stepsPerScenario),
    });
  }

  scenarios.sort((a, b) => a.mapIndex - b.mapIndex);
  return scenarios;
}

export function buildRuntimeScenariosFromBytes(
  mapheadBytes: Uint8Array,
  gamemapsBytes: Uint8Array,
  stepsPerScenario = 64,
  variant: 'WL6' = 'WL6',
): RuntimeScenarioData[] {
  return buildWl6RuntimeScenariosFromBytes(mapheadBytes, gamemapsBytes, stepsPerScenario, variant);
}

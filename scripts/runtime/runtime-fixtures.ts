import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { RuntimeConfig, RuntimeInput } from '../../src/runtime/contracts';

const AREATILE = 107;

type Plane0Map = {
  mapIndex: number;
  mapName: string;
  width: number;
  height: number;
  plane0: Uint16Array;
};

export type RuntimeFixtureScenario = {
  id: string;
  mapIndex: number;
  mapName: string;
  seed: number;
  config: RuntimeConfig;
  steps: RuntimeInput[];
};

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

function idCaCarmackExpandWords(sourceBytes: Uint8Array, expandedLengthBytes: number): Uint16Array {
  const NEARTAG = 0xa7;
  const FARTAG = 0xa8;
  const outWords = Math.max(0, expandedLengthBytes | 0) >>> 1;
  const out = new Uint16Array(outWords);

  let src = 0;
  let dst = 0;
  while (dst < outWords) {
    const ch = readU16(sourceBytes, src);
    src += 2;
    const chHigh = (ch >>> 8) & 0xff;
    const count = ch & 0xff;

    if (chHigh === NEARTAG) {
      if (count === 0) {
        const low = src < sourceBytes.length ? sourceBytes[src]! : 0;
        src += 1;
        out[dst++] = ((ch & 0xff00) | low) & 0xffff;
        continue;
      }
      const offset = src < sourceBytes.length ? sourceBytes[src]! : 0;
      src += 1;
      for (let i = 0; i < count && dst < outWords; i++) {
        const copyIndex = dst - offset;
        out[dst++] = copyIndex >= 0 && copyIndex < dst ? out[copyIndex]! : 0;
      }
      continue;
    }

    if (chHigh === FARTAG) {
      if (count === 0) {
        const low = src < sourceBytes.length ? sourceBytes[src]! : 0;
        src += 1;
        out[dst++] = ((ch & 0xff00) | low) & 0xffff;
        continue;
      }
      const offset = readU16(sourceBytes, src);
      src += 2;
      for (let i = 0; i < count && dst < outWords; i++) {
        const copyIndex = offset + i;
        out[dst++] = copyIndex >= 0 && copyIndex < dst ? out[copyIndex]! : 0;
      }
      continue;
    }

    out[dst++] = ch & 0xffff;
  }
  return out;
}

function idCaRlewExpandWords(sourceWords: Uint16Array, expandedLengthBytes: number, rlewTag: number): Uint16Array {
  const outWords = Math.max(0, expandedLengthBytes | 0) >>> 1;
  const out = new Uint16Array(outWords);
  const tag = rlewTag & 0xffff;

  let src = 0;
  let dst = 0;
  while (dst < outWords) {
    const value = src < sourceWords.length ? (sourceWords[src++]! & 0xffff) : 0;
    if (value !== tag) {
      out[dst++] = value;
      continue;
    }
    const count = src < sourceWords.length ? (sourceWords[src++]! & 0xffff) : 0;
    const repeated = src < sourceWords.length ? (sourceWords[src++]! & 0xffff) : 0;
    if (count === 0) {
      out[dst++] = tag;
      continue;
    }
    for (let i = 0; i < count && dst < outWords; i++) {
      out[dst++] = repeated;
    }
  }
  return out;
}

function extractPlane0Map(gamemapsBytes: Uint8Array, mapheadBytes: Uint8Array, mapIndex: number): Plane0Map | null {
  const rlewTag = readU16(mapheadBytes, 0);
  const headerOffset = readS32(mapheadBytes, 2 + mapIndex * 4);
  if (headerOffset < 0 || headerOffset + 38 > gamemapsBytes.length) {
    return null;
  }

  const planeStart = readS32(gamemapsBytes, headerOffset);
  const planeLength = readU16(gamemapsBytes, headerOffset + 12);
  const width = readU16(gamemapsBytes, headerOffset + 18);
  const height = readU16(gamemapsBytes, headerOffset + 20);
  const name = decodeAsciiName(gamemapsBytes.subarray(headerOffset + 22, headerOffset + 38)) || `MAP${mapIndex}`;

  if (width <= 0 || height <= 0) {
    return null;
  }
  if (planeStart < 0 || planeLength <= 2 || planeStart + planeLength > gamemapsBytes.length) {
    return null;
  }

  const source = gamemapsBytes.subarray(planeStart, planeStart + planeLength);
  const expanded = readU16(source, 0);
  const carmack = idCaCarmackExpandWords(source.subarray(2), expanded);
  const rlewSource = carmack.subarray(carmack.length > 0 ? 1 : 0);
  const plane0 = idCaRlewExpandWords(rlewSource, width * height * 2, rlewTag);
  return { mapIndex, mapName: name, width, height, plane0 };
}

function wallInPlane(plane0: Uint16Array, width: number, height: number, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return true;
  }
  return (plane0[y * width + x] ?? 0) < AREATILE;
}

function buildMapBitsFromPlane(plane: Plane0Map, seed: number): { mapLo: number; mapHi: number; startXQ8: number; startYQ8: number } {
  const maxX0 = Math.max(0, plane.width - 8);
  const maxY0 = Math.max(0, plane.height - 8);
  const x0 = maxX0 === 0 ? 0 : ((seed >>> 1) % (maxX0 + 1));
  const y0 = maxY0 === 0 ? 0 : ((seed >>> 5) % (maxY0 + 1));

  let lo = 0;
  let hi = 0;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const border = x === 0 || y === 0 || x === 7 || y === 7;
      const wall = border || wallInPlane(plane.plane0, plane.width, plane.height, x0 + x, y0 + y);
      if (!wall) continue;
      const bit = y * 8 + x;
      if (bit < 32) lo |= 1 << bit;
      else hi |= 1 << (bit - 32);
    }
  }

  let startTileX = 3;
  let startTileY = 3;
  let found = false;
  for (let y = 1; y <= 6 && !found; y++) {
    for (let x = 1; x <= 6; x++) {
      const bit = y * 8 + x;
      const isWall = bit < 32 ? ((lo >>> bit) & 1) === 1 : ((hi >>> (bit - 32)) & 1) === 1;
      if (!isWall) {
        startTileX = x;
        startTileY = y;
        found = true;
        break;
      }
    }
  }

  return {
    mapLo: lo >>> 0,
    mapHi: hi >>> 0,
    startXQ8: startTileX * 256 + 128,
    startYQ8: startTileY * 256 + 128,
  };
}

function buildScenarioSteps(seed: number, count: number): RuntimeInput[] {
  const steps: RuntimeInput[] = [];
  let s = seed | 0;
  for (let i = 0; i < count; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    steps.push({
      inputMask: s & 0xff,
      tics: (s >>> 8) & 0x7,
      rng: s ^ Math.imul(i + 1, 1103515245),
    });
  }
  return steps;
}

export async function loadWl1RuntimeScenarios(rootDir: string, stepsPerScenario = 64): Promise<RuntimeFixtureScenario[]> {
  const assetsDir = path.join(rootDir, 'assets', 'wl1');
  const mapheadBytes = new Uint8Array(await readFile(path.join(assetsDir, 'MAPHEAD.WL1')));
  const gamemapsBytes = new Uint8Array(await readFile(path.join(assetsDir, 'GAMEMAPS.WL1')));

  const scenarios: RuntimeFixtureScenario[] = [];
  for (let mapIndex = 0; mapIndex < 100; mapIndex++) {
    const plane = extractPlane0Map(gamemapsBytes, mapheadBytes, mapIndex);
    if (!plane) {
      continue;
    }
    const seed = (Math.imul(mapIndex + 1, 0x45d9f3b) ^ 0x9e3779b9) >>> 0;
    const mapBits = buildMapBitsFromPlane(plane, seed);
    scenarios.push({
      id: `wl1-map-${mapIndex}`,
      mapIndex,
      mapName: plane.mapName,
      seed,
      config: {
        mapLo: mapBits.mapLo,
        mapHi: mapBits.mapHi,
        startXQ8: mapBits.startXQ8,
        startYQ8: mapBits.startYQ8,
        startAngleDeg: (mapIndex * 37) % 360,
        startHealth: 45 + (mapIndex % 40),
        startAmmo: 8 + (mapIndex % 12),
      },
      steps: buildScenarioSteps(seed | 0, stepsPerScenario),
    });
  }

  scenarios.sort((a, b) => a.mapIndex - b.mapIndex);
  return scenarios;
}

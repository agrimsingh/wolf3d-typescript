import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { getNumRuns, getSeed } from './config';
import { withReplay } from './replay';
import {
  idCaCacheMapHash,
  idCaCarmackExpandHash,
  idCaRlewExpandHash,
  idCaSetupMapFileHash,
  idMmFreePtrHash,
  idMmGetPtrHash,
  idMmSetLockHash,
  idMmSetPurgeHash,
  idMmSortMemHash,
  idPmCheckMainMemHash,
  idPmGetPageAddressHash,
  idPmGetPageHash,
  idPmNextFrameHash,
  idPmResetHash,
  wlGameDrawPlayScreenHash,
  wlGameSetupGameLevelHash,
} from '../../src/wolf/map/wlMap';

function bytesFrom(values: number[]): Uint8Array {
  return Uint8Array.from(values.map((v) => v & 0xff));
}

function wordsFrom(values: number[]): Uint16Array {
  return Uint16Array.from(values.map((v) => v & 0xffff));
}

function writeU16LE(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
}

function writeU32LE(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

function readU16LE(source: Uint8Array, offset: number): number {
  if (offset + 1 >= source.length) {
    return 0;
  }
  return source[offset]! | (source[offset + 1]! << 8);
}

function readS32LE(source: Uint8Array, offset: number): number {
  if (offset + 3 >= source.length) {
    return -1;
  }
  return (
    source[offset]! |
    (source[offset + 1]! << 8) |
    (source[offset + 2]! << 16) |
    (source[offset + 3]! << 24)
  ) | 0;
}

function buildSyntheticMapCase(rlewTag: number, plane0Word: number, plane1Word: number): { mapheadBytes: Uint8Array; gamemapsBytes: Uint8Array } {
  const mapheadBytes = new Uint8Array(2 + 4 * 100);
  writeU16LE(mapheadBytes, 0, rlewTag);
  for (let i = 0; i < 100; i++) {
    writeU32LE(mapheadBytes, 2 + i * 4, i === 0 ? 0 : 0xffffffff);
  }

  const headerSize = 38;
  const planeChunkSize = 6;
  const plane0Start = headerSize;
  const plane1Start = headerSize + planeChunkSize;
  const gamemapsBytes = new Uint8Array(headerSize + planeChunkSize * 2);

  writeU32LE(gamemapsBytes, 0, plane0Start);
  writeU32LE(gamemapsBytes, 4, plane1Start);
  writeU32LE(gamemapsBytes, 8, 0);
  writeU16LE(gamemapsBytes, 12, planeChunkSize);
  writeU16LE(gamemapsBytes, 14, planeChunkSize);
  writeU16LE(gamemapsBytes, 16, 0);
  writeU16LE(gamemapsBytes, 18, 64);
  writeU16LE(gamemapsBytes, 20, 64);

  // Carmack chunk: [expandedBytes][word0][word1]. word0 is skipped by CA_CacheMap before RLEW.
  writeU16LE(gamemapsBytes, plane0Start + 0, 4);
  writeU16LE(gamemapsBytes, plane0Start + 2, 0);
  writeU16LE(gamemapsBytes, plane0Start + 4, plane0Word);

  writeU16LE(gamemapsBytes, plane1Start + 0, 4);
  writeU16LE(gamemapsBytes, plane1Start + 2, 0);
  writeU16LE(gamemapsBytes, plane1Start + 4, plane1Word);

  return { mapheadBytes, gamemapsBytes };
}

function buildTrimmedWl1MapCase(mapheadBytes: Uint8Array, gamemapsBytes: Uint8Array, mapnum: number): { mapheadBytes: Uint8Array; gamemapsBytes: Uint8Array } {
  const headerOffset = readS32LE(mapheadBytes, 2 + mapnum * 4);
  if (headerOffset < 0 || headerOffset + 38 > gamemapsBytes.length) {
    return buildSyntheticMapCase(readU16LE(mapheadBytes, 0), 0, 0);
  }

  const plane0Start = readS32LE(gamemapsBytes, headerOffset + 0);
  const plane1Start = readS32LE(gamemapsBytes, headerOffset + 4);
  const plane0Len = readU16LE(gamemapsBytes, headerOffset + 12);
  const plane1Len = readU16LE(gamemapsBytes, headerOffset + 14);
  const width = readU16LE(gamemapsBytes, headerOffset + 18);
  const height = readU16LE(gamemapsBytes, headerOffset + 20);
  const name = gamemapsBytes.slice(headerOffset + 22, headerOffset + 38);

  const safePlane0Start = Math.max(0, Math.min(plane0Start, gamemapsBytes.length));
  const safePlane1Start = Math.max(0, Math.min(plane1Start, gamemapsBytes.length));
  const safePlane0End = Math.max(safePlane0Start, Math.min(safePlane0Start + plane0Len, gamemapsBytes.length));
  const safePlane1End = Math.max(safePlane1Start, Math.min(safePlane1Start + plane1Len, gamemapsBytes.length));

  const plane0 = gamemapsBytes.slice(safePlane0Start, safePlane0End);
  const plane1 = gamemapsBytes.slice(safePlane1Start, safePlane1End);

  const tinyMaphead = new Uint8Array(2 + 4 * 100);
  writeU16LE(tinyMaphead, 0, readU16LE(mapheadBytes, 0));
  for (let i = 0; i < 100; i++) {
    writeU32LE(tinyMaphead, 2 + i * 4, i === 0 ? 0 : 0xffffffff);
  }

  const headerSize = 38;
  const tinyGamemaps = new Uint8Array(headerSize + plane0.length + plane1.length);
  const tinyPlane0Start = headerSize;
  const tinyPlane1Start = headerSize + plane0.length;

  writeU32LE(tinyGamemaps, 0, tinyPlane0Start);
  writeU32LE(tinyGamemaps, 4, tinyPlane1Start);
  writeU32LE(tinyGamemaps, 8, 0);
  writeU16LE(tinyGamemaps, 12, plane0.length);
  writeU16LE(tinyGamemaps, 14, plane1.length);
  writeU16LE(tinyGamemaps, 16, 0);
  writeU16LE(tinyGamemaps, 18, width);
  writeU16LE(tinyGamemaps, 20, height);
  tinyGamemaps.set(name.subarray(0, 16), 22);
  tinyGamemaps.set(plane0, tinyPlane0Start);
  tinyGamemaps.set(plane1, tinyPlane1Start);

  return { mapheadBytes: tinyMaphead, gamemapsBytes: tinyGamemaps };
}

describe('phase 2 real WOLFSRC map/cache parity', () => {
  let oracle: OracleBridge;
  let mapheadBytes: Uint8Array;
  let gamemapsBytes: Uint8Array;

  beforeAll(async () => {
    oracle = await getOracleBridge();
    mapheadBytes = new Uint8Array(readFileSync(join(process.cwd(), 'assets', 'wl1', 'MAPHEAD.WL1')));
    gamemapsBytes = new Uint8Array(readFileSync(join(process.cwd(), 'assets', 'wl1', 'GAMEMAPS.WL1')));
  });

  it('ID_CA.CAL_CarmackExpand hash matches oracle', () => {
    withReplay('phase2.id_ca.CAL_CarmackExpand', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 0xff }), { minLength: 0, maxLength: 512 }),
          fc.integer({ min: 0, max: 4096 }).map((n) => n & ~1),
          (source, expandedLengthBytes) => {
            const srcBytes = bytesFrom(source);
            expect(idCaCarmackExpandHash(srcBytes, expandedLengthBytes) >>> 0).toBe(
              oracle.idCaCarmackExpandHash(srcBytes, expandedLengthBytes) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_CA.CA_RLEWexpand hash matches oracle', () => {
    withReplay('phase2.id_ca.CA_RLEWexpand', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 0xffff }), { minLength: 0, maxLength: 256 }),
          fc.integer({ min: 0, max: 8192 }).map((n) => n & ~1),
          fc.integer({ min: 0, max: 0xffff }),
          (source, expandedLengthBytes, rlewTag) => {
            const srcWords = wordsFrom(source);
            expect(idCaRlewExpandHash(srcWords, expandedLengthBytes, rlewTag) >>> 0).toBe(
              oracle.idCaRlewExpandHash(srcWords, expandedLengthBytes, rlewTag) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_CA.CAL_SetupMapFile hash matches oracle', () => {
    withReplay('phase2.id_ca.CAL_SetupMapFile', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 0xff }), { minLength: 0, maxLength: 1024 }),
          (source) => {
            const bytes = bytesFrom(source);
            expect(idCaSetupMapFileHash(bytes) >>> 0).toBe(oracle.idCaSetupMapFileHash(bytes) >>> 0);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_CA.CA_CacheMap hash matches oracle (synthetic random compressed maps)', () => {
    withReplay('phase2.id_ca.CA_CacheMap', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 0xffff }),
          fc.integer({ min: 0, max: 0xffff }),
          fc.integer({ min: 0, max: 0xffff }),
          (rlewTag, plane0Word, plane1Word) => {
            const synthetic = buildSyntheticMapCase(rlewTag, plane0Word, plane1Word);
            expect(idCaCacheMapHash(synthetic.gamemapsBytes, synthetic.mapheadBytes, 0) >>> 0).toBe(
              oracle.idCaCacheMapHash(synthetic.gamemapsBytes, synthetic.mapheadBytes, 0) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_CA.CA_CacheMap stays in parity on WL1 real map fixtures', () => {
    const mapnums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (const mapnum of mapnums) {
      const tiny = buildTrimmedWl1MapCase(mapheadBytes, gamemapsBytes, mapnum);
      expect(idCaCacheMapHash(tiny.gamemapsBytes, tiny.mapheadBytes, 0) >>> 0).toBe(
        oracle.idCaCacheMapHash(tiny.gamemapsBytes, tiny.mapheadBytes, 0) >>> 0,
      );
    }
  });

  it('WL_GAME.SetupGameLevel hash matches oracle', () => {
    withReplay('phase2.wl_game.SetupGameLevel', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 32 }),
          fc.integer({ min: 1, max: 32 }),
          fc.array(fc.integer({ min: 0, max: 0xffff }), { minLength: 0, maxLength: 1024 }),
          (mapWidth, mapHeight, words) => {
            const plane0Words = wordsFrom(words);
            expect(wlGameSetupGameLevelHash(plane0Words, mapWidth, mapHeight) >>> 0).toBe(
              oracle.wlGameSetupGameLevelHash(plane0Words, mapWidth, mapHeight) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_GAME.DrawPlayScreen hash matches oracle', () => {
    withReplay('phase2.wl_game.DrawPlayScreen', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 320 }),
          fc.integer({ min: 2, max: 160 }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: 0, max: 0xffff }),
          (viewWidth, viewHeight, bufferOfs, s0, s1, s2, statusBarPic) => {
            expect(wlGameDrawPlayScreenHash(viewWidth, viewHeight, bufferOfs, s0, s1, s2, statusBarPic) >>> 0).toBe(
              oracle.wlGameDrawPlayScreenHash(viewWidth, viewHeight, bufferOfs, s0, s1, s2, statusBarPic) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_MM memory manager hash helpers match oracle', () => {
    withReplay('phase2.id_mm.memory', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -256, max: 256 }),
          (freeBytes, requestSize, purgeMask, lockMask, blockSize, slot) => {
            const mmGetPtr = idMmGetPtrHash(freeBytes, requestSize, purgeMask, lockMask) >>> 0;
            const mmGetPtrOracle = oracle.idMmGetPtrHash(freeBytes, requestSize, purgeMask, lockMask) >>> 0;
            expect(mmGetPtr).toBe(mmGetPtrOracle);

            const mmFreePtr = idMmFreePtrHash(freeBytes, blockSize, purgeMask, slot) >>> 0;
            const mmFreePtrOracle = oracle.idMmFreePtrHash(freeBytes, blockSize, purgeMask, slot) >>> 0;
            expect(mmFreePtr).toBe(mmFreePtrOracle);

            const mmSetPurge = idMmSetPurgeHash(purgeMask, lockMask, slot, requestSize & 3) >>> 0;
            const mmSetPurgeOracle = oracle.idMmSetPurgeHash(purgeMask, lockMask, slot, requestSize & 3) >>> 0;
            expect(mmSetPurge).toBe(mmSetPurgeOracle);

            const mmSetLock = idMmSetLockHash(lockMask, slot, requestSize & 1) >>> 0;
            const mmSetLockOracle = oracle.idMmSetLockHash(lockMask, slot, requestSize & 1) >>> 0;
            expect(mmSetLock).toBe(mmSetLockOracle);

            const mmSortMem = idMmSortMemHash(purgeMask, lockMask, requestSize, blockSize) >>> 0;
            const mmSortMemOracle = oracle.idMmSortMemHash(purgeMask, lockMask, requestSize, blockSize) >>> 0;
            expect(mmSortMem).toBe(mmSortMemOracle);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_PM page manager hash helpers match oracle', () => {
    withReplay('phase2.id_pm.page', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -256, max: 256 }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          (pageCount, residentMask, lockMask, pageSize, pageNum, frame) => {
            expect(idPmCheckMainMemHash(pageCount, residentMask, lockMask, pageSize) >>> 0).toBe(
              oracle.idPmCheckMainMemHash(pageCount, residentMask, lockMask, pageSize) >>> 0,
            );
            expect(idPmGetPageAddressHash(residentMask, pageNum, pageSize, frame) >>> 0).toBe(
              oracle.idPmGetPageAddressHash(residentMask, pageNum, pageSize, frame) >>> 0,
            );
            expect(idPmGetPageHash(residentMask, lockMask, pageNum, frame) >>> 0).toBe(
              oracle.idPmGetPageHash(residentMask, lockMask, pageNum, frame) >>> 0,
            );
            expect(idPmNextFrameHash(residentMask, lockMask, frame) >>> 0).toBe(
              oracle.idPmNextFrameHash(residentMask, lockMask, frame) >>> 0,
            );
            expect(idPmResetHash(pageCount, residentMask, frame) >>> 0).toBe(
              oracle.idPmResetHash(pageCount, residentMask, frame) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('phase 2 WL1 deterministic setup-mapfile fixture stays in parity', () => {
    expect(idCaSetupMapFileHash(mapheadBytes) >>> 0).toBe(oracle.idCaSetupMapFileHash(mapheadBytes) >>> 0);
  });
});

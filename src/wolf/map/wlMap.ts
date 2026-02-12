const NEARTAG = 0xa7;
const FARTAG = 0xa8;
const AREATILE = 107;
const AMBUSHTILE = 106;
const STATUSLINES = 40;

const MAPPLANES = 2;
const MAPWORDS = 64 * 64;

interface MapHeaderInfo {
  rlewTag: number;
  headerOffsets: Int32Array;
}

interface MapHeader {
  planeStart: Int32Array;
  planeLength: Uint16Array;
  width: number;
  height: number;
  name: Uint8Array;
}

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function popcount32(value: number): number {
  let v = value >>> 0;
  let count = 0;
  while (v !== 0) {
    count += v & 1;
    v >>>= 1;
  }
  return count | 0;
}

function clampS32(value: number): number {
  if (value > 0x7fffffff) {
    return 0x7fffffff;
  }
  if (value < -0x80000000) {
    return -0x80000000;
  }
  return value | 0;
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

function parseMapHead(mapheadBytes: Uint8Array): MapHeaderInfo {
  const rlewTag = readU16(mapheadBytes, 0);
  const headerOffsets = new Int32Array(100);
  for (let i = 0; i < headerOffsets.length; i++) {
    headerOffsets[i] = readS32(mapheadBytes, 2 + i * 4);
  }
  return { rlewTag, headerOffsets };
}

function parseMapHeader(gamemapsBytes: Uint8Array, offset: number): MapHeader {
  const planeStart = new Int32Array(3);
  const planeLength = new Uint16Array(3);
  for (let i = 0; i < 3; i++) {
    planeStart[i] = readS32(gamemapsBytes, offset + i * 4);
  }
  for (let i = 0; i < 3; i++) {
    planeLength[i] = readU16(gamemapsBytes, offset + 12 + i * 2);
  }
  const width = readU16(gamemapsBytes, offset + 18);
  const height = readU16(gamemapsBytes, offset + 20);
  const name = gamemapsBytes.slice(offset + 22, offset + 38);
  return { planeStart, planeLength, width, height, name };
}

export function idCaCarmackExpandWords(sourceBytes: Uint8Array, expandedLengthBytes: number): Uint16Array {
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

export function idCaCarmackExpandHash(sourceBytes: Uint8Array, expandedLengthBytes: number): number {
  const out = idCaCarmackExpandWords(sourceBytes, expandedLengthBytes);
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < out.length; i++) {
    hash = fnv1a(hash, out[i] ?? 0);
  }
  return fnv1a(hash, out.length) >>> 0;
}

export function idCaRlewExpandWords(sourceWords: Uint16Array, expandedLengthBytes: number, rlewTag: number): Uint16Array {
  const outWords = Math.max(0, expandedLengthBytes | 0) >>> 1;
  const out = new Uint16Array(outWords);

  let src = 0;
  let dst = 0;
  const tag = rlewTag & 0xffff;

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

export function idCaRlewExpandHash(sourceWords: Uint16Array, expandedLengthBytes: number, rlewTag: number): number {
  const out = idCaRlewExpandWords(sourceWords, expandedLengthBytes, rlewTag);
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < out.length; i++) {
    hash = fnv1a(hash, out[i] ?? 0);
  }
  hash = fnv1a(hash, out.length);
  hash = fnv1a(hash, rlewTag & 0xffff);
  return hash >>> 0;
}

export function idCaSetupMapFileHash(mapheadBytes: Uint8Array): number {
  const info = parseMapHead(mapheadBytes);
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, info.rlewTag & 0xffff);
  let valid = 0;
  for (let i = 0; i < info.headerOffsets.length; i++) {
    const value = info.headerOffsets[i] | 0;
    hash = fnv1a(hash, value);
    if (value >= 0) {
      valid++;
    }
  }
  hash = fnv1a(hash, valid);
  hash = fnv1a(hash, mapheadBytes.length);
  return hash >>> 0;
}

export function idCaCacheMapHash(gamemapsBytes: Uint8Array, mapheadBytes: Uint8Array, mapnum: number): number {
  const info = parseMapHead(mapheadBytes);
  const index = mapnum | 0;
  if (index < 0 || index >= info.headerOffsets.length) {
    return 0;
  }

  const headerOffset = info.headerOffsets[index] | 0;
  if (headerOffset < 0 || headerOffset + 38 > gamemapsBytes.length) {
    return 0;
  }

  const header = parseMapHeader(gamemapsBytes, headerOffset);
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, header.width);
  hash = fnv1a(hash, header.height);
  hash = fnv1a(hash, info.rlewTag);
  for (let i = 0; i < header.name.length; i++) {
    hash = fnv1a(hash, header.name[i] ?? 0);
  }

  for (let plane = 0; plane < MAPPLANES; plane++) {
    const pos = header.planeStart[plane] | 0;
    const compressed = header.planeLength[plane] | 0;
    if (pos < 0 || compressed <= 2 || pos + compressed > gamemapsBytes.length) {
      hash = fnv1a(hash, plane);
      continue;
    }

    const source = gamemapsBytes.subarray(pos, pos + compressed);
    const expanded = readU16(source, 0);
    const carmack = idCaCarmackExpandWords(source.subarray(2), expanded);
    const rlewSource = carmack.subarray(carmack.length > 0 ? 1 : 0);
    const planeWords = idCaRlewExpandWords(rlewSource, MAPWORDS * 2, info.rlewTag);
    hash = fnv1a(hash, plane);
    for (let i = 0; i < planeWords.length; i++) {
      hash = fnv1a(hash, planeWords[i] ?? 0);
    }
  }

  return hash >>> 0;
}

export function wlGameSetupGameLevelHash(plane0Words: Uint16Array, mapWidth: number, mapHeight: number): number {
  const width = Math.max(1, mapWidth | 0);
  const height = Math.max(1, mapHeight | 0);
  const total = width * height;

  const map = new Uint16Array(total);
  const tilemap = new Uint16Array(total);
  const actorat = new Uint16Array(total);

  for (let i = 0; i < total; i++) {
    const tile = plane0Words[i] ?? 0;
    map[i] = tile;
    if (tile < AREATILE) {
      tilemap[i] = tile;
      actorat[i] = tile;
    }
  }

  let doorCount = 0;
  let verticalDoors = 0;
  let lockHash = 2166136261 >>> 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const tile = map[idx] ?? 0;
      if (tile < 90 || tile > 101) {
        continue;
      }

      doorCount++;
      if ((tile & 1) === 0) {
        verticalDoors++;
        lockHash = fnv1a(lockHash, ((tile - 90) / 2) | 0);
      } else {
        lockHash = fnv1a(lockHash, ((tile - 91) / 2) | 0);
      }
      lockHash = fnv1a(lockHash, x);
      lockHash = fnv1a(lockHash, y);
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const tile = map[idx] ?? 0;
      if (tile !== AMBUSHTILE) {
        continue;
      }

      tilemap[idx] = 0;
      if (actorat[idx] === AMBUSHTILE) {
        actorat[idx] = 0;
      }

      let replacement = tile;
      if (x + 1 < width && (map[idx + 1] ?? 0) >= AREATILE) {
        replacement = map[idx + 1] ?? 0;
      }
      if (y > 0 && (map[idx - width] ?? 0) >= AREATILE) {
        replacement = map[idx - width] ?? 0;
      }
      if (y + 1 < height && (map[idx + width] ?? 0) >= AREATILE) {
        replacement = map[idx + width] ?? 0;
      }
      if (x > 0 && (map[idx - 1] ?? 0) >= AREATILE) {
        replacement = map[idx - 1] ?? 0;
      }
      map[idx] = replacement;
    }
  }

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, width);
  hash = fnv1a(hash, height);
  hash = fnv1a(hash, doorCount);
  hash = fnv1a(hash, verticalDoors);
  hash = fnv1a(hash, lockHash);

  for (let i = 0; i < total; i++) {
    hash = fnv1a(hash, tilemap[i] ?? 0);
    hash = fnv1a(hash, actorat[i] ?? 0);
    hash = fnv1a(hash, map[i] ?? 0);
  }

  return hash >>> 0;
}

function hashDrawPlayBorder(hashIn: number, viewWidth: number, viewHeight: number): number {
  let hash = hashIn >>> 0;
  const xl = (160 - ((viewWidth / 2) | 0)) | 0;
  const yl = ((200 - STATUSLINES - viewHeight) / 2) | 0;

  hash = fnv1a(hash, 0x10);
  hash = fnv1a(hash, 0);
  hash = fnv1a(hash, 0);
  hash = fnv1a(hash, 320);
  hash = fnv1a(hash, 200 - STATUSLINES);
  hash = fnv1a(hash, 127);

  hash = fnv1a(hash, 0x11);
  hash = fnv1a(hash, xl);
  hash = fnv1a(hash, yl);
  hash = fnv1a(hash, viewWidth);
  hash = fnv1a(hash, viewHeight);
  hash = fnv1a(hash, 0);

  hash = fnv1a(hash, 0x12);
  hash = fnv1a(hash, xl - 1);
  hash = fnv1a(hash, xl + viewWidth);
  hash = fnv1a(hash, yl - 1);
  hash = fnv1a(hash, 0);

  hash = fnv1a(hash, 0x13);
  hash = fnv1a(hash, xl - 1);
  hash = fnv1a(hash, xl + viewWidth);
  hash = fnv1a(hash, yl + viewHeight);
  hash = fnv1a(hash, 125);

  hash = fnv1a(hash, 0x14);
  hash = fnv1a(hash, yl - 1);
  hash = fnv1a(hash, yl + viewHeight);
  hash = fnv1a(hash, xl - 1);
  hash = fnv1a(hash, 0);

  hash = fnv1a(hash, 0x15);
  hash = fnv1a(hash, yl - 1);
  hash = fnv1a(hash, yl + viewHeight);
  hash = fnv1a(hash, xl + viewWidth);
  hash = fnv1a(hash, 125);

  hash = fnv1a(hash, 0x16);
  hash = fnv1a(hash, xl - 1);
  hash = fnv1a(hash, yl + viewHeight);
  hash = fnv1a(hash, 124);
  return hash >>> 0;
}

export function wlGameDrawPlayScreenHash(
  viewWidth: number,
  viewHeight: number,
  bufferOfs: number,
  screenLoc0: number,
  screenLoc1: number,
  screenLoc2: number,
  statusBarPic: number,
): number {
  let hash = 2166136261 >>> 0;
  let currentBuffer = bufferOfs | 0;
  const temp = currentBuffer;
  const screens = [screenLoc0 | 0, screenLoc1 | 0, screenLoc2 | 0];

  hash = fnv1a(hash, 0x01); // VW_FadeOut
  hash = fnv1a(hash, 0x02); // CA_CacheGrChunk
  hash = fnv1a(hash, statusBarPic | 0);

  for (let i = 0; i < screens.length; i++) {
    currentBuffer = screens[i]!;
    hash = fnv1a(hash, currentBuffer);
    hash = hashDrawPlayBorder(hash, viewWidth | 0, viewHeight | 0);
    hash = fnv1a(hash, 0x20); // VWB_DrawPic
    hash = fnv1a(hash, 0);
    hash = fnv1a(hash, 200 - STATUSLINES);
    hash = fnv1a(hash, statusBarPic | 0);
  }

  currentBuffer = temp;
  hash = fnv1a(hash, currentBuffer);
  hash = fnv1a(hash, 0x03); // UNCACHEGRCHUNK
  hash = fnv1a(hash, statusBarPic | 0);

  const hudOps = [0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37];
  for (const op of hudOps) {
    hash = fnv1a(hash, op);
  }

  return hash >>> 0;
}

export function idMmGetPtrHash(freeBytes: number, requestSize: number, purgeMask: number, lockMask: number): number {
  const request = requestSize < 0 ? 0 : (requestSize | 0);
  let remaining = clampS32((freeBytes | 0) - request);
  const granted = remaining >= 0 ? 1 : 0;
  if (remaining < 0) {
    remaining = -1;
  }
  const slot = (request ^ ((freeBytes | 0) >> 3) ^ (purgeMask | 0) ^ ((lockMask | 0) << 1)) & 31;
  const nextLockMask = ((lockMask >>> 0) | (1 << slot)) >>> 0;

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, request);
  hash = fnv1a(hash, remaining);
  hash = fnv1a(hash, granted);
  hash = fnv1a(hash, slot);
  hash = fnv1a(hash, purgeMask);
  hash = fnv1a(hash, lockMask);
  hash = fnv1a(hash, nextLockMask);
  return hash >>> 0;
}

export function idMmFreePtrHash(freeBytes: number, blockSize: number, allocMask: number, slot: number): number {
  const idx = slot & 31;
  const bit = (1 << idx) >>> 0;
  const size = blockSize < 0 ? 0 : (blockSize | 0);
  const released = ((allocMask >>> 0) & bit) !== 0 ? size : 0;
  const nextFreeBytes = clampS32((freeBytes | 0) + released);
  const nextAllocMask = ((allocMask >>> 0) & (~bit >>> 0)) >>> 0;

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, freeBytes);
  hash = fnv1a(hash, size);
  hash = fnv1a(hash, allocMask);
  hash = fnv1a(hash, idx);
  hash = fnv1a(hash, released);
  hash = fnv1a(hash, nextFreeBytes);
  hash = fnv1a(hash, nextAllocMask);
  return hash >>> 0;
}

export function idMmSetPurgeHash(purgeMask: number, lockMask: number, slot: number, purgeLevel: number): number {
  const idx = slot & 31;
  const bit = (1 << idx) >>> 0;
  const locked = ((lockMask >>> 0) & bit) !== 0 ? 1 : 0;
  const purgeable = purgeLevel > 0 ? 1 : 0;
  let nextPurgeMask = purgeMask >>> 0;
  if (locked === 0) {
    nextPurgeMask = (((purgeMask >>> 0) & (~bit >>> 0)) | ((purgeable << idx) >>> 0)) >>> 0;
  }

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, purgeMask);
  hash = fnv1a(hash, lockMask);
  hash = fnv1a(hash, idx);
  hash = fnv1a(hash, purgeLevel);
  hash = fnv1a(hash, locked);
  hash = fnv1a(hash, nextPurgeMask);
  return hash >>> 0;
}

export function idMmSetLockHash(lockMask: number, slot: number, locked: number): number {
  const idx = slot & 31;
  const bit = (1 << idx) >>> 0;
  const normalizedLocked = locked !== 0 ? 1 : 0;
  const nextLockMask = normalizedLocked !== 0 ? ((lockMask >>> 0) | bit) >>> 0 : ((lockMask >>> 0) & (~bit >>> 0)) >>> 0;

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, lockMask);
  hash = fnv1a(hash, idx);
  hash = fnv1a(hash, normalizedLocked);
  hash = fnv1a(hash, nextLockMask);
  return hash >>> 0;
}

export function idMmSortMemHash(allocMask: number, purgeMask: number, lockMask: number, lowWaterMark: number): number {
  const movable = ((allocMask >>> 0) & (purgeMask >>> 0) & (~(lockMask >>> 0) >>> 0)) >>> 0;
  const movedBlocks = popcount32(movable);
  let compactedWaterMark = clampS32((lowWaterMark | 0) + movedBlocks * 256);
  if (compactedWaterMark < 0) {
    compactedWaterMark = 0;
  }

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, allocMask);
  hash = fnv1a(hash, purgeMask);
  hash = fnv1a(hash, lockMask);
  hash = fnv1a(hash, movable);
  hash = fnv1a(hash, movedBlocks);
  hash = fnv1a(hash, compactedWaterMark);
  return hash >>> 0;
}

export function idPmCheckMainMemHash(pageCount: number, residentMask: number, lockMask: number, pageSize: number): number {
  const totalPages = pageCount < 0 ? 0 : (pageCount | 0);
  const residentPages = popcount32(residentMask);
  const lockedPages = popcount32((lockMask >>> 0) & (residentMask >>> 0));
  let freePages = totalPages - residentPages;
  if (freePages < 0) {
    freePages = 0;
  }
  const size = pageSize < 0 ? 0 : (pageSize | 0);
  const freeBytes = clampS32(freePages * size);
  const pressure = lockedPages > freePages ? 1 : 0;

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, totalPages);
  hash = fnv1a(hash, residentMask);
  hash = fnv1a(hash, lockMask);
  hash = fnv1a(hash, residentPages);
  hash = fnv1a(hash, lockedPages);
  hash = fnv1a(hash, freeBytes);
  hash = fnv1a(hash, pressure);
  return hash >>> 0;
}

export function idPmGetPageAddressHash(residentMask: number, pageNum: number, pageSize: number, frame: number): number {
  const idx = pageNum & 31;
  const bit = (1 << idx) >>> 0;
  const resident = ((residentMask >>> 0) & bit) !== 0 ? 1 : 0;
  const size = pageSize < 0 ? 0 : (pageSize | 0);
  const address = resident !== 0 ? clampS32(((frame | 0) + idx) * size) : -1;

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, residentMask);
  hash = fnv1a(hash, idx);
  hash = fnv1a(hash, size);
  hash = fnv1a(hash, frame);
  hash = fnv1a(hash, resident);
  hash = fnv1a(hash, address);
  return hash >>> 0;
}

export function idPmGetPageHash(residentMask: number, lockMask: number, pageNum: number, frame: number): number {
  const idx = pageNum & 31;
  const bit = (1 << idx) >>> 0;
  const wasResident = ((residentMask >>> 0) & bit) !== 0 ? 1 : 0;
  const locked = ((lockMask >>> 0) & bit) !== 0 ? 1 : 0;
  let nextResidentMask = residentMask >>> 0;
  let loaded = 0;
  if (wasResident === 0 && locked === 0) {
    nextResidentMask = ((nextResidentMask | bit) >>> 0);
    loaded = 1;
  }
  const frameSlot = (((frame | 0) + idx) & 31) | 0;

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, residentMask);
  hash = fnv1a(hash, lockMask);
  hash = fnv1a(hash, idx);
  hash = fnv1a(hash, wasResident);
  hash = fnv1a(hash, locked);
  hash = fnv1a(hash, loaded);
  hash = fnv1a(hash, frameSlot);
  hash = fnv1a(hash, nextResidentMask);
  return hash >>> 0;
}

export function idPmNextFrameHash(residentMask: number, lockMask: number, frame: number): number {
  const nextFrame = ((frame | 0) + 1) & 0x7fff;
  const residentPages = popcount32(residentMask);
  const lockedPages = popcount32((lockMask >>> 0) & (residentMask >>> 0));
  let thrashBudget = residentPages - lockedPages;
  if (thrashBudget < 0) {
    thrashBudget = 0;
  }

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, residentMask);
  hash = fnv1a(hash, lockMask);
  hash = fnv1a(hash, frame);
  hash = fnv1a(hash, nextFrame);
  hash = fnv1a(hash, thrashBudget);
  return hash >>> 0;
}

export function idPmResetHash(pageCount: number, preloadMask: number, frameSeed: number): number {
  const clampedPages = pageCount < 0 ? 0 : Math.min(32, pageCount | 0);
  const activeMask = clampedPages === 32 ? 0xffffffff : ((1 << clampedPages) - 1) >>> 0;
  const residentMask = (preloadMask >>> 0) & activeMask;
  const nextFrame = frameSeed & 0x7fff;
  const warmPages = popcount32(residentMask);

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, clampedPages);
  hash = fnv1a(hash, preloadMask);
  hash = fnv1a(hash, residentMask);
  hash = fnv1a(hash, warmPages);
  hash = fnv1a(hash, nextFrame);
  return hash >>> 0;
}

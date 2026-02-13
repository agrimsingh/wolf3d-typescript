import type {
  DecodedSpriteChunk,
  DecodedSpritePost,
  DecodedWallTexture,
  Wl6VswapIndexMetadata,
} from '../wolf/io/types';
import { idCaCarmackExpandWords, idCaRlewExpandWords } from '../wolf/map/wlMap';

export interface VswapIndex extends Wl6VswapIndexMetadata {}

export interface SpriteColumnPosts {
  spriteId: number;
  chunkId: number;
  firstCol: number;
  lastCol: number;
  columnOffsets: Uint16Array;
  postsByColumn: DecodedSpritePost[][];
  pixelPool: Uint8Array;
}

export interface DecodedMapPlanes {
  plane0: Uint16Array;
  plane1: Uint16Array;
  width: number;
  height: number;
  mapName: string;
}

function readU16(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || offset + 1 >= bytes.length) {
    return 0;
  }
  return ((bytes[offset]! | (bytes[offset + 1]! << 8)) & 0xffff) >>> 0;
}

function readU32(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || offset + 3 >= bytes.length) {
    return 0;
  }
  return (
    (bytes[offset]!) |
    (bytes[offset + 1]! << 8) |
    (bytes[offset + 2]! << 16) |
    (bytes[offset + 3]! << 24)
  ) >>> 0;
}

function readS32(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || offset + 3 >= bytes.length) {
    return -1;
  }
  const value = (
    (bytes[offset]!) |
    (bytes[offset + 1]! << 8) |
    (bytes[offset + 2]! << 16) |
    (bytes[offset + 3]! << 24)
  );
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

export function decodeVswapIndex(bytes: Uint8Array): VswapIndex {
  const chunkCount = readU16(bytes, 0);
  const spriteStart = readU16(bytes, 2);
  const soundStart = readU16(bytes, 4);

  if (chunkCount <= 0) {
    return {
      chunkCount: 0,
      chunkOffsets: new Uint32Array(0),
      chunkLengths: new Uint16Array(0),
      wallCount: 0,
      spriteStart: 0,
      soundStart: 0,
      wallTextureChunks: 0,
    };
  }

  const offsetTableStart = 6;
  const lengthTableStart = offsetTableStart + chunkCount * 4;
  if (lengthTableStart + chunkCount * 2 > bytes.length) {
    return {
      chunkCount,
      chunkOffsets: new Uint32Array(0),
      chunkLengths: new Uint16Array(0),
      wallCount: 0,
      spriteStart: 0,
      soundStart: 0,
      wallTextureChunks: 0,
    };
  }

  const chunkOffsets = new Uint32Array(chunkCount);
  const chunkLengths = new Uint16Array(chunkCount);
  for (let i = 0; i < chunkCount; i++) {
    chunkOffsets[i] = readU32(bytes, offsetTableStart + i * 4) >>> 0;
    chunkLengths[i] = readU16(bytes, lengthTableStart + i * 2) & 0xffff;
  }

  const wallCount = Math.max(0, Math.min(spriteStart, chunkCount)) | 0;
  return {
    chunkCount: chunkCount | 0,
    chunkOffsets,
    chunkLengths,
    wallCount,
    spriteStart: spriteStart | 0,
    soundStart: soundStart | 0,
    wallTextureChunks: wallCount,
  };
}

export function decodeWallTexture(bytes: Uint8Array, index: VswapIndex, chunkId: number): Uint8Array {
  const id = chunkId | 0;
  if (id < 0 || id >= index.wallCount) {
    return new Uint8Array(64 * 64);
  }
  const off = index.chunkOffsets[id] ?? 0;
  const len = index.chunkLengths[id] ?? 0;
  if (off <= 0 || len < 64 * 64 || off + len > bytes.length) {
    return new Uint8Array(64 * 64);
  }
  return bytes.slice(off, off + 64 * 64);
}

export function decodeWallTextureChunk(bytes: Uint8Array, index: VswapIndex, chunkId: number): DecodedWallTexture {
  const id = chunkId | 0;
  const off = index.chunkOffsets[id] ?? 0;
  const len = index.chunkLengths[id] ?? 0;
  if (id < 0 || id >= index.wallCount || off <= 0 || len < 64 * 64 || off + len > bytes.length) {
    return {
      id,
      pixelsColumnMajor64x64: new Uint8Array(64 * 64),
    };
  }
  return {
    id,
    pixelsColumnMajor64x64: bytes.slice(off, off + 64 * 64),
  };
}

export function decodeSpriteColumnPosts(bytes: Uint8Array, index: VswapIndex, spriteId: number): SpriteColumnPosts {
  const sid = spriteId | 0;
  const chunkId = (index.spriteStart + sid) | 0;
  if (sid < 0 || chunkId < 0 || chunkId >= index.chunkCount) {
    return {
      spriteId: sid,
      chunkId,
      firstCol: 0,
      lastCol: -1,
      columnOffsets: new Uint16Array(0),
      postsByColumn: [],
      pixelPool: new Uint8Array(0),
    };
  }

  const chunkOffset = index.chunkOffsets[chunkId] ?? 0;
  const chunkLength = index.chunkLengths[chunkId] ?? 0;
  if (chunkOffset <= 0 || chunkLength <= 0 || chunkOffset + chunkLength > bytes.length) {
    return {
      spriteId: sid,
      chunkId,
      firstCol: 0,
      lastCol: -1,
      columnOffsets: new Uint16Array(0),
      postsByColumn: [],
      pixelPool: new Uint8Array(0),
    };
  }

  const chunk = bytes.subarray(chunkOffset, chunkOffset + chunkLength);
  const firstCol = readU16(chunk, 0) | 0;
  const lastCol = readU16(chunk, 2) | 0;
  if (lastCol < firstCol) {
    return {
      spriteId: sid,
      chunkId,
      firstCol: 0,
      lastCol: -1,
      columnOffsets: new Uint16Array(0),
      postsByColumn: [],
      pixelPool: new Uint8Array(0),
    };
  }

  const colCount = (lastCol - firstCol + 1) | 0;
  const columnOffsets = new Uint16Array(colCount);
  for (let i = 0; i < colCount; i++) {
    columnOffsets[i] = readU16(chunk, 4 + i * 2) & 0xffff;
  }

  let minPostOffset = chunk.length;
  for (let i = 0; i < colCount; i++) {
    const off = columnOffsets[i] ?? 0;
    if (off >= 0 && off < minPostOffset) {
      minPostOffset = off;
    }
  }
  if (minPostOffset < 4 + colCount * 2 || minPostOffset > chunk.length) {
    minPostOffset = chunk.length;
  }
  const pixelPool = chunk.subarray(4 + colCount * 2, minPostOffset);

  const postsByColumn: DecodedSpritePost[][] = [];
  let pixelCursor = 0;
  for (let i = 0; i < colCount; i++) {
    const posts: DecodedSpritePost[] = [];
    let postOffset = columnOffsets[i] ?? 0;
    if (postOffset < 0 || postOffset >= chunk.length) {
      postsByColumn.push(posts);
      continue;
    }

    while (postOffset + 5 < chunk.length) {
      const endRow = (readU16(chunk, postOffset) >>> 1) | 0;
      if (endRow === 0) {
        break;
      }
      const startRow = (readU16(chunk, postOffset + 4) >>> 1) | 0;
      const pixelCount = Math.max(0, endRow - startRow) | 0;
      const boundedOffset = Math.max(0, Math.min(pixelCursor, pixelPool.length)) | 0;
      const boundedCount = Math.max(0, Math.min(pixelCount, pixelPool.length - boundedOffset)) | 0;
      posts.push({
        startRow,
        endRow,
        pixelOffset: boundedOffset,
        pixelCount: boundedCount,
      });
      pixelCursor = (pixelCursor + pixelCount) | 0;
      postOffset += 6;
    }
    postsByColumn.push(posts);
  }

  return {
    spriteId: sid,
    chunkId,
    firstCol,
    lastCol,
    columnOffsets,
    postsByColumn,
    pixelPool: pixelPool.slice(),
  };
}

export function decodeSpriteChunk(bytes: Uint8Array, index: VswapIndex, spriteId: number): DecodedSpriteChunk {
  const decoded = decodeSpriteColumnPosts(bytes, index, spriteId);
  return {
    id: decoded.spriteId,
    chunkId: decoded.chunkId,
    firstCol: decoded.firstCol,
    lastCol: decoded.lastCol,
    columnOffsets: decoded.columnOffsets,
    postsByColumn: decoded.postsByColumn,
    pixelPool: decoded.pixelPool,
  };
}

export function buildMapPlanes(mapheadBytes: Uint8Array, gamemapsBytes: Uint8Array, level: number): DecodedMapPlanes {
  const levelIndex = level | 0;
  const rlewTag = readU16(mapheadBytes, 0);
  const headerOffset = readS32(mapheadBytes, 2 + levelIndex * 4);
  if (headerOffset < 0 || headerOffset + 38 > gamemapsBytes.length) {
    return {
      plane0: new Uint16Array(0),
      plane1: new Uint16Array(0),
      width: 0,
      height: 0,
      mapName: '',
    };
  }

  const planeStart0 = readS32(gamemapsBytes, headerOffset + 0);
  const planeStart1 = readS32(gamemapsBytes, headerOffset + 4);
  const planeLength0 = readU16(gamemapsBytes, headerOffset + 12);
  const planeLength1 = readU16(gamemapsBytes, headerOffset + 14);
  const width = readU16(gamemapsBytes, headerOffset + 18) | 0;
  const height = readU16(gamemapsBytes, headerOffset + 20) | 0;
  const mapName = decodeAsciiName(gamemapsBytes.subarray(headerOffset + 22, headerOffset + 38));

  if (
    width <= 0
    || height <= 0
    || planeStart0 < 0
    || planeStart1 < 0
    || planeLength0 <= 2
    || planeLength1 <= 2
    || planeStart0 + planeLength0 > gamemapsBytes.length
    || planeStart1 + planeLength1 > gamemapsBytes.length
  ) {
    return {
      plane0: new Uint16Array(0),
      plane1: new Uint16Array(0),
      width: 0,
      height: 0,
      mapName,
    };
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

  return {
    plane0,
    plane1,
    width,
    height,
    mapName,
  };
}

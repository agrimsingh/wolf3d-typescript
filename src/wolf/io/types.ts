export interface Wl6AssetPaths {
  gamemaps: string;
  maphead: string;
  vswap: string;
  vgagraph: string;
  vgahead: string;
  vgadict: string;
  audiohed: string;
  audiot: string;
}

export type RuntimeAssetPaths = Wl6AssetPaths;

export interface Wl6AssetPackage {
  rootDir: string;
  files: Wl6AssetPaths;
  metadata?: Wl6AssetMetadata;
}

export type RuntimeAssetPackage = Wl6AssetPackage;

export interface Wl6AssetMetadata {
  variant: 'WL6';
  validatedAt: string;
  fileSizes: Record<string, number>;
  checksums?: Record<string, string>;
}

export interface RuntimeAssetMetadata {
  variant: 'WL6';
  validatedAt: string;
  fileSizes: Record<string, number>;
  checksums?: Record<string, string>;
}

export type Wl6RuntimeAssetMetadata = Wl6AssetMetadata;

export interface ChunkIndexEntry {
  chunkId: number;
  offset: number;
  compressedLength: number;
  expandedLength?: number;
}

export interface AssetChunkIndexTable {
  source: string;
  entries: ChunkIndexEntry[];
}

export interface DecodedMapPlane {
  width: number;
  height: number;
  tiles: Uint16Array;
}

export interface DecodedMapLevel {
  levelIndex: number;
  name: string;
  width: number;
  height: number;
  playerStartTileX: number;
  playerStartTileY: number;
  playerStartAngleDeg: number;
  planes: [DecodedMapPlane, DecodedMapPlane, DecodedMapPlane];
}

export interface Wl6VswapIndexMetadata {
  chunkCount: number;
  chunkOffsets: Uint32Array;
  chunkLengths: Uint16Array;
  wallCount: number;
  spriteStart: number;
  soundStart: number;
  wallTextureChunks: number;
}

export interface DecodedWallTexture {
  id: number;
  // 64x64 palette indexes in column-major order (VSWAP native layout).
  pixelsColumnMajor64x64: Uint8Array;
}

export interface DecodedSpritePost {
  startRow: number;
  endRow: number;
  pixelOffset: number;
  pixelCount: number;
}

export interface DecodedSpriteChunk {
  id: number;
  chunkId: number;
  firstCol: number;
  lastCol: number;
  columnOffsets: Uint16Array;
  postsByColumn: DecodedSpritePost[][];
  pixelPool: Uint8Array;
}

export interface Wl6AudioIndexMetadata {
  chunkCount: number;
  offsets: Uint32Array;
}

export interface BinaryChunk {
  id: string;
  offset: number;
  length: number;
  data: Uint8Array;
}

export interface MapChunk {
  mapIndex: number;
  width: number;
  height: number;
  planes: [Uint16Array, Uint16Array, Uint16Array];
}

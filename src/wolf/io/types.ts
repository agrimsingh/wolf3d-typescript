export interface Wl1AssetPaths {
  gamemaps: string;
  maphead: string;
  vswap: string;
  vgagraph: string;
  vgahead: string;
  vgadict: string;
  audiohed: string;
  audiot: string;
}

export interface Wl1AssetPackage {
  rootDir: string;
  files: Wl1AssetPaths;
  metadata?: Wl1AssetMetadata;
}

export interface Wl1AssetMetadata {
  variant: 'WL6';
  validatedAt: string;
  fileSizes: Record<string, number>;
  checksums?: Record<string, string>;
}

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

export interface Wl1VswapIndexMetadata {
  chunkCount: number;
  spriteStart: number;
  soundStart: number;
  wallTextureChunks: number;
}

export interface Wl1AudioIndexMetadata {
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

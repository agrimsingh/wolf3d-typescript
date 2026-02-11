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

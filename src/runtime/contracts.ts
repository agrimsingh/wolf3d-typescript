import type { DecodedSpriteChunk, Wl6VswapIndexMetadata } from '../wolf/io/types';

export interface RuntimeConfig {
  // Variant/profile selector for asset and fixture pipelines.
  variant?: 'WL6';
  // Legacy 8x8 compatibility bits. Runtime derives these from full map state when omitted.
  mapLo?: number;
  mapHi?: number;
  // Deprecated: full-map mode now auto-enables when plane data is present.
  enableFullMapRuntime?: boolean;
  mapIndex?: number;
  mapName?: string;
  mapWidth?: number;
  mapHeight?: number;
  // Deprecated: runtime derives window origin from world position when possible.
  runtimeWindowOriginX?: number;
  runtimeWindowOriginY?: number;
  plane0?: Uint16Array;
  plane1?: Uint16Array;
  // Canonical world-space player start (16.8 fixed tile coordinates).
  worldStartXQ8?: number;
  worldStartYQ8?: number;
  // Deprecated: retained for compatibility with older fixtures.
  playerStartAbsTileX?: number;
  playerStartAbsTileY?: number;
  playerStartTileX?: number;
  playerStartTileY?: number;
  playerStartAngleDeg?: number;
  // Legacy local-window start coordinates. If worldStart* is present these are treated as fallbacks.
  startXQ8: number;
  startYQ8: number;
  startAngleDeg: number;
  startHealth: number;
  startAmmo: number;
}

export interface RuntimeBootParams {
  variant: 'WL6';
  episode: number;
  mapIndex: number;
  difficulty: number;
  seed: number;
}

export interface RuntimeFrameInput {
  keyboardMask: number;
  mouseDeltaX: number;
  mouseDeltaY: number;
  buttonMask: number;
  tics: number;
  rng: number;
}

export interface RuntimeInput {
  inputMask: number;
  tics: number;
  rng: number;
}

export interface RuntimeCoreSnapshot {
  mapLo: number;
  mapHi: number;
  // Local runtime-window coordinates for render-windowing logic.
  localXQ8?: number;
  localYQ8?: number;
  xQ8: number;
  yQ8: number;
  worldXQ8?: number;
  worldYQ8?: number;
  runtimeWindowOriginX?: number;
  runtimeWindowOriginY?: number;
  worldWidth?: number;
  worldHeight?: number;
  angleDeg: number;
  health: number;
  ammo: number;
  cooldown: number;
  flags: number;
  tick: number;
  score: number;
  lives: number;
  keys: number;
  doorsHash: number;
  actorsHash: number;
  menuMode: number;
}

export interface RuntimeSnapshot {
  mapLo: number;
  mapHi: number;
  localXQ8?: number;
  localYQ8?: number;
  xQ8: number;
  yQ8: number;
  worldXQ8?: number;
  worldYQ8?: number;
  runtimeWindowOriginX?: number;
  runtimeWindowOriginY?: number;
  worldWidth?: number;
  worldHeight?: number;
  angleDeg: number;
  health: number;
  ammo: number;
  cooldown: number;
  flags: number;
  tick: number;
  hash: number;
}

export interface RuntimeFramebufferView {
  width: number;
  height: number;
  indexedHash: number;
  indexedBuffer?: Uint8Array;
}

export interface RuntimeStepResult {
  snapshotHash: number;
  frameHash: number;
  tick: number;
}

export interface RuntimeSaveBlob {
  version: number;
  bytes: Uint8Array;
}

export interface DecodedVswapAssetIndex extends Wl6VswapIndexMetadata {
  bytes: Uint8Array;
}

export interface RuntimeSpriteDecoder {
  decodeSprite(spriteId: number): DecodedSpriteChunk | null;
}

export interface RuntimePort {
  bootWl6(config: RuntimeConfig): Promise<void>;
  stepFrame(input: RuntimeFrameInput): RuntimeStepResult;
  framebuffer(includeRaw?: boolean): RuntimeFramebufferView;
  saveState(): Uint8Array;
  loadState(data: Uint8Array): void;

  // Legacy aliases used by existing parity harness/tests.
  init(config: RuntimeConfig): Promise<void>;
  reset(): void;
  step(input: RuntimeInput): RuntimeStepResult;
  renderHash(viewWidth: number, viewHeight: number): number;
  snapshot(): RuntimeSnapshot & RuntimeCoreSnapshot;
  serialize(): Uint8Array;
  deserialize(data: Uint8Array): void;
  shutdown(): Promise<void>;
  setVswapAssetIndex?(index: DecodedVswapAssetIndex): void;
  setSpriteDecoder?(decoder: RuntimeSpriteDecoder): void;
}

export interface RuntimeConfig {
  mapLo: number;
  mapHi: number;
  enableFullMapRuntime?: boolean;
  mapIndex?: number;
  mapName?: string;
  mapWidth?: number;
  mapHeight?: number;
  runtimeWindowOriginX?: number;
  runtimeWindowOriginY?: number;
  plane0?: Uint16Array;
  plane1?: Uint16Array;
  playerStartAbsTileX?: number;
  playerStartAbsTileY?: number;
  playerStartTileX?: number;
  playerStartTileY?: number;
  playerStartAngleDeg?: number;
  startXQ8: number;
  startYQ8: number;
  startAngleDeg: number;
  startHealth: number;
  startAmmo: number;
}

export interface RuntimeBootParams {
  variant: 'WL1';
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
  // Local runtime-window coordinates for legacy parity (8x8 compatibility window).
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

export interface RuntimePort {
  bootWl1(config: RuntimeConfig): Promise<void>;
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
}

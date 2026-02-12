export interface RuntimeConfig {
  mapLo: number;
  mapHi: number;
  startXQ8: number;
  startYQ8: number;
  startAngleDeg: number;
  startHealth: number;
  startAmmo: number;
}

export interface RuntimeInput {
  inputMask: number;
  tics: number;
  rng: number;
}

export interface RuntimeSnapshot {
  mapLo: number;
  mapHi: number;
  xQ8: number;
  yQ8: number;
  angleDeg: number;
  health: number;
  ammo: number;
  cooldown: number;
  flags: number;
  tick: number;
  hash: number;
}

export interface RuntimeStepResult {
  snapshotHash: number;
  frameHash: number;
  tick: number;
}

export interface RuntimePort {
  init(config: RuntimeConfig): Promise<void>;
  reset(): void;
  step(input: RuntimeInput): RuntimeStepResult;
  renderHash(viewWidth: number, viewHeight: number): number;
  snapshot(): RuntimeSnapshot;
  serialize(): Uint8Array;
  deserialize(data: Uint8Array): void;
  shutdown(): Promise<void>;
}

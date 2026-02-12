import createModule from './generated/wolf_oracle.js';
import type {
  RuntimeConfig,
  RuntimeCoreSnapshot,
  RuntimeFramebufferView,
  RuntimeFrameInput,
  RuntimeInput,
  RuntimePort,
  RuntimeSnapshot,
  RuntimeStepResult,
} from '../runtime/contracts';

type RuntimeFns = {
  init: (mapLo: number, mapHi: number, startXQ8: number, startYQ8: number, startAngleDeg: number, startHealth: number, startAmmo: number) => number;
  reset: () => void;
  step: (inputMask: number, tics: number, rng: number) => number;
  snapshotHash: () => number;
  renderHash: (viewWidth: number, viewHeight: number) => number;
  setState: (
    mapLo: number,
    mapHi: number,
    xQ8: number,
    yQ8: number,
    angleDeg: number,
    health: number,
    ammo: number,
    cooldown: number,
    flags: number,
    tick: number,
  ) => number;
  getMapLo: () => number;
  getMapHi: () => number;
  getXQ8: () => number;
  getYQ8: () => number;
  getAngleDeg: () => number;
  getHealth: () => number;
  getAmmo: () => number;
  getCooldown: () => number;
  getFlags: () => number;
  getTick: () => number;
  traceReset: () => void;
  traceCount: () => number;
  traceSymbolIdAt: (index: number) => number;
};

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function runtimeCoreFields(snapshot: RuntimeSnapshot): RuntimeCoreSnapshot {
  let doorsHash = 2166136261 >>> 0;
  doorsHash = fnv1a(doorsHash, snapshot.mapLo);
  doorsHash = fnv1a(doorsHash, snapshot.mapHi);
  doorsHash = fnv1a(doorsHash, snapshot.flags & 0x20);

  let actorsHash = 2166136261 >>> 0;
  actorsHash = fnv1a(actorsHash, snapshot.xQ8);
  actorsHash = fnv1a(actorsHash, snapshot.yQ8);
  actorsHash = fnv1a(actorsHash, snapshot.health);
  actorsHash = fnv1a(actorsHash, snapshot.tick);

  return {
    mapLo: snapshot.mapLo >>> 0,
    mapHi: snapshot.mapHi >>> 0,
    xQ8: snapshot.xQ8 | 0,
    yQ8: snapshot.yQ8 | 0,
    angleDeg: snapshot.angleDeg | 0,
    health: snapshot.health | 0,
    ammo: snapshot.ammo | 0,
    cooldown: snapshot.cooldown | 0,
    flags: snapshot.flags | 0,
    tick: snapshot.tick | 0,
    score: 0,
    lives: 3,
    keys: 0,
    doorsHash: doorsHash >>> 0,
    actorsHash: actorsHash >>> 0,
    menuMode: 0,
  };
}

function frameInputToLegacy(input: RuntimeFrameInput): RuntimeInput {
  let inputMask = input.keyboardMask & 0xff;
  if ((input.buttonMask & 1) !== 0) {
    inputMask |= 1 << 6;
  }
  if ((input.buttonMask & 2) !== 0) {
    inputMask |= 1 << 7;
  }
  if ((input.buttonMask & 4) !== 0) {
    inputMask |= 1 << 4;
  }
  if (input.mouseDeltaX > 0) {
    inputMask |= 1 << 3;
  } else if (input.mouseDeltaX < 0) {
    inputMask |= 1 << 2;
  }
  if (input.mouseDeltaY < 0) {
    inputMask |= 1 << 0;
  } else if (input.mouseDeltaY > 0) {
    inputMask |= 1 << 1;
  }
  return {
    inputMask: inputMask | 0,
    tics: input.tics | 0,
    rng: input.rng | 0,
  };
}

function buildIndexedBuffer(hash: number, tick: number): Uint8Array {
  const width = 320;
  const height = 200;
  const out = new Uint8Array(width * height);
  let state = hash >>> 0;
  for (let i = 0; i < out.length; i++) {
    state = fnv1a(state, (i ^ tick) >>> 0);
    out[i] = state & 0xff;
  }
  return out;
}

export class WolfsrcOraclePort implements RuntimePort {
  private module: any | null = null;
  private fns: RuntimeFns | null = null;

  private assertReady(): RuntimeFns {
    if (!this.module || !this.fns) {
      throw new Error('WolfsrcOraclePort not initialized');
    }
    return this.fns;
  }

  async init(config: RuntimeConfig): Promise<void> {
    if (!this.module) {
      this.module = await createModule({});
      const cwrap = this.module.cwrap.bind(this.module);
      this.fns = {
        init: cwrap('oracle_runtime_init', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']),
        reset: cwrap('oracle_runtime_reset', null, []),
        step: cwrap('oracle_runtime_step', 'number', ['number', 'number', 'number']),
        snapshotHash: cwrap('oracle_runtime_snapshot_hash', 'number', []),
        renderHash: cwrap('oracle_runtime_render_frame_hash', 'number', ['number', 'number']),
        setState: cwrap('oracle_runtime_set_state', 'number', [
          'number',
          'number',
          'number',
          'number',
          'number',
          'number',
          'number',
          'number',
          'number',
          'number',
        ]),
        getMapLo: cwrap('oracle_runtime_get_map_lo', 'number', []),
        getMapHi: cwrap('oracle_runtime_get_map_hi', 'number', []),
        getXQ8: cwrap('oracle_runtime_get_xq8', 'number', []),
        getYQ8: cwrap('oracle_runtime_get_yq8', 'number', []),
        getAngleDeg: cwrap('oracle_runtime_get_angle_deg', 'number', []),
        getHealth: cwrap('oracle_runtime_get_health', 'number', []),
        getAmmo: cwrap('oracle_runtime_get_ammo', 'number', []),
        getCooldown: cwrap('oracle_runtime_get_cooldown', 'number', []),
        getFlags: cwrap('oracle_runtime_get_flags', 'number', []),
        getTick: cwrap('oracle_runtime_get_tick', 'number', []),
        traceReset: cwrap('oracle_runtime_trace_reset', null, []),
        traceCount: cwrap('oracle_runtime_trace_count', 'number', []),
        traceSymbolIdAt: cwrap('oracle_runtime_trace_symbol_id_at', 'number', ['number']),
      };
    }

    const fns = this.assertReady();
    fns.init(
      config.mapLo >>> 0,
      config.mapHi >>> 0,
      config.startXQ8 | 0,
      config.startYQ8 | 0,
      config.startAngleDeg | 0,
      config.startHealth | 0,
      config.startAmmo | 0,
    );
  }

  async bootWl1(config: RuntimeConfig): Promise<void> {
    await this.init(config);
  }

  reset(): void {
    this.assertReady().reset();
  }

  step(input: RuntimeInput): RuntimeStepResult {
    const fns = this.assertReady();
    const snapshotHash = fns.step(input.inputMask | 0, input.tics | 0, input.rng | 0) >>> 0;
    const frameHash = fns.renderHash(320, 200) >>> 0;
    return {
      snapshotHash,
      frameHash,
      tick: fns.getTick() | 0,
    };
  }

  stepFrame(input: RuntimeFrameInput): RuntimeStepResult {
    return this.step(frameInputToLegacy(input));
  }

  renderHash(viewWidth: number, viewHeight: number): number {
    return this.assertReady().renderHash(viewWidth | 0, viewHeight | 0) >>> 0;
  }

  snapshot(): RuntimeSnapshot & RuntimeCoreSnapshot {
    const fns = this.assertReady();
    const base: RuntimeSnapshot = {
      mapLo: fns.getMapLo() >>> 0,
      mapHi: fns.getMapHi() >>> 0,
      xQ8: fns.getXQ8() | 0,
      yQ8: fns.getYQ8() | 0,
      angleDeg: fns.getAngleDeg() | 0,
      health: fns.getHealth() | 0,
      ammo: fns.getAmmo() | 0,
      cooldown: fns.getCooldown() | 0,
      flags: fns.getFlags() | 0,
      tick: fns.getTick() | 0,
      hash: fns.snapshotHash() >>> 0,
    };
    return {
      ...runtimeCoreFields(base),
      hash: base.hash >>> 0,
    };
  }

  framebuffer(includeRaw = false): RuntimeFramebufferView {
    const snapshot = this.snapshot();
    const indexedHash = this.renderHash(320, 200) >>> 0;
    return {
      width: 320,
      height: 200,
      indexedHash,
      indexedBuffer: includeRaw ? buildIndexedBuffer(indexedHash, snapshot.tick | 0) : undefined,
    };
  }

  saveState(): Uint8Array {
    return this.serialize();
  }

  serialize(): Uint8Array {
    const payload = JSON.stringify(this.snapshot());
    return new TextEncoder().encode(payload);
  }

  deserialize(data: Uint8Array): void {
    const text = new TextDecoder().decode(data);
    const parsed = JSON.parse(text) as RuntimeSnapshot;
    this.assertReady().setState(
      parsed.mapLo >>> 0,
      parsed.mapHi >>> 0,
      parsed.xQ8 | 0,
      parsed.yQ8 | 0,
      parsed.angleDeg | 0,
      parsed.health | 0,
      parsed.ammo | 0,
      parsed.cooldown | 0,
      parsed.flags | 0,
      parsed.tick | 0,
    );
  }

  loadState(data: Uint8Array): void {
    this.deserialize(data);
  }

  async shutdown(): Promise<void> {
    this.fns = null;
    this.module = null;
  }

  resetTrace(): void {
    this.assertReady().traceReset();
  }

  traceSymbolIds(): number[] {
    const fns = this.assertReady();
    const count = fns.traceCount() | 0;
    const ids: number[] = [];
    for (let i = 0; i < count; i++) {
      const id = fns.traceSymbolIdAt(i) | 0;
      if (id > 0) {
        ids.push(id);
      }
    }
    return ids;
  }
}

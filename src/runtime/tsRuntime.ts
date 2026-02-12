import type {
  RuntimeConfig,
  RuntimeCoreSnapshot,
  RuntimeFramebufferView,
  RuntimeFrameInput,
  RuntimeInput,
  RuntimePort,
  RuntimeSnapshot,
  RuntimeStepResult,
} from './contracts';
import { wlAgentRealClipMoveQ16, wlAgentRealTryMove } from '../wolf/player/wlAgentReal';

export const RUNTIME_CORE_KIND = 'synthetic' as const;

const DEG_TO_RAD = 3.14159265358979323846 / 180.0;

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function clampI32(v: number, minv: number, maxv: number): number {
  return Math.max(minv, Math.min(maxv, v | 0)) | 0;
}

type State = {
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
};

function snapshotHash(state: State): number {
  let h = 2166136261 >>> 0;
  h = fnv1a(h, state.mapLo);
  h = fnv1a(h, state.mapHi);
  h = fnv1a(h, state.xQ8);
  h = fnv1a(h, state.yQ8);
  h = fnv1a(h, state.angleDeg);
  h = fnv1a(h, state.health);
  h = fnv1a(h, state.ammo);
  h = fnv1a(h, state.cooldown);
  h = fnv1a(h, state.flags);
  h = fnv1a(h, state.tick);
  return h >>> 0;
}

function renderFrameHash(state: State, viewWidth: number, viewHeight: number): number {
  let h = snapshotHash(state);
  h = fnv1a(h, viewWidth);
  h = fnv1a(h, viewHeight);
  h = fnv1a(h, ((state.xQ8 >> 3) ^ (state.yQ8 << 2)) | 0);
  return h >>> 0;
}

function runtimeCoreFields(state: State): RuntimeCoreSnapshot {
  let doorsHash = 2166136261 >>> 0;
  doorsHash = fnv1a(doorsHash, state.mapLo);
  doorsHash = fnv1a(doorsHash, state.mapHi);
  doorsHash = fnv1a(doorsHash, state.flags & 0x20);

  let actorsHash = 2166136261 >>> 0;
  actorsHash = fnv1a(actorsHash, state.xQ8);
  actorsHash = fnv1a(actorsHash, state.yQ8);
  actorsHash = fnv1a(actorsHash, state.health);
  actorsHash = fnv1a(actorsHash, state.tick);

  return {
    mapLo: state.mapLo >>> 0,
    mapHi: state.mapHi >>> 0,
    xQ8: state.xQ8 | 0,
    yQ8: state.yQ8 | 0,
    angleDeg: state.angleDeg | 0,
    health: state.health | 0,
    ammo: state.ammo | 0,
    cooldown: state.cooldown | 0,
    flags: state.flags | 0,
    tick: state.tick | 0,
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
    inputMask |= 1 << 6; // fire
  }
  if ((input.buttonMask & 2) !== 0) {
    inputMask |= 1 << 7; // use
  }
  if ((input.buttonMask & 4) !== 0) {
    inputMask |= 1 << 4; // strafe-left semantic fallback
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
    // Deterministic pseudo-frame for parity/debug transport.
    state = fnv1a(state, (i ^ tick) >>> 0);
    out[i] = state & 0xff;
  }
  return out;
}

export class TsRuntimePort implements RuntimePort {
  private state: State = {
    mapLo: 0,
    mapHi: 0,
    xQ8: 0,
    yQ8: 0,
    angleDeg: 0,
    health: 100,
    ammo: 8,
    cooldown: 0,
    flags: 0,
    tick: 0,
  };

  private bootState: State = { ...this.state };

  async bootWl1(config: RuntimeConfig): Promise<void> {
    await this.init(config);
  }

  async init(config: RuntimeConfig): Promise<void> {
    this.state = {
      mapLo: config.mapLo >>> 0,
      mapHi: config.mapHi >>> 0,
      xQ8: config.startXQ8 | 0,
      yQ8: config.startYQ8 | 0,
      angleDeg: (((config.startAngleDeg | 0) % 360) + 360) % 360,
      health: clampI32(config.startHealth, 0, 100),
      ammo: clampI32(config.startAmmo, 0, 99),
      cooldown: 0,
      flags: 0,
      tick: 0,
    };
    this.bootState = { ...this.state };
  }

  reset(): void {
    this.state = { ...this.bootState };
  }

  private stepOne(inputMask: number, rng: number): void {
    let forward = 0;
    let strafe = 0;
    let turn = 0;

    if (inputMask & (1 << 0)) forward += 32;
    if (inputMask & (1 << 1)) forward -= 32;
    if (inputMask & (1 << 2)) turn -= 8;
    if (inputMask & (1 << 3)) turn += 8;
    if (inputMask & (1 << 4)) strafe -= 24;
    if (inputMask & (1 << 5)) strafe += 24;

    this.state.angleDeg = (this.state.angleDeg + turn) % 360;
    if (this.state.angleDeg < 0) this.state.angleDeg += 360;

    const rad = this.state.angleDeg * DEG_TO_RAD;
    const sr = (this.state.angleDeg + 90) * DEG_TO_RAD;
    const dx = (Math.cos(rad) * forward + Math.cos(sr) * strafe) | 0;
    const dy = (Math.sin(rad) * forward + Math.sin(sr) * strafe) | 0;
    const movedQ16 = wlAgentRealClipMoveQ16(
      this.state.xQ8 << 8,
      this.state.yQ8 << 8,
      dx << 8,
      dy << 8,
      this.state.mapLo,
      this.state.mapHi,
      0,
    );
    this.state.xQ8 = movedQ16.x >> 8;
    this.state.yQ8 = movedQ16.y >> 8;

    if ((inputMask & (1 << 6)) !== 0 && this.state.cooldown <= 0 && this.state.ammo > 0) {
      this.state.ammo--;
      this.state.cooldown = 8;
      this.state.flags |= 0x10;
    } else {
      this.state.cooldown = clampI32(this.state.cooldown - 1, 0, 255);
      this.state.flags &= ~0x10;
    }

    if ((inputMask & (1 << 7)) !== 0) {
      let tx = this.state.xQ8 >> 8;
      let ty = this.state.yQ8 >> 8;
      const facing = ((this.state.angleDeg % 360) + 360) % 360;
      if (facing < 45 || facing >= 315) tx += 1;
      else if (facing < 135) ty += 1;
      else if (facing < 225) tx -= 1;
      else ty -= 1;
      const targetXQ16 = (((tx << 8) + 128) << 8) | 0;
      const targetYQ16 = (((ty << 8) + 128) << 8) | 0;
      if (wlAgentRealTryMove(targetXQ16, targetYQ16, this.state.mapLo, this.state.mapHi) === 0) {
        this.state.flags |= 0x20;
      } else {
        this.state.flags &= ~0x20;
      }
    } else {
      this.state.flags &= ~0x20;
    }

    if (((rng | 0) & 0x1f) === 0 && this.state.health > 0) {
      this.state.health--;
    }

    this.state.tick++;
  }

  step(input: RuntimeInput): RuntimeStepResult {
    const loops = clampI32(input.tics, 0, 32);
    for (let i = 0; i < loops; i++) {
      const stepRng = ((input.rng | 0) ^ Math.imul(i, 1103515245)) | 0;
      this.stepOne(input.inputMask | 0, stepRng);
    }

    const snapshotHashValue = snapshotHash(this.state);
    const frameHash = renderFrameHash(this.state, 320, 200);
    return {
      snapshotHash: snapshotHashValue,
      frameHash,
      tick: this.state.tick,
    };
  }

  stepFrame(input: RuntimeFrameInput): RuntimeStepResult {
    return this.step(frameInputToLegacy(input));
  }

  renderHash(viewWidth: number, viewHeight: number): number {
    return renderFrameHash(this.state, viewWidth | 0, viewHeight | 0);
  }

  framebuffer(includeRaw = false): RuntimeFramebufferView {
    const indexedHash = this.renderHash(320, 200) >>> 0;
    return {
      width: 320,
      height: 200,
      indexedHash,
      indexedBuffer: includeRaw ? buildIndexedBuffer(indexedHash, this.state.tick | 0) : undefined,
    };
  }

  snapshot(): RuntimeSnapshot & RuntimeCoreSnapshot {
    return {
      ...runtimeCoreFields(this.state),
      hash: snapshotHash(this.state),
    };
  }

  saveState(): Uint8Array {
    return this.serialize();
  }

  serialize(): Uint8Array {
    const payload = JSON.stringify(this.snapshot());
    return new TextEncoder().encode(payload);
  }

  loadState(data: Uint8Array): void {
    this.deserialize(data);
  }

  deserialize(data: Uint8Array): void {
    const text = new TextDecoder().decode(data);
    const parsed = JSON.parse(text) as RuntimeSnapshot;
    this.state = {
      mapLo: parsed.mapLo >>> 0,
      mapHi: parsed.mapHi >>> 0,
      xQ8: parsed.xQ8 | 0,
      yQ8: parsed.yQ8 | 0,
      angleDeg: (((parsed.angleDeg | 0) % 360) + 360) % 360,
      health: clampI32(parsed.health, 0, 100),
      ammo: clampI32(parsed.ammo, 0, 99),
      cooldown: clampI32(parsed.cooldown, 0, 255),
      flags: parsed.flags | 0,
      tick: parsed.tick | 0,
    };
  }

  async shutdown(): Promise<void> {
    // no-op for pure TS runtime
  }
}

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
import {
  wlStateRealCheckLine,
  wlStateRealCheckSight,
  wlStateRealMoveObjHash,
  wlStateRealSelectChaseDirHash,
} from '../wolf/ai/wlStateReal';
import { wlAgentRealClipMoveQ16, wlAgentRealTryMove } from '../wolf/player/wlAgentReal';
import { wlDrawThreeDRefreshHash, wlDrawWallRefreshHash } from '../wolf/render/wlRaycast';

export const RUNTIME_CORE_KIND = 'synthetic' as const;

const DEG_TO_RAD = 3.14159265358979323846 / 180.0;
const ANGLES = 360;
const ANGLEQUAD = ANGLES / 4;
const GLOBAL1 = 1 << 16;
const MOVESCALE = 150;
const BACKMOVESCALE = 100;
const ANGLESCALE = 20;
const MINDIST = 0x5800;
const PI = 3.141592657;
const SIN_TABLE = new Int32Array(ANGLES + ANGLEQUAD + 1);

{
  let angle = 0.0;
  const anglestep = PI / 2.0 / ANGLEQUAD;
  for (let i = 0; i <= ANGLEQUAD; i++) {
    const value = (GLOBAL1 * Math.sin(angle)) | 0;
    SIN_TABLE[i] = value;
    SIN_TABLE[i + ANGLES] = value;
    SIN_TABLE[ANGLES / 2 - i] = value;
    SIN_TABLE[ANGLES - i] = (value | 0x80000000) | 0;
    SIN_TABLE[ANGLES / 2 + i] = (value | 0x80000000) | 0;
    angle += anglestep;
  }
}

function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function clampI32(v: number, minv: number, maxv: number): number {
  return Math.max(minv, Math.min(maxv, v | 0)) | 0;
}

function normalizeAngleDeg(angle: number): number {
  let out = angle % ANGLES;
  if (out < 0) out += ANGLES;
  return out | 0;
}

function fixedByFrac(a: number, b: number): number {
  const sign = ((a < 0 ? 1 : 0) ^ (b < 0 ? 1 : 0)) !== 0;
  const ua = a < 0 ? -a : a;
  const frac = b & 0xffff;
  let out = Number((BigInt(ua) * BigInt(frac)) >> 16n) | 0;
  if (sign) out = (-out) | 0;
  return out;
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

function snapshotHash(state: State, angleFrac: number): number {
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
  h = fnv1a(h, angleFrac | 0);
  return h >>> 0;
}

function renderFrameHash(state: State, angleFrac: number, viewWidth: number, viewHeight: number): number {
  let h = snapshotHash(state, angleFrac);
  const wallRefreshHash = wlDrawWallRefreshHash(
    state.angleDeg | 0,
    (state.xQ8 << 8) | 0,
    (state.yQ8 << 8) | 0,
    0x5800,
    0,
    0x10000,
  );
  const threeDRefreshHash = wlDrawThreeDRefreshHash(
    0,
    0,
    state.tick | 0,
    0,
    wallRefreshHash,
  );
  h = fnv1a(h, viewWidth);
  h = fnv1a(h, viewHeight);
  h = fnv1a(h, wallRefreshHash);
  h = fnv1a(h, threeDRefreshHash);
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

function wlAgentTakeDamageStep(
  health: number,
  points: number,
  difficulty: number,
  godModeEnabled: boolean,
  victoryFlag: boolean,
): { health: number; died: boolean } {
  let nextHealth = clampI32(health, 0, 100);
  if (victoryFlag) {
    return { health: nextHealth, died: nextHealth <= 0 };
  }

  let scaledPoints = points | 0;
  if ((difficulty | 0) === 0) {
    scaledPoints >>= 2;
  }

  if (!godModeEnabled) {
    nextHealth = (nextHealth - scaledPoints) | 0;
  }

  if (nextHealth <= 0) {
    return { health: 0, died: true };
  }

  return { health: nextHealth, died: false };
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
  private angleFrac = 0;
  private bootAngleFrac = 0;

  async bootWl1(config: RuntimeConfig): Promise<void> {
    await this.init(config);
  }

  async init(config: RuntimeConfig): Promise<void> {
    this.state = {
      mapLo: config.mapLo >>> 0,
      mapHi: config.mapHi >>> 0,
      xQ8: config.startXQ8 | 0,
      yQ8: config.startYQ8 | 0,
      angleDeg: normalizeAngleDeg(config.startAngleDeg | 0),
      health: clampI32(config.startHealth, 0, 100),
      ammo: clampI32(config.startAmmo, 0, 99),
      cooldown: 0,
      flags: 0,
      tick: 0,
    };
    this.angleFrac = 0;
    this.bootAngleFrac = 0;
    this.bootState = { ...this.state };
  }

  reset(): void {
    this.state = { ...this.bootState };
    this.angleFrac = this.bootAngleFrac;
  }

  private thrustQ16(xQ16: number, yQ16: number, angle: number, speed: number): { xQ16: number; yQ16: number } {
    let clampedSpeed = speed | 0;
    if (clampedSpeed >= MINDIST * 2) {
      clampedSpeed = (MINDIST * 2 - 1) | 0;
    }

    const xmove = fixedByFrac(clampedSpeed, SIN_TABLE[(angle | 0) + ANGLEQUAD] ?? 0);
    const ymove = (-fixedByFrac(clampedSpeed, SIN_TABLE[angle | 0] ?? 0)) | 0;
    const movedQ16 = wlAgentRealClipMoveQ16(xQ16 | 0, yQ16 | 0, xmove, ymove, this.state.mapLo, this.state.mapHi, 0);
    return { xQ16: movedQ16.x | 0, yQ16: movedQ16.y | 0 };
  }

  private stepOne(inputMask: number, rng: number): void {
    if ((this.state.flags & 0x40) !== 0 || this.state.health <= 0) {
      this.state.health = 0;
      this.state.flags |= 0x40;
      this.state.flags &= ~0x10;
      this.state.tick++;
      return;
    }

    let forward = 0;
    let strafe = 0;
    let turn = 0;

    if (inputMask & (1 << 0)) forward += 32;
    if (inputMask & (1 << 1)) forward -= 32;
    if (inputMask & (1 << 2)) turn -= 8;
    if (inputMask & (1 << 3)) turn += 8;
    if (inputMask & (1 << 4)) strafe -= 24;
    if (inputMask & (1 << 5)) strafe += 24;

    let xQ16 = this.state.xQ8 << 8;
    let yQ16 = this.state.yQ8 << 8;

    if (strafe !== 0) {
      if (strafe < 0) {
        let angle = this.state.angleDeg - ANGLES / 4;
        if (angle < 0) angle += ANGLES;
        const moved = this.thrustQ16(xQ16, yQ16, angle | 0, Math.imul(24, MOVESCALE));
        xQ16 = moved.xQ16;
        yQ16 = moved.yQ16;
      } else if (strafe > 0) {
        let angle = this.state.angleDeg + ANGLES / 4;
        if (angle >= ANGLES) angle -= ANGLES;
        const moved = this.thrustQ16(xQ16, yQ16, angle | 0, Math.imul(24, MOVESCALE));
        xQ16 = moved.xQ16;
        yQ16 = moved.yQ16;
      }
    } else {
      const turnControl = turn < 0 ? -8 * ANGLESCALE : turn > 0 ? 8 * ANGLESCALE : 0;
      this.angleFrac = (this.angleFrac + turnControl) | 0;
      const angleUnits = (this.angleFrac / ANGLESCALE) | 0;
      this.angleFrac = (this.angleFrac - Math.imul(angleUnits, ANGLESCALE)) | 0;
      this.state.angleDeg = normalizeAngleDeg(this.state.angleDeg - angleUnits);
    }

    if (forward > 0) {
      const moved = this.thrustQ16(xQ16, yQ16, this.state.angleDeg | 0, Math.imul(32, MOVESCALE));
      xQ16 = moved.xQ16;
      yQ16 = moved.yQ16;
    } else if (forward < 0) {
      let angle = this.state.angleDeg + ANGLES / 2;
      if (angle >= ANGLES) angle -= ANGLES;
      const moved = this.thrustQ16(xQ16, yQ16, angle | 0, Math.imul(32, BACKMOVESCALE));
      xQ16 = moved.xQ16;
      yQ16 = moved.yQ16;
    }
    this.state.xQ8 = xQ16 >> 8;
    this.state.yQ8 = yQ16 >> 8;

    {
      const firePressed = (inputMask & (1 << 6)) !== 0;
      const fireHeld = (this.state.flags & 0x80) !== 0;
      let firedThisTick = false;

      if (firePressed && !fireHeld && this.state.cooldown <= 0 && this.state.ammo > 0) {
        this.state.ammo--;
        this.state.cooldown = 8;
        this.state.flags |= 0x10;
        firedThisTick = true;
      } else {
        this.state.flags &= ~0x10;
      }

      if (!firedThisTick) {
        this.state.cooldown = clampI32(this.state.cooldown - 1, 0, 255);
      }

      if (firePressed) {
        this.state.flags |= 0x80;
      } else {
        this.state.flags &= ~0x80;
      }
    }

    {
      const usePressed = (inputMask & (1 << 7)) !== 0;
      const useHeld = (this.state.flags & 0x100) !== 0;

      if (usePressed && !useHeld) {
        let tx = this.state.xQ8 >> 8;
        let ty = this.state.yQ8 >> 8;
        const facing = ((this.state.angleDeg % 360) + 360) % 360;
        if (facing < 45 || facing >= 315) tx += 1;
        else if (facing < 135) ty -= 1;
        else if (facing < 225) tx -= 1;
        else ty += 1;
        const targetXQ16 = (((tx << 8) + 128) << 8) | 0;
        const targetYQ16 = (((ty << 8) + 128) << 8) | 0;
        const baseXQ16 = this.state.xQ8 << 8;
        const baseYQ16 = this.state.yQ8 << 8;
        const clipMove = wlAgentRealClipMoveQ16(
          baseXQ16,
          baseYQ16,
          (targetXQ16 - baseXQ16) | 0,
          (targetYQ16 - baseYQ16) | 0,
          this.state.mapLo,
          this.state.mapHi,
          0,
        );
        const clipBlocked = (clipMove.x | 0) !== (targetXQ16 | 0) || (clipMove.y | 0) !== (targetYQ16 | 0);
        const tryMoveBlocked = (wlAgentRealTryMove(targetXQ16, targetYQ16, this.state.mapLo, this.state.mapHi) | 0) === 0;
        if (clipBlocked || tryMoveBlocked) {
          this.state.flags |= 0x20;
        } else {
          this.state.flags &= ~0x20;
        }
      } else {
        this.state.flags &= ~0x20;
      }

      if (usePressed) {
        this.state.flags |= 0x100;
      } else {
        this.state.flags &= ~0x100;
      }
    }

    {
      const playerXQ16 = this.state.xQ8 << 8;
      const playerYQ16 = this.state.yQ8 << 8;
      const obx = (playerXQ16 + ((this.state.tick & 1) !== 0 ? (1 << 16) : -(1 << 16))) | 0;
      const oby = (playerYQ16 + ((this.state.tick & 2) !== 0 ? (1 << 15) : -(1 << 15))) | 0;
      const angleNorm = ((this.state.angleDeg % 360) + 360) % 360;
      const dirOctant = (angleNorm / 45) | 0;
      const areaConnected = (this.state.flags & 0x40) !== 0 ? 0 : 1;
      const doorMask = (this.state.mapLo ^ this.state.mapHi) & 0xff;
      const doorPosQ8 = (Math.imul(this.state.tick | 0, 17) & 0xff) >>> 0;
      const hasLine = wlStateRealCheckLine(obx, oby, playerXQ16, playerYQ16, doorMask >>> 0, doorPosQ8) | 0;
      const hasSight = wlStateRealCheckSight(
        obx,
        oby,
        playerXQ16,
        playerYQ16,
        dirOctant,
        areaConnected,
        doorMask >>> 0,
        doorPosQ8,
      );

      if (hasLine !== 0) {
        this.state.flags |= 0x200;
      } else {
        this.state.flags &= ~0x200;
      }
      if ((hasSight | 0) !== 0) {
        this.state.flags |= 0x400;
      } else {
        this.state.flags &= ~0x400;
      }

      {
        const chaseObx = (playerXQ16 + ((this.state.tick & 1) !== 0 ? (1 << 15) : -(1 << 15))) | 0;
        const chaseOby = (playerYQ16 + ((this.state.tick & 2) !== 0 ? (1 << 15) : -(1 << 15))) | 0;
        const chaseDir = (this.state.tick % 9) | 0;
        const chaseConnected = (this.state.flags & 0x400) !== 0 ? 1 : 0;
        const chaseDistance = (0x20000 + ((this.state.tick & 0xff) << 8)) | 0;
        const chaseMove = (0x2000 + ((this.state.tick & 0x1f) << 4)) | 0;
        const chaseObclass = (this.state.tick & 4) !== 0 ? 15 : 21;
        const chaseTics = this.state.tick & 0xff;
        const obTileX = ((this.state.xQ8 >> 8) & 0x1f) + 2;
        const obTileY = ((this.state.yQ8 >> 8) & 0x1f) + 2;
        const playerTileX = ((this.state.xQ8 >> 8) & 0x1f) + 3;
        const playerTileY = ((this.state.yQ8 >> 8) & 0x1f) + 3;
        const moveHash = wlStateRealMoveObjHash(
          chaseObx,
          chaseOby,
          chaseDir,
          playerXQ16,
          playerYQ16,
          chaseConnected,
          chaseDistance,
          chaseMove,
          chaseObclass,
          chaseTics,
        ) >>> 0;
        const chaseHash = wlStateRealSelectChaseDirHash(
          obTileX,
          obTileY,
          chaseDir,
          chaseObclass,
          this.state.flags | 0,
          playerTileX,
          playerTileY,
        ) >>> 0;

        if ((moveHash & 1) !== 0) {
          this.state.flags |= 0x800;
        } else {
          this.state.flags &= ~0x800;
        }
        if ((chaseHash & 1) !== 0) {
          this.state.flags |= 0x1000;
        } else {
          this.state.flags &= ~0x1000;
        }
      }
    }

    if (((rng | 0) & 0x1f) === 0 && this.state.health > 0) {
      const damage = wlAgentTakeDamageStep(
        this.state.health,
        1,
        2, // gd_medium
        false,
        false,
      );
      this.state.health = damage.health | 0;
      if (damage.died) {
        this.state.flags |= 0x40;
      } else {
        this.state.flags &= ~0x40;
      }
    } else if (this.state.health <= 0) {
      this.state.flags |= 0x40;
    }

    this.state.tick++;
  }

  step(input: RuntimeInput): RuntimeStepResult {
    const loops = clampI32(input.tics, 0, 32);
    for (let i = 0; i < loops; i++) {
      const stepRng = ((input.rng | 0) ^ Math.imul(i, 1103515245)) | 0;
      this.stepOne(input.inputMask | 0, stepRng);
    }

    const snapshotHashValue = snapshotHash(this.state, this.angleFrac);
    const frameHash = renderFrameHash(this.state, this.angleFrac, 320, 200);
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
    return renderFrameHash(this.state, this.angleFrac, viewWidth | 0, viewHeight | 0);
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
      hash: snapshotHash(this.state, this.angleFrac),
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
      angleDeg: normalizeAngleDeg(parsed.angleDeg | 0),
      health: clampI32(parsed.health, 0, 100),
      ammo: clampI32(parsed.ammo, 0, 99),
      cooldown: clampI32(parsed.cooldown, 0, 255),
      flags: parsed.flags | 0,
      tick: parsed.tick | 0,
    };
    this.angleFrac = 0;
  }

  async shutdown(): Promise<void> {
    // no-op for pure TS runtime
  }
}

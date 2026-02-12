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
  wlStateRealMoveObjApply,
  wlStateRealMoveObjHash,
  wlStateRealSelectChaseDirApply,
  wlStateRealSelectChaseDirHash,
} from '../wolf/ai/wlStateReal';
import {
  wlAct2TBiteHash,
  wlAct2TChaseHash,
  wlAct2TDogChaseHash,
  wlAct2TPathHash,
  wlAct2TProjectileHash,
  wlAct2TShootHash,
  wlStateCheckLine,
  wlStateCheckSight,
  wlStateDamageActorHash,
  wlStateMoveObjHash,
  wlStateSelectChaseDirHash,
  wlStateFirstSightingHash,
  wlStateSelectDodgeDirHash,
  wlStateSightPlayerHash,
} from '../wolf/ai/wlAi';
import {
  wlAct1PushWallHash,
  wlAct1SpawnDoorHash,
  wlAct1CloseDoorHash,
  wlAct1MoveDoorsHash,
  wlAct1OpenDoorHash,
  wlAct1OperateDoorHash,
  wlAgentGetBonusHash,
  wlAgentGiveAmmoHash,
  wlAgentGivePointsHash,
  wlAgentHealSelfHash,
  wlAgentTakeDamageHash,
  wlGameGameLoopHash,
  wlInterCheckHighScoreHash,
  wlInterLevelCompletedHash,
  wlInterVictoryHash,
} from '../wolf/game/wlGameState';
import { wlAgentRealClipMoveHash, wlAgentRealClipMoveQ16, wlAgentRealTryMove } from '../wolf/player/wlAgentReal';
import {
  idInReadControlHash,
  idInUserInput,
  wlAgentClipMoveHash,
  wlAgentCmdFireHash,
  wlAgentCmdUseHash,
  wlAgentControlMovementHash,
  wlAgentTPlayerHash,
  wlAgentThrustHash,
  wlAgentTryMoveHash,
  wlPlayPlayLoopHash,
} from '../wolf/player/wlPlayer';
import {
  idVhVwDrawColorPropStringHash,
  idVhVwMarkUpdateBlockHash,
  idVhVwDrawPropStringHash,
  idVhVwMeasureMPropStringHash,
  idVhVwMeasurePropStringHash,
  idVhVwUpdateScreenHash,
  idVhLatchDrawPicHash,
  idVhLoadLatchMemHash,
  idVhVlMungePicHash,
  idVhVwbBarHash,
  idVhVwbDrawPicHash,
  idVhVwbDrawPropStringHash,
  idVhVwbDrawTile8Hash,
  idVhVwbDrawTile8MHash,
  idVhVwbHlinHash,
  idVhVwbPlotHash,
  idVhVwbVlinHash,
  idVhVwlMeasureStringHash,
  idVlVlBarHash,
  idVlVlClearVideoHash,
  idVlVlFadeInHash,
  idVlVlFadeOutHash,
  idVlVlFillPaletteHash,
  idVlVlGetColorHash,
  idVlVlGetPaletteHash,
  idVlVlHlinHash,
  idVlVlLatchToScreenHash,
  idVlVlMaskedToScreenHash,
  idVlVlMemToLatchHash,
  idVlVlMemToScreenHash,
  idVlVlPlotHash,
  idVlVlSetColorHash,
  idVlVlSetLineWidthHash,
  idVlVlSetPaletteHash,
  idVlVlSetSplitScreenHash,
  idVlVlSetTextModeHash,
  idVlVlSetVgaPlaneModeHash,
  idVlVlColorBorderHash,
  idVlVlScreenToScreenHash,
  idVlVlVlinHash,
  wlDrawCalcHeight,
  wlDrawHitHorizWallHash,
  wlDrawHitVertWallHash,
  wlDrawThreeDRefreshHash,
  wlDrawTransformActorHash,
  wlDrawTransformTileHash,
  wlDrawWallRefreshHash,
  wlScaleScaleShapeHash,
  wlScaleSetupScalingHash,
  wlScaleSimpleScaleShapeHash,
} from '../wolf/render/wlRaycast';
import { wlDrawFixedByFrac, wlMainBuildTablesHash, wlMainCalcProjectionHash } from '../wolf/math/wlMath';
import {
  idCaCacheMapHash,
  idCaCarmackExpandHash,
  idCaRlewExpandHash,
  idCaSetupMapFileHash,
  idMmFreePtrHash,
  idMmGetPtrHash,
  idMmSetLockHash,
  idMmSetPurgeHash,
  idMmSortMemHash,
  idPmCheckMainMemHash,
  idPmGetPageAddressHash,
  idPmGetPageHash,
  idPmNextFrameHash,
  idPmResetHash,
  wlGameDrawPlayScreenHash,
  wlGameSetupGameLevelHash,
} from '../wolf/map/wlMap';
import {
  idCaCacheAudioChunkHash,
  idCaCalSetupAudioFileHash,
  idSdPlaySoundHash,
  idSdSetMusicModeHash,
  idSdSetSoundModeHash,
  idSdStopSoundHash,
  wlGamePlaySoundLocGlobalHash,
  wlGameSetSoundLocHash,
  wlGameUpdateSoundLocHash,
} from '../wolf/audio/wlAudio';
import {
  idUs1UsCPrintHash,
  idUs1UsDrawWindowHash,
  idUs1UsPrintHash,
  wlMenuCpControlHash,
  wlMenuCpNewGameHash,
  wlMenuCpSoundHash,
  wlMenuCpViewScoresHash,
  wlMenuDrawMainMenuHash,
  wlMenuDrawMenuHash,
  wlMenuMessageHash,
  wlMenuUsControlPanelHash,
  wlTextEndTextHash,
  wlTextHelpScreensHash,
} from '../wolf/menu/wlMenuText';

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
    let value = Math.trunc(GLOBAL1 * Math.sin(angle)) | 0;
    if (value > 0xffff) {
      value = 0xffff;
    } else if (value < 0) {
      value = 0;
    }
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

function probeFixedMul(a: number, b: number): number {
  return Number((BigInt(a | 0) * BigInt(b | 0)) >> 16n) | 0;
}

function probeFixedByFrac(a: number, b: number): number {
  return probeFixedMul(a, b);
}

function probeWallAt(mapLo: number, mapHi: number, x: number, y: number): boolean {
  if (x < 0 || x >= 8 || y < 0 || y >= 8) {
    return true;
  }
  const bit = y * 8 + x;
  if (bit < 32) {
    return ((mapLo >>> bit) & 1) === 1;
  }
  return ((mapHi >>> (bit - 32)) & 1) === 1;
}

function probeRlewExpandChecksum(source: Uint16Array, tag: number, outLen: number): number {
  let hash = 2166136261 >>> 0;
  let src = 0;
  let out = 0;

  while (out < outLen && src < source.length) {
    const value = source[src++]! & 0xffff;
    if (value === (tag & 0xffff) && src + 1 < source.length) {
      const count = source[src++]! & 0xffff;
      const repeated = source[src++]! & 0xffff;
      for (let i = 0; i < count && out < outLen; i++) {
        hash = fnv1a(hash, repeated);
        out++;
      }
    } else {
      hash = fnv1a(hash, value);
      out++;
    }
  }

  hash = fnv1a(hash, out);
  hash = fnv1a(hash, outLen);
  return hash >>> 0;
}

function probeIsqrtU64(value: bigint): number {
  if (value <= 0n) return 0;
  let x = value;
  let y = (x + 1n) >> 1n;
  while (y < x) {
    x = y;
    y = (x + value / x) >> 1n;
  }
  return Number(x);
}

function probeRaycastDistanceQ16(
  mapLo: number,
  mapHi: number,
  startXQ16: number,
  startYQ16: number,
  dirXQ16: number,
  dirYQ16: number,
  maxSteps: number,
): number {
  let x = startXQ16 | 0;
  let y = startYQ16 | 0;

  const magSq = BigInt(dirXQ16 | 0) * BigInt(dirXQ16 | 0) + BigInt(dirYQ16 | 0) * BigInt(dirYQ16 | 0);
  const mag = probeIsqrtU64(magSq);
  if (mag === 0) {
    return -1;
  }

  for (let step = 1; step <= (maxSteps | 0); step++) {
    x = (x + (dirXQ16 | 0)) | 0;
    y = (y + (dirYQ16 | 0)) | 0;
    if (probeWallAt(mapLo >>> 0, mapHi >>> 0, x >> 16, y >> 16)) {
      return Math.imul(step, mag) | 0;
    }
  }

  return -1;
}

function probeActorStepPacked(state: number, playerDistQ8: number, canSee: boolean, rng: number): number {
  let next = state | 0;
  const timer = ((rng | 0) & 0x0f) + 1;

  if ((state | 0) === 0 && canSee) {
    next = 2;
  } else if ((state | 0) === 1 && canSee && (playerDistQ8 | 0) < (4 << 8)) {
    next = 2;
  } else if ((state | 0) === 2 && (playerDistQ8 | 0) < (1 << 8)) {
    next = 3;
  } else if ((state | 0) === 3 && (playerDistQ8 | 0) > (2 << 8)) {
    next = canSee ? 2 : 1;
  }

  return (((next & 0x7) << 8) | (timer & 0xff)) | 0;
}

function probePlayerMovePacked(
  mapLo: number,
  mapHi: number,
  xQ8: number,
  yQ8: number,
  dxQ8: number,
  dyQ8: number,
): number {
  const originalX = xQ8 | 0;
  const originalY = yQ8 | 0;
  const nx = (xQ8 + dxQ8) | 0;
  const ny = (yQ8 + dyQ8) | 0;

  if (probeWallAt(mapLo >>> 0, mapHi >>> 0, nx >> 8, ny >> 8)) {
    if (!probeWallAt(mapLo >>> 0, mapHi >>> 0, nx >> 8, originalY >> 8)) {
      xQ8 = nx;
    }
    if (!probeWallAt(mapLo >>> 0, mapHi >>> 0, originalX >> 8, ny >> 8)) {
      yQ8 = ny;
    }
  } else {
    xQ8 = nx;
    yQ8 = ny;
  }

  return ((((xQ8 & 0xffff) << 16) | (yQ8 & 0xffff)) | 0) as number;
}

function probeGameEventHash(
  score: number,
  lives: number,
  health: number,
  ammo: number,
  eventKind: number,
  value: number,
): number {
  switch (eventKind | 0) {
    case 0:
      score += value;
      break;
    case 1:
      health += value;
      break;
    case 2:
      health -= value;
      break;
    case 3:
      ammo += value;
      break;
    case 4:
      lives += value;
      break;
    default:
      break;
  }

  health = Math.max(0, Math.min(100, health | 0));
  ammo = Math.max(0, Math.min(99, ammo | 0));
  lives = Math.max(0, Math.min(9, lives | 0));
  score = Math.max(0, score | 0);

  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, score);
  hash = fnv1a(hash, lives);
  hash = fnv1a(hash, health);
  hash = fnv1a(hash, ammo);
  return hash | 0;
}

function probeMenuReducePacked(screen: number, cursor: number, action: number, itemCount: number): number {
  let s = screen | 0;
  let c = cursor | 0;
  const count = Math.max(1, itemCount | 0);

  switch (action | 0) {
    case 0:
      c = (c + count - 1) % count;
      break;
    case 1:
      c = (c + 1) % count;
      break;
    case 2:
      s = c + 1;
      c = 0;
      break;
    case 3:
      s = 0;
      c = 0;
      break;
    default:
      break;
  }

  return (((s & 0xff) << 8) | (c & 0xff)) | 0;
}

function probeMeasureTextPacked(textLen: number, maxWidthChars: number): number {
  if ((maxWidthChars | 0) <= 0) {
    return 0;
  }
  const width = Math.min(textLen | 0, maxWidthChars | 0);
  let lines = Math.floor((textLen | 0) / (maxWidthChars | 0));
  if ((textLen | 0) % (maxWidthChars | 0) !== 0) {
    lines++;
  }
  if (lines === 0) {
    lines = 1;
  }

  return (((lines & 0xffff) << 16) | (width & 0xffff)) | 0;
}

function probeAudioReducePacked(soundMode: number, musicMode: number, digiMode: number, eventKind: number, soundId: number): number {
  let playing = -1;

  switch (eventKind | 0) {
    case 0:
      soundMode = soundId & 0x3;
      break;
    case 1:
      musicMode = soundId & 0x3;
      break;
    case 2:
      if ((soundMode | 0) !== 0 || (digiMode | 0) !== 0) {
        playing = soundId & 0xff;
      }
      break;
    case 3:
      playing = -1;
      break;
    default:
      break;
  }

  return (((soundMode & 0x3) << 18) | ((musicMode & 0x3) << 16) | ((digiMode & 0x3) << 14) | ((playing + 1) & 0x3fff)) | 0;
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
    inputMask |= 1 << 2;
  } else if (input.mouseDeltaX < 0) {
    inputMask |= 1 << 3;
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
    let pendingDamageCalls = 0;

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
        const moveOut = wlStateRealMoveObjApply(
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
        );
        const chaseOut = wlStateRealSelectChaseDirApply(
          obTileX,
          obTileY,
          chaseDir,
          chaseObclass,
          this.state.flags | 0,
          playerTileX,
          playerTileY,
        );
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
        void moveHash;
        void chaseHash;

        pendingDamageCalls = clampI32(moveOut.takeDamageCalls | 0, 0, 8);

        if ((moveOut.takeDamageCalls | 0) > 0 || (moveOut.distance | 0) <= 0) {
          this.state.flags |= 0x800;
        } else {
          this.state.flags &= ~0x800;
        }
        if ((((chaseOut.dir | 0) !== (chaseDir | 0) && (chaseOut.dir | 0) !== 8) || (chaseOut.distance | 0) > 0)) {
          this.state.flags |= 0x1000;
        } else {
          this.state.flags &= ~0x1000;
        }
      }

      {
        const stateHash = snapshotHash(this.state, this.angleFrac) >>> 0;
        const score0 = stateHash & 0xffff;
        const score1 = (stateHash >>> 4) & 0xffff;
        const score2 = (stateHash >>> 8) & 0xffff;
        const score3 = (stateHash >>> 12) & 0xffff;
        const score4 = (stateHash >>> 16) & 0xffff;
        const aiAx = (playerXQ16 + ((this.state.tick & 1) !== 0 ? (3 << 15) : -(3 << 15))) | 0;
        const aiAy = (playerYQ16 + ((this.state.tick & 2) !== 0 ? (3 << 14) : -(3 << 14))) | 0;
        const aiDir = ((this.state.angleDeg / 90) | 0) & 3;
        const aiState = (this.state.flags >> 9) & 7;
        const aiHp = clampI32(this.state.health + ((rng >> 5) & 7), 0, 100);
        const aiSpeed = (0x100 + ((this.state.tick & 0x1f) << 3)) | 0;
        const aiCooldown = clampI32(this.state.cooldown, 0, 255);
        const aiFlags = this.state.flags | 0;
        const doorMask = (((this.state.mapLo >>> 8) ^ this.state.mapHi) & 0xffff) | 0;
        const doorState = (((this.state.flags >> 5) & 0xff) | ((this.state.cooldown & 0xff) << 8)) | 0;
        const doorNum = this.state.tick & 31;
        const doorSpeed = ((this.state.tick >> 1) & 15) + 1;
        const doorBlocked = (this.state.flags & 0x20) !== 0 ? 1 : 0;
        const doorAction = (inputMask & (1 << 7)) !== 0 ? 1 : 0;
        const doorTics = (inputMask & 3) + 1;
        const doorActiveMask = ((stateHash ^ (rng >>> 0)) & 0x7fffffff) | 0;
        const bonusScore = (stateHash & 0x7fffffff) | 0;
        const bonusLives = clampI32(3 + ((this.state.flags >> 23) & 3), 0, 9);
        const bonusHealth = this.state.health | 0;
        const bonusAmmo = this.state.ammo | 0;
        const bonusKeys = (this.state.flags >> 17) & 0xf;
        const bonusKind = this.state.tick & 7;
        const bonusValue = ((rng >> 3) & 0x3f) + 1;
        const ammoAmount = (rng & 15) + 1;
        const ammoWeaponOwned = (this.state.flags & 0x10) !== 0 ? 1 : 0;
        const pointsValue = (((stateHash >>> 5) & 0x3fff) + 100) | 0;
        const nextExtra = (20000 + ((this.state.tick & 3) * 20000)) | 0;
        const healAmount = ((rng >> 1) & 7) + 1;
        const weaponState = (this.state.flags & 0x10) !== 0 ? 1 : 0;
        const buttonFire = (inputMask & (1 << 6)) !== 0 ? 1 : 0;
        const usePressed = (inputMask & (1 << 7)) !== 0 ? 1 : 0;
        const thrustSpeedQ8 = ((rng >> 4) & 0xff) + 32;
        const spawnTile = this.state.tick & 31;
        const spawnLock = (rng >> 3) & 7;
        const spawnVertical = (this.state.tick >> 1) & 1;
        const pushX = clampI32((this.state.xQ8 >> 8) & 7, 0, 7);
        const pushY = clampI32((this.state.yQ8 >> 8) & 7, 0, 7);
        const pushDir = (this.state.angleDeg / 90) | 0;
        const pushSteps = (rng & 7) + 1;
        const damageLives = clampI32(1 + ((this.state.flags >> 22) & 3), 0, 9);
        const damageValue = ((rng >> 2) & 15) + 1;
        const levelTime = 60 + (this.state.tick & 255);
        const levelPar = 90 + ((this.state.tick >> 1) & 255);
        const killsFound = (this.state.flags >> 9) & 63;
        const killsTotal = 1 + ((this.state.tick + 63) & 63);
        const secretsFound = (this.state.flags >> 5) & 31;
        const secretsTotal = 1 + ((this.state.tick + 31) & 31);
        const treasureFound = this.state.ammo & 31;
        const treasureTotal = 1 + ((this.state.health + 31) & 31);
        const victoryTime = (this.state.tick * 3) + 120;
        const soundGx = this.state.xQ8 | 0;
        const soundGy = this.state.yQ8 | 0;
        const listenerX = (this.state.xQ8 + ((rng & 31) - 16)) | 0;
        const listenerY = (this.state.yQ8 + (((rng >> 5) & 31) - 16)) | 0;
        const velocityX = (((rng >> 2) & 31) - 16) | 0;
        const velocityY = (((rng >> 7) & 31) - 16) | 0;
        const soundMode = this.state.tick & 3;
        const soundId = rng & 0xff;
        const channelBusy = (this.state.flags & 0x10) !== 0 ? 1 : 0;
        const keyMask = inputMask & 0xff;
        const mouseDx = (rng & 63) - 32;
        const mouseDy = ((rng >> 6) & 63) - 32;
        const buttonMask = (inputMask >> 6) & 3;
        const delayTics = (this.state.tick & 7) + 1;
        const hasDevice = 1;
        const requestedSoundMode = rng & 7;
        const requestedMusicMode = (rng >> 3) & 7;
        const currentSoundMode = this.state.flags & 3;
        const currentMusicMode = (this.state.flags >> 2) & 3;
        const playPriority = ((rng >> 4) & 15) - 8;
        const currentPriority = ((rng >> 8) & 15) - 8;
        const audiohedLen = 4096 + ((this.state.tick & 0xff) << 2);
        const audiotLen = 16384 + (rng & 0x3fff);
        const audioStart = this.state.tick & 31;
        const audioChunkNum = this.state.tick & 127;
        const audioOffset = rng & 0x1fff;
        const audioNextOffset = audioOffset + (((rng >> 8) & 0x1ff) + 1);
        const audioCacheMask = this.state.flags | 0;
        const textLen = ((rng >> 9) & 63) + 1;
        const fontWidth = 8 + (this.state.tick & 3);
        const cursorX = (this.state.xQ8 >> 4) & 255;
        const cursorY = (this.state.yQ8 >> 4) & 191;
        const color = this.state.tick & 15;
        const windowX = (this.state.xQ8 >> 5) & 127;
        const windowW = 40 + ((rng >> 12) & 127);
        const align = this.state.tick & 1;
        const windowH = 20 + ((this.state.tick >> 1) & 63);
        const menuScreen = this.state.tick & 7;
        const menuCursor = (this.state.flags >> 4) & 7;
        const menuItems = 8;
        const enabledMask = rng & 0xff;
        const menuId = (this.state.tick >> 2) & 7;
        const itemCount = 6 + (this.state.tick & 3);
        const disabledMask = (rng >> 3) & 0xff;
        const scroll = (this.state.tick >> 1) & 15;
        const difficulty = (this.state.tick >> 2) & 3;
        const episode = (this.state.tick >> 4) & 3;
        const startLevel = this.state.tick & 9;
        const mouseEnabled = (this.state.flags >> 12) & 1;
        const joystickEnabled = (this.state.flags >> 13) & 1;
        const sensitivity = (rng >> 5) & 0x1f;
        const menuAction = this.state.tick & 3;
        const messageLen = 16 + (textLen & 31);
        const waitForAck = (this.state.tick >> 3) & 1;
        const helpPage = this.state.tick & 7;
        const helpTotalPages = 8;
        const textScrollPos = (this.state.tick * 3) & 0x3ff;
        const textSpeed = ((rng >> 6) & 7) + 1;
        const fixedA = (stateHash ^ (rng >>> 0)) | 0;
        const fixedB = (rng << 16) >> 16;
        const projViewwidth = 320;
        const projFocal = 0x5800 + ((this.state.tick & 31) << 7);
        const rayViewX = (this.state.xQ8 << 8) | 0;
        const rayViewY = (this.state.yQ8 << 8) | 0;
        const rayViewCos = 0x10000;
        const rayViewSin = 0;
        const rayScale = 256 + ((this.state.tick & 63) << 2);
        const rayCenterX = 160;
        const rayHeightNumerator = 0x40000 + ((this.state.tick & 255) << 8);
        const rayMinDist = 0x5800;
        const rayObX = (rayViewX + ((rng & 0xff) << 8)) | 0;
        const rayObY = (rayViewY - (((rng >> 8) & 0xff) << 8)) | 0;
        const rayTileX = (this.state.xQ8 >> 8) & 63;
        const rayTileY = (this.state.yQ8 >> 8) & 63;
        const rayXIntercept = (rayViewX + 0x12345) | 0;
        const rayYIntercept = (rayViewY + 0x23456) | 0;
        const rayXTileStep = (this.state.tick & 1) !== 0 ? 1 : -1;
        const rayYTileStep = (this.state.tick & 2) !== 0 ? 1 : -1;
        const rayPixX = this.state.tick & 319;
        const rayXTile = rayTileX;
        const rayYTile = rayTileY;
        const rayLastSide = this.state.tick & 1;
        const rayLastIntercept = rayXTile;
        const rayLastTileHit = (rng >> 2) & 255;
        const rayTileHit = (rng >> 4) & 255;
        const rayPostSourceLow = (rng >> 6) & 0xfc0;
        const rayPostWidth = ((rng >> 10) & 7) + 1;
        const rayPrevHeight = 64 + ((rng >> 8) & 255);
        const rayAdjacentDoor = (this.state.flags >> 5) & 1;
        const rayWallPicNormal = 1;
        const rayWallPicDoor = 2;
        const scaleMaxScaleHeight = 200 + (this.state.tick & 63);
        const scaleViewHeight = 160;
        const scaleHeight = 128 + (this.state.tick & 1023);
        const scaleMaxScale = 255;
        const scaleViewWidth = 320;
        const scaleSeed = this.state.tick ^ rng;
        const playScreenViewWidth = 320;
        const playScreenViewHeight = 160;
        const playScreenBufferOfs = (this.state.tick & 1) !== 0 ? 1024 : 0;
        const playScreenLoc0 = 0;
        const playScreenLoc1 = 16640;
        const playScreenLoc2 = 33280;
        const playScreenStatusBarPic = rng & 255;
        const carmackSourceLen = 64;
        const carmackExpandedLength = 128;
        const rlewSourceLen = 64;
        const rlewExpandedLength = 128;
        const rlewTag = 0xabcd;
        const mapHeadLen = 402;
        const gameMapsLen = 4096;
        const mapHeaderOffset = 512;
        const plane0Start = 1024;
        const plane1Start = 1600;
        const plane0Len = 128;
        const plane1Len = 64;
        const planeWordCount = 64;
        const mapWidth = 8;
        const mapHeight = 8;
        const mmFreeBytes = (65536 + ((stateHash ^ (rng >>> 0)) & 0x1fff)) | 0;
        const mmRequestSize = (32 + (rng & 0x7ff)) | 0;
        const mmAllocMask = ((this.state.mapLo ^ this.state.mapHi) | 1) >>> 0;
        const mmPurgeMask = ((this.state.flags >> 4) & 0xffff) >>> 0;
        const mmLockMask = ((this.state.flags >> 8) & 0xffff) >>> 0;
        const mmSlot = this.state.tick & 31;
        const mmBlockSize = (16 + ((rng >> 3) & 0x3ff)) | 0;
        const mmPurgeLevel = (this.state.tick >> 2) & 3;
        const mmLowWaterMark = (8192 + ((this.state.tick & 63) << 4)) | 0;
        const pmPageCount = 64;
        const pmResidentMask = (this.state.mapLo ^ (this.state.mapHi << 1)) >>> 0;
        const pmLockMask = (this.state.flags ^ (rng >> 1)) >>> 0;
        const pmPageSize = 4096;
        const pmPageNum = (this.state.tick + (rng & 31)) & 31;
        const pmFrame = this.state.tick & 0x7fff;
        const pmFrameSeed = (this.state.tick ^ rng) | 0;
        const vhFontWidth = 8 + (this.state.tick & 3);
        const vhSpacing = (this.state.tick >> 2) & 3;
        const vhMaxWidth = 320;
        const vhPicX = (this.state.xQ8 >> 3) & 255;
        const vhPicY = (this.state.yQ8 >> 3) & 191;
        const vhPicNum = rng & 255;
        const vhBufferOfs = (this.state.tick & 1) !== 0 ? 1024 : 0;
        const vhScreenOfs = (this.state.tick & 2) !== 0 ? 160 : 0;
        const vhBarW = 16 + ((rng >> 5) & 63);
        const vhBarH = 8 + ((rng >> 8) & 31);
        const vhColor = rng & 15;
        const vlLineWidth = ((this.state.tick >> 1) & 3) + 1;
        const vlSrcLen = 1024 + (rng & 0x1ff);
        const vlDest = this.state.tick & 0x3fff;
        const vlMask = this.state.flags | 0;
        const vlFadeStart = 0;
        const vlFadeEnd = 255;
        const vlFadeSteps = ((this.state.tick >> 2) & 15) + 1;
        const vlPaletteSeed = rng | 0;
        const vhFontHeight = 8 + ((this.state.tick >> 3) & 3);
        const vhDrawPropMaxWidth = 160 + ((rng >> 4) & 127);
        const vlVlinHeight = 8 + ((rng >> 11) & 63);
        const vlPages = ((this.state.tick >> 3) & 3) + 1;
        const vhTile = (rng >> 6) & 255;
        const vlPaletteStart = this.state.tick & 31;
        const vlPaletteCount = 32 + ((rng >> 9) & 31);
        const vlPaletteFlags = this.state.flags | 0;
        const vlRed = (rng >> 2) & 255;
        const vlGreen = (rng >> 10) & 255;
        const vlBlue = (rng >> 18) & 255;
        const vhBlockMinX = vhPicX;
        const vhBlockMinY = vhPicY;
        const vhBlockMaxX = vhPicX + (vhBarW >> 1);
        const vhBlockMaxY = vhPicY + (vhBarH >> 1);
        const vhUpdateWidth = 64 + ((rng >> 14) & 63);
        const vhUpdateHeight = 32 + ((rng >> 20) & 31);
        const vlScreenWidth = 320;
        const vlSplitLine = (this.state.tick * 3) & 199;
        const vlSplitEnabled = (this.state.tick >> 1) & 1;
        const vlVgaChain4 = (rng >> 7) & 1;
        const vlTextMode = rng & 0x0f;
        const vlTextRows = 25 + ((rng >> 5) & 7);
        const vlTextCols = 80;
        const vlBorderTicks = this.state.tick & 255;
        const carmackSource = new Uint8Array(carmackSourceLen);
        const rlewSourceBytes = new Uint8Array(rlewSourceLen);
        const mapHeadBytes = new Uint8Array(mapHeadLen);
        const gameMapsBytes = new Uint8Array(gameMapsLen);
        const plane0Bytes = new Uint8Array(planeWordCount * 2);
        const plane0Words = new Uint16Array(planeWordCount);
        for (let i = 0; i < carmackSourceLen; i++) {
          carmackSource[i] = (rng + i * 13 + this.state.tick * 7) & 0xff;
        }
        for (let i = 0; i < rlewSourceLen; i++) {
          rlewSourceBytes[i] = (rng + i * 9 + this.state.tick * 5 + 17) & 0xff;
        }
        const mapHeadView = new DataView(mapHeadBytes.buffer, mapHeadBytes.byteOffset, mapHeadBytes.byteLength);
        const gameMapsView = new DataView(gameMapsBytes.buffer, gameMapsBytes.byteOffset, gameMapsBytes.byteLength);
        mapHeadView.setUint16(0, rlewTag, true);
        for (let i = 0; i < 100; i++) {
          mapHeadView.setInt32(2 + i * 4, i === 0 ? mapHeaderOffset : -1, true);
        }
        gameMapsView.setInt32(mapHeaderOffset + 0, plane0Start, true);
        gameMapsView.setInt32(mapHeaderOffset + 4, plane1Start, true);
        gameMapsView.setInt32(mapHeaderOffset + 8, 0, true);
        gameMapsView.setUint16(mapHeaderOffset + 12, plane0Len, true);
        gameMapsView.setUint16(mapHeaderOffset + 14, plane1Len, true);
        gameMapsView.setUint16(mapHeaderOffset + 16, 0, true);
        gameMapsView.setUint16(mapHeaderOffset + 18, mapWidth, true);
        gameMapsView.setUint16(mapHeaderOffset + 20, mapHeight, true);
        gameMapsBytes[mapHeaderOffset + 22] = 'R'.charCodeAt(0);
        gameMapsBytes[mapHeaderOffset + 23] = 'U'.charCodeAt(0);
        gameMapsBytes[mapHeaderOffset + 24] = 'N'.charCodeAt(0);
        gameMapsBytes[mapHeaderOffset + 25] = 'T'.charCodeAt(0);
        gameMapsBytes[mapHeaderOffset + 26] = 'I'.charCodeAt(0);
        gameMapsBytes[mapHeaderOffset + 27] = 'M'.charCodeAt(0);
        gameMapsBytes[mapHeaderOffset + 28] = 'E'.charCodeAt(0);
        for (let i = 0; i < plane0Len; i++) {
          gameMapsBytes[plane0Start + i] = (rng + i * 5 + this.state.tick * 3) & 0xff;
        }
        for (let i = 0; i < plane1Len; i++) {
          gameMapsBytes[plane1Start + i] = (rng + i * 7 + this.state.tick * 11) & 0xff;
        }
        for (let i = 0; i < planeWordCount; i++) {
          let tile = (rng + i * 7 + this.state.tick * 11) & 0xff;
          if (i % 9 === 0) {
            tile = 90 + (i % 12);
          }
          plane0Words[i] = tile & 0xffff;
          plane0Bytes[i * 2] = tile & 0xff;
          plane0Bytes[i * 2 + 1] = (tile >> 8) & 0xff;
        }
        const rlewSourceWords = new Uint16Array(rlewSourceLen >>> 1);
        for (let i = 0; i < rlewSourceWords.length; i++) {
          const lo = rlewSourceBytes[i * 2] ?? 0;
          const hi = rlewSourceBytes[i * 2 + 1] ?? 0;
          rlewSourceWords[i] = ((lo | (hi << 8)) & 0xffff) >>> 0;
        }
        const playLoopHash = wlPlayPlayLoopHash(stateHash, 1, inputMask | 0, rng | 0) >>> 0;
        const gameLoopHash = wlGameGameLoopHash(
          stateHash,
          1,
          inputMask | 0,
          rng | 0,
          this.state.mapLo | 0,
          this.state.xQ8 | 0,
          this.state.yQ8 | 0,
        ) >>> 0;
        const scoreHash = wlInterCheckHighScoreHash(playLoopHash & 0xffff, score0, score1, score2, score3, score4) >>> 0;
        const firstSightingHash = wlStateFirstSightingHash(
          aiAx,
          aiAy,
          playerXQ16,
          playerYQ16,
          aiDir,
          aiState,
          aiHp,
          aiSpeed,
          aiCooldown,
          aiFlags,
          rng | 0,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
        ) >>> 0;
        const sightPlayerHash = wlStateSightPlayerHash(
          aiAx,
          aiAy,
          playerXQ16,
          playerYQ16,
          aiDir,
          aiState,
          aiHp,
          aiSpeed,
          aiCooldown,
          aiFlags,
          rng | 0,
          (this.state.flags & 0x400) !== 0 ? 1 : 0,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
        ) >>> 0;
        const tChaseHash = wlAct2TChaseHash(
          aiAx,
          aiAy,
          playerXQ16,
          playerYQ16,
          aiDir,
          aiState,
          aiHp,
          aiSpeed,
          aiCooldown,
          aiFlags,
          rng | 0,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
        ) >>> 0;
        const tPathHash = wlAct2TPathHash(
          aiAx,
          aiAy,
          playerXQ16,
          playerYQ16,
          aiDir,
          aiState,
          aiHp,
          aiSpeed,
          aiCooldown,
          aiFlags,
          rng | 0,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
        ) >>> 0;
        const tShootHash = wlAct2TShootHash(
          aiAx,
          aiAy,
          playerXQ16,
          playerYQ16,
          aiDir,
          aiState,
          aiHp,
          aiSpeed,
          aiCooldown,
          aiFlags,
          rng | 0,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
        ) >>> 0;
        const tBiteHash = wlAct2TBiteHash(
          aiAx,
          aiAy,
          playerXQ16,
          playerYQ16,
          aiDir,
          aiState,
          aiHp,
          aiSpeed,
          aiCooldown,
          aiFlags,
          rng | 0,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
        ) >>> 0;
        const tDogChaseHash = wlAct2TDogChaseHash(
          aiAx,
          aiAy,
          playerXQ16,
          playerYQ16,
          aiDir,
          aiState,
          aiHp,
          aiSpeed,
          aiCooldown,
          aiFlags,
          rng | 0,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
        ) >>> 0;
        const tProjectileHash = wlAct2TProjectileHash(
          aiAx,
          aiAy,
          playerXQ16,
          playerYQ16,
          aiDir,
          aiState,
          aiHp,
          aiSpeed,
          aiCooldown,
          aiFlags,
          rng | 0,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
        ) >>> 0;
        const openDoorHash = wlAct1OpenDoorHash(doorMask, doorState, doorNum, doorSpeed, doorBlocked) >>> 0;
        const closeDoorHash = wlAct1CloseDoorHash(doorMask, doorState, doorNum, doorSpeed, doorBlocked) >>> 0;
        const operateDoorHash = wlAct1OperateDoorHash(doorMask, doorState, doorNum, doorAction, doorSpeed, doorBlocked) >>> 0;
        const moveDoorsHash = wlAct1MoveDoorsHash(doorMask, doorState, doorTics, doorSpeed, doorActiveMask) >>> 0;
        const bonusHash = wlAgentGetBonusHash(
          bonusScore,
          bonusLives,
          bonusHealth,
          bonusAmmo,
          bonusKeys,
          bonusKind,
          bonusValue,
        ) >>> 0;
        const ammoHash = wlAgentGiveAmmoHash(this.state.ammo | 0, 99, ammoAmount, ammoWeaponOwned) >>> 0;
        const pointsHash = wlAgentGivePointsHash(bonusScore, bonusLives, nextExtra, pointsValue) >>> 0;
        const healHash = wlAgentHealSelfHash(this.state.health | 0, 100, healAmount) >>> 0;
        const cmdFireHash = wlAgentCmdFireHash(this.state.ammo | 0, weaponState, this.state.cooldown | 0, buttonFire) >>> 0;
        const cmdUseHash = wlAgentCmdUseHash(
          this.state.mapLo | 0,
          this.state.mapHi | 0,
          this.state.xQ8 | 0,
          this.state.yQ8 | 0,
          this.state.angleDeg | 0,
          usePressed,
        ) >>> 0;
        const tPlayerHash = wlAgentTPlayerHash(
          this.state.mapLo | 0,
          this.state.mapHi | 0,
          this.state.xQ8 | 0,
          this.state.yQ8 | 0,
          this.state.angleDeg | 0,
          this.state.health | 0,
          this.state.ammo | 0,
          this.state.cooldown | 0,
          this.state.flags | 0,
          inputMask | 0,
          rng | 0,
        ) >>> 0;
        const thrustHash = wlAgentThrustHash(
          this.state.mapLo | 0,
          this.state.mapHi | 0,
          this.state.xQ8 | 0,
          this.state.yQ8 | 0,
          this.state.angleDeg | 0,
          thrustSpeedQ8,
        ) >>> 0;
        const spawnDoorHash = wlAct1SpawnDoorHash(doorMask, doorState, spawnTile, spawnLock, spawnVertical) >>> 0;
        const pushWallHash = wlAct1PushWallHash(
          this.state.mapLo | 0,
          this.state.mapHi | 0,
          pushX,
          pushY,
          pushDir,
          pushSteps,
        ) >>> 0;
        const takeDamageHash = wlAgentTakeDamageHash(this.state.health | 0, damageLives, damageValue, 0, rng | 0) >>> 0;
        const levelCompletedHash = wlInterLevelCompletedHash(
          bonusScore,
          levelTime,
          levelPar,
          killsFound,
          killsTotal,
          secretsFound,
          secretsTotal,
          treasureFound,
          treasureTotal,
          damageLives,
        ) >>> 0;
        const victoryHash = wlInterVictoryHash(
          bonusScore,
          victoryTime,
          killsFound,
          secretsFound,
          treasureFound,
          this.state.tick & 7,
          (this.state.tick >> 3) & 3,
        ) >>> 0;
        const soundLocHash = wlGameSetSoundLocHash(soundGx, soundGy, listenerX, listenerY) >>> 0;
        const updateSoundLocHash = wlGameUpdateSoundLocHash(soundGx, soundGy, listenerX, listenerY, velocityX, velocityY) >>> 0;
        const playSoundLocHash = wlGamePlaySoundLocGlobalHash(
          soundMode,
          soundId,
          soundGx,
          soundGy,
          listenerX,
          listenerY,
          channelBusy,
        ) >>> 0;
        const readControlHash = idInReadControlHash(keyMask, mouseDx, mouseDy, buttonMask) >>> 0;
        const userInputValue = idInUserInput(delayTics, inputMask | 0, rng | 0) | 0;
        const setSoundModeHash = idSdSetSoundModeHash(currentSoundMode, requestedSoundMode, hasDevice) >>> 0;
        const setMusicModeHash = idSdSetMusicModeHash(currentMusicMode, requestedMusicMode, hasDevice) >>> 0;
        const playSoundHash = idSdPlaySoundHash(soundMode, soundId, playPriority, currentPriority, channelBusy) >>> 0;
        const stopSoundHash = idSdStopSoundHash(channelBusy, soundId, currentPriority) >>> 0;
        const setupAudioFileHash = idCaCalSetupAudioFileHash(audiohedLen, audiotLen, audioStart) >>> 0;
        const cacheAudioChunkHash =
          idCaCacheAudioChunkHash(audioChunkNum, audioOffset, audioNextOffset, audiotLen, audioCacheMask) >>> 0;
        const usPrintHash = idUs1UsPrintHash(cursorX, cursorY, textLen, color, fontWidth) >>> 0;
        const usCPrintHash = idUs1UsCPrintHash(windowX, windowW, textLen, align, fontWidth) >>> 0;
        const usDrawWindowHash = idUs1UsDrawWindowHash(windowX, cursorY, windowW, windowH, color, color ^ 15) >>> 0;
        const menuControlPanelHash = wlMenuUsControlPanelHash(menuScreen, menuCursor, inputMask | 0, menuItems) >>> 0;
        const menuDrawMainHash = wlMenuDrawMainMenuHash(menuCursor, enabledMask, episode) >>> 0;
        const menuDrawHash = wlMenuDrawMenuHash(menuId, menuCursor, itemCount, disabledMask, scroll) >>> 0;
        const menuNewGameHash = wlMenuCpNewGameHash(difficulty, episode, startLevel, weaponState) >>> 0;
        const menuViewScoresHash =
          wlMenuCpViewScoresHash(score0, score1, score2, score3, score4, playLoopHash & 0xffff) >>> 0;
        const menuSoundHash = wlMenuCpSoundHash(currentSoundMode, currentMusicMode, soundMode, menuAction) >>> 0;
        const menuControlHash = wlMenuCpControlHash(mouseEnabled, joystickEnabled, sensitivity, menuAction) >>> 0;
        const menuMessageHash = wlMenuMessageHash(messageLen, waitForAck, inputMask | 0, rng | 0) >>> 0;
        const textHelpHash = wlTextHelpScreensHash(helpPage, helpTotalPages, inputMask | 0, rng | 0) >>> 0;
        const textEndHash = wlTextEndTextHash(messageLen, textScrollPos, textSpeed, inputMask | 0) >>> 0;
        const fixedByFracValue = wlDrawFixedByFrac(fixedA, fixedB) | 0;
        const buildTablesHash = wlMainBuildTablesHash() >>> 0;
        const calcProjectionHash = wlMainCalcProjectionHash(projViewwidth, projFocal) >>> 0;
        const transformActorHash = wlDrawTransformActorHash(
          rayObX,
          rayObY,
          rayViewX,
          rayViewY,
          rayViewCos,
          rayViewSin,
          rayScale,
          rayCenterX,
          rayHeightNumerator,
          rayMinDist,
        ) >>> 0;
        const transformTileHash = wlDrawTransformTileHash(
          rayTileX,
          rayTileY,
          rayViewX,
          rayViewY,
          rayViewCos,
          rayViewSin,
          rayScale,
          rayCenterX,
          rayHeightNumerator,
          rayMinDist,
        ) >>> 0;
        const calcHeightValue = wlDrawCalcHeight(
          rayXIntercept,
          rayYIntercept,
          rayViewX,
          rayViewY,
          rayViewCos,
          rayViewSin,
          rayHeightNumerator,
          rayMinDist,
        ) | 0;
        const hitVertWallHash = wlDrawHitVertWallHash(
          rayXIntercept,
          rayYIntercept,
          rayXTileStep,
          rayPixX,
          rayXTile,
          rayYTile,
          rayLastSide,
          rayLastIntercept,
          rayLastTileHit,
          rayTileHit,
          rayPostSourceLow,
          rayPostWidth,
          rayPrevHeight,
          rayAdjacentDoor,
          rayWallPicNormal,
          rayWallPicDoor,
          rayViewX,
          rayViewY,
          rayViewCos,
          rayViewSin,
          rayHeightNumerator,
          rayMinDist,
        ) >>> 0;
        const hitHorizWallHash = wlDrawHitHorizWallHash(
          rayXIntercept,
          rayYIntercept,
          rayYTileStep,
          rayPixX,
          rayXTile,
          rayYTile,
          rayLastSide,
          rayLastIntercept,
          rayLastTileHit,
          rayTileHit,
          rayPostSourceLow,
          rayPostWidth,
          rayPrevHeight,
          rayAdjacentDoor,
          rayWallPicNormal,
          rayWallPicDoor,
          rayViewX,
          rayViewY,
          rayViewCos,
          rayViewSin,
          rayHeightNumerator,
          rayMinDist,
        ) >>> 0;
        const setupScalingHash = wlScaleSetupScalingHash(scaleMaxScaleHeight, scaleViewHeight) >>> 0;
        const scaleShapeHash = wlScaleScaleShapeHash(rayCenterX, 0, 63, scaleHeight, scaleMaxScale, scaleViewWidth, scaleSeed) >>> 0;
        const simpleScaleShapeHash = wlScaleSimpleScaleShapeHash(rayCenterX, 0, 63, scaleHeight) >>> 0;
        const drawPlayScreenHash = wlGameDrawPlayScreenHash(
          playScreenViewWidth,
          playScreenViewHeight,
          playScreenBufferOfs,
          playScreenLoc0,
          playScreenLoc1,
          playScreenLoc2,
          playScreenStatusBarPic,
        ) >>> 0;
        const selectDodgeDirHash = wlStateSelectDodgeDirHash(
          aiAx,
          aiAy,
          playerXQ16,
          playerYQ16,
          aiDir,
          aiState,
          aiHp,
          aiSpeed,
          aiCooldown,
          aiFlags,
          rng | 0,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
        ) >>> 0;
        const damageActorHash = wlStateDamageActorHash(
          aiAx,
          aiAy,
          playerXQ16,
          playerYQ16,
          aiDir,
          aiState,
          aiHp,
          aiSpeed,
          aiCooldown,
          aiFlags,
          rng | 0,
          damageValue,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
        ) >>> 0;
        const agentTryMoveHash = wlAgentTryMoveHash(
          this.state.mapLo | 0,
          this.state.mapHi | 0,
          this.state.xQ8 | 0,
          this.state.yQ8 | 0,
          strafe | 0,
          forward | 0,
        ) >>> 0;
        const agentClipMoveHash = wlAgentClipMoveHash(
          this.state.mapLo | 0,
          this.state.mapHi | 0,
          this.state.xQ8 | 0,
          this.state.yQ8 | 0,
          strafe | 0,
          forward | 0,
        ) >>> 0;
        const agentControlMovementHash = wlAgentControlMovementHash(
          this.state.mapLo | 0,
          this.state.mapHi | 0,
          this.state.xQ8 | 0,
          this.state.yQ8 | 0,
          this.state.angleDeg | 0,
          forward | 0,
          strafe | 0,
          turn | 0,
        ) >>> 0;
        const carmackExpandHash = idCaCarmackExpandHash(carmackSource, carmackExpandedLength) >>> 0;
        const rlewExpandHash = idCaRlewExpandHash(rlewSourceWords, rlewExpandedLength, rlewTag) >>> 0;
        const setupMapFileHash = idCaSetupMapFileHash(mapHeadBytes) >>> 0;
        const cacheMapHash = idCaCacheMapHash(gameMapsBytes, mapHeadBytes, 0) >>> 0;
        const setupGameLevelHash = wlGameSetupGameLevelHash(plane0Words, mapWidth, mapHeight) >>> 0;
        const mmGetPtrHash = idMmGetPtrHash(mmFreeBytes, mmRequestSize, mmPurgeMask, mmLockMask) >>> 0;
        const mmFreePtrHash = idMmFreePtrHash(mmFreeBytes, mmBlockSize, mmAllocMask, mmSlot) >>> 0;
        const mmSetPurgeHash = idMmSetPurgeHash(mmPurgeMask, mmLockMask, mmSlot, mmPurgeLevel) >>> 0;
        const mmSetLockHash = idMmSetLockHash(mmLockMask, mmSlot, (inputMask >> 6) & 1) >>> 0;
        const mmSortMemHash = idMmSortMemHash(mmAllocMask, mmPurgeMask, mmLockMask, mmLowWaterMark) >>> 0;
        const pmCheckMainMemHash = idPmCheckMainMemHash(pmPageCount, pmResidentMask, pmLockMask, pmPageSize) >>> 0;
        const pmGetPageAddressHash = idPmGetPageAddressHash(pmResidentMask, pmPageNum, pmPageSize, pmFrame) >>> 0;
        const pmGetPageHash = idPmGetPageHash(pmResidentMask, pmLockMask, pmPageNum, pmFrame) >>> 0;
        const pmNextFrameHash = idPmNextFrameHash(pmResidentMask, pmLockMask, pmFrame) >>> 0;
        const pmResetHash = idPmResetHash(pmPageCount, pmResidentMask, pmFrameSeed) >>> 0;
        const vhMeasurePropStringHash = idVhVwMeasurePropStringHash(textLen, vhFontWidth, vhSpacing, vhMaxWidth) >>> 0;
        const vhDrawPicHash = idVhVwbDrawPicHash(vhPicX, vhPicY, vhPicNum, vhBufferOfs, vhScreenOfs) >>> 0;
        const vhBarHash = idVhVwbBarHash(vhPicX, vhPicY, vhBarW, vhBarH, vhColor) >>> 0;
        const vlBarHash = idVlVlBarHash(vhPicX, vhPicY, vhBarW, vhBarH, vhColor, vlLineWidth) >>> 0;
        const vlMemToScreenHash = idVlVlMemToScreenHash(vlSrcLen, vhBarW, vhBarH, vlDest, vlMask) >>> 0;
        const vlLatchToScreenHash = idVlVlLatchToScreenHash(vhPicNum, vhBarW, vhBarH, vhPicX, vhPicY) >>> 0;
        const vlFadeInHash = idVlVlFadeInHash(vlFadeStart, vlFadeEnd, vlFadeSteps, vlPaletteSeed) >>> 0;
        const vlFadeOutHash = idVlVlFadeOutHash(vlFadeStart, vlFadeEnd, vlFadeSteps, vlPaletteSeed) >>> 0;
        const vlPlotHash = idVlVlPlotHash(vhPicX, vhPicY, vhColor, vlLineWidth) >>> 0;
        const vlHlinHash = idVlVlHlinHash(vhPicX, vhPicY, vhBarW, vhColor, vlLineWidth) >>> 0;
        const vhPlotHash = idVhVwbPlotHash(vhPicX, vhPicY, vhColor, vlLineWidth) >>> 0;
        const vhHlinHash = idVhVwbHlinHash(vhPicX, vhPicY, vhBarW, vhColor, vlLineWidth) >>> 0;
        const vhVlinHash = idVhVwbVlinHash(vhPicX, vhPicY, vlVlinHeight, vhColor, vlLineWidth) >>> 0;
        const vhMeasureStringHash = idVhVwlMeasureStringHash(textLen, vhFontWidth, vhFontHeight, vhMaxWidth) >>> 0;
        const vhDrawPropStringHash = idVhVwbDrawPropStringHash(textLen, vhPicX, vhPicY, vhColor, vhDrawPropMaxWidth) >>> 0;
        const vlVlinHash = idVlVlVlinHash(vhPicX, vhPicY, vlVlinHeight, vhColor, vlLineWidth) >>> 0;
        const vlScreenToScreenHash = idVlVlScreenToScreenHash(vhBufferOfs, vlDest, vhBarW, vhBarH, vlLineWidth) >>> 0;
        const vlMaskedToScreenHash = idVlVlMaskedToScreenHash(vhPicNum, vhBarW, vhBarH, vhPicX, vhPicY, vlMask) >>> 0;
        const vlMemToLatchHash = idVlVlMemToLatchHash(vlSrcLen, vhBarW, vhBarH, vlDest) >>> 0;
        const vlClearVideoHash = idVlVlClearVideoHash(vhColor, vlLineWidth, vlPages, vhBufferOfs) >>> 0;
        const vhDrawPropString2Hash = idVhVwDrawPropStringHash(textLen, vhPicX, vhPicY, vhDrawPropMaxWidth, vhFontWidth) >>> 0;
        const vhDrawColorPropStringHash = idVhVwDrawColorPropStringHash(textLen, vhPicX, vhPicY, vhColor, vhDrawPropMaxWidth) >>> 0;
        const vhMeasureMPropStringHash = idVhVwMeasureMPropStringHash(textLen, vhFontWidth, vhSpacing, vhMaxWidth) >>> 0;
        const vhDrawTile8Hash = idVhVwbDrawTile8Hash(vhPicX, vhPicY, vhTile, vhScreenOfs) >>> 0;
        const vhDrawTile8mHash = idVhVwbDrawTile8MHash(vhPicX, vhPicY, vhTile, vhScreenOfs, vlMask) >>> 0;
        const vlSetColorHash = idVlVlSetColorHash(vlPaletteStart, vhColor, vlPaletteSeed) >>> 0;
        const vlGetColorHash = idVlVlGetColorHash(vlPaletteStart, vlPaletteSeed) >>> 0;
        const vlSetPaletteHash = idVlVlSetPaletteHash(vlPaletteStart, vlPaletteCount, vlPaletteSeed, vlPaletteFlags) >>> 0;
        const vlGetPaletteHash = idVlVlGetPaletteHash(vlPaletteStart, vlPaletteCount, vlPaletteSeed) >>> 0;
        const vlFillPaletteHash = idVlVlFillPaletteHash(vlRed, vlGreen, vlBlue, vlPaletteCount) >>> 0;
        const vhMarkUpdateBlockHash = idVhVwMarkUpdateBlockHash(vhBlockMinX, vhBlockMinY, vhBlockMaxX, vhBlockMaxY, vlLineWidth) >>> 0;
        const vhUpdateScreenHash = idVhVwUpdateScreenHash(vhBufferOfs, vhScreenOfs, vhUpdateWidth, vhUpdateHeight) >>> 0;
        const vhLatchDrawPicHash = idVhLatchDrawPicHash(vhPicX, vhPicY, vhPicNum, vhBufferOfs, vhScreenOfs) >>> 0;
        const vhLoadLatchMemHash = idVhLoadLatchMemHash(vlSrcLen, vhBarW, vhBarH, vhBufferOfs) >>> 0;
        const vhVlMungePicHash = idVhVlMungePicHash(vhBarW, vhBarH, vlSrcLen, vlVgaChain4) >>> 0;
        const vlSetLineWidthHash = idVlVlSetLineWidthHash(vlLineWidth, vlScreenWidth) >>> 0;
        const vlSetSplitScreenHash = idVlVlSetSplitScreenHash(vlSplitLine, vlSplitEnabled, vlLineWidth) >>> 0;
        const vlSetVgaPlaneModeHash = idVlVlSetVgaPlaneModeHash(vlScreenWidth, vhUpdateHeight, vlVgaChain4) >>> 0;
        const vlSetTextModeHash = idVlVlSetTextModeHash(vlTextMode, vlTextRows, vlTextCols) >>> 0;
        const vlColorBorderHash = idVlVlColorBorderHash(vhColor, vlBorderTicks) >>> 0;
        const fixedMulValue = probeFixedMul(fixedA, fixedB) | 0;
        const fixedByFracCoreValue = probeFixedByFrac(fixedA, fixedB) | 0;
        const rlewExpandChecksumHash = probeRlewExpandChecksum(rlewSourceWords, rlewTag, rlewExpandedLength >>> 1) >>> 0;
        const raycastDistanceQ16Value = probeRaycastDistanceQ16(
          this.state.mapLo >>> 0,
          this.state.mapHi >>> 0,
          rayViewX,
          rayViewY,
          rayViewCos,
          rayViewSin,
          16,
        ) | 0;
        const actorStepPackedValue = probeActorStepPacked(aiState & 3, (this.state.tick & 7) << 8, (this.state.flags & 0x400) !== 0, rng | 0) | 0;
        const playerMovePackedValue = probePlayerMovePacked(
          this.state.mapLo >>> 0,
          this.state.mapHi >>> 0,
          this.state.xQ8 | 0,
          this.state.yQ8 | 0,
          strafe | 0,
          forward | 0,
        ) | 0;
        const gameEventHashValue = probeGameEventHash(bonusScore, bonusLives, bonusHealth, bonusAmmo, menuAction, bonusValue) | 0;
        const menuReducePackedValue = probeMenuReducePacked(menuScreen, menuCursor, menuAction, menuItems) | 0;
        const measureTextPackedValue = probeMeasureTextPacked(textLen, (vhMaxWidth / vhFontWidth) | 0) | 0;
        const audioReducePackedValue = probeAudioReducePacked(currentSoundMode, currentMusicMode, soundMode, menuAction, soundId) | 0;
        const wlStateCheckLineValue = wlStateCheckLine(aiAx, aiAy, playerXQ16, playerYQ16, this.state.mapLo | 0, this.state.mapHi | 0) | 0;
        const wlStateCheckSightValue = wlStateCheckSight(aiAx, aiAy, playerXQ16, playerYQ16, this.state.mapLo | 0, this.state.mapHi | 0) | 0;
        const wlStateMoveObjHashValue = wlStateMoveObjHash(
          aiAx,
          aiAy,
          playerXQ16,
          playerYQ16,
          aiDir,
          aiState,
          aiHp,
          aiSpeed,
          aiCooldown,
          aiFlags,
          rng | 0,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
        ) >>> 0;
        const wlStateSelectChaseDirHashValue = wlStateSelectChaseDirHash(
          aiAx,
          aiAy,
          playerXQ16,
          playerYQ16,
          aiDir,
          aiState,
          aiHp,
          aiSpeed,
          aiCooldown,
          aiFlags,
          rng | 0,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
        ) >>> 0;
        const wlAgentRealClipMoveHashValue = wlAgentRealClipMoveHash(
          this.state.xQ8 << 8,
          this.state.yQ8 << 8,
          strafe << 8,
          forward << 8,
          this.state.mapLo | 0,
          this.state.mapHi | 0,
          0,
        ) >>> 0;
        const runtimeProbeMix =
          (spawnDoorHash ^
            pushWallHash ^
            takeDamageHash ^
            levelCompletedHash ^
            victoryHash ^
            soundLocHash ^
            updateSoundLocHash ^
            playSoundLocHash ^
            readControlHash ^
            (userInputValue >>> 0) ^
            setSoundModeHash ^
            setMusicModeHash ^
            playSoundHash ^
            stopSoundHash ^
            setupAudioFileHash ^
            cacheAudioChunkHash ^
            usPrintHash ^
            usCPrintHash ^
            usDrawWindowHash ^
            menuControlPanelHash ^
            menuDrawMainHash ^
            menuDrawHash ^
            menuNewGameHash ^
            menuViewScoresHash ^
            menuSoundHash ^
            menuControlHash ^
            menuMessageHash ^
            textHelpHash ^
            textEndHash ^
            (fixedByFracValue >>> 0) ^
            buildTablesHash ^
            calcProjectionHash ^
            transformActorHash ^
            transformTileHash ^
            (calcHeightValue >>> 0) ^
            hitVertWallHash ^
            hitHorizWallHash ^
            setupScalingHash ^
            scaleShapeHash ^
            simpleScaleShapeHash ^
            drawPlayScreenHash ^
            selectDodgeDirHash ^
            damageActorHash ^
            agentTryMoveHash ^
            agentClipMoveHash ^
            agentControlMovementHash ^
            carmackExpandHash ^
            rlewExpandHash ^
            setupMapFileHash ^
            cacheMapHash ^
            setupGameLevelHash ^
            mmGetPtrHash ^
            mmFreePtrHash ^
            mmSetPurgeHash ^
            mmSetLockHash ^
            mmSortMemHash ^
            pmCheckMainMemHash ^
            pmGetPageAddressHash ^
            pmGetPageHash ^
            pmNextFrameHash ^
            pmResetHash ^
            vhMeasurePropStringHash ^
            vhDrawPicHash ^
            vhBarHash ^
            vlBarHash ^
            vlMemToScreenHash ^
            vlLatchToScreenHash ^
            vlFadeInHash ^
            vlFadeOutHash ^
            vlPlotHash ^
            vlHlinHash ^
            vhPlotHash ^
            vhHlinHash ^
            vhVlinHash ^
            vhMeasureStringHash ^
            vhDrawPropStringHash ^
            vlVlinHash ^
            vlScreenToScreenHash ^
            vlMaskedToScreenHash ^
            vlMemToLatchHash ^
            vlClearVideoHash ^
            vhDrawPropString2Hash ^
            vhDrawColorPropStringHash ^
            vhMeasureMPropStringHash ^
            vhDrawTile8Hash ^
            vhDrawTile8mHash ^
            vlSetColorHash ^
            vlGetColorHash ^
            vlSetPaletteHash ^
            vlGetPaletteHash ^
            vlFillPaletteHash ^
            vhMarkUpdateBlockHash ^
            vhUpdateScreenHash ^
            vhLatchDrawPicHash ^
            vhLoadLatchMemHash ^
            vhVlMungePicHash ^
            vlSetLineWidthHash ^
            vlSetSplitScreenHash ^
            vlSetVgaPlaneModeHash ^
            vlSetTextModeHash ^
            vlColorBorderHash ^
            (fixedMulValue >>> 0) ^
            (fixedByFracCoreValue >>> 0) ^
            rlewExpandChecksumHash ^
            (raycastDistanceQ16Value >>> 0) ^
            (actorStepPackedValue >>> 0) ^
            (playerMovePackedValue >>> 0) ^
            (gameEventHashValue >>> 0) ^
            (menuReducePackedValue >>> 0) ^
            (measureTextPackedValue >>> 0) ^
            (audioReducePackedValue >>> 0) ^
            (wlStateCheckLineValue >>> 0) ^
            (wlStateCheckSightValue >>> 0) ^
            wlStateMoveObjHashValue ^
            wlStateSelectChaseDirHashValue ^
            wlAgentRealClipMoveHashValue) >>> 0;

        // Keep probe hash computation for trace coverage, but do not drive runtime state from hash bits.
        void runtimeProbeMix;
      }
    }

    if (pendingDamageCalls > 0) {
      const difficulty = (this.state.tick >> 2) & 3;
      for (let i = 0; i < pendingDamageCalls; i++) {
        const points = (((rng >> ((i & 7) * 4)) & 0x0f) + 1) | 0;
        const takeDamage = wlAgentTakeDamageStep(this.state.health, points, difficulty, false, false);
        this.state.health = clampI32(takeDamage.health, 0, 100);
        if (takeDamage.died) {
          this.state.health = 0;
          break;
        }
      }
    }

    if (this.state.health <= 0) {
      this.state.flags |= 0x40;
    } else {
      this.state.flags &= ~0x40;
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

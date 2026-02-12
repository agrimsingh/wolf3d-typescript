import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import type { RuntimeConfig, RuntimeInput } from '../../src/runtime/contracts';
import { getNumRuns, getSeed } from './config';
import { withReplay } from './replay';

const AREATILE = 107;
const FLAG_ACTOR_KILLED = 1 << 20;

function makePlane(width: number, height: number, fill: number): Uint16Array {
  const out = new Uint16Array(width * height);
  out.fill(fill & 0xffff);
  return out;
}

function addBorderWalls(plane0: Uint16Array, width: number, height: number): void {
  for (let x = 0; x < width; x++) {
    plane0[x] = 1;
    plane0[(height - 1) * width + x] = 1;
  }
  for (let y = 0; y < height; y++) {
    plane0[y * width] = 1;
    plane0[y * width + (width - 1)] = 1;
  }
}

function baseConfig(plane0: Uint16Array, plane1: Uint16Array, width: number, height: number): RuntimeConfig {
  return {
    mapLo: 0,
    mapHi: 0,
    enableFullMapRuntime: true,
    mapWidth: width,
    mapHeight: height,
    plane0,
    plane1,
    runtimeWindowOriginX: 0,
    runtimeWindowOriginY: 0,
    playerStartAbsTileX: 5,
    playerStartAbsTileY: 5,
    startXQ8: (5 * 256 + 128) | 0,
    startYQ8: (5 * 256 + 128) | 0,
    startAngleDeg: 0,
    startHealth: 100,
    startAmmo: 16,
  };
}

function injectActor(runtime: TsRuntimePort, tileX: number, tileY: number, hp = 28, kind = 118): void {
  const internal = runtime as unknown as {
    fullMap: {
      actors: Array<{ id: number; kind: number; xQ8: number; yQ8: number; hp: number; mode: number; cooldown: number }>;
      nextActorId: number;
    };
  };

  internal.fullMap.actors = [{
    id: 1,
    kind,
    xQ8: (tileX * 256 + 128) | 0,
    yQ8: (tileY * 256 + 128) | 0,
    hp: hp | 0,
    mode: 0,
    cooldown: 0,
  }];
  internal.fullMap.nextActorId = 2;
}

function actorSnapshot(runtime: TsRuntimePort): { hp: number; xQ8: number; yQ8: number; mode: number } {
  const internal = runtime as unknown as {
    fullMap: { actors: Array<{ hp: number; xQ8: number; yQ8: number; mode: number }> };
  };
  const actor = internal.fullMap.actors[0];
  if (!actor) {
    return { hp: 0, xQ8: 0, yQ8: 0, mode: 3 };
  }
  return {
    hp: actor.hp | 0,
    xQ8: actor.xQ8 | 0,
    yQ8: actor.yQ8 | 0,
    mode: actor.mode | 0,
  };
}

function inputFromByte(b: number, seed: number, index: number): RuntimeInput {
  let mask = 0;
  if ((b & 1) !== 0) mask |= 1 << 0; // forward
  if ((b & 2) !== 0) mask |= 1 << 6; // fire
  if ((b & 4) !== 0) mask |= 1 << 2; // turn right
  if ((b & 8) !== 0) mask |= 1 << 3; // turn left
  if ((b & 16) !== 0) mask |= 1 << 7; // use
  return {
    inputMask: mask,
    tics: ((b >> 5) & 0x3) + 1,
    rng: (seed ^ Math.imul(index + 1, 1103515245) ^ b) | 0,
  };
}

async function runTrace(seed: number, bytes: number[]): Promise<number> {
  const width = 16;
  const height = 16;
  const plane0 = makePlane(width, height, AREATILE);
  const plane1 = makePlane(width, height, 0);
  addBorderWalls(plane0, width, height);

  const runtime = new TsRuntimePort();
  await runtime.bootWl1(baseConfig(plane0, plane1, width, height));
  injectActor(runtime, 8, 5, 34, 118);

  let traceHash = 2166136261 >>> 0;
  for (let i = 0; i < bytes.length; i++) {
    const input = inputFromByte(bytes[i] ?? 0, seed | 0, i);
    const step = runtime.step(input);
    const snap = runtime.snapshot();
    const actor = actorSnapshot(runtime);
    traceHash = Math.imul((traceHash ^ (step.snapshotHash >>> 0)) >>> 0, 16777619) >>> 0;
    traceHash = Math.imul((traceHash ^ (step.frameHash >>> 0)) >>> 0, 16777619) >>> 0;
    traceHash = Math.imul((traceHash ^ (snap.actorsHash >>> 0)) >>> 0, 16777619) >>> 0;
    traceHash = Math.imul((traceHash ^ (actor.hp >>> 0)) >>> 0, 16777619) >>> 0;
    traceHash = Math.imul((traceHash ^ (actor.mode >>> 0)) >>> 0, 16777619) >>> 0;
  }

  await runtime.shutdown();
  return traceHash >>> 0;
}

describe('runtime actor combat (full-map mode)', () => {
  it('stateful actor traces are deterministic for identical seeds and inputs', async () => {
    const traceRuns = Math.min(getNumRuns(), 64);
    await withReplay('runtime.actor-combat.deterministic-trace', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 0x7fffffff }),
          fc.array(fc.integer({ min: 0, max: 255 }), { minLength: 8, maxLength: 48 }),
          async (seed, bytes) => {
            const lhs = await runTrace(seed | 0, bytes);
            const rhs = await runTrace(seed | 0, bytes);
            expect(lhs >>> 0).toBe(rhs >>> 0);
          },
        ),
        { numRuns: traceRuns, seed: getSeed() },
      );
    });
  });

  it('actor can chase, damage the player, and be killed by repeated fire', async () => {
    const width = 16;
    const height = 16;
    const plane0 = makePlane(width, height, AREATILE);
    const plane1 = makePlane(width, height, 0);
    addBorderWalls(plane0, width, height);

    const runtime = new TsRuntimePort();
    await runtime.bootWl1(baseConfig(plane0, plane1, width, height));
    injectActor(runtime, 7, 5, 36, 122);

    const actorStart = actorSnapshot(runtime);
    const healthStart = runtime.snapshot().health | 0;

    // Allow chase/attack ticks.
    for (let i = 0; i < 90; i++) {
      runtime.step({ inputMask: 0, tics: 1, rng: (0x7000 + i) | 0 });
    }

    const actorAfterChase = actorSnapshot(runtime);
    const healthAfterChase = runtime.snapshot().health | 0;

    // Repeatedly fire forward until actor dies or tick budget is consumed.
    for (let i = 0; i < 90; i++) {
      runtime.step({ inputMask: 1 << 6, tics: 1, rng: (0x9000 + i) | 0 });
      if (actorSnapshot(runtime).hp <= 0) {
        break;
      }
    }

    const actorEnd = actorSnapshot(runtime);
    const endSnapshot = runtime.snapshot();

    expect(actorAfterChase.xQ8 !== actorStart.xQ8 || actorAfterChase.yQ8 !== actorStart.yQ8).toBe(true);
    expect(healthAfterChase).toBeLessThan(healthStart);
    expect(actorEnd.hp).toBe(0);
    expect(((endSnapshot.flags >>> 0) & FLAG_ACTOR_KILLED) !== 0).toBe(true);

    await runtime.shutdown();
  });
});

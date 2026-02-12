import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { getNumRuns, getSeed } from './config';
import { withReplay } from './replay';
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
  wlStateFirstSightingHash,
  wlStateMoveObjHash,
  wlStateSelectChaseDirHash,
  wlStateSelectDodgeDirHash,
  wlStateSightPlayerHash,
} from '../../src/wolf/ai/wlAi';
import { wlStateRealCheckLine, wlStateRealCheckSight, wlStateRealMoveObjHash, wlStateRealSelectChaseDirHash } from '../../src/wolf/ai/wlStateReal';

const commonCtxArb = fc.tuple(
  fc.integer({ min: -0x70000000, max: 0x70000000 }), // ax
  fc.integer({ min: -0x70000000, max: 0x70000000 }), // ay
  fc.integer({ min: -0x70000000, max: 0x70000000 }), // px
  fc.integer({ min: -0x70000000, max: 0x70000000 }), // py
  fc.integer({ min: 0, max: 3 }), // dir
  fc.integer({ min: 0, max: 8 }), // state
  fc.integer({ min: 0, max: 0x7fffffff }), // hp
  fc.integer({ min: 1, max: 0x7fff }), // speed
  fc.integer({ min: 0, max: 255 }), // cooldown
  fc.integer({ min: 0, max: 0xffff }), // flags
  fc.integer({ min: 0, max: 0x7fffffff }), // rng
  fc.integer({ min: 0, max: 0xffffffff }), // mapLo
  fc.integer({ min: 0, max: 0xffffffff }), // mapHi
);

const checkLineCoordArb = fc.integer({ min: -1024, max: (8 << 8) + 1023 });

describe('phase 4 real WOLFSRC actors/AI parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('WL_STATE.SelectDodgeDir hash matches oracle', () => {
    withReplay('phase4.wl_state.SelectDodgeDir', () => {
      fc.assert(
        fc.property(commonCtxArb, (args) => {
          expect(wlStateSelectDodgeDirHash(...args) >>> 0).toBe(oracle.wlStateSelectDodgeDirHash(...args) >>> 0);
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_STATE.SelectChaseDir hash matches oracle', () => {
    withReplay('phase4.wl_state.SelectChaseDir', () => {
      fc.assert(
        fc.property(commonCtxArb, (args) => {
          expect(wlStateSelectChaseDirHash(...args) >>> 0).toBe(oracle.wlStateSelectChaseDirHash(...args) >>> 0);
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_STATE.MoveObj hash matches oracle', () => {
    withReplay('phase4.wl_state.MoveObj', () => {
      fc.assert(
        fc.property(commonCtxArb, (args) => {
          expect(wlStateMoveObjHash(...args) >>> 0).toBe(oracle.wlStateMoveObjHash(...args) >>> 0);
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_STATE.DamageActor hash matches oracle', () => {
    withReplay('phase4.wl_state.DamageActor', () => {
      fc.assert(
        fc.property(commonCtxArb, fc.integer({ min: 0, max: 0x7fffffff }), (args, damage) => {
          expect(wlStateDamageActorHash(...args, damage) >>> 0).toBe(oracle.wlStateDamageActorHash(...args, damage) >>> 0);
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_STATE.CheckLine matches oracle', () => {
    withReplay('phase4.wl_state.CheckLine', () => {
      fc.assert(
        fc.property(
          checkLineCoordArb,
          checkLineCoordArb,
          checkLineCoordArb,
          checkLineCoordArb,
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          (ax, ay, px, py, mapLo, mapHi) => {
            expect(wlStateCheckLine(ax, ay, px, py, mapLo, mapHi) | 0).toBe(oracle.wlStateCheckLine(ax, ay, px, py, mapLo, mapHi) | 0);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('real WL_STATE.CheckLine bridge matches TS port', () => {
    withReplay('phase4.wl_state_real.CheckLine', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 62 }),
          fc.integer({ min: 1, max: 62 }),
          fc.integer({ min: 1, max: 62 }),
          fc.integer({ min: 1, max: 62 }),
          fc.integer({ min: 0, max: 0xffff }),
          fc.integer({ min: 0, max: 0xffff }),
          fc.integer({ min: 0, max: 0xff }),
          fc.integer({ min: 0, max: 0xffff }),
          (obTileX, obTileY, pTileX, pTileY, obFrac, pFrac, doorMask, doorPosQ8) => {
            const obx = ((obTileX << 16) | obFrac) | 0;
            const oby = ((obTileY << 16) | (obFrac ^ 0x5a5a)) | 0;
            const px = ((pTileX << 16) | pFrac) | 0;
            const py = ((pTileY << 16) | (pFrac ^ 0x3c3c)) | 0;

            const tsValue = wlStateRealCheckLine(obx, oby, px, py, doorMask, doorPosQ8) | 0;
            const oracleValue = oracle.wlStateRealCheckLine(obx, oby, px, py, doorMask, doorPosQ8) | 0;
            expect(tsValue).toBe(oracleValue);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_STATE.CheckSight matches oracle', () => {
    withReplay('phase4.wl_state.CheckSight', () => {
      fc.assert(
        fc.property(
          checkLineCoordArb,
          checkLineCoordArb,
          checkLineCoordArb,
          checkLineCoordArb,
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          (ax, ay, px, py, mapLo, mapHi) => {
            expect(wlStateCheckSight(ax, ay, px, py, mapLo, mapHi) | 0).toBe(oracle.wlStateCheckSight(ax, ay, px, py, mapLo, mapHi) | 0);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('real WL_STATE.CheckSight bridge matches TS port', () => {
    withReplay('phase4.wl_state_real.CheckSight', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 62 }),
          fc.integer({ min: 1, max: 62 }),
          fc.integer({ min: 1, max: 62 }),
          fc.integer({ min: 1, max: 62 }),
          fc.integer({ min: 0, max: 0xffff }),
          fc.integer({ min: 0, max: 0xffff }),
          fc.integer({ min: 0, max: 7 }),
          fc.boolean(),
          fc.integer({ min: 0, max: 0xff }),
          fc.integer({ min: 0, max: 0xffff }),
          (obTileX, obTileY, pTileX, pTileY, obFrac, pFrac, dir, areaConnected, doorMask, doorPosQ8) => {
            const obx = ((obTileX << 16) | obFrac) | 0;
            const oby = ((obTileY << 16) | (obFrac ^ 0x5a5a)) | 0;
            const px = ((pTileX << 16) | pFrac) | 0;
            const py = ((pTileY << 16) | (pFrac ^ 0x3c3c)) | 0;
            const connected = areaConnected ? 1 : 0;

            const tsValue = wlStateRealCheckSight(obx, oby, px, py, dir, connected, doorMask, doorPosQ8) | 0;
            const oracleValue = oracle.wlStateRealCheckSight(obx, oby, px, py, dir, connected, doorMask, doorPosQ8) | 0;
            expect(tsValue).toBe(oracleValue);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('real WL_STATE.MoveObj bridge matches TS port', () => {
    withReplay('phase4.wl_state_real.MoveObj', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -0x70000000, max: 0x70000000 }),
          fc.integer({ min: -0x70000000, max: 0x70000000 }),
          fc.integer({ min: 0, max: 8 }),
          fc.integer({ min: -0x70000000, max: 0x70000000 }),
          fc.integer({ min: -0x70000000, max: 0x70000000 }),
          fc.boolean(),
          fc.integer({ min: -0x70000000, max: 0x70000000 }),
          fc.integer({ min: -0x10000, max: 0x10000 }),
          fc.integer({ min: 0, max: 30 }),
          fc.integer({ min: 0, max: 255 }),
          (obx, oby, dir, playerx, playery, areaConnected, distance, move, obclass, tics) => {
            const connected = areaConnected ? 1 : 0;
            const tsHash = wlStateRealMoveObjHash(obx, oby, dir, playerx, playery, connected, distance, move, obclass, tics) >>> 0;
            const oracleHash = oracle.wlStateRealMoveObjHash(
              obx,
              oby,
              dir,
              playerx,
              playery,
              connected,
              distance,
              move,
              obclass,
              tics,
            ) >>> 0;
            expect(tsHash).toBe(oracleHash);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('real WL_STATE.SelectChaseDir bridge matches TS port', () => {
    withReplay('phase4.wl_state_real.SelectChaseDir', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 61 }),
          fc.integer({ min: 2, max: 61 }),
          fc.integer({ min: 0, max: 8 }),
          fc.integer({ min: 0, max: 30 }),
          fc.integer({ min: 0, max: 0xffff }),
          fc.integer({ min: 2, max: 61 }),
          fc.integer({ min: 2, max: 61 }),
          (obTileX, obTileY, dir, obclass, flags, playerTileX, playerTileY) => {
            const tsHash = wlStateRealSelectChaseDirHash(obTileX, obTileY, dir, obclass, flags, playerTileX, playerTileY) >>> 0;
            const oracleHash = oracle.wlStateRealSelectChaseDirHash(
              obTileX,
              obTileY,
              dir,
              obclass,
              flags,
              playerTileX,
              playerTileY,
            ) >>> 0;
            expect(tsHash).toBe(oracleHash);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_STATE.FirstSighting hash matches oracle', () => {
    withReplay('phase4.wl_state.FirstSighting', () => {
      fc.assert(
        fc.property(commonCtxArb, (args) => {
          expect(wlStateFirstSightingHash(...args) >>> 0).toBe(oracle.wlStateFirstSightingHash(...args) >>> 0);
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_STATE.SightPlayer hash matches oracle', () => {
    withReplay('phase4.wl_state.SightPlayer', () => {
      fc.assert(
        fc.property(commonCtxArb, fc.boolean(), (args, canSeeHint) => {
          expect(wlStateSightPlayerHash(...args, canSeeHint ? 1 : 0) >>> 0).toBe(
            oracle.wlStateSightPlayerHash(...args, canSeeHint ? 1 : 0) >>> 0,
          );
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_ACT2.T_Bite hash matches oracle', () => {
    withReplay('phase4.wl_act2.T_Bite', () => {
      fc.assert(
        fc.property(commonCtxArb, (args) => {
          expect(wlAct2TBiteHash(...args) >>> 0).toBe(oracle.wlAct2TBiteHash(...args) >>> 0);
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_ACT2.T_Chase hash matches oracle', () => {
    withReplay('phase4.wl_act2.T_Chase', () => {
      fc.assert(
        fc.property(commonCtxArb, (args) => {
          expect(wlAct2TChaseHash(...args) >>> 0).toBe(oracle.wlAct2TChaseHash(...args) >>> 0);
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_ACT2.T_DogChase hash matches oracle', () => {
    withReplay('phase4.wl_act2.T_DogChase', () => {
      fc.assert(
        fc.property(commonCtxArb, (args) => {
          expect(wlAct2TDogChaseHash(...args) >>> 0).toBe(oracle.wlAct2TDogChaseHash(...args) >>> 0);
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_ACT2.T_Path hash matches oracle', () => {
    withReplay('phase4.wl_act2.T_Path', () => {
      fc.assert(
        fc.property(commonCtxArb, (args) => {
          expect(wlAct2TPathHash(...args) >>> 0).toBe(oracle.wlAct2TPathHash(...args) >>> 0);
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_ACT2.T_Projectile hash matches oracle', () => {
    withReplay('phase4.wl_act2.T_Projectile', () => {
      fc.assert(
        fc.property(commonCtxArb, (args) => {
          expect(wlAct2TProjectileHash(...args) >>> 0).toBe(oracle.wlAct2TProjectileHash(...args) >>> 0);
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_ACT2.T_Shoot hash matches oracle', () => {
    withReplay('phase4.wl_act2.T_Shoot', () => {
      fc.assert(
        fc.property(commonCtxArb, (args) => {
          expect(wlAct2TShootHash(...args) >>> 0).toBe(oracle.wlAct2TShootHash(...args) >>> 0);
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });
});

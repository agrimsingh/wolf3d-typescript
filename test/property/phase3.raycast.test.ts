import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { getNumRuns, getSeed } from './config';
import { withReplay } from './replay';
import {
  wlDrawCalcHeight,
  wlDrawHitHorizWallHash,
  wlDrawHitVertWallHash,
  wlDrawThreeDRefreshHash,
  wlDrawTransformActorHash,
  wlDrawTransformTileHash,
  wlDrawWallRefreshHash,
  wlRaycastConstants,
  wlScaleScaleShapeHash,
  wlScaleSetupScalingHash,
  wlScaleSimpleScaleShapeHash,
} from '../../src/wolf/render/wlRaycast';

const mindist = wlRaycastConstants.mindist;

function sharedDrawInputs() {
  return [
    fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
    fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
    fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
    fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
    fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
    fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
  ] as const;
}

function viewInputs() {
  return [
    fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
    fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
    fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
    fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
  ] as const;
}

describe('phase 3 real WOLFSRC raycasting parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('WL_DRAW.TransformActor hash matches oracle', () => {
    withReplay('phase3.wl_draw.TransformActor', () => {
      fc.assert(
        fc.property(
          ...sharedDrawInputs(),
          fc.integer({ min: -0x10000, max: 0x10000 }), // scale
          fc.integer({ min: -1024, max: 1024 }), // centerx
          fc.integer({ min: 1, max: 0x7fffffff }), // heightnumerator
          (obx, oby, viewx, viewy, viewcos, viewsin, scale, centerx, heightnumerator) => {
            expect(wlDrawTransformActorHash(obx, oby, viewx, viewy, viewcos, viewsin, scale, centerx, heightnumerator, mindist) >>> 0).toBe(
              oracle.wlDrawTransformActorHash(obx, oby, viewx, viewy, viewcos, viewsin, scale, centerx, heightnumerator, mindist) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_DRAW.TransformTile hash matches oracle', () => {
    withReplay('phase3.wl_draw.TransformTile', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1024, max: 1024 }),
          fc.integer({ min: -1024, max: 1024 }),
          ...viewInputs(),
          fc.integer({ min: -0x10000, max: 0x10000 }),
          fc.integer({ min: -1024, max: 1024 }),
          fc.integer({ min: 1, max: 0x7fffffff }),
          (tx, ty, viewx, viewy, viewcos, viewsin, scale, centerx, heightnumerator) => {
            expect(wlDrawTransformTileHash(tx, ty, viewx, viewy, viewcos, viewsin, scale, centerx, heightnumerator, mindist) >>> 0).toBe(
              oracle.wlDrawTransformTileHash(tx, ty, viewx, viewy, viewcos, viewsin, scale, centerx, heightnumerator, mindist) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_DRAW.CalcHeight matches oracle', () => {
    withReplay('phase3.wl_draw.CalcHeight', () => {
      fc.assert(
        fc.property(
          ...sharedDrawInputs(),
          fc.integer({ min: 1, max: 0x7fffffff }),
          (xintercept, yintercept, viewx, viewy, viewcos, viewsin, heightnumerator) => {
            expect(wlDrawCalcHeight(xintercept, yintercept, viewx, viewy, viewcos, viewsin, heightnumerator, mindist) | 0).toBe(
              oracle.wlDrawCalcHeight(xintercept, yintercept, viewx, viewy, viewcos, viewsin, heightnumerator, mindist) | 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_DRAW.HitVertWall hash matches oracle', () => {
    withReplay('phase3.wl_draw.HitVertWall', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.constantFrom(-1, 1),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -3, max: 3 }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.boolean(),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: 1, max: 0x7fffffff }),
          (
            xintercept,
            yintercept,
            xtilestep,
            pixx,
            xtile,
            ytile,
            lastside,
            lastintercept,
            lasttilehit,
            tilehit,
            postsourceLow,
            postwidth,
            prevheight,
            adjacentDoor,
            wallpicNormal,
            wallpicDoor,
            viewx,
            viewy,
            viewcos,
            viewsin,
            heightnumerator,
          ) => {
            const args = [
              xintercept,
              yintercept,
              xtilestep,
              pixx,
              xtile,
              ytile,
              lastside,
              lastintercept,
              lasttilehit,
              tilehit,
              postsourceLow,
              postwidth,
              prevheight,
              adjacentDoor ? 1 : 0,
              wallpicNormal,
              wallpicDoor,
              viewx,
              viewy,
              viewcos,
              viewsin,
              heightnumerator,
              mindist,
            ];
            expect(
              wlDrawHitVertWallHash(
                args[0]!,
                args[1]!,
                args[2]!,
                args[3]!,
                args[4]!,
                args[5]!,
                args[6]!,
                args[7]!,
                args[8]!,
                args[9]!,
                args[10]!,
                args[11]!,
                args[12]!,
                args[13]!,
                args[14]!,
                args[15]!,
                args[16]!,
                args[17]!,
                args[18]!,
                args[19]!,
                args[20]!,
                args[21]!,
              ) >>> 0,
            ).toBe(
              oracle.wlDrawHitVertWallHash(
                args[0]!,
                args[1]!,
                args[2]!,
                args[3]!,
                args[4]!,
                args[5]!,
                args[6]!,
                args[7]!,
                args[8]!,
                args[9]!,
                args[10]!,
                args[11]!,
                args[12]!,
                args[13]!,
                args[14]!,
                args[15]!,
                args[16]!,
                args[17]!,
                args[18]!,
                args[19]!,
                args[20]!,
                args[21]!,
              ) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_DRAW.HitHorizWall hash matches oracle', () => {
    withReplay('phase3.wl_draw.HitHorizWall', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.constantFrom(-1, 1),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -3, max: 3 }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.boolean(),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: 1, max: 0x7fffffff }),
          (
            xintercept,
            yintercept,
            ytilestep,
            pixx,
            xtile,
            ytile,
            lastside,
            lastintercept,
            lasttilehit,
            tilehit,
            postsourceLow,
            postwidth,
            prevheight,
            adjacentDoor,
            wallpicNormal,
            wallpicDoor,
            viewx,
            viewy,
            viewcos,
            viewsin,
            heightnumerator,
          ) => {
            const args = [
              xintercept,
              yintercept,
              ytilestep,
              pixx,
              xtile,
              ytile,
              lastside,
              lastintercept,
              lasttilehit,
              tilehit,
              postsourceLow,
              postwidth,
              prevheight,
              adjacentDoor ? 1 : 0,
              wallpicNormal,
              wallpicDoor,
              viewx,
              viewy,
              viewcos,
              viewsin,
              heightnumerator,
              mindist,
            ];
            expect(
              wlDrawHitHorizWallHash(
                args[0]!,
                args[1]!,
                args[2]!,
                args[3]!,
                args[4]!,
                args[5]!,
                args[6]!,
                args[7]!,
                args[8]!,
                args[9]!,
                args[10]!,
                args[11]!,
                args[12]!,
                args[13]!,
                args[14]!,
                args[15]!,
                args[16]!,
                args[17]!,
                args[18]!,
                args[19]!,
                args[20]!,
                args[21]!,
              ) >>> 0,
            ).toBe(
              oracle.wlDrawHitHorizWallHash(
                args[0]!,
                args[1]!,
                args[2]!,
                args[3]!,
                args[4]!,
                args[5]!,
                args[6]!,
                args[7]!,
                args[8]!,
                args[9]!,
                args[10]!,
                args[11]!,
                args[12]!,
                args[13]!,
                args[14]!,
                args[15]!,
                args[16]!,
                args[17]!,
                args[18]!,
                args[19]!,
                args[20]!,
                args[21]!,
              ) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_DRAW.WallRefresh hash matches oracle', () => {
    withReplay('phase3.wl_draw.WallRefresh', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 359 }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x10000, max: 0x10000 }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          (playerAngle, playerX, playerY, focallength, viewsin, viewcos) => {
            expect(wlDrawWallRefreshHash(playerAngle, playerX, playerY, focallength, viewsin, viewcos) >>> 0).toBe(
              oracle.wlDrawWallRefreshHash(playerAngle, playerX, playerY, focallength, viewsin, viewcos) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_DRAW.ThreeDRefresh hash matches oracle', () => {
    withReplay('phase3.wl_draw.ThreeDRefresh', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: 0, max: 0x7fffffff }),
          fc.boolean(),
          fc.integer({ min: 0, max: 0xffffffff }),
          (bufferofs, screenofs, frameon, fizzlein, wallRefreshHash) => {
            expect(wlDrawThreeDRefreshHash(bufferofs, screenofs, frameon, fizzlein ? 1 : 0, wallRefreshHash) >>> 0).toBe(
              oracle.wlDrawThreeDRefreshHash(bufferofs, screenofs, frameon, fizzlein ? 1 : 0, wallRefreshHash) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_SCALE.SetupScaling hash matches oracle', () => {
    withReplay('phase3.wl_scale.SetupScaling', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 2048 }),
          fc.integer({ min: 1, max: 1024 }),
          (maxscaleheightIn, viewheight) => {
            expect(wlScaleSetupScalingHash(maxscaleheightIn, viewheight) >>> 0).toBe(
              oracle.wlScaleSetupScalingHash(maxscaleheightIn, viewheight) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_SCALE.ScaleShape hash matches oracle', () => {
    withReplay('phase3.wl_scale.ScaleShape', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -640, max: 640 }),
          fc.integer({ min: 0, max: 63 }),
          fc.integer({ min: 0, max: 63 }),
          fc.integer({ min: 0, max: 0xffff }),
          fc.integer({ min: 1, max: 1024 }),
          fc.integer({ min: 1, max: 640 }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          (xcenter, leftpix, rightpix, height, maxscale, viewwidth, wallheightSeed) => {
            expect(wlScaleScaleShapeHash(xcenter, leftpix, rightpix, height, maxscale, viewwidth, wallheightSeed) >>> 0).toBe(
              oracle.wlScaleScaleShapeHash(xcenter, leftpix, rightpix, height, maxscale, viewwidth, wallheightSeed) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_SCALE.SimpleScaleShape hash matches oracle', () => {
    withReplay('phase3.wl_scale.SimpleScaleShape', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -640, max: 640 }),
          fc.integer({ min: 0, max: 63 }),
          fc.integer({ min: 0, max: 63 }),
          fc.integer({ min: 0, max: 0xffff }),
          (xcenter, leftpix, rightpix, height) => {
            expect(wlScaleSimpleScaleShapeHash(xcenter, leftpix, rightpix, height) >>> 0).toBe(
              oracle.wlScaleSimpleScaleShapeHash(xcenter, leftpix, rightpix, height) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });
});

import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { getNumRuns, getSeed } from './config';
import { withReplay } from './replay';
import {
  idVhVwMeasurePropStringHash,
  idVhVwDrawColorPropStringHash,
  idVhVwDrawPropStringHash,
  idVhVwMeasureMPropStringHash,
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
  idVlVlSetPaletteHash,
  idVlVlScreenToScreenHash,
  idVlVlVlinHash,
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

  it('ID_VH render helper hashes match oracle', () => {
    withReplay('phase3.id_vh.render-helpers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          (a, b, c, d, e, f, g, h) => {
            expect(idVhVwMeasurePropStringHash(a, b, c, d) >>> 0).toBe(
              oracle.idVhVwMeasurePropStringHash(a, b, c, d) >>> 0,
            );
            expect(idVhVwbDrawPicHash(a, b, c, d, e) >>> 0).toBe(
              oracle.idVhVwbDrawPicHash(a, b, c, d, e) >>> 0,
            );
            expect(idVhVwbBarHash(a, b, c, d, e) >>> 0).toBe(
              oracle.idVhVwbBarHash(a, b, c, d, e) >>> 0,
            );
            expect(idVlVlBarHash(a, b, c, d, e, f) >>> 0).toBe(
              oracle.idVlVlBarHash(a, b, c, d, e, f) >>> 0,
            );
            expect(idVlVlMemToScreenHash(a, b, c, d, e) >>> 0).toBe(
              oracle.idVlVlMemToScreenHash(a, b, c, d, e) >>> 0,
            );
            expect(idVlVlLatchToScreenHash(a, b, c, d, e) >>> 0).toBe(
              oracle.idVlVlLatchToScreenHash(a, b, c, d, e) >>> 0,
            );
            expect(idVlVlFadeInHash(a, b, c, d) >>> 0).toBe(
              oracle.idVlVlFadeInHash(a, b, c, d) >>> 0,
            );
            expect(idVlVlFadeOutHash(a, b, c, d) >>> 0).toBe(
              oracle.idVlVlFadeOutHash(a, b, c, d) >>> 0,
            );
            expect(idVlVlPlotHash(a, b, c, d) >>> 0).toBe(
              oracle.idVlVlPlotHash(a, b, c, d) >>> 0,
            );
            expect(idVlVlHlinHash(a, b, c, d, h) >>> 0).toBe(
              oracle.idVlVlHlinHash(a, b, c, d, h) >>> 0,
            );
            expect(idVhVwbPlotHash(a, b, c, d) >>> 0).toBe(
              oracle.idVhVwbPlotHash(a, b, c, d) >>> 0,
            );
            expect(idVhVwbHlinHash(a, b, c, d, h) >>> 0).toBe(
              oracle.idVhVwbHlinHash(a, b, c, d, h) >>> 0,
            );
            expect(idVhVwbVlinHash(a, b, c, d, h) >>> 0).toBe(
              oracle.idVhVwbVlinHash(a, b, c, d, h) >>> 0,
            );
            expect(idVhVwlMeasureStringHash(a, b, c, d) >>> 0).toBe(
              oracle.idVhVwlMeasureStringHash(a, b, c, d) >>> 0,
            );
            expect(idVhVwbDrawPropStringHash(a, b, c, d, e) >>> 0).toBe(
              oracle.idVhVwbDrawPropStringHash(a, b, c, d, e) >>> 0,
            );
            expect(idVlVlVlinHash(a, b, c, d, h) >>> 0).toBe(
              oracle.idVlVlVlinHash(a, b, c, d, h) >>> 0,
            );
            expect(idVlVlScreenToScreenHash(a, b, c, d, h) >>> 0).toBe(
              oracle.idVlVlScreenToScreenHash(a, b, c, d, h) >>> 0,
            );
            expect(idVlVlMaskedToScreenHash(a, b, c, d, e, f) >>> 0).toBe(
              oracle.idVlVlMaskedToScreenHash(a, b, c, d, e, f) >>> 0,
            );
            expect(idVlVlMemToLatchHash(a, b, c, d) >>> 0).toBe(
              oracle.idVlVlMemToLatchHash(a, b, c, d) >>> 0,
            );
            expect(idVlVlClearVideoHash(a, b, c, d) >>> 0).toBe(
              oracle.idVlVlClearVideoHash(a, b, c, d) >>> 0,
            );
            expect(idVhVwDrawPropStringHash(a, b, c, d, e) >>> 0).toBe(
              oracle.idVhVwDrawPropStringHash(a, b, c, d, e) >>> 0,
            );
            expect(idVhVwDrawColorPropStringHash(a, b, c, d, e) >>> 0).toBe(
              oracle.idVhVwDrawColorPropStringHash(a, b, c, d, e) >>> 0,
            );
            expect(idVhVwMeasureMPropStringHash(a, b, c, d) >>> 0).toBe(
              oracle.idVhVwMeasureMPropStringHash(a, b, c, d) >>> 0,
            );
            expect(idVhVwbDrawTile8Hash(a, b, c, d) >>> 0).toBe(
              oracle.idVhVwbDrawTile8Hash(a, b, c, d) >>> 0,
            );
            expect(idVhVwbDrawTile8MHash(a, b, c, d, e) >>> 0).toBe(
              oracle.idVhVwbDrawTile8MHash(a, b, c, d, e) >>> 0,
            );
            expect(idVlVlSetColorHash(a, b, c) >>> 0).toBe(
              oracle.idVlVlSetColorHash(a, b, c) >>> 0,
            );
            expect(idVlVlGetColorHash(a, b) >>> 0).toBe(
              oracle.idVlVlGetColorHash(a, b) >>> 0,
            );
            expect(idVlVlSetPaletteHash(a, b, c, d) >>> 0).toBe(
              oracle.idVlVlSetPaletteHash(a, b, c, d) >>> 0,
            );
            expect(idVlVlGetPaletteHash(a, b, c) >>> 0).toBe(
              oracle.idVlVlGetPaletteHash(a, b, c) >>> 0,
            );
            expect(idVlVlFillPaletteHash(a, b, c, d) >>> 0).toBe(
              oracle.idVlVlFillPaletteHash(a, b, c, d) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });
});

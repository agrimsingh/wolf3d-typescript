import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { getNumRuns, getSeed } from './config';
import { withReplay } from './replay';
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
} from '../../src/wolf/player/wlPlayer';
import { wlAgentRealClipMoveHash, wlAgentRealTryMove } from '../../src/wolf/player/wlAgentReal';

const mapArb = fc.tuple(
  fc.integer({ min: 0, max: 0xffffffff }),
  fc.integer({ min: 0, max: 0xffffffff }),
);

const posArb = fc.tuple(
  fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
  fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
);

const deltaArb = fc.tuple(
  fc.integer({ min: -0x7fff, max: 0x7fff }),
  fc.integer({ min: -0x7fff, max: 0x7fff }),
);

const realPosArb = fc.tuple(
  fc.integer({ min: 1, max: 6 }),
  fc.integer({ min: 1, max: 6 }),
  fc.integer({ min: 0, max: 0xffff }),
  fc.integer({ min: 0, max: 0xffff }),
);

describe('phase 5 real WOLFSRC player/input parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('ID_IN.IN_ReadControl hash matches oracle', () => {
    withReplay('phase5.id_in.IN_ReadControl', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 0xff }),
          fc.integer({ min: -512, max: 512 }),
          fc.integer({ min: -512, max: 512 }),
          fc.integer({ min: 0, max: 0xff }),
          (keyMask, mouseDx, mouseDy, buttonMask) => {
            expect(idInReadControlHash(keyMask, mouseDx, mouseDy, buttonMask) >>> 0).toBe(
              oracle.idInReadControlHash(keyMask, mouseDx, mouseDy, buttonMask) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_IN.IN_UserInput matches oracle', () => {
    withReplay('phase5.id_in.IN_UserInput', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -512, max: 512 }),
          fc.integer({ min: 0, max: 0xffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          (delayTics, inputMask, rng) => {
            expect(idInUserInput(delayTics, inputMask, rng) | 0).toBe(oracle.idInUserInput(delayTics, inputMask, rng) | 0);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_AGENT.TryMove hash matches oracle', () => {
    withReplay('phase5.wl_agent.TryMove', () => {
      fc.assert(
        fc.property(mapArb, posArb, deltaArb, ([mapLo, mapHi], [xq8, yq8], [dxq8, dyq8]) => {
          expect(wlAgentTryMoveHash(mapLo, mapHi, xq8, yq8, dxq8, dyq8) >>> 0).toBe(
            oracle.wlAgentTryMoveHash(mapLo, mapHi, xq8, yq8, dxq8, dyq8) >>> 0,
          );
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_AGENT.ClipMove hash matches oracle', () => {
    withReplay('phase5.wl_agent.ClipMove', () => {
      fc.assert(
        fc.property(mapArb, posArb, deltaArb, ([mapLo, mapHi], [xq8, yq8], [dxq8, dyq8]) => {
          expect(wlAgentClipMoveHash(mapLo, mapHi, xq8, yq8, dxq8, dyq8) >>> 0).toBe(
            oracle.wlAgentClipMoveHash(mapLo, mapHi, xq8, yq8, dxq8, dyq8) >>> 0,
          );
        }),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('real WL_AGENT.TryMove bridge matches TS port', () => {
    withReplay('phase5.wl_agent_real.TryMove', () => {
      fc.assert(
        fc.property(
          mapArb,
          realPosArb,
          ([mapLo, mapHi], [tileX, tileY, fracX, fracY]) => {
            const x = ((tileX << 16) | fracX) | 0;
            const y = ((tileY << 16) | fracY) | 0;
            expect(wlAgentRealTryMove(x, y, mapLo, mapHi) | 0).toBe(oracle.wlAgentRealTryMove(x, y, mapLo, mapHi) | 0);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('real WL_AGENT.ClipMove bridge matches TS port', () => {
    withReplay('phase5.wl_agent_real.ClipMove', () => {
      fc.assert(
        fc.property(
          mapArb,
          realPosArb,
          fc.integer({ min: -0x8000, max: 0x8000 }),
          fc.integer({ min: -0x8000, max: 0x8000 }),
          fc.boolean(),
          ([mapLo, mapHi], [tileX, tileY, fracX, fracY], xmove, ymove, noclip) => {
            const x = ((tileX << 16) | fracX) | 0;
            const y = ((tileY << 16) | fracY) | 0;
            const noclipValue = noclip ? 1 : 0;
            expect(wlAgentRealClipMoveHash(x, y, xmove, ymove, mapLo, mapHi, noclipValue) >>> 0).toBe(
              oracle.wlAgentRealClipMoveHash(x, y, xmove, ymove, mapLo, mapHi, noclipValue) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_AGENT.Thrust hash matches oracle', () => {
    withReplay('phase5.wl_agent.Thrust', () => {
      fc.assert(
        fc.property(
          mapArb,
          posArb,
          fc.integer({ min: -720, max: 720 }),
          fc.integer({ min: -0x7fff, max: 0x7fff }),
          ([mapLo, mapHi], [xq8, yq8], angleDeg, speedQ8) => {
            expect(wlAgentThrustHash(mapLo, mapHi, xq8, yq8, angleDeg, speedQ8) >>> 0).toBe(
              oracle.wlAgentThrustHash(mapLo, mapHi, xq8, yq8, angleDeg, speedQ8) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_AGENT.ControlMovement hash matches oracle', () => {
    withReplay('phase5.wl_agent.ControlMovement', () => {
      fc.assert(
        fc.property(
          mapArb,
          posArb,
          fc.integer({ min: -720, max: 720 }),
          fc.integer({ min: -0x7fff, max: 0x7fff }),
          fc.integer({ min: -0x7fff, max: 0x7fff }),
          fc.integer({ min: -90, max: 90 }),
          ([mapLo, mapHi], [xq8, yq8], angleDeg, forwardQ8, strafeQ8, turnDeg) => {
            expect(wlAgentControlMovementHash(mapLo, mapHi, xq8, yq8, angleDeg, forwardQ8, strafeQ8, turnDeg) >>> 0).toBe(
              oracle.wlAgentControlMovementHash(mapLo, mapHi, xq8, yq8, angleDeg, forwardQ8, strafeQ8, turnDeg) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_AGENT.Cmd_Fire hash matches oracle', () => {
    withReplay('phase5.wl_agent.Cmd_Fire', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -64, max: 256 }),
          fc.integer({ min: -16, max: 16 }),
          fc.integer({ min: -16, max: 256 }),
          fc.integer({ min: 0, max: 1 }),
          (ammo, weaponState, cooldown, buttonFire) => {
            expect(wlAgentCmdFireHash(ammo, weaponState, cooldown, buttonFire) >>> 0).toBe(
              oracle.wlAgentCmdFireHash(ammo, weaponState, cooldown, buttonFire) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_AGENT.Cmd_Use hash matches oracle', () => {
    withReplay('phase5.wl_agent.Cmd_Use', () => {
      fc.assert(
        fc.property(
          mapArb,
          posArb,
          fc.integer({ min: -720, max: 720 }),
          fc.integer({ min: 0, max: 1 }),
          ([mapLo, mapHi], [xq8, yq8], angleDeg, usePressed) => {
            expect(wlAgentCmdUseHash(mapLo, mapHi, xq8, yq8, angleDeg, usePressed) >>> 0).toBe(
              oracle.wlAgentCmdUseHash(mapLo, mapHi, xq8, yq8, angleDeg, usePressed) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_AGENT.T_Player hash matches oracle', () => {
    withReplay('phase5.wl_agent.T_Player', () => {
      fc.assert(
        fc.property(
          mapArb,
          posArb,
          fc.integer({ min: -720, max: 720 }),
          fc.integer({ min: 0, max: 200 }),
          fc.integer({ min: -64, max: 256 }),
          fc.integer({ min: -16, max: 256 }),
          fc.integer({ min: 0, max: 0xffff }),
          fc.integer({ min: 0, max: 0xff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          ([mapLo, mapHi], [xq8, yq8], angleDeg, health, ammo, cooldown, flags, inputMask, rng) => {
            expect(wlAgentTPlayerHash(mapLo, mapHi, xq8, yq8, angleDeg, health, ammo, cooldown, flags, inputMask, rng) >>> 0).toBe(
              oracle.wlAgentTPlayerHash(mapLo, mapHi, xq8, yq8, angleDeg, health, ammo, cooldown, flags, inputMask, rng) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_PLAY.PlayLoop hash matches oracle', () => {
    withReplay('phase5.wl_play.PlayLoop', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: -32, max: 512 }),
          fc.integer({ min: 0, max: 0xffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          (stateHash, tics, inputMask, rng) => {
            expect(wlPlayPlayLoopHash(stateHash, tics, inputMask, rng) >>> 0).toBe(
              oracle.wlPlayPlayLoopHash(stateHash, tics, inputMask, rng) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });
});

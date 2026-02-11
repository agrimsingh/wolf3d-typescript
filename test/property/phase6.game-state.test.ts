import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { getNumRuns, getSeed } from './config';
import { withReplay } from './replay';
import {
  wlAct1CloseDoorHash,
  wlAct1MoveDoorsHash,
  wlAct1OpenDoorHash,
  wlAct1OperateDoorHash,
  wlAct1PushWallHash,
  wlAct1SpawnDoorHash,
  wlAgentGetBonusHash,
  wlAgentGiveAmmoHash,
  wlAgentGivePointsHash,
  wlAgentHealSelfHash,
  wlAgentTakeDamageHash,
  wlGameGameLoopHash,
  wlInterCheckHighScoreHash,
  wlInterLevelCompletedHash,
  wlInterVictoryHash,
} from '../../src/wolf/game/wlGameState';

const mapArb = fc.tuple(
  fc.integer({ min: 0, max: 0xffffffff }),
  fc.integer({ min: 0, max: 0xffffffff }),
);

describe('phase 6 real WOLFSRC game-state parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('WL_ACT1.SpawnDoor hash matches oracle', () => {
    withReplay('phase6.wl_act1.SpawnDoor', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 63 }),
          fc.integer({ min: 0, max: 1 }),
          fc.integer({ min: 0, max: 1 }),
          (doorMask, doorState, tile, lock, vertical) => {
            expect(wlAct1SpawnDoorHash(doorMask, doorState, tile, lock, vertical) >>> 0).toBe(
              oracle.wlAct1SpawnDoorHash(doorMask, doorState, tile, lock, vertical) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_ACT1.OpenDoor hash matches oracle', () => {
    withReplay('phase6.wl_act1.OpenDoor', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 63 }),
          fc.integer({ min: 0, max: 32 }),
          fc.integer({ min: 0, max: 1 }),
          (doorMask, doorState, doorNum, speed, blocked) => {
            expect(wlAct1OpenDoorHash(doorMask, doorState, doorNum, speed, blocked) >>> 0).toBe(
              oracle.wlAct1OpenDoorHash(doorMask, doorState, doorNum, speed, blocked) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_ACT1.CloseDoor hash matches oracle', () => {
    withReplay('phase6.wl_act1.CloseDoor', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 63 }),
          fc.integer({ min: 0, max: 32 }),
          fc.integer({ min: 0, max: 1 }),
          (doorMask, doorState, doorNum, speed, blocked) => {
            expect(wlAct1CloseDoorHash(doorMask, doorState, doorNum, speed, blocked) >>> 0).toBe(
              oracle.wlAct1CloseDoorHash(doorMask, doorState, doorNum, speed, blocked) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_ACT1.OperateDoor hash matches oracle', () => {
    withReplay('phase6.wl_act1.OperateDoor', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 63 }),
          fc.integer({ min: 0, max: 1 }),
          fc.integer({ min: 0, max: 32 }),
          fc.integer({ min: 0, max: 1 }),
          (doorMask, doorState, doorNum, action, speed, blocked) => {
            expect(wlAct1OperateDoorHash(doorMask, doorState, doorNum, action, speed, blocked) >>> 0).toBe(
              oracle.wlAct1OperateDoorHash(doorMask, doorState, doorNum, action, speed, blocked) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_ACT1.MoveDoors hash matches oracle', () => {
    withReplay('phase6.wl_act1.MoveDoors', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: -32, max: 256 }),
          fc.integer({ min: 0, max: 32 }),
          fc.integer({ min: 0, max: 0xffffffff }),
          (doorMask, doorState, tics, speed, activeMask) => {
            expect(wlAct1MoveDoorsHash(doorMask, doorState, tics, speed, activeMask) >>> 0).toBe(
              oracle.wlAct1MoveDoorsHash(doorMask, doorState, tics, speed, activeMask) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_ACT1.PushWall hash matches oracle', () => {
    withReplay('phase6.wl_act1.PushWall', () => {
      fc.assert(
        fc.property(
          mapArb,
          fc.integer({ min: -16, max: 16 }),
          fc.integer({ min: -16, max: 16 }),
          fc.integer({ min: 0, max: 3 }),
          fc.integer({ min: -8, max: 16 }),
          ([mapLo, mapHi], pushX, pushY, dir, steps) => {
            expect(wlAct1PushWallHash(mapLo, mapHi, pushX, pushY, dir, steps) >>> 0).toBe(
              oracle.wlAct1PushWallHash(mapLo, mapHi, pushX, pushY, dir, steps) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_AGENT.GetBonus hash matches oracle', () => {
    withReplay('phase6.wl_agent.GetBonus', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100000, max: 1000000 }),
          fc.integer({ min: 0, max: 9 }),
          fc.integer({ min: -64, max: 164 }),
          fc.integer({ min: -64, max: 164 }),
          fc.integer({ min: 0, max: 0xf }),
          fc.integer({ min: 0, max: 7 }),
          fc.integer({ min: -1000, max: 1000 }),
          (score, lives, health, ammo, keys, bonusKind, value) => {
            expect(wlAgentGetBonusHash(score, lives, health, ammo, keys, bonusKind, value) >>> 0).toBe(
              oracle.wlAgentGetBonusHash(score, lives, health, ammo, keys, bonusKind, value) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_AGENT.GiveAmmo hash matches oracle', () => {
    withReplay('phase6.wl_agent.GiveAmmo', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -64, max: 200 }),
          fc.integer({ min: -10, max: 200 }),
          fc.integer({ min: -64, max: 128 }),
          fc.integer({ min: 0, max: 1 }),
          (ammo, maxAmmo, amount, weaponOwned) => {
            expect(wlAgentGiveAmmoHash(ammo, maxAmmo, amount, weaponOwned) >>> 0).toBe(
              oracle.wlAgentGiveAmmoHash(ammo, maxAmmo, amount, weaponOwned) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_AGENT.GivePoints hash matches oracle', () => {
    withReplay('phase6.wl_agent.GivePoints', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 2_000_000 }),
          fc.integer({ min: 0, max: 9 }),
          fc.integer({ min: -1, max: 200000 }),
          fc.integer({ min: -50000, max: 200000 }),
          (score, lives, nextExtra, points) => {
            expect(wlAgentGivePointsHash(score, lives, nextExtra, points) >>> 0).toBe(
              oracle.wlAgentGivePointsHash(score, lives, nextExtra, points) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_AGENT.HealSelf hash matches oracle', () => {
    withReplay('phase6.wl_agent.HealSelf', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 200 }),
          fc.integer({ min: -100, max: 200 }),
          fc.integer({ min: -100, max: 200 }),
          (health, maxHealth, amount) => {
            expect(wlAgentHealSelfHash(health, maxHealth, amount) >>> 0).toBe(
              oracle.wlAgentHealSelfHash(health, maxHealth, amount) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_AGENT.TakeDamage hash matches oracle', () => {
    withReplay('phase6.wl_agent.TakeDamage', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 200 }),
          fc.integer({ min: 0, max: 9 }),
          fc.integer({ min: -50, max: 200 }),
          fc.integer({ min: 0, max: 1 }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          (health, lives, damage, godMode, rng) => {
            expect(wlAgentTakeDamageHash(health, lives, damage, godMode, rng) >>> 0).toBe(
              oracle.wlAgentTakeDamageHash(health, lives, damage, godMode, rng) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_GAME.GameLoop hash matches oracle', () => {
    withReplay('phase6.wl_game.GameLoop', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: -64, max: 512 }),
          fc.integer({ min: 0, max: 0xffff }),
          fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 0, max: 0xffffffff }),
          (stateHash, tics, inputMask, rng, doorHash, playerHash, actorHash) => {
            expect(wlGameGameLoopHash(stateHash, tics, inputMask, rng, doorHash, playerHash, actorHash) >>> 0).toBe(
              oracle.wlGameGameLoopHash(stateHash, tics, inputMask, rng, doorHash, playerHash, actorHash) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_INTER.CheckHighScore hash matches oracle', () => {
    withReplay('phase6.wl_inter.CheckHighScore', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 2_000_000 }),
          fc.integer({ min: 0, max: 2_000_000 }),
          fc.integer({ min: 0, max: 2_000_000 }),
          fc.integer({ min: 0, max: 2_000_000 }),
          fc.integer({ min: 0, max: 2_000_000 }),
          fc.integer({ min: 0, max: 2_000_000 }),
          (newScore, s0, s1, s2, s3, s4) => {
            expect(wlInterCheckHighScoreHash(newScore, s0, s1, s2, s3, s4) >>> 0).toBe(
              oracle.wlInterCheckHighScoreHash(newScore, s0, s1, s2, s3, s4) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_INTER.LevelCompleted hash matches oracle', () => {
    withReplay('phase6.wl_inter.LevelCompleted', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 2_000_000 }),
          fc.integer({ min: 0, max: 9999 }),
          fc.integer({ min: 0, max: 9999 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 9 }),
          (score, timeSec, parSec, killsFound, killsTotal, secretsFound, secretsTotal, treasureFound, treasureTotal, lives) => {
            expect(
              wlInterLevelCompletedHash(
                score,
                timeSec,
                parSec,
                killsFound,
                killsTotal,
                secretsFound,
                secretsTotal,
                treasureFound,
                treasureTotal,
                lives,
              ) >>> 0,
            ).toBe(
              oracle.wlInterLevelCompletedHash(
                score,
                timeSec,
                parSec,
                killsFound,
                killsTotal,
                secretsFound,
                secretsTotal,
                treasureFound,
                treasureTotal,
                lives,
              ) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_INTER.Victory hash matches oracle', () => {
    withReplay('phase6.wl_inter.Victory', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10_000_000 }),
          fc.integer({ min: 0, max: 50_000 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 2 }),
          fc.integer({ min: 0, max: 3 }),
          (totalScore, totalTime, totalKills, totalSecrets, totalTreasures, episode, difficulty) => {
            expect(wlInterVictoryHash(totalScore, totalTime, totalKills, totalSecrets, totalTreasures, episode, difficulty) >>> 0).toBe(
              oracle.wlInterVictoryHash(totalScore, totalTime, totalKills, totalSecrets, totalTreasures, episode, difficulty) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });
});

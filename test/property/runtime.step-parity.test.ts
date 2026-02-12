import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { withReplay } from './replay';
import { getNumRuns, getSeed } from './config';
import { WolfsrcOraclePort } from '../../src/oracle/runtimeOracle';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import type { RuntimeConfig, RuntimeInput } from '../../src/runtime/contracts';
import {
  assertRuntimeTraceParity,
  captureRuntimeTrace,
  RuntimeParityError,
  type RuntimeParityScenario,
} from '../../src/runtime/parityHarness';
import { persistRuntimeRepro } from './runtimeRepro';

function makeMapBits(seed: number): { lo: number; hi: number } {
  let lo = 0;
  let hi = 0;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const border = x === 0 || y === 0 || x === 7 || y === 7;
      const randomWall = ((seed >>> ((x + y) & 31)) & 1) === 1 && x > 1 && y > 1 && x < 6 && y < 6;
      if (!(border || randomWall)) continue;
      const bit = y * 8 + x;
      if (bit < 32) lo |= 1 << bit;
      else hi |= 1 << (bit - 32);
    }
  }
  return { lo: lo >>> 0, hi: hi >>> 0 };
}

describe('runtime step parity', () => {
  let oracle: WolfsrcOraclePort;
  let tsRuntime: TsRuntimePort;

  beforeAll(async () => {
    oracle = new WolfsrcOraclePort();
    tsRuntime = new TsRuntimePort();
  });

  afterAll(async () => {
    await oracle.shutdown();
    await tsRuntime.shutdown();
  });

  function buildScenario(
    mapSeed: number,
    startXQ8: number,
    startYQ8: number,
    startAngleDeg: number,
    startHealth: number,
    startAmmo: number,
    steps: RuntimeInput[],
  ): RuntimeParityScenario {
    const map = makeMapBits(mapSeed >>> 0);
    return {
      id: `seed-${mapSeed >>> 0}`,
      config: {
        mapLo: map.lo,
        mapHi: map.hi,
        startXQ8,
        startYQ8,
        startAngleDeg,
        startHealth,
        startAmmo,
      },
      steps,
    };
  }

  async function captureParityOrPersist(suite: string, scenario: RuntimeParityScenario): Promise<void> {
    let oracleTrace;
    let tsTrace;
    try {
      oracleTrace = await captureRuntimeTrace(oracle, scenario);
      tsTrace = await captureRuntimeTrace(tsRuntime, scenario);
      assertRuntimeTraceParity(scenario, oracleTrace, tsTrace);
    } catch (error) {
      const jsonError =
        error instanceof RuntimeParityError
          ? error.toJSON()
          : {
              error: error instanceof Error ? error.message : String(error),
            };
      persistRuntimeRepro({
        suite,
        timestamp: new Date().toISOString(),
        scenario,
        oracleTrace,
        tsTrace,
        error: jsonError,
      });
      throw error;
    }
  }

  it('step/replay parity matches between oracle and ts runtime', async () => {
    await withReplay('runtime.step-parity.sequence', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 256, max: 6 * 256 }),
          fc.integer({ min: 256, max: 6 * 256 }),
          fc.integer({ min: -720, max: 720 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 99 }),
          fc.array(
            fc.record({
              inputMask: fc.integer({ min: 0, max: 0xff }),
              tics: fc.integer({ min: 0, max: 8 }),
              rng: fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
            }),
            { minLength: 1, maxLength: 25 },
          ),
          async (mapSeed, startXQ8, startYQ8, startAngleDeg, startHealth, startAmmo, steps) => {
            const scenario = buildScenario(mapSeed, startXQ8, startYQ8, startAngleDeg, startHealth, startAmmo, steps);
            await captureParityOrPersist('runtime.step-parity.sequence', scenario);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('serialize/deserialize parity preserves state', async () => {
    await withReplay('runtime.step-parity.serialize', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 0xffffffff }),
          fc.integer({ min: 256, max: 6 * 256 }),
          fc.integer({ min: 256, max: 6 * 256 }),
          fc.integer({ min: -720, max: 720 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 99 }),
          fc.array(
            fc.record({
              inputMask: fc.integer({ min: 0, max: 0xff }),
              tics: fc.integer({ min: 0, max: 8 }),
              rng: fc.integer({ min: -0x7fffffff, max: 0x7fffffff }),
            }),
            { minLength: 3, maxLength: 20 },
          ),
          async (mapSeed, startXQ8, startYQ8, startAngleDeg, startHealth, startAmmo, steps) => {
            const scenario = buildScenario(mapSeed, startXQ8, startYQ8, startAngleDeg, startHealth, startAmmo, steps);
            const config: RuntimeConfig = scenario.config;

            await oracle.init(config);
            await tsRuntime.init(config);

            for (const stepInput of scenario.steps) {
              oracle.step(stepInput);
              tsRuntime.step(stepInput);
            }

            const oracleBlob = oracle.serialize();
            const tsBlob = tsRuntime.serialize();

            await oracle.init(config);
            await tsRuntime.init(config);

            oracle.deserialize(oracleBlob);
            tsRuntime.deserialize(tsBlob);

            const oracleSnap = oracle.snapshot();
            const tsSnap = tsRuntime.snapshot();
            expect(tsSnap.hash >>> 0).toBe(oracleSnap.hash >>> 0);
            expect(tsSnap.tick | 0).toBe(oracleSnap.tick | 0);
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('oracle runtime trace symbols are deterministic for identical scenarios', async () => {
    const config: RuntimeConfig = {
      mapLo: 0xff818181,
      mapHi: 0x818181ff,
      startXQ8: 3 * 256,
      startYQ8: 4 * 256,
      startAngleDeg: 90,
      startHealth: 75,
      startAmmo: 12,
    };

    const runTrace = async (): Promise<number[]> => {
      await oracle.init(config);
      oracle.resetTrace();
      await oracle.init(config);
      oracle.reset();
      oracle.snapshot();
      oracle.step({ inputMask: 0xbf, tics: 4, rng: 0x12345678 });
      oracle.renderHash(320, 200);
      return oracle.traceSymbolIds();
    };

    const a = await runTrace();
    const b = await runTrace();

    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
    expect(a.includes(1)).toBe(true); // oracle_runtime_init
    expect(a.includes(2)).toBe(true); // oracle_runtime_reset
    expect(a.includes(3)).toBe(true); // oracle_runtime_step
    expect(a.includes(17)).toBe(true); // real WL_AGENT.ClipMove
    expect(a.includes(18)).toBe(true); // real WL_AGENT.TryMove
    expect(a.includes(19)).toBe(true); // real WL_AGENT.ControlMovement
    expect(a.includes(21)).toBe(true); // real WL_DRAW.WallRefresh
    expect(a.includes(22)).toBe(true); // real WL_DRAW.ThreeDRefresh
    expect(a.includes(23)).toBe(true); // real WL_STATE.CheckLine
    expect(a.includes(24)).toBe(true); // real WL_STATE.CheckSight
    expect(a.includes(25)).toBe(true); // real WL_STATE.MoveObj
    expect(a.includes(26)).toBe(true); // real WL_STATE.SelectChaseDir
    expect(a.includes(27)).toBe(true); // WL_PLAY.PlayLoop
    expect(a.includes(28)).toBe(true); // WL_GAME.GameLoop
    expect(a.includes(29)).toBe(true); // WL_INTER.CheckHighScore
    expect(a.includes(30)).toBe(true); // WL_STATE.FirstSighting
    expect(a.includes(31)).toBe(true); // WL_STATE.SightPlayer
    expect(a.includes(32)).toBe(true); // WL_ACT2.T_Chase
    expect(a.includes(33)).toBe(true); // WL_ACT2.T_Path
    expect(a.includes(34)).toBe(true); // WL_ACT2.T_Shoot
    expect(a.includes(35)).toBe(true); // WL_ACT2.T_Bite
    expect(a.includes(36)).toBe(true); // WL_ACT2.T_DogChase
    expect(a.includes(37)).toBe(true); // WL_ACT2.T_Projectile
    expect(a.includes(38)).toBe(true); // WL_ACT1.OpenDoor
    expect(a.includes(39)).toBe(true); // WL_ACT1.CloseDoor
    expect(a.includes(40)).toBe(true); // WL_ACT1.OperateDoor
    expect(a.includes(41)).toBe(true); // WL_ACT1.MoveDoors
    expect(a.includes(42)).toBe(true); // WL_AGENT.GetBonus
    expect(a.includes(43)).toBe(true); // WL_AGENT.GiveAmmo
    expect(a.includes(44)).toBe(true); // WL_AGENT.GivePoints
    expect(a.includes(45)).toBe(true); // WL_AGENT.HealSelf
    expect(a.includes(46)).toBe(true); // WL_AGENT.Cmd_Fire
    expect(a.includes(47)).toBe(true); // WL_AGENT.Cmd_Use
    expect(a.includes(48)).toBe(true); // WL_AGENT.T_Player
    expect(a.includes(49)).toBe(true); // WL_AGENT.Thrust
    expect(a.includes(50)).toBe(true); // WL_ACT1.SpawnDoor
    expect(a.includes(51)).toBe(true); // WL_ACT1.PushWall
    expect(a.includes(52)).toBe(true); // WL_AGENT.TakeDamage
    expect(a.includes(53)).toBe(true); // WL_INTER.LevelCompleted
    expect(a.includes(54)).toBe(true); // WL_INTER.Victory
    expect(a.includes(55)).toBe(true); // WL_GAME.SetSoundLoc
    expect(a.includes(56)).toBe(true); // WL_GAME.UpdateSoundLoc
    expect(a.includes(57)).toBe(true); // WL_GAME.PlaySoundLocGlobal
    expect(a.includes(58)).toBe(true); // ID_IN.IN_ReadControl
    expect(a.includes(59)).toBe(true); // ID_IN.IN_UserInput
    expect(a.includes(60)).toBe(true); // ID_SD.SD_SetSoundMode
    expect(a.includes(61)).toBe(true); // ID_SD.SD_SetMusicMode
    expect(a.includes(62)).toBe(true); // ID_SD.SD_PlaySound
    expect(a.includes(63)).toBe(true); // ID_SD.SD_StopSound
    expect(a.includes(64)).toBe(true); // ID_CA.CAL_SetupAudioFile
    expect(a.includes(65)).toBe(true); // ID_CA.CA_CacheAudioChunk
    expect(a.includes(66)).toBe(true); // ID_US_1.US_Print
    expect(a.includes(67)).toBe(true); // ID_US_1.US_CPrint
    expect(a.includes(68)).toBe(true); // ID_US_1.US_DrawWindow
    expect(a.includes(69)).toBe(true); // WL_MENU.US_ControlPanel
    expect(a.includes(70)).toBe(true); // WL_MENU.DrawMainMenu
    expect(a.includes(71)).toBe(true); // WL_MENU.DrawMenu
    expect(a.includes(72)).toBe(true); // WL_MENU.CP_NewGame
    expect(a.includes(73)).toBe(true); // WL_MENU.CP_ViewScores
    expect(a.includes(74)).toBe(true); // WL_MENU.CP_Sound
    expect(a.includes(75)).toBe(true); // WL_MENU.CP_Control
    expect(a.includes(76)).toBe(true); // WL_MENU.Message
    expect(a.includes(77)).toBe(true); // WL_TEXT.HelpScreens
    expect(a.includes(78)).toBe(true); // WL_TEXT.EndText
    expect(a.includes(79)).toBe(true); // WL_DRAW.FixedByFrac
    expect(a.includes(80)).toBe(true); // WL_MAIN.BuildTables
    expect(a.includes(81)).toBe(true); // WL_MAIN.CalcProjection
    expect(a.includes(82)).toBe(true); // WL_DRAW.TransformActor
    expect(a.includes(83)).toBe(true); // WL_DRAW.TransformTile
    expect(a.includes(84)).toBe(true); // WL_DRAW.CalcHeight
    expect(a.includes(85)).toBe(true); // WL_DRAW.HitVertWall
    expect(a.includes(86)).toBe(true); // WL_DRAW.HitHorizWall
    expect(a.includes(87)).toBe(true); // WL_SCALE.SetupScaling
    expect(a.includes(88)).toBe(true); // WL_SCALE.ScaleShape
    expect(a.includes(89)).toBe(true); // WL_SCALE.SimpleScaleShape
    expect(a.includes(90)).toBe(true); // WL_GAME.DrawPlayScreen
    expect(a.includes(91)).toBe(true); // WL_STATE.SelectDodgeDir
    expect(a.includes(92)).toBe(true); // WL_STATE.DamageActor
    expect(a.includes(93)).toBe(true); // WL_AGENT.TryMove
    expect(a.includes(94)).toBe(true); // WL_AGENT.ClipMove
    expect(a.includes(95)).toBe(true); // WL_AGENT.ControlMovement
    expect(a.includes(96)).toBe(true); // ID_CA.CarmackExpand
    expect(a.includes(97)).toBe(true); // ID_CA.RLEWExpand
    expect(a.includes(98)).toBe(true); // ID_CA.SetupMapFile
    expect(a.includes(99)).toBe(true); // ID_CA.CacheMap
    expect(a.includes(100)).toBe(true); // WL_GAME.SetupGameLevel
    expect(a.includes(101)).toBe(true); // ID_MM.MM_GetPtr
    expect(a.includes(102)).toBe(true); // ID_MM.MM_FreePtr
    expect(a.includes(103)).toBe(true); // ID_MM.MM_SetPurge
    expect(a.includes(104)).toBe(true); // ID_MM.MM_SetLock
    expect(a.includes(105)).toBe(true); // ID_MM.MM_SortMem
    expect(a.includes(106)).toBe(true); // ID_PM.PM_CheckMainMem
    expect(a.includes(107)).toBe(true); // ID_PM.PM_GetPageAddress
    expect(a.includes(108)).toBe(true); // ID_PM.PM_GetPage
    expect(a.includes(109)).toBe(true); // ID_PM.PM_NextFrame
    expect(a.includes(110)).toBe(true); // ID_PM.PM_Reset
  });

  it('oracle runtime is self-consistent across deterministic scenarios', async () => {
    const scenarios: RuntimeParityScenario[] = [
      buildScenario(0x1234abcd, 2 * 256, 2 * 256, 90, 80, 12, [
        { inputMask: 0xbf, tics: 4, rng: 0x12345678 },
        { inputMask: 0x33, tics: 2, rng: 0x87654321 },
        { inputMask: 0xa5, tics: 5, rng: 0x13579bdf },
      ]),
      buildScenario(0xfeedface, 4 * 256, 3 * 256, -45, 65, 20, [
        { inputMask: 0x41, tics: 6, rng: -12345 },
        { inputMask: 0x9d, tics: 1, rng: 0x0badf00d },
        { inputMask: 0x07, tics: 8, rng: 0x11223344 },
      ]),
    ];

    for (const scenario of scenarios) {
      const a = await captureRuntimeTrace(oracle, scenario);
      const b = await captureRuntimeTrace(oracle, scenario);
      assertRuntimeTraceParity(scenario, a, b);
      expect(a.traceHash >>> 0).toBe(b.traceHash >>> 0);
    }
  });

  it('ts runtime is self-consistent across deterministic scenarios', async () => {
    const scenarios: RuntimeParityScenario[] = [
      buildScenario(0x27182818, 2 * 256, 5 * 256, 180, 90, 8, [
        { inputMask: 0xc0, tics: 2, rng: 3333 },
        { inputMask: 0x12, tics: 7, rng: 4444 },
        { inputMask: 0xee, tics: 3, rng: 5555 },
      ]),
      buildScenario(0x31415926, 5 * 256, 2 * 256, 270, 50, 15, [
        { inputMask: 0x44, tics: 5, rng: 0x55aa55aa },
        { inputMask: 0x18, tics: 4, rng: -999999 },
        { inputMask: 0x80, tics: 2, rng: 0x7fffffff },
      ]),
    ];

    for (const scenario of scenarios) {
      const a = await captureRuntimeTrace(tsRuntime, scenario);
      const b = await captureRuntimeTrace(tsRuntime, scenario);
      assertRuntimeTraceParity(scenario, a, b);
      expect(a.traceHash >>> 0).toBe(b.traceHash >>> 0);
    }
  });
});

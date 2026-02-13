import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { WolfsrcOraclePort } from '../../src/oracle/runtimeOracle';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import { buildWl6RuntimeScenariosFromBytes } from '../../src/runtime/wl6LevelData';
import { wlGameSetupGameLevelHash } from '../../src/wolf/map/wlMap';
import { getOracleBridge, type OracleBridge } from '../../src/oracle/bridge';
import type { RuntimeConfig } from '../../src/runtime/contracts';
import { getNumRuns, getSeed } from './config';
import { withReplay } from './replay';

describe('runtime level-load parity', () => {
  let oracle: WolfsrcOraclePort;
  let tsRuntime: TsRuntimePort;
  let symbolOracle: OracleBridge;
  let scenarios = buildWl6RuntimeScenariosFromBytes(new Uint8Array(0), new Uint8Array(0), 1);

  beforeAll(async () => {
    oracle = new WolfsrcOraclePort();
    tsRuntime = new TsRuntimePort();
    symbolOracle = await getOracleBridge();

  const wl6MapHead = join(process.cwd(), 'assets', 'wl6', 'raw', 'MAPHEAD.WL6');
  const wl6GameMaps = join(process.cwd(), 'assets', 'wl6', 'raw', 'GAMEMAPS.WL6');
  const maphead = new Uint8Array(readFileSync(wl6MapHead));
  const gamemaps = new Uint8Array(readFileSync(wl6GameMaps));
  scenarios = buildWl6RuntimeScenariosFromBytes(maphead, gamemaps, 2, 'WL6');
  });

  afterAll(async () => {
    await oracle.shutdown();
    await tsRuntime.shutdown();
  });

  it('WL_GAME.SetupGameLevel parity holds on representative runtime maps', () => {
    const representative = [0, 1, 4, 7, 8, 9];
    for (const mapIndex of representative) {
      const scenario = scenarios.find((entry) => entry.mapIndex === mapIndex);
      expect(scenario).toBeDefined();
      const plane0 = scenario!.config.plane0 ?? new Uint16Array(0);
      const mapWidth = scenario!.config.mapWidth ?? 0;
      const mapHeight = scenario!.config.mapHeight ?? 0;

      expect(wlGameSetupGameLevelHash(plane0, mapWidth, mapHeight) >>> 0).toBe(
        symbolOracle.wlGameSetupGameLevelHash(plane0, mapWidth, mapHeight) >>> 0,
      );
    }
  });

  it('boot/reset parity remains deterministic across real level configs', async () => {
    await withReplay('runtime.level-load.boot-reset', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: Math.max(0, scenarios.length - 1) }),
          async (index) => {
            const scenario = scenarios[index]!;
            const config: RuntimeConfig = {
              ...scenario.config,
              enableFullMapRuntime: false,
            };

            await oracle.bootWl6(config);
            await tsRuntime.bootWl6(config);
            expect(tsRuntime.snapshot()).toEqual(oracle.snapshot());

            oracle.reset();
            tsRuntime.reset();
            expect(tsRuntime.snapshot()).toEqual(oracle.snapshot());
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });
});

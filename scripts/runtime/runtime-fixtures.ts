import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildWl1RuntimeScenariosFromBytes, type Wl1RuntimeScenarioData } from '../../src/runtime/wl1LevelData';

export type RuntimeFixtureScenario = Wl1RuntimeScenarioData;

export async function loadWl1RuntimeScenarios(rootDir: string, stepsPerScenario = 64): Promise<RuntimeFixtureScenario[]> {
  const assetsDir = path.join(rootDir, 'assets', 'wl1');
  const mapheadBytes = new Uint8Array(await readFile(path.join(assetsDir, 'MAPHEAD.WL1')));
  const gamemapsBytes = new Uint8Array(await readFile(path.join(assetsDir, 'GAMEMAPS.WL1')));
  return buildWl1RuntimeScenariosFromBytes(mapheadBytes, gamemapsBytes, stepsPerScenario);
}

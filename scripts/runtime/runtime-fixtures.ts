import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { buildWl1RuntimeScenariosFromBytes, type Wl1RuntimeScenarioData } from '../../src/runtime/wl1LevelData';

export type RuntimeFixtureScenario = Wl1RuntimeScenarioData;

export async function loadWl1RuntimeScenarios(rootDir: string, stepsPerScenario = 64): Promise<RuntimeFixtureScenario[]> {
  const wl6Dir = path.join(rootDir, 'assets', 'wl6', 'raw');
  const wl1Dir = path.join(rootDir, 'assets', 'wl1');

  if (
    existsSync(path.join(wl6Dir, 'MAPHEAD.WL6'))
    && existsSync(path.join(wl6Dir, 'GAMEMAPS.WL6'))
  ) {
    const mapheadBytes = new Uint8Array(await readFile(path.join(wl6Dir, 'MAPHEAD.WL6')));
    const gamemapsBytes = new Uint8Array(await readFile(path.join(wl6Dir, 'GAMEMAPS.WL6')));
    return buildWl1RuntimeScenariosFromBytes(mapheadBytes, gamemapsBytes, stepsPerScenario, 'WL6');
  }

  const mapheadBytes = new Uint8Array(await readFile(path.join(wl1Dir, 'MAPHEAD.WL1')));
  const gamemapsBytes = new Uint8Array(await readFile(path.join(wl1Dir, 'GAMEMAPS.WL1')));
  return buildWl1RuntimeScenariosFromBytes(mapheadBytes, gamemapsBytes, stepsPerScenario, 'WL1');
}

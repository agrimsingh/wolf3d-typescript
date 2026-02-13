import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildRuntimeScenariosFromBytes,
  type RuntimeScenarioData,
} from '../../src/runtime/wl1LevelData';

export type RuntimeFixtureScenario = RuntimeScenarioData;

export async function loadWl1RuntimeScenarios(rootDir: string, stepsPerScenario = 64): Promise<RuntimeFixtureScenario[]> {
  const wl6Dir = path.join(rootDir, 'assets', 'wl6', 'raw');
  const mapheadBytes = new Uint8Array(await readFile(path.join(wl6Dir, 'MAPHEAD.WL6')));
  const gamemapsBytes = new Uint8Array(await readFile(path.join(wl6Dir, 'GAMEMAPS.WL6')));
  return buildRuntimeScenariosFromBytes(mapheadBytes, gamemapsBytes, stepsPerScenario, 'WL6');
}

export async function loadRuntimeScenarios(rootDir: string, stepsPerScenario = 64): Promise<RuntimeFixtureScenario[]> {
  return loadWl1RuntimeScenarios(rootDir, stepsPerScenario);
}

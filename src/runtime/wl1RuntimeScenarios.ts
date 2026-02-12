import { buildWl1RuntimeScenariosFromBytes, type Wl1RuntimeScenarioData } from './wl1LevelData';

export type Wl1RuntimeScenario = Wl1RuntimeScenarioData;

async function fetchBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

export async function loadWl1RuntimeScenarios(baseUrl = '/assets/wl1', stepsPerScenario = 64): Promise<Wl1RuntimeScenario[]> {
  const mapheadBytes = await fetchBytes(`${baseUrl}/MAPHEAD.WL1`);
  const gamemapsBytes = await fetchBytes(`${baseUrl}/GAMEMAPS.WL1`);
  return buildWl1RuntimeScenariosFromBytes(mapheadBytes, gamemapsBytes, stepsPerScenario);
}

import { buildRuntimeScenariosFromBytes, buildWl1RuntimeScenariosFromBytes, type RuntimeScenarioData } from './wl1LevelData';

export type Wl1RuntimeScenario = RuntimeScenarioData;
export type RuntimeScenario = RuntimeScenarioData;
export type WolfDataVariant = 'WL6';

export type RuntimeScenarios = RuntimeScenario[];

async function fetchBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

export async function loadWl1RuntimeScenarios(
  baseUrl = '/assets/wl6/raw',
  stepsPerScenario = 64,
  variant: WolfDataVariant = 'WL6',
): Promise<Wl1RuntimeScenario[]> {
  const mapheadBytes = await fetchBytes(`${baseUrl}/MAPHEAD.${variant}`);
  const gamemapsBytes = await fetchBytes(`${baseUrl}/GAMEMAPS.${variant}`);
  return buildRuntimeScenariosFromBytes(mapheadBytes, gamemapsBytes, stepsPerScenario, variant);
}

export async function loadRuntimeScenarios(
  baseUrl = '/assets/wl6/raw',
  stepsPerScenario = 64,
  variant: WolfDataVariant = 'WL6',
): Promise<RuntimeScenario[]> {
  const scenarios = await loadWl1RuntimeScenarios(baseUrl, stepsPerScenario, variant);
  return scenarios;
}

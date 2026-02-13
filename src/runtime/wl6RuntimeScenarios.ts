import { buildWl6RuntimeScenariosFromBytes, type RuntimeScenarioData } from './wl6LevelData';

export type Wl6RuntimeScenario = RuntimeScenarioData;
export type RuntimeScenario = RuntimeScenarioData;
export type WolfDataVariant = 'WL6';
export type RuntimeScenarios = RuntimeScenario[];

interface FetchBytes {
  (url: string): Promise<Uint8Array>;
}

const fetchBytes: FetchBytes = async (url: string): Promise<Uint8Array> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return new Uint8Array(await response.arrayBuffer());
};

export async function loadWl6RuntimeScenarios(
  baseUrl = '/assets/wl6/raw',
  stepsPerScenario = 64,
  variant: WolfDataVariant = 'WL6',
): Promise<Wl6RuntimeScenario[]> {
  const mapheadBytes = await fetchBytes(`${baseUrl}/MAPHEAD.${variant}`);
  const gamemapsBytes = await fetchBytes(`${baseUrl}/GAMEMAPS.${variant}`);
  return buildWl6RuntimeScenariosFromBytes(mapheadBytes, gamemapsBytes, stepsPerScenario, variant);
}

export async function loadRuntimeScenarios(
  baseUrl = '/assets/wl6/raw',
  stepsPerScenario = 64,
  variant: WolfDataVariant = 'WL6',
): Promise<RuntimeScenario[]> {
  return loadWl6RuntimeScenarios(baseUrl, stepsPerScenario, variant);
}

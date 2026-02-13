import { buildRuntimeScenariosFromBytes as buildRuntimeScenariosFromBytesLegacy, type RuntimeScenarioData as LegacyRuntimeScenarioData } from './wl1LevelData';
import { buildWl1RuntimeScenariosFromBytes as buildWl1RuntimeScenariosFromBytesLegacy } from './wl1LevelData';

export type Wl6RuntimeScenarioData = LegacyRuntimeScenarioData;
export type RuntimeScenarioData = Wl6RuntimeScenarioData;

export function buildWl6RuntimeScenariosFromBytes(
  mapheadBytes: Uint8Array,
  gamemapsBytes: Uint8Array,
  stepsPerScenario = 64,
  variant: 'WL6' = 'WL6',
): RuntimeScenarioData[] {
  return buildWl1RuntimeScenariosFromBytesLegacy(mapheadBytes, gamemapsBytes, stepsPerScenario, variant);
}

export { buildRuntimeScenariosFromBytesLegacy as buildRuntimeScenariosFromBytes };

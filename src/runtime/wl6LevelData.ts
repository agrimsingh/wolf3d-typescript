import {
  buildRuntimeScenariosFromBytes as buildRuntimeScenariosFromBytes,
  buildWl6RuntimeScenariosFromBytes as buildWl6RuntimeScenariosFromBytesLegacy,
  type RuntimeScenarioData as LegacyRuntimeScenarioData,
} from './wl1LevelData';

export type Wl6RuntimeScenarioData = LegacyRuntimeScenarioData;
export type RuntimeScenarioData = Wl6RuntimeScenarioData;

export function buildWl6RuntimeScenariosFromBytes(
  mapheadBytes: Uint8Array,
  gamemapsBytes: Uint8Array,
  stepsPerScenario = 64,
  variant: 'WL6' = 'WL6',
): RuntimeScenarioData[] {
  return buildWl6RuntimeScenariosFromBytesLegacy(mapheadBytes, gamemapsBytes, stepsPerScenario, variant);
}

export { buildRuntimeScenariosFromBytes };
export { buildWl1RuntimeScenariosFromBytes } from './wl1LevelData';

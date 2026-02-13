import { loadRuntimeScenarios as loadWl6RuntimeScenarios, type RuntimeScenario as CampaignRuntimeScenario } from './wl6Campaign';

export type RuntimeScenario = CampaignRuntimeScenario;
export type Wl6RuntimeScenario = CampaignRuntimeScenario;
export type Wl1RuntimeScenario = CampaignRuntimeScenario;
export type WolfDataVariant = 'WL6';
export type RuntimeScenarios = CampaignRuntimeScenario[];

export const loadWl6RuntimeScenariosAlias = loadWl6RuntimeScenarios;
export const loadWl1RuntimeScenarios = loadWl6RuntimeScenariosAlias;

export async function loadRuntimeScenarios(
  baseUrl = '/assets/wl6/raw',
  stepsPerScenario = 64,
  variant: WolfDataVariant = 'WL6',
): Promise<CampaignRuntimeScenario[]> {
  return loadWl6RuntimeScenarios(baseUrl, stepsPerScenario, variant);
}

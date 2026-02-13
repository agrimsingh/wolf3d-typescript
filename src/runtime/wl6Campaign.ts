import {
  type RuntimeScenario,
  loadRuntimeScenarios,
  loadWl6RuntimeScenarios,
  type WolfDataVariant,
} from './wl6RuntimeScenarios';

export interface CampaignLoadOptions {
  baseUrl?: string;
  stepsPerScenario?: number;
  variant?: WolfDataVariant;
}

export type { RuntimeScenario };
export type { WolfDataVariant };

export async function loadWl6Campaign(options: CampaignLoadOptions = {}) {
  const {
    baseUrl = '/assets/wl6/raw',
    stepsPerScenario = 64,
    variant = 'WL6',
  } = options;

  return loadWl6RuntimeScenarios(baseUrl, stepsPerScenario, variant);
}

export { loadRuntimeScenarios, loadWl6RuntimeScenarios };

export const loadRuntimeCampaign = loadWl6Campaign;

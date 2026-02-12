import { loadWl1RuntimeScenarios, type WolfDataVariant } from './wl1RuntimeScenarios';

export interface CampaignLoadOptions {
  baseUrl?: string;
  stepsPerScenario?: number;
  variant?: WolfDataVariant;
}

export async function loadWl1Campaign(options: CampaignLoadOptions = {}) {
  const {
    baseUrl = '/assets/wl1',
    stepsPerScenario = 64,
    variant = 'WL1',
  } = options;

  return loadWl1RuntimeScenarios(baseUrl, stepsPerScenario, variant);
}

import { loadWl6Campaign, loadRuntimeScenarios as loadWl6RuntimeScenarios, type WolfDataVariant } from './wl6Campaign';

export interface CampaignLoadOptions {
  baseUrl?: string;
  stepsPerScenario?: number;
  variant?: WolfDataVariant;
}

export async function loadWl1Campaign(options: CampaignLoadOptions = {}) {
  const {
    baseUrl = '/assets/wl6/raw',
    stepsPerScenario = 64,
    variant = 'WL6',
  } = options;

  return loadWl6Campaign({
    baseUrl,
    stepsPerScenario,
    variant,
  });
}

export async function loadRuntimeCampaign(options: CampaignLoadOptions = {}) {
  const {
    baseUrl = '/assets/wl6/raw',
    stepsPerScenario = 64,
    variant = 'WL6',
  } = options;

  return loadWl6RuntimeScenarios(baseUrl, stepsPerScenario, variant);
}

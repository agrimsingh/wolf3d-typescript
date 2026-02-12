import { loadWl1RuntimeScenarios } from './wl1RuntimeScenarios';

export async function loadWl1Campaign(baseUrl = '/assets/wl1', stepsPerScenario = 64) {
  return loadWl1RuntimeScenarios(baseUrl, stepsPerScenario);
}

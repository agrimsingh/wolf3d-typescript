import { loadRuntimeScenarios as loadWl6RuntimeScenarios, type RuntimeScenario } from './wl6Campaign';

export type { RuntimeScenario };
export type Wl1RuntimeScenario = RuntimeScenario;
export type WolfDataVariant = 'WL6';
export type RuntimeScenarios = RuntimeScenario[];

export const loadWl1RuntimeScenarios = loadWl6RuntimeScenarios;

export async function loadRuntimeScenarios(
  baseUrl = '/assets/wl6/raw',
  stepsPerScenario = 64,
  variant: WolfDataVariant = 'WL6',
): Promise<RuntimeScenario[]> {
  return loadWl6RuntimeScenarios(baseUrl, stepsPerScenario, variant);
}

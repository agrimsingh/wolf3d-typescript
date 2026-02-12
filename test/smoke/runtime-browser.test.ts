import { afterEach, describe, expect, it } from 'vitest';
import { RuntimeAppController } from '../../src/app/runtimeController';
import { NullRuntimeAudioAdapter } from '../../src/app/runtimeAudio';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import type { Wl1RuntimeScenario } from '../../src/runtime/wl1RuntimeScenarios';

function makeBorderMapBits(): { mapLo: number; mapHi: number } {
  let mapLo = 0;
  let mapHi = 0;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const border = x === 0 || y === 0 || x === 7 || y === 7;
      const wall = border || (x === 4 && y > 1 && y < 6);
      if (!wall) continue;
      const bit = y * 8 + x;
      if (bit < 32) mapLo |= 1 << bit;
      else mapHi |= 1 << (bit - 32);
    }
  }
  return { mapLo: mapLo >>> 0, mapHi: mapHi >>> 0 };
}

function makeScenario(mapIndex: number): Wl1RuntimeScenario {
  const bits = makeBorderMapBits();
  return {
    id: `smoke-map-${mapIndex}`,
    mapIndex,
    mapName: `Smoke ${mapIndex}`,
    seed: (0x12340000 + mapIndex) >>> 0,
    config: {
      mapLo: bits.mapLo,
      mapHi: bits.mapHi,
      startXQ8: 2 * 256 + 128,
      startYQ8: 2 * 256 + 128,
      startAngleDeg: 90,
      startHealth: 100,
      startAmmo: 12,
    },
    steps: [],
  };
}

async function waitUntil(predicate: () => boolean, timeoutMs = 2000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error(`Timed out after ${timeoutMs}ms`);
}

describe('runtime browser smoke', () => {
  const controllers: RuntimeAppController[] = [];

  afterEach(async () => {
    while (controllers.length > 0) {
      const controller = controllers.pop()!;
      await controller.shutdown();
    }
  });

  it('boots to menu with decoded scenarios', async () => {
    const controller = new RuntimeAppController({
      runtime: new TsRuntimePort(),
      audio: new NullRuntimeAudioAdapter(),
      scenarioLoader: async () => [makeScenario(0), makeScenario(1)],
    });
    controllers.push(controller);

    await controller.boot();
    const state = controller.getState();
    expect(state.mode).toBe('menu');
    expect(state.scenarios.length).toBe(2);
    expect(state.selectedScenarioIndex).toBe(0);
    expect(state.currentScenario).toBeNull();
  });

  it('menu -> new game -> playing tick updates snapshot/frame', async () => {
    const controller = new RuntimeAppController({
      runtime: new TsRuntimePort(),
      audio: new NullRuntimeAudioAdapter(),
      scenarioLoader: async () => [makeScenario(0)],
    });
    controllers.push(controller);

    await controller.boot();
    controller.onKeyDown('Enter');
    await waitUntil(() => controller.getState().mode === 'playing');

    const before = controller.getState().snapshot;
    expect(before).not.toBeNull();

    controller.onKeyDown('KeyW');
    controller.tick(100);
    controller.tick(130);
    controller.tick(160);
    controller.tick(220);
    controller.onKeyUp('KeyW');

    const after = controller.getState().snapshot;
    expect(after).not.toBeNull();
    expect((after!.tick | 0)).toBeGreaterThan(before!.tick | 0);
    expect(controller.getState().frameHash >>> 0).toBeGreaterThan(0);
  });

  it('supports deterministic level transition to next scenario', async () => {
    const controller = new RuntimeAppController({
      runtime: new TsRuntimePort(),
      audio: new NullRuntimeAudioAdapter(),
      scenarioLoader: async () => [makeScenario(0), makeScenario(1)],
    });
    controllers.push(controller);

    await controller.boot();
    await controller.startScenario(0);
    expect(controller.getState().mode).toBe('playing');
    expect(controller.getState().currentScenario?.mapIndex).toBe(0);

    controller.onKeyDown('KeyN');
    await waitUntil(() => controller.getState().currentScenario?.mapIndex === 1);
    expect(controller.getState().mode).toBe('playing');
    expect(controller.getState().currentScenario?.mapIndex).toBe(1);
  });
});

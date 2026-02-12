import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { RuntimeAppController } from '../../src/app/runtimeController';
import { TsRuntimePort } from '../../src/runtime/tsRuntime';
import type { RuntimeAudioAdapter, RuntimeUiEvent } from '../../src/app/runtimeAudio';
import type { RuntimeSnapshot } from '../../src/runtime/contracts';
import type { Wl1RuntimeScenario } from '../../src/runtime/wl1RuntimeScenarios';
import { getNumRuns, getSeed } from './config';
import { withReplay } from './replay';

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
    id: `menu-flow-map-${mapIndex}`,
    mapIndex,
    mapName: `MenuFlow ${mapIndex}`,
    seed: (0x22330000 + mapIndex) >>> 0,
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

class RecordingAudioAdapter implements RuntimeAudioAdapter {
  readonly uiEvents: RuntimeUiEvent[] = [];
  stepCount = 0;

  unlock(): void {
    // no-op for property tests
  }

  onStep(_previous: RuntimeSnapshot, _next: RuntimeSnapshot, _inputMask: number): void {
    this.stepCount = (this.stepCount + 1) | 0;
  }

  onUiEvent(event: RuntimeUiEvent): void {
    this.uiEvents.push(event);
  }

  shutdown(): void {
    // no-op
  }
}

async function waitUntil(predicate: () => boolean, timeoutMs = 1500): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error(`Timed out after ${timeoutMs}ms`);
}

async function runMenuFlow(downMoves: number): Promise<{ signature: string; finalMap: number; mode: string }> {
  const audio = new RecordingAudioAdapter();
  const scenarios = [makeScenario(0), makeScenario(1), makeScenario(2), makeScenario(3)];
  const controller = new RuntimeAppController({
    runtime: new TsRuntimePort(),
    audio,
    scenarioLoader: async () => scenarios,
  });

  await controller.boot();
  controller.onKeyDown('Enter'); // title -> control panel
  for (let i = 0; i < downMoves; i++) {
    controller.onKeyDown('ArrowDown');
  }
  controller.onKeyDown('Enter'); // new game

  await waitUntil(() => controller.getState().mode === 'playing');

  // Drive a few deterministic gameplay ticks.
  controller.tick(100);
  controller.tick(140);
  controller.tick(180);
  controller.tick(220);

  // Transition through intermission.
  controller.onKeyDown('KeyN');
  controller.tick(1000);
  controller.tick(1230);
  controller.tick(1460);
  controller.tick(1690);
  controller.tick(1920);

  await waitUntil(() => controller.getState().mode === 'playing', 3000);

  const state = controller.getState();
  const signature = `${audio.uiEvents.join(',')}|${audio.stepCount}|${state.selectedScenarioIndex}|${state.currentScenario?.mapIndex ?? -1}`;

  await controller.shutdown();
  return {
    signature,
    finalMap: state.currentScenario?.mapIndex ?? -1,
    mode: state.mode,
  };
}

describe('runtime menu/input/intermission progression', () => {
  it('deterministic title->menu->game->intermission->next-level traces stay stable', async () => {
    const flowRuns = Math.min(getNumRuns(), 256);
    await withReplay('runtime.menu-progression.deterministic-flow', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 0, max: 9 }), async (moves) => {
          const lhs = await runMenuFlow(moves);
          const rhs = await runMenuFlow(moves);
          expect(lhs.signature).toBe(rhs.signature);
          expect(lhs.mode).toBe('playing');
          expect(lhs.finalMap).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: flowRuns, seed: getSeed() },
      );
    });
  });
});

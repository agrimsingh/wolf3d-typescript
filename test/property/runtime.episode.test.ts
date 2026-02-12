import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { computeRuntimeEpisodeArtifact, type RuntimeEpisodeArtifact } from '../../scripts/runtime/runtime-episode';
import { withReplay } from './replay';

describe('runtime episode parity checkpoints', () => {
  it('episode lock stays stable across all WL1 maps', async () => {
    await withReplay('runtime.episode.lock', async () => {
      const lockPath = path.join(process.cwd(), 'specs', 'generated', 'runtime-episode-checkpoints-lock.json');
      const lock = JSON.parse(await readFile(lockPath, 'utf8')) as RuntimeEpisodeArtifact;
      const generated = await computeRuntimeEpisodeArtifact(process.cwd(), 64);
      expect(generated).toEqual(lock);
    });
  });

  it('episode per-step trace structure is contiguous and deterministic', async () => {
    await withReplay('runtime.episode.trace-structure', async () => {
      const artifact = await computeRuntimeEpisodeArtifact(process.cwd(), 64);
      expect(artifact.phase).toBe('F6');
      expect(artifact.scenarioCount).toBeGreaterThan(0);
      expect(artifact.mapOrder.length).toBe(artifact.scenarioCount);
      for (let i = 0; i < artifact.mapOrder.length; i++) {
        expect(artifact.mapOrder[i] | 0).toBe(i);
        expect((artifact.maps[i]?.mapIndex ?? -1) | 0).toBe(i);
        expect((artifact.maps[i]?.stepCount ?? 0) | 0).toBeGreaterThan(0);

        const trace = artifact.maps[i]!.stepTrace;
        expect(trace.length).toBe(artifact.maps[i]!.stepCount);
        expect(trace[trace.length - 1]!.tick | 0).toBe(artifact.maps[i]!.finalTick | 0);
        for (const step of trace) {
          expect(step.snapshotHash >>> 0).toBeGreaterThan(0);
          expect(step.frameHash >>> 0).toBeGreaterThan(0);
        }
      }
      expect(artifact.episodeDigest >>> 0).toBeGreaterThan(0);
    });
  });
});

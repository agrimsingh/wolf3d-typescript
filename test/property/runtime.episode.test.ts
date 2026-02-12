import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { computeRuntimeEpisodeArtifact, type RuntimeEpisodeArtifact } from '../../scripts/runtime/runtime-episode';

describe('runtime episode parity checkpoints', () => {
  it('episode lock stays stable across all WL1 maps', async () => {
    const lockPath = path.join(process.cwd(), 'specs', 'generated', 'runtime-episode-checkpoints-lock.json');
    const lock = JSON.parse(await readFile(lockPath, 'utf8')) as RuntimeEpisodeArtifact;
    const generated = await computeRuntimeEpisodeArtifact(process.cwd(), 64);
    expect(generated).toEqual(lock);
  });

  it('episode checkpoint structure is contiguous and deterministic', async () => {
    const artifact = await computeRuntimeEpisodeArtifact(process.cwd(), 64);
    expect(artifact.phase).toBe('R7');
    expect(artifact.scenarioCount).toBeGreaterThan(0);
    expect(artifact.mapOrder.length).toBe(artifact.scenarioCount);
    for (let i = 0; i < artifact.mapOrder.length; i++) {
      expect(artifact.mapOrder[i] | 0).toBe(i);
      expect((artifact.maps[i]?.mapIndex ?? -1) | 0).toBe(i);
      expect((artifact.maps[i]?.stepCount ?? 0) | 0).toBeGreaterThan(0);
    }
    expect(artifact.episodeDigest >>> 0).toBeGreaterThan(0);
  });
});

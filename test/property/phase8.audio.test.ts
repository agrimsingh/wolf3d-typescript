import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { audioReducePacked } from '../../src/audio/reducer';
import { propertyNumRuns } from '../helpers/property';

describe('phase 8 audio parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('audio reduce matches oracle', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 255 }),
        (soundMode, musicMode, digiMode, eventKind, soundId) => {
          expect(audioReducePacked(soundMode, musicMode, digiMode, eventKind, soundId) | 0).toBe(
            oracle.audioReducePacked(soundMode, musicMode, digiMode, eventKind, soundId) | 0,
          );
        },
      ),
      { numRuns: propertyNumRuns() },
    );
  });
});

import { beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { getOracleBridge, OracleBridge } from '../../src/oracle/bridge';
import { getNumRuns, getSeed } from './config';
import { withReplay } from './replay';
import {
  idCaCacheAudioChunkHash,
  idCaCalSetupAudioFileHash,
  idSdPlaySoundHash,
  idSdSetMusicModeHash,
  idSdSetSoundModeHash,
  idSdStopSoundHash,
  wlGamePlaySoundLocGlobalHash,
  wlGameSetSoundLocHash,
  wlGameUpdateSoundLocHash,
} from '../../src/wolf/audio/wlAudio';

describe('phase 8 real WOLFSRC audio parity', () => {
  let oracle: OracleBridge;

  beforeAll(async () => {
    oracle = await getOracleBridge();
  });

  it('ID_CA.CAL_SetupAudioFile hash matches oracle', () => {
    withReplay('phase8.id_ca.CAL_SetupAudioFile', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10_000_000 }),
          fc.integer({ min: 0, max: 10_000_000 }),
          fc.integer({ min: -64, max: 4096 }),
          (audiohedLen, audiotLen, start) => {
            expect(idCaCalSetupAudioFileHash(audiohedLen, audiotLen, start) >>> 0).toBe(
              oracle.idCaCalSetupAudioFileHash(audiohedLen, audiotLen, start) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_CA.CA_CacheAudioChunk hash matches oracle', () => {
    withReplay('phase8.id_ca.CA_CacheAudioChunk', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 4096 }),
          fc.integer({ min: -1024, max: 10_000_000 }),
          fc.integer({ min: -1024, max: 10_000_000 }),
          fc.integer({ min: 0, max: 10_000_000 }),
          fc.integer({ min: 0, max: 0xffffffff }),
          (chunkNum, offset, nextOffset, audiotLen, cacheMask) => {
            expect(idCaCacheAudioChunkHash(chunkNum, offset, nextOffset, audiotLen, cacheMask) >>> 0).toBe(
              oracle.idCaCacheAudioChunkHash(chunkNum, offset, nextOffset, audiotLen, cacheMask) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_SD.SD_SetSoundMode hash matches oracle', () => {
    withReplay('phase8.id_sd.SD_SetSoundMode', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 3 }),
          fc.integer({ min: 0, max: 7 }),
          fc.integer({ min: 0, max: 1 }),
          (currentMode, requestedMode, hasDevice) => {
            expect(idSdSetSoundModeHash(currentMode, requestedMode, hasDevice) >>> 0).toBe(
              oracle.idSdSetSoundModeHash(currentMode, requestedMode, hasDevice) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_SD.SD_SetMusicMode hash matches oracle', () => {
    withReplay('phase8.id_sd.SD_SetMusicMode', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 3 }),
          fc.integer({ min: 0, max: 7 }),
          fc.integer({ min: 0, max: 1 }),
          (currentMode, requestedMode, hasDevice) => {
            expect(idSdSetMusicModeHash(currentMode, requestedMode, hasDevice) >>> 0).toBe(
              oracle.idSdSetMusicModeHash(currentMode, requestedMode, hasDevice) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_SD.SD_PlaySound hash matches oracle', () => {
    withReplay('phase8.id_sd.SD_PlaySound', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 3 }),
          fc.integer({ min: -1, max: 255 }),
          fc.integer({ min: -16, max: 64 }),
          fc.integer({ min: -16, max: 64 }),
          fc.integer({ min: 0, max: 1 }),
          (soundMode, soundId, priority, currentPriority, channelBusy) => {
            expect(idSdPlaySoundHash(soundMode, soundId, priority, currentPriority, channelBusy) >>> 0).toBe(
              oracle.idSdPlaySoundHash(soundMode, soundId, priority, currentPriority, channelBusy) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('ID_SD.SD_StopSound hash matches oracle', () => {
    withReplay('phase8.id_sd.SD_StopSound', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1 }),
          fc.integer({ min: -1, max: 255 }),
          fc.integer({ min: -16, max: 64 }),
          (channelBusy, currentSound, currentPriority) => {
            expect(idSdStopSoundHash(channelBusy, currentSound, currentPriority) >>> 0).toBe(
              oracle.idSdStopSoundHash(channelBusy, currentSound, currentPriority) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_GAME.SetSoundLoc hash matches oracle', () => {
    withReplay('phase8.wl_game.SetSoundLoc', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -32768, max: 32767 }),
          fc.integer({ min: -32768, max: 32767 }),
          fc.integer({ min: -32768, max: 32767 }),
          fc.integer({ min: -32768, max: 32767 }),
          (gx, gy, listenerX, listenerY) => {
            expect(wlGameSetSoundLocHash(gx, gy, listenerX, listenerY) >>> 0).toBe(
              oracle.wlGameSetSoundLocHash(gx, gy, listenerX, listenerY) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_GAME.UpdateSoundLoc hash matches oracle', () => {
    withReplay('phase8.wl_game.UpdateSoundLoc', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -32768, max: 32767 }),
          fc.integer({ min: -32768, max: 32767 }),
          fc.integer({ min: -32768, max: 32767 }),
          fc.integer({ min: -32768, max: 32767 }),
          fc.integer({ min: -1024, max: 1024 }),
          fc.integer({ min: -1024, max: 1024 }),
          (gx, gy, listenerX, listenerY, velocityX, velocityY) => {
            expect(wlGameUpdateSoundLocHash(gx, gy, listenerX, listenerY, velocityX, velocityY) >>> 0).toBe(
              oracle.wlGameUpdateSoundLocHash(gx, gy, listenerX, listenerY, velocityX, velocityY) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });

  it('WL_GAME.PlaySoundLocGlobal hash matches oracle', () => {
    withReplay('phase8.wl_game.PlaySoundLocGlobal', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 3 }),
          fc.integer({ min: -1, max: 255 }),
          fc.integer({ min: -32768, max: 32767 }),
          fc.integer({ min: -32768, max: 32767 }),
          fc.integer({ min: -32768, max: 32767 }),
          fc.integer({ min: -32768, max: 32767 }),
          fc.integer({ min: 0, max: 1 }),
          (soundMode, soundId, gx, gy, listenerX, listenerY, channelBusy) => {
            expect(wlGamePlaySoundLocGlobalHash(soundMode, soundId, gx, gy, listenerX, listenerY, channelBusy) >>> 0).toBe(
              oracle.wlGamePlaySoundLocGlobalHash(soundMode, soundId, gx, gy, listenerX, listenerY, channelBusy) >>> 0,
            );
          },
        ),
        { numRuns: getNumRuns(), seed: getSeed() },
      );
    });
  });
});

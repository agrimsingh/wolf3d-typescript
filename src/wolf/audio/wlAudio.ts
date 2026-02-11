function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function clampI32(v: number, minv: number, maxv: number): number {
  return Math.max(minv, Math.min(maxv, v | 0)) | 0;
}

export function idCaCalSetupAudioFileHash(audiohedLen: number, audiotLen: number, start: number): number {
  let chunks = ((audiohedLen / 4) | 0) - (start | 0);
  if (chunks < 0) chunks = 0;
  let dataBytes = (audiotLen - (start * 16)) | 0;
  if (dataBytes < 0) dataBytes = 0;

  let h = 2166136261 >>> 0;
  h = fnv1a(h, chunks);
  h = fnv1a(h, dataBytes);
  h = fnv1a(h, start);
  return h >>> 0;
}

export function idCaCacheAudioChunkHash(chunkNum: number, offset: number, nextOffset: number, audiotLen: number, cacheMask: number): number {
  const begin = clampI32(offset, 0, audiotLen);
  const end = clampI32(nextOffset, begin, audiotLen);
  const len = (end - begin) | 0;
  const newMask = (cacheMask | (1 << (chunkNum & 31))) >>> 0;

  let h = 2166136261 >>> 0;
  h = fnv1a(h, len);
  h = fnv1a(h, newMask);
  h = fnv1a(h, chunkNum);
  return h >>> 0;
}

export function idSdSetSoundModeHash(currentMode: number, requestedMode: number, hasDevice: number): number {
  const mode = hasDevice ? (requestedMode & 3) : 0;
  let h = 2166136261 >>> 0;
  h = fnv1a(h, currentMode);
  h = fnv1a(h, mode);
  h = fnv1a(h, hasDevice ? 1 : 0);
  return h >>> 0;
}

export function idSdSetMusicModeHash(currentMode: number, requestedMode: number, hasDevice: number): number {
  const mode = hasDevice ? (requestedMode & 3) : 0;
  let h = 2166136261 >>> 0;
  h = fnv1a(h, currentMode);
  h = fnv1a(h, mode);
  h = fnv1a(h, hasDevice ? 1 : 0);
  return h >>> 0;
}

export function idSdPlaySoundHash(soundMode: number, soundId: number, priority: number, currentPriority: number, channelBusy: number): number {
  let started = 0;
  let newPriority = currentPriority | 0;
  let sid = -1;
  if (soundMode !== 0 && (!channelBusy || priority >= currentPriority)) {
    started = 1;
    sid = soundId | 0;
    newPriority = priority | 0;
  }

  let h = 2166136261 >>> 0;
  h = fnv1a(h, started);
  h = fnv1a(h, sid);
  h = fnv1a(h, newPriority);
  return h >>> 0;
}

export function idSdStopSoundHash(channelBusy: number, currentSound: number, currentPriority: number): number {
  const busy = 0;
  const sid = channelBusy ? -1 : (currentSound | 0);
  const pr = channelBusy ? 0 : (currentPriority | 0);
  let h = 2166136261 >>> 0;
  h = fnv1a(h, busy);
  h = fnv1a(h, sid);
  h = fnv1a(h, pr);
  return h >>> 0;
}

export function wlGameSetSoundLocHash(gx: number, gy: number, listenerX: number, listenerY: number): number {
  const dx = (gx - listenerX) | 0;
  const dy = (gy - listenerY) | 0;
  let dist = dx < 0 ? -dx : dx;
  dist += dy < 0 ? -dy : dy;
  const pan = clampI32((dx / 8) | 0, -15, 15);

  let h = 2166136261 >>> 0;
  h = fnv1a(h, dist);
  h = fnv1a(h, pan & 31);
  return h >>> 0;
}

export function wlGameUpdateSoundLocHash(
  gx: number,
  gy: number,
  listenerX: number,
  listenerY: number,
  velocityX: number,
  velocityY: number,
): number {
  const nx = (gx + velocityX) | 0;
  const ny = (gy + velocityY) | 0;
  return wlGameSetSoundLocHash(nx, ny, listenerX, listenerY);
}

export function wlGamePlaySoundLocGlobalHash(
  soundMode: number,
  soundId: number,
  gx: number,
  gy: number,
  listenerX: number,
  listenerY: number,
  channelBusy: number,
): number {
  const loc = wlGameSetSoundLocHash(gx, gy, listenerX, listenerY);
  const play = idSdPlaySoundHash(soundMode, soundId, 8, 0, channelBusy);
  let h = 2166136261 >>> 0;
  h = fnv1a(h, loc);
  h = fnv1a(h, play);
  return h >>> 0;
}

# Audio (Optional Phase)

## Overview

Audio is an optional final phase. If implemented, audio state/event behavior must still follow oracle parity methodology.

Primary C references include:

- `ID_SD.C` (sound manager behavior)
- `ID_CA.C` (`CA_CacheAudioChunk` and audio asset handling)
- `WL_GAME.C` (positioned sound integration)

## Architecture

```text
audio event + game context -> audio state/output event model
                                   |
                        oracle parity for state transitions
```

## Core Types

```ts
export interface AudioEvent {
  type: string;
  soundId?: number;
  x?: number;
  y?: number;
}

export interface AudioState {
  soundMode: string;
  musicMode: string;
  digiMode: string;
  currentlyPlaying: number[];
}
```

## API / Interface

- `playSound(input): AudioState`
- `playSoundLocGlobal(input): AudioState`
- `setSoundMode(input): AudioState`
- `updateAudioTick(input): AudioState`

## Property Test Requirements

- Sound mode transition parity.
- Event handling parity for positioned and non-positioned effects.
- Deterministic state parity under randomized event streams.

## Completion Criteria

- Optional phase only.
- If executed: local 1k and CI 10k gates are green.
- If executed: Phase 8 checklist and commit complete in `TODO.md`.

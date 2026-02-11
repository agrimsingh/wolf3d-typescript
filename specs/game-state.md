# Game State Management

## Overview

This phase ports mutable game-state systems: doors, items, scoring, lives, level progression, and intermission-related counters/state transitions.

Primary C references include:

- `WL_GAME.C` (game loop state transitions, level setup, life/death flow)
- `WL_INTER.C` (intermission and score bookkeeping)
- `WL_ACT1.C` (door operation and movement)
- `WL_AGENT.C` (score, keys, treasure, health mutations)

## Architecture

```text
event + current game state -> state transition -> updated game state
                                         |
                     oracle parity for counters, flags, and transitions
```

## Core Types

```ts
export interface GameStateSnapshot {
  score: number;
  lives: number;
  health: number;
  ammo: number;
  keys: number;
  mapon: number;
  episode: number;
  playstate: string;
}
```

## API / Interface

- `operateDoor(input): GameStateSnapshot`
- `moveDoors(input): GameStateSnapshot`
- `getBonus(input): GameStateSnapshot`
- `takeDamage(input): GameStateSnapshot`
- `applyLevelEnd(input): GameStateSnapshot`

## Property Test Requirements

- Door state/position parity across randomized transitions.
- Score/lives/keys/bonus mutation parity.
- Level completion and intermission parity.

## Completion Criteria

- Game-state transition functions covered by oracle parity tests.
- Local 1k and CI 10k gates are green.
- Phase 6 checklist and commit complete in `TODO.md`.

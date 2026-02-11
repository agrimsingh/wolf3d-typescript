# Actor State Machines and AI

## Overview

This phase ports enemy and actor state transitions, direction selection, chase/path behavior, and combat-related AI routines.

Primary C references include:

- `WL_STATE.C` (`SelectDodgeDir`, `SelectChaseDir`, `MoveObj`, `DamageActor`, etc.)
- `WL_ACT1.C` (door interactions and static objects that affect AI/state)
- `WL_ACT2.C` (enemy-specific think/action routines)

## Architecture

```text
world + actor snapshot -> tick/think transition -> updated actor snapshot
                                             |
                           oracle parity on next-state transitions
```

## Core Types

```ts
export interface ActorStateInput {
  actor: ActorSnapshot;
  world: WorldSnapshot;
  tics: number;
}

export interface ActorStateOutput {
  actor: ActorSnapshot;
  worldDelta: WorldDelta;
}
```

## API / Interface

- `selectDodgeDir(input): ActorStateOutput`
- `selectChaseDir(input): ActorStateOutput`
- `moveObj(input): ActorStateOutput`
- `damageActor(input): ActorStateOutput`
- `tickActor(input): ActorStateOutput`

## Property Test Requirements

- State transition parity over randomized actor/world snapshots.
- Direction choice parity for chase/dodge routines.
- Combat and death transition parity.

## Completion Criteria

- AI/actor transition routines covered by oracle property tests.
- Local 1k and CI 10k gates are green.
- Phase 4 checklist and commit complete in `TODO.md`.

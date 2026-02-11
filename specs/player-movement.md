# Player Movement, Input, and Collision

## Overview

This phase ports player controls, thrust/movement integration, collision clipping, and interaction commands.

Primary C references include:

- `WL_AGENT.C` (`ControlMovement`, `ClipMove`, `Thrust`, `Cmd_Use`, `Cmd_Fire`, `T_Player`)
- `WL_PLAY.C` (play loop integration)

## Architecture

```text
input + player/world state -> movement + action update -> new player/world state
                                                   |
                                  oracle parity for each tick transition
```

## Core Types

```ts
export interface PlayerTickInput {
  player: PlayerSnapshot;
  world: WorldSnapshot;
  input: ControlInput;
  tics: number;
}

export interface PlayerTickOutput {
  player: PlayerSnapshot;
  worldDelta: WorldDelta;
}
```

## API / Interface

- `controlMovement(input): PlayerTickOutput`
- `clipMove(input): PlayerTickOutput`
- `thrust(input): PlayerTickOutput`
- `cmdUse(input): PlayerTickOutput`
- `cmdFire(input): PlayerTickOutput`
- `tickPlayer(input): PlayerTickOutput`

## Property Test Requirements

- Position/angle parity under randomized control streams.
- Collision parity near walls, doors, and map boundaries.
- Weapon/use action parity under randomized state combinations.

## Completion Criteria

- Player movement/input/collision functions have oracle parity tests.
- Local 1k and CI 10k gates are green.
- Phase 5 checklist and commit complete in `TODO.md`.

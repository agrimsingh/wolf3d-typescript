# Raycasting Engine

## Overview

This phase ports core renderer math and per-column ray intersection behavior. Output parity must be deterministic for equivalent camera/player/map state.

Primary C references include:

- `WL_DRAW.C` (`ThreeDRefresh`, transforms, wall hits, height calc)
- `WL_MAIN.C` (`CalcProjection`)
- `WL_SCALE.C` (scale helpers)

## Architecture

```text
camera + level state -> raycast per column -> projected wall slice data
                                        |
                         oracle parity for each sampled frame state
```

## Core Types

```ts
export interface RaycastInput {
  viewX: number;
  viewY: number;
  viewAngle: number;
  map: ParsedLevel;
}

export interface RaycastColumn {
  column: number;
  distance: number;
  wallHeight: number;
  textureId: number;
  hitKind: 'vertical' | 'horizontal' | 'door';
}
```

## API / Interface

- `transformActor(...)`
- `transformTile(...)`
- `calcHeight(...)`
- `wallRefresh(...)`
- `threeDRefresh(input: RaycastInput): RaycastColumn[]`

## Property Test Requirements

- Transform and height helper parity for randomized geometric inputs.
- Column-by-column parity for randomized deterministic scenes.
- Edge cases for axis-aligned views and near-wall distances.

## Completion Criteria

- Core raycast pipeline parity is green for required random runs.
- Local 1k and CI 10k gates are green.
- Phase 3 checklist and commit complete in `TODO.md`.

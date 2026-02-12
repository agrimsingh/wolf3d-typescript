# Map and Level Data Loading

## Overview

This phase ports binary map header and plane decoding/parsing behavior used to construct runtime level state. Exact decompression and indexing parity is required.

Primary C references include:

- `ID_CA.C` (`CA_RLEWexpand`, `CA_CacheMap`, map header reads)
- `WL_GAME.C` (`SetupGameLevel` map interpretation)
- `WL_DEF.H` (map constants and dimensions)

## Architecture

```text
binary map bytes -> decode/decompress -> normalized TS level structs
                                |
                   oracle parity against C/WASM decode
```

## Core Types

```ts
export interface MapPlanes {
  plane0: Uint16Array;
  plane1: Uint16Array;
  plane2: Uint16Array;
}

export interface LevelMap {
  width: number;
  height: number;
  planes: MapPlanes;
}
```

## API / Interface

- `rlewExpand(source: Uint16Array, expectedWords: number, rlewTag: number): Uint16Array`
- `cacheMap(mapIndex: number): LevelMap`
- `parseLevelGeometry(level: LevelMap): ParsedLevel`
- `buildWl1RuntimeScenariosFromBytes(mapheadBytes, gamemapsBytes, stepsPerScenario): Wl1RuntimeScenario[]`

## Deterministic Trace Seed Policy

- Scenario seed is derived from canonical map metadata and player spawn:
  - map index
  - map name bytes
  - canonical start position (Q8)
- Runtime traces must not use random 8x8 map window sampling.
- Player start is extracted from object-plane start tiles (`19..22`) with WOLFSRC-consistent angle mapping.

## Property Test Requirements

- RLEW decode parity for randomized compressed streams (valid and edge-case inputs).
- Map plane output parity against oracle for sampled WL1 maps.
- Tile/door/actor placement parity from parsed level output.

## Completion Criteria

- All decode and map parse routines covered with oracle property tests.
- Local 1k and CI 10k gates are green.
- Phase 2 checklist and commit complete in `TODO.md`.

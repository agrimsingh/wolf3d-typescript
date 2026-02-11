# Math and Fixed-Point Utilities

## Overview

This phase ports fixed-point arithmetic and core lookup-table math used by rendering, movement, and AI. These utilities are foundational; all downstream phases depend on preserving exact behavior.

Primary C references include:

- `WL_DRAW.C` (`FixedByFrac` and related use sites)
- `WL_MAIN.C` (`BuildTables`, `CalcProjection` support math)
- `WL_DEF.H` (global constants and numeric conventions)

## Architecture

```text
TS fixed-point ops + trig tables
            |
  used by render/player/ai systems
            |
property parity vs C/WASM oracle
```

## Core Types

```ts
export type Fixed = number; // constrained to signed 32-bit integer semantics

export interface ProjectionTables {
  sintable: Int32Array;
  costable: Int32Array;
  finetangent: Int32Array;
  pixelangle: Int16Array;
}
```

## API / Interface

- `fixedByFrac(a: Fixed, b: Fixed): Fixed`
- `buildTables(): ProjectionTables`
- `calcProjection(focal: number, viewWidth: number): { scale: Int32Array; pixelangle: Int16Array }`

## Property Test Requirements

- `fixedByFrac` parity across random signed integer pairs.
- Table generation parity (`sintable`, `costable`, `finetangent`, `pixelangle`) with exact integer equality.
- Projection helper parity under randomized valid view sizes and focal lengths.

## Completion Criteria

- All listed functions have oracle property tests.
- Local 1k and CI 10k gates are green.
- Phase 1 checklist and commit complete in `TODO.md`.

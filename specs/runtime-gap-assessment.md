# Runtime Gap Assessment (Current)

## Objective

Track the real gap between current runtime behavior and true gameplay-complete WL1 runtime parity against original WOLFSRC.

## Current Reality (2026-02-12, R0 Baseline)

1. Browser runtime currently defaults to oracle-backed runtime (`WolfsrcOraclePort`) in `src/app/runtimeController.ts`.
2. Both oracle-side runtime (`c-oracle/runtime/wolfsrc_runtime_oracle.c`) and TS runtime harness (`src/runtime/tsRuntime.ts`) still contain synthetic behavior patterns and probe-driven logic.
3. Runtime scenarios and episode fixtures are currently generated from 8x8 sampled map-bit fixtures rather than canonical full-map runtime world state.
4. Existing “phase complete” evidence in prior F-phase docs reflects parity within the synthetic harness, not full gameplay-faithful WOLFSRC runtime behavior.

## Primary Gaps To Close

1. Replace synthetic runtime engine behavior with runtime-faithful world simulation semantics.
2. Replace synthetic fixture/scenario model with real deterministic WL1 runtime traces.
3. Reclassify runtime symbols from real gameplay traces (not synthetic driver traces).
4. Port required-runtime behavior function-by-function to TS and enforce strict parity gates.
5. Swap production path to pure TS runtime and keep oracle/WASM test-only.
6. Lock full deterministic WL1 episode parity at per-tic snapshot + indexed frame exactness.

## Not Done Yet

- Doors, actors, weapons, and level progression are not yet validated as full runtime-faithful behavior in production path.
- Current browser “playability” signals do not satisfy final done definition.
- CI green status today is insufficient proof of full WL1 runtime equivalence.

## Done Criteria (Target)

Project is only done when all are true:

1. Browser runtime is gameplay-complete across WL1 episode flow.
2. Production gameplay runtime is pure TypeScript.
3. Every required-runtime symbol is covered by function-level TS-vs-C oracle property parity.
4. Full deterministic episode traces pass per-tic snapshot + indexed frame exact parity.
5. R-phase gates (`R0..R10`) are green with required phase commits.

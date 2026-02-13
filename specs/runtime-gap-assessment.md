# Runtime Gap Assessment (WL6 Modern Track Baseline)

## Objective

Track the remaining gap between the current browser runtime and a gameplay-complete, parity-verified WL6 TypeScript runtime.

## Current Reality (2026-02-13)

Progress checkpoint: No phase is currently complete as a runtime-faithful guarantee.

1. Runtime is currently in mixed behavior mode: production browser flow is partially driven by synthetic fixtures and legacy 8x8 map-wall assumptions.
2. WL6 canonical map/runtime assets are present in the production path, with VSWAP-driven walls/sprites and canonical palette mapping enabled.
3. Runtime symbol classification and manifests exist, but runtime-faithful evidence for every required behavior transition is not complete.
4. Deterministic checkpoint/full-episode parity artifacts exist, but they are not yet proven as a strict gate for complete gameplay.
5. Browser acceptance traces are present from earlier experimental passes, but replay coverage does not yet prove full episode parity under live WL6 behavior.

## Recent Progress (2026-02-13)

1. Canonical WL6 palette is now used for indexed framebuffer conversion; synthetic 3-3-2 palette mapping was removed.
2. Full-map door runtime behavior now includes door open/hold/close progression, locked-door key checks, and dynamic ray/render door shift.
3. Full-map collision now respects door openness threshold for movement passability.
4. Runtime interaction coverage now includes locked-door and door-animation property cases in `test/property/runtime.fullmap-interactions.test.ts`.

## Primary Gaps To Close

1. Remove synthetic scenario fixtures from the production path and wire deterministic full-world startup.
2. Complete map/window replacement with full-map parity state and collision surfaces.
3. Finish strict parity for remaining movement/combat/enemy/intermission/audio details with WL6 source traces.
4. Finish one-shot P0–P12 execution and attach clean evidence for each green gate.
5. Validate full-episode completion parity and lock final merge evidence.

## Done Criteria (WL6 Track)

Project is complete for this track only when:

1. Browser runtime is gameplay-complete for WL6 route coverage under defined acceptance traces.
2. Production runtime path is pure TypeScript.
3. Every required-runtime symbol has explicit oracle parity evidence.
4. Deterministic traces pass per-tic snapshot and indexed framebuffer parity.
5. K-phase gates (`K0..K12`) are green with corresponding commits and artifacts.

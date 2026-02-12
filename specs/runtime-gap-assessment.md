# Runtime Gap Assessment (G0 Baseline)

## Objective

Track the concrete gap between the current synthetic runtime harness and a gameplay-complete WL1 TypeScript runtime parity against original WOLFSRC.

## Current Reality (2026-02-12)

1. Production runtime path still executes `TsRuntimePort` with synthetic runtime behavior in `src/runtime/tsRuntime.ts` (`RUNTIME_CORE_KIND = 'synthetic'`).
2. Runtime world modeling still collapses full maps into 8x8 window bits (`mapLo/mapHi`) in `src/runtime/wl1LevelData.ts`.
3. Browser render path still uses custom demo raycasting from snapshot state rather than full runtime-framebuffer semantics in `src/app/gameApp.ts`.
4. Oracle/runtime parity artifacts and green CI primarily validate synthetic harness determinism, not full gameplay-faithful WL1 behavior.
5. Existing docs and completion claims from prior tracks diverge from observed runtime behavior in browser.

## Primary Gaps To Close

1. Replace synthetic runtime state evolution with true WOLFSRC runtime behavior in TS production path.
2. Replace map-window abstractions with full-map runtime world state and connectivity.
3. Replace demo rendering path with runtime-faithful renderer/framebuffer pipeline.
4. Reclassify runtime symbols from real gameplay traces and enforce per-function parity for required runtime surface.
5. Lock full deterministic WL1 episode parity at per-tic snapshot and framebuffer levels.
6. Prove browser playability end-to-end (menu/new-game/combat/doors/level progression/intermission) with agent-browser acceptance.

## Not Done Yet

- Full gameplay loop parity: enemies, doors/pushwalls, weapons/combat, level completion progression.
- Runtime-complete menu/control panel/new game flow and intermission UI parity.
- Production TS runtime isolation from oracle/synthetic fallback paths.
- Full episode parity and CI freeze based on real gameplay traces.

## Done Criteria (Target)

Project is complete only when all are true:

1. Browser runtime is gameplay-complete across WL1 episode flow.
2. Production runtime is pure TypeScript and free of synthetic runtime-window modeling.
3. Every required-runtime symbol has explicit TS-vs-C oracle property parity coverage.
4. Deterministic full-episode traces pass per-tic snapshot + indexed framebuffer exact parity.
5. G-phase gates (`G0..G12`) are green with required phase commits and reproducible evidence artifacts.

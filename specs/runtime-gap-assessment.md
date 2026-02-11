# Runtime Gap Assessment (Prototype -> Full WL1 Runtime Completion)

## Objective

Document the exact gap between the current repository state and a true gameplay-complete TypeScript port of WOLFSRC with deterministic WL1 parity in browser.

## Current Reality

1. Browser runtime remains prototype-level (`src/app/gameApp.ts`) and is not WOLFSRC-runtime-driven.
2. Oracle wrappers in `c-oracle/` are reduced synthetic models, not full stateful WOLFSRC runtime execution.
3. Phase `0..8` parity currently validates selected wrapper behavior, not all runtime-path behavior.
4. `specs/port-manifest.md` still has 488 unchecked `shared` symbols.
5. DOS/BIOS/asm-era compile blockers exist in upstream WOLFSRC for direct WASM compilation.

## Required End-State

1. Real WOLFSRC runtime path compiled to WASM with deterministic `init/reset/step/snapshot/render` contract.
2. Runtime-path symbol manifest extracted from deterministic WL1 execution traces.
3. TypeScript runtime implementation matched function-by-function against oracle for all required runtime symbols.
4. Tick-state parity and frame-hash parity across all WL1 maps.
5. Browser app uses runtime core and can complete WL1 episode flow with parity checkpoints.

## Hard Technical Gaps

- Portability layer for `<dos.h>`, `<conio.h>`, BIOS interrupts, far pointers, and inline asm.
- Runtime memory/state model parity (globals, structs, save/load boundaries).
- Deterministic trace and replay tooling.
- Runtime-path symbol hit instrumentation and manifest freeze.
- Full episode acceptance harness (state + frame checkpoints).

## Non-Goals

- Full parity for dead/debug/non-runtime symbols not exercised by WL1 runtime traces.
- WL6/SOD variants in this execution track.

## Acceptance Criteria for Gap Closure

- All R-phases (`R0..R8`) complete with green gates and phase commits.
- Runtime symbol manifest required set fully checked.
- All-map WL1 parity + full episode parity passes in CI release gate.

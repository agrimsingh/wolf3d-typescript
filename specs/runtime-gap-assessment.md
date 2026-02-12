# Runtime Gap Assessment (Prototype -> Full WL1 Runtime Completion)

## Objective

Document the exact gap between the current repository state and a true gameplay-complete TypeScript port of WOLFSRC with deterministic WL1 parity in browser.

## Current Reality

1. Browser runtime path is now runtime-driven (`src/app/runtimeController.ts` + `src/app/gameApp.ts`) with WL1 map selection/start flow and smoke coverage.
2. Runtime-path oracle wrappers and parity harness are active for required symbols, with deterministic tick/frame checkpoint lock in place.
3. Full end-to-end episode acceptance traces (all-map progression checkpoints) are not yet implemented.
4. `specs/port-manifest.md` still has many unchecked `shared` symbols outside the runtime-path-required set.
5. DOS/BIOS/asm-era compile blockers still exist upstream for full unmodified WOLFSRC direct WASM compilation.

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

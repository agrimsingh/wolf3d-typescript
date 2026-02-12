# Wolf3D TypeScript Specifications

Design documentation for the browser-based TypeScript port of Wolfenstein 3D, validated against the original C code via a WebAssembly oracle.

## Runtime Completion

- [runtime-gap-assessment.md](./runtime-gap-assessment.md): objective gap from current prototype parity to full WL1 runtime-complete parity.
- [runtime-symbol-manifest.md](./runtime-symbol-manifest.md): authoritative runtime-path symbol checklist used for R-phase execution.
- `generated/runtime-symbol-hits.json`: deterministic trace artifact produced by `pnpm runtime:manifest:extract`.
- `generated/runtime-symbol-lock.json`: frozen R2 lock consumed by `pnpm runtime:manifest:verify`.
- [wolfsrc-compatibility.md](./wolfsrc-compatibility.md): R1 portability layer, sanitized source pipeline, and compile-blocker burn-down status.

## Core Systems

| Spec | Planned Code | Purpose |
| :--- | :--- | :--- |
| [testing-strategy.md](./testing-strategy.md) | `test/property/`, `src/oracle/` | Defines the mandatory oracle parity testing model and completion gates. |
| [c-wasm-bridge.md](./c-wasm-bridge.md) | `src/oracle/`, `scripts/wasm/` | Defines how original C functions are compiled and exposed as a reference oracle. |
| [math-fixed-point.md](./math-fixed-point.md) | `src/math/` | Fixed-point arithmetic and trig table behavior that all gameplay systems depend on. |
| [map-loading.md](./map-loading.md) | `src/map/` | Map header/plane decoding and level parsing parity with C data pipeline. |
| [raycasting.md](./raycasting.md) | `src/render/raycast/` | Core wall casting and projection calculations. |
| [actors-ai.md](./actors-ai.md) | `src/actors/`, `src/ai/` | Enemy behavior, state transitions, and movement decisions. |
| [player-movement.md](./player-movement.md) | `src/player/` | Player control, movement integration, and collision resolution. |
| [game-state.md](./game-state.md) | `src/game/` | Doors, items, scoring, lives, level transitions, and playstate transitions. |
| [menu-text.md](./menu-text.md) | `src/ui/menu/`, `src/ui/text/` | Menu flow, UI state transitions, and text layout behavior. |
| [audio.md](./audio.md) | `src/audio/` | Optional audio parity phase for sound/music state behavior. |

## How To Use These Specs

1. Before implementing any function, read `testing-strategy.md` and the system spec for that function.
2. Port one function at a time from C to TS.
3. Add a property-based oracle test for that function.
4. Run property tests and fix until green.
5. Only then mark the function done in `TODO.md`.
6. Do not advance phases until all current-phase checks and gates are green and committed.

## Spec Status

| Spec | Status | Notes |
| :--- | :--- | :--- |
| testing-strategy.md | Draft | Foundation document; must be read first. |
| c-wasm-bridge.md | Draft | Bridge architecture and ABI constraints captured. |
| math-fixed-point.md | Draft | Phase 1 target. |
| map-loading.md | Draft | Phase 2 target. |
| raycasting.md | Draft | Phase 3 target. |
| actors-ai.md | Draft | Phase 4 target. |
| player-movement.md | Draft | Phase 5 target. |
| game-state.md | Draft | Phase 6 target. |
| menu-text.md | Draft | Phase 7 target. |
| audio.md | Draft | Phase 8 optional target. |
| runtime-gap-assessment.md | Active | Baseline truth document for runtime-complete work. |
| runtime-symbol-manifest.md | Active | Runtime-path symbol tracker for full completion. |
| wolfsrc-compatibility.md | Active | Compatibility bring-up and probe status for real-source compilation. |

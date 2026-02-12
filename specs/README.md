# Wolf3D TypeScript Specifications

Design documentation for the browser TypeScript port of Wolfenstein 3D, validated against original C/WASM oracle behavior.

## Runtime Completion Track (Active)

- [runtime-parity-execution-spec.md](./runtime-parity-execution-spec.md): authoritative one-pass execution spec (`R0..R10`).
- [runtime-gap-assessment.md](./runtime-gap-assessment.md): current truth snapshot of synthetic-vs-runtime-faithful gap.
- [runtime-symbol-manifest.md](./runtime-symbol-manifest.md): runtime-path symbol checklist derived from trace artifacts.
- [runtime-symbol-classification.md](./runtime-symbol-classification.md): full WOLFSRC inventory classification summary.
- [wolfsrc-compatibility.md](./wolfsrc-compatibility.md): WOLFSRC compatibility and portability constraints.

## Generated Runtime Artifacts

- `generated/runtime-core-mode.json`
- `generated/runtime-symbol-hits.json`
- `generated/runtime-symbol-lock.json`
- `generated/wolfsrc-manifest.json`
- `generated/wolfsrc-runtime-classification.json`
- `generated/runtime-checkpoints.json`
- `generated/runtime-checkpoints-lock.json`
- `generated/runtime-episode-checkpoints.json`
- `generated/runtime-episode-checkpoints-lock.json`

## Core System Specs

| Spec | Planned Code | Purpose |
| :--- | :--- | :--- |
| [testing-strategy.md](./testing-strategy.md) | `test/property/`, `src/oracle/` | Oracle parity methodology and gate policy. |
| [c-wasm-bridge.md](./c-wasm-bridge.md) | `src/oracle/`, `scripts/wasm/` | Emscripten bridge contracts and ABI notes. |
| [math-fixed-point.md](./math-fixed-point.md) | `src/math/`, `src/wolf/math/` | Fixed-point, tables, and projection primitives. |
| [map-loading.md](./map-loading.md) | `src/map/`, `src/wolf/map/` | Map decode/cache/load parity behavior. |
| [raycasting.md](./raycasting.md) | `src/render/`, `src/wolf/render/` | Wall/raycast/render behavior parity. |
| [actors-ai.md](./actors-ai.md) | `src/actors/`, `src/wolf/ai/` | Actor state machines and AI transitions. |
| [player-movement.md](./player-movement.md) | `src/player/`, `src/wolf/player/` | Input, movement, collision, weapons. |
| [game-state.md](./game-state.md) | `src/game/`, `src/wolf/game/` | Doors/items/score/lives/intermission transitions. |
| [menu-text.md](./menu-text.md) | `src/ui/`, `src/wolf/menu/` | Menu and text flow behavior. |
| [audio.md](./audio.md) | `src/audio/`, `src/wolf/audio/` | Audio behavior/state parity. |

## How To Use Specs

1. Read `testing-strategy.md` before implementing any function.
2. Implement exactly one function/slice at a time.
3. Add TS-vs-C/WASM property parity tests for that function/slice.
4. Run local gate (1k) and CI gate (10k) before marking complete.
5. Update `TODO.md` and manifest evidence.
6. Do not advance phase until all current phase gates are green and committed.

## Spec Status

| Spec | Status | Notes |
| :--- | :--- | :--- |
| runtime-parity-execution-spec.md | Active | Authoritative R-phase execution plan. |
| runtime-gap-assessment.md | Active | Truth baseline for current gap. |
| runtime-symbol-manifest.md | Active | Runtime symbol checklist and parity status. |
| runtime-symbol-classification.md | Active | Inventory classification output. |
| testing-strategy.md | Active | Mandatory oracle-parity workflow. |
| c-wasm-bridge.md | Active | Bridge architecture and ABI constraints. |
| math-fixed-point.md | Active | Phase coverage pending R4+ runtime-fidelity uplift. |
| map-loading.md | Active | Phase coverage pending R1/R4 uplift. |
| raycasting.md | Active | Phase coverage pending R5 uplift. |
| actors-ai.md | Active | Phase coverage pending R7 uplift. |
| player-movement.md | Active | Phase coverage pending R6 uplift. |
| game-state.md | Active | Phase coverage pending R6 uplift. |
| menu-text.md | Active | Phase coverage pending R8 uplift. |
| audio.md | Active | Phase coverage pending R8 uplift. |

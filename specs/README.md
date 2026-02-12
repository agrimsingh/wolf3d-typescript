# Wolf3D TypeScript Specifications

Design documentation for the browser TypeScript port of Wolfenstein 3D with strict C/WASM oracle parity.

## Active Runtime Track (Completed)

- [wl6-modern-runtime-execution-spec.md](./wl6-modern-runtime-execution-spec.md): authoritative one-shot execution spec (`K0..K12`) for WL6 canonical runtime + modern asset mapping.
- [wl1-real-runtime-execution-spec.md](./wl1-real-runtime-execution-spec.md): prior WL1 recovery execution history (`G0..G12`).
- [runtime-gap-assessment.md](./runtime-gap-assessment.md): current truth snapshot for the active WL6 migration track.
- [runtime-symbol-manifest.md](./runtime-symbol-manifest.md): runtime symbol checklist from runtime-faithful trace artifacts.
- [runtime-symbol-classification.md](./runtime-symbol-classification.md): full WOLFSRC inventory classification summary.
- [wolfsrc-compatibility.md](./wolfsrc-compatibility.md): WOLFSRC portability constraints and toolchain notes.

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
- `generated/k12-wl6-parity-freeze-evidence.json`
- `generated/g12-release-evidence.md`

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
2. Work from `TODO.md` current K-phase only.
3. Implement one function/slice at a time, then add TS-vs-C/WASM property tests.
4. Run local (1k) and CI-strength (10k) parity gates before marking complete.
5. Keep docs/manifests/checkpoints synchronized with implementation reality.
6. Do not advance phases until gates are green and a phase commit exists.

## Current Truth

- Active target is WL6 canonical runtime behavior with deterministic modern asset mapping.
- Runtime/oracle infrastructure exists but still requires WL6-specific lock regeneration and parity burn-down.
- `K0..K12` are complete with green gates and committed phase evidence.

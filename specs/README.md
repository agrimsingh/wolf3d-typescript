# Wolf3D TypeScript Specifications

Design documentation for the browser TypeScript port of Wolfenstein 3D with strict C/WASM oracle parity. Every spec maps to a code location and tracks implementation and verification status.

## How to Use This Index

1. **Find the relevant spec** using the tables below.
2. **Read before implementing** — specs define expected behavior and design.
3. **Update after implementing** — if reality differs from spec, reconcile them.
4. **Check verification status** — only "Verified" specs have been confirmed to match the code.

---

## Active Runtime Track

| Spec | Purpose | Status | Verified |
| :--- | :--- | :--- | :--- |
| [wl6-modern-runtime-execution-spec.md](./wl6-modern-runtime-execution-spec.md) | K0..K12 WL6 canonical runtime + modern asset mapping | Implemented | Partial |
| [wl1-real-runtime-execution-spec.md](./wl1-real-runtime-execution-spec.md) | Prior WL1 G0..G12 recovery history | Implemented | Yes |
| [runtime-gap-assessment.md](./runtime-gap-assessment.md) | Current truth snapshot for WL6 migration | In Progress | Partial |
| [runtime-symbol-manifest.md](./runtime-symbol-manifest.md) | Required-runtime symbol checklist | Implemented | Yes |
| [runtime-symbol-classification.md](./runtime-symbol-classification.md) | WOLFSRC inventory classification | Implemented | Yes |
| [wolfsrc-compatibility.md](./wolfsrc-compatibility.md) | WOLFSRC portability constraints | Implemented | Yes |

## Core System Specs

| Spec | Code Location | Purpose | Status | Verified |
| :--- | :--- | :--- | :--- | :--- |
| [testing-strategy.md](./testing-strategy.md) | `test/property/`, `src/oracle/` | Oracle parity methodology, gate policy | Implemented | Yes |
| [c-wasm-bridge.md](./c-wasm-bridge.md) | `src/oracle/`, `scripts/wasm/` | Emscripten bridge contracts, ABI | Implemented | Yes |
| [math-fixed-point.md](./math-fixed-point.md) | `src/math/`, `src/wolf/math/` | Fixed-point, tables, projection | In Progress | Partial |
| [map-loading.md](./map-loading.md) | `src/map/`, `src/wolf/map/` | Map decode/cache/load parity | In Progress | Partial |
| [raycasting.md](./raycasting.md) | `src/render/`, `src/wolf/render/` | Wall/raycast/render parity | Implemented | Partial |
| [actors-ai.md](./actors-ai.md) | `src/actors/`, `src/wolf/ai/` | Actor state machines, AI | Implemented | Partial |
| [player-movement.md](./player-movement.md) | `src/player/`, `src/wolf/player/` | Input, movement, collision, weapons | Implemented | Partial |
| [game-state.md](./game-state.md) | `src/game/`, `src/wolf/game/` | Doors, items, score, intermission | In Progress | Partial |
| [menu-text.md](./menu-text.md) | `src/ui/`, `src/wolf/menu/` | Menu and text flow | Planned | No |
| [audio.md](./audio.md) | `src/audio/`, `src/wolf/audio/` | Audio behavior/state parity | Planned | No |

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

---

## Status Legend

| Status | Meaning |
| :--- | :--- |
| **Draft** | Spec written, implementation not started |
| **In Progress** | Implementation underway |
| **Implemented** | Code written to match spec |
| **Needs Update** | Code and spec have diverged |
| **Planned** | Placeholder, spec not yet written |

## Verification Legend

| Verified | Meaning |
| :--- | :--- |
| **Yes** | Code reviewed against spec, confirmed to match |
| **Partial** | Some sections verified, others pending |
| **No** | Not yet verified against code |
| **Stale** | Was verified, but code or spec changed since |

---

## Creating / Updating / Verifying Specs

- **Create:** Use system spec template; add entry here; set status Draft, verified No.
- **Update:** Change spec; set verified Stale if spec changed after last verification.
- **Verify:** Use `.agents/workflows/implement-and-verify.md`; set verified Yes with date; update `docs/quality.md`.

## Current Truth

- Active target: WL6 canonical runtime with deterministic modern asset mapping.
- K0..K12 phases in progress; K8/K9 complete with green gates.

# Architecture

**Last Updated:** 2026-02-13

This document provides a top-level map of the codebase. Read this to understand how the project is organized, where things live, and how the major pieces connect.

## System Overview

This project ports the original Wolfenstein 3D C codebase to TypeScript for browser execution. Correctness is defined by parity with original C behavior. The C implementation is compiled to WebAssembly and used as an oracle; TypeScript ports are verified via property-based testing (fast-check) against the oracle.

## High-Level Architecture

```
Original C (WOLFSRC) --Emscripten--> WASM Oracle --OracleBridge--> Property Tests
                                                     |
                                          TypeScript Ported Systems
```

## Domain Map

| Domain | Code Location | Spec | Description |
| :--- | :--- | :--- | :--- |
| Oracle / Bridge | `src/oracle/`, `scripts/wasm/` | `specs/c-wasm-bridge.md` | C-to-WASM build, export interface, parity harness |
| Runtime | `src/runtime/` | `specs/wl6-modern-runtime-execution-spec.md` | WL6 runtime scenarios, level data, palette, sprites |
| Math / Fixed-point | `src/math/`, `src/wolf/math/` | `specs/math-fixed-point.md` | Fixed-point, tables, projection primitives |
| Map loading | `src/map/`, `src/wolf/map/` | `specs/map-loading.md` | Map decode, cache, load parity |
| Raycasting / Render | `src/render/`, `src/wolf/render/` | `specs/raycasting.md` | Wall/raycast/render behavior |
| Actors / AI | `src/actors/`, `src/wolf/ai/` | `specs/actors-ai.md` | Actor state machines, AI transitions |
| Player | `src/player/`, `src/wolf/player/` | `specs/player-movement.md` | Input, movement, collision, weapons |
| Game state | `src/game/`, `src/wolf/game/` | `specs/game-state.md` | Doors, items, score, lives, intermission |
| Menu / Text | `src/ui/`, `src/wolf/menu/` | `specs/menu-text.md` | Menu and text flow behavior |
| Audio | `src/audio/`, `src/wolf/audio/` | `specs/audio.md` | Audio behavior/state parity |

## Directory Structure

```
wolf3d-typescript/
├── src/                        # Application source
│   ├── app/                    # Game app, runtime controller
│   ├── oracle/                 # Oracle bridge wrappers
│   ├── runtime/                # WL6 runtime, level data, palette, sprites
│   └── wolf/                   # Ported gameplay modules (io, etc.)
├── test/
│   ├── property/               # fast-check parity tests
│   └── smoke/                  # Smoke / browser runtime tests
├── scripts/
│   ├── wasm/                   # Emscripten build, probe
│   └── runtime/                # Manifest, checkpoints, episode, verification
├── specs/                      # Design specifications
├── docs/                       # Project knowledge base
│   ├── architecture.md        # This file
│   ├── core-beliefs.md         # Agent-first operating principles
│   ├── quality.md              # Per-domain quality scorecard
│   └── plans/                  # Execution plans
│       ├── active/             # In-progress plans
│       └── completed/          # Finished plans
├── .agents/workflows/          # Agent workflow definitions
├── AGENTS.md                   # Repository entry point (the map)
└── TODO.md                     # K-phase implementation tracker
```

## Package Layering

- **Runtime** depends on oracle only for test fixtures; production path is pure TS.
- **Oracle** is test-only; never imported by production runtime.
- **Property tests** import both TS port and oracle bridge; assert equivalence.

## Key Files

| File | Purpose |
| :--- | :--- |
| `src/app/gameApp.ts` | Game app entry |
| `src/runtime/tsRuntime.ts` | TS runtime implementation |
| `src/oracle/runtimeOracle.ts` | Oracle bridge for runtime parity |
| `scripts/wasm/build-oracle.sh` | Emscripten oracle build |
| `specs/runtime-symbol-manifest.md` | Required-runtime symbol authority |

## Tech Stack

| Component | Technology | Notes |
| :--- | :--- | :--- |
| Language | TypeScript | 5.9+ |
| Build | Vite | Dev server, production build |
| Testing | Vitest + fast-check | Property-based parity tests |
| Oracle | Emscripten | C → WASM for reference |
| Deployment | Static | Browser bundle |

## Naming Conventions

| Element | Convention | Example |
| :--- | :--- | :--- |
| Files | kebab-case | `wl6-level-data.ts` |
| Functions/Variables | camelCase | `loadMapPlane` |
| Types/Classes | PascalCase | `Wl6LevelData` |
| Constants | UPPER_SNAKE | `TILE_SIZE` |

## Formatting

| Rule | Value |
| :--- | :--- |
| Indentation | 2 spaces |
| Quotes | Double for strings |
| Semicolons | Yes |

## Error Handling

- Preserve C integer semantics (signedness, overflow).
- Deterministic behavior; side-effect boundaries explicit.
- Property test failures must produce reproducible seeds.

## Debugging

- Replay failing seed: `pnpm test:property -- --seed <seed>`
- Replay runtime artifact: `pnpm runtime:replay <artifact.json>`

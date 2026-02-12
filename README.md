# Wolf3D TypeScript Port (Oracle-Driven)

This repository ports Wolfenstein 3D runtime behavior from the original C codebase in `/Users/agrim/Downloads/ai fun projects/wolf3d-master/WOLFSRC` to TypeScript that runs in the browser.

The implementation model is strict parity:

1. Build and use C/WASM oracle wrappers from real WOLFSRC routines.
2. Port runtime behavior to TypeScript function by function.
3. Compare TS output to oracle output with property-based tests (`fast-check` + Vitest).
4. Do not advance phases until gates are green.

## Why This Exists

- Make the game playable in a browser with a pure TypeScript production runtime.
- Preserve WOLFSRC behavior with deterministic, test-first parity evidence.
- Keep long-horizon work agent-friendly using scaffolded specs/TODO/workflows.

## Project Status (Current Truth)

- A substantial parity harness and runtime scaffolding already exist.
- Browser runtime currently runs, but work remains to fully lock authentic WL6 gameplay presentation and progression against parity gates.
- This track now targets canonical WL6 raw lumps plus deterministic modern asset mapping.

## What Was Executed Autonomously

- Agent scaffolding and workflow docs were established (spec index, phase TODO, runtime plans).
- C/WASM bridge and parity harness scripts were wired (`scripts/wasm/*`, `scripts/runtime/*`).
- Multiple parity and smoke test pipelines were added and iterated.
- Runtime and renderer prototype paths were advanced enough for in-browser traversal and debugging.

## Runtime Targets

- Canonical runtime data: WL6 (`MAPHEAD.WL6`, `GAMEMAPS.WL6`, `VSWAP.WL6`) pinned by checksum.
- Modern supplemental assets: `/Users/agrim/Downloads/wolf3d-assets.zip` via deterministic mapping manifests.
- Production runtime: pure TypeScript.
- Oracle runtime: test-only reference.

## Repository Map

- `/Users/agrim/Downloads/ai fun projects/wolf3d-typescript/src/`: runtime, renderer, app, oracle interfaces.
- `/Users/agrim/Downloads/ai fun projects/wolf3d-typescript/specs/`: execution specs, parity strategy, manifests, generated locks.
- `/Users/agrim/Downloads/ai fun projects/wolf3d-typescript/scripts/`: wasm prep/build, runtime verification, CI helpers.
- `/Users/agrim/Downloads/ai fun projects/wolf3d-typescript/test/`: property tests, smoke tests, replay artifacts.
- `/Users/agrim/Downloads/ai fun projects/wolf3d-typescript/assets/`: game assets and validation scripts.

## Commands

- Install deps: `pnpm install`
- Dev app: `pnpm dev`
- Typecheck: `pnpm typecheck`
- Smoke tests: `pnpm test:smoke`
- Property tests: `pnpm test:property`
- Build oracle wasm: `pnpm wasm:build`
- Runtime parity suite: `pnpm runtime:parity:test`
- Full runtime verification: `pnpm runtime:required:verify`
- Docs verification: `pnpm verify:docs`

## Immediate TODO Direction

See `/Users/agrim/Downloads/ai fun projects/wolf3d-typescript/TODO.md` for the active K-phase state machine:

- K0: baseline/reset + README/spec truthing.
- K1-K12: WL6 source lock, asset mapping, parity waves, production swap, CI freeze, merge.

## Notes

- This project intentionally treats “looks close enough” as failing for core runtime behavior.
- Every important parity failure must be reproducible (seed/path + minimized repro JSON).

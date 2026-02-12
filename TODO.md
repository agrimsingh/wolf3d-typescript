# Wolf3D TypeScript Real Runtime TODO (G-Phases)

**Status:** In Progress (`G2` active)  
**Last Updated:** 2026-02-12

## Scope Lock

- Target: gameplay-complete WL1 shareware runtime behavior in browser.
- End state: production gameplay runtime is pure TypeScript; C/WASM is oracle-only.
- Parity policy: deterministic TS-vs-C/WASM parity for all required-runtime behavior.
- Frame policy: per-tic exact indexed framebuffer parity (320x200).
- Phase policy: no advancement before current phase gates are green and phase commit exists.

## Phase Checklist

## G0: Truth Reset + Anti-Synthetic Guard Lock

- [x] Rewrite docs to mark runtime as synthetic baseline, not gameplay-complete.
- [x] Add `specs/wl1-real-runtime-execution-spec.md` as authoritative one-shot plan.
- [x] Strengthen runtime guard scripts for synthetic/runtime-window detection by phase.
- [x] Gate: `pnpm verify`
- [x] Gate: agent-browser confirms explicit prototype baseline banner/state before replacement
- [x] Tests green
- [x] Phase commit pushed (`g0: truth reset and anti-synthetic guards`)

## G1: Deterministic WOLFSRC Source + Asset Baseline

- [x] Pin sanitized WOLFSRC snapshot from `/Users/agrim/Downloads/ai fun projects/wolf3d-master/WOLFSRC` with checksum manifest.
- [x] Ensure `scripts/wasm/prepare-wolfsrc.sh` defaults to vendored source with optional source refresh.
- [x] Validate WL1 assets under `assets/wl1`.
- [x] Gate: `pnpm wasm:verify:compat`
- [x] Gate: `pnpm verify:assets`
- [x] Gate: `pnpm wasm:build`
- [x] Gate: agent-browser verifies menu boots with real assets and no placeholder fallbacks
- [x] Tests green
- [x] Phase commit pushed (`g1: deterministic wolfsrc source and asset baseline`)

## G2: Real Oracle Runtime Driver (No Probe-Synthetic Runtime Semantics)

- [ ] Remove synthetic probe-driven runtime state evolution from `c-oracle/runtime/wolfsrc_runtime_oracle.c` runtime path.
- [ ] Keep probe symbols only for function-level parity coverage.
- [ ] Ensure runtime step/snapshot/framebuffer/save-load are real WOLFSRC-driven.
- [ ] Gate: `pnpm runtime:parity:test`
- [ ] Gate: deterministic replay repeatability suite
- [ ] Gate: agent-browser deterministic trace replay hash equality over repeated runs
- [ ] Tests green
- [ ] Phase commit pushed (`g2: real wolfsrc oracle runtime stepping`)

## G3: Full Runtime Symbol Reclassification From Real Traces

- [ ] Regenerate runtime hits using real menu/gameplay/progression traces.
- [ ] Rebuild `specs/runtime-symbol-manifest.md` from generated artifacts.
- [ ] Enforce zero unclassified symbols.
- [ ] Gate: `pnpm runtime:manifest:extract`
- [ ] Gate: `pnpm runtime:classification:verify`
- [ ] Gate: `pnpm runtime:manifest:verify`
- [ ] Gate: agent-browser trace capture includes menu -> new game -> combat -> exit
- [ ] Tests green
- [ ] Phase commit pushed (`g3: runtime symbol classification from real traces`)

## G4: Replace 8x8 Runtime World Model With Full Map/World State

- [ ] Remove `mapLo/mapHi` world abstraction from production runtime flow.
- [ ] Upgrade `src/runtime/wl1LevelData.ts` and runtime boot contracts to full map planes, true spawn, full connectivity.
- [ ] Preserve deterministic trace seed policy.
- [ ] Gate: map/load parity properties (local 1k / CI 10k where applicable)
- [ ] Gate: agent-browser verifies E1M1 connected topology and non-windowed map context
- [ ] Tests green
- [ ] Phase commit pushed (`g4: full-map runtime world state foundation`)

## G5: TS Port Wave A (Cache/Memory/Map Runtime Paths)

- [ ] Port runtime-required paths from `ID_CA.C`, `ID_MM.C`, `ID_PM.C`, `WL_GAME.C::SetupGameLevel` into active runtime flow.
- [ ] Add per-function property parity tests.
- [ ] Gate: local 1k + CI 10k per function
- [ ] Gate: deterministic representative level-load parity
- [ ] Gate: agent-browser verifies level transitions and setup across multiple maps
- [ ] Tests green
- [ ] Phase commit pushed (`g5: cache-memory-map runtime parity`)

## G6: TS Port Wave B (Real Renderer Pipeline)

- [ ] Replace demo render path in `src/app/gameApp.ts` with runtime framebuffer-driven pipeline.
- [ ] Implement runtime-faithful renderer behavior for `WL_DRAW.C`, `WL_SCALE.C`, `ID_VH.C`, `ID_VL.C` semantics.
- [ ] Include sprites, weapon/status visuals, and texture orientation correctness.
- [ ] Gate: helper-level parity green
- [ ] Gate: per-tic exact indexed framebuffer parity on deterministic traces
- [ ] Gate: agent-browser captures canonical scene set and parity signatures
- [ ] Tests green
- [ ] Phase commit pushed (`g6: renderer pipeline runtime parity`)

## G7: TS Port Wave C (Player, Doors, Pushwalls, Game Loop Core)

- [ ] Port runtime-faithful player/use/fire/collision and door/pushwall/game-loop transitions.
- [ ] Remove synthetic HP countdown/probe side effects from gameplay path.
- [ ] Gate: stateful parity properties for movement/use/fire/door/pushwall/loop
- [ ] Gate: deterministic traces for door interactions, damage/death, level completion
- [ ] Gate: agent-browser scripted flow `move -> open door -> push wall -> pick item -> damage -> survive`
- [ ] Tests green
- [ ] Phase commit pushed (`g7: player-doors-gameloop parity`)

## G8: TS Port Wave D (Actors/AI/Combat)

- [ ] Port runtime-faithful actor state machines and combat transitions from `WL_STATE.C` and `WL_ACT2.C`.
- [ ] Gate: stateful actor tick parity suites
- [ ] Gate: deterministic combat trace parity
- [ ] Gate: agent-browser enemy encounter script validates chase/attack/death flow
- [ ] Tests green
- [ ] Phase commit pushed (`g8: actors-ai-combat parity`)

## G9: TS Port Wave E (Menu/Text/Input/Intermission/Audio State)

- [ ] Port gameplay-complete menu/text/input/intermission/audio behavior-state.
- [ ] Include loading/new game/episode progression paths.
- [ ] Gate: menu/input/audio parity suites
- [ ] Gate: deterministic menu and progression traces
- [ ] Gate: agent-browser `title -> control panel -> new game -> in-game -> intermission -> next level`
- [ ] Tests green
- [ ] Phase commit pushed (`g9: menu-text-input-audio gameplay parity`)

## G10: Production Runtime Swap + Oracle Isolation

- [ ] Production app path uses pure TS runtime only.
- [ ] Oracle/WASM remains test harness only.
- [ ] Remove synthetic scenario-driver and prototype fallback routes.
- [ ] Gate: `pnpm runtime:required:verify`
- [ ] Gate: `pnpm test:smoke`
- [ ] Gate: `pnpm build`
- [ ] Gate: runtime guard scripts all green
- [ ] Gate: agent-browser playable smoke without oracle dependency in production path
- [ ] Tests green
- [ ] Phase commit pushed (`g10: production path on pure ts runtime`)

## G11: Full-Episode Parity Lock + CI Freeze

- [ ] Lock full deterministic WL1 episode traces (per-tic snapshot + frame parity).
- [ ] Harden `.github/workflows/parity-pr.yml` and `.github/workflows/parity-10k.yml` with reproducible triage artifacts.
- [ ] Gate: `pnpm runtime:checkpoints:verify`
- [ ] Gate: `pnpm runtime:episode:verify`
- [ ] Gate: `pnpm runtime:required:verify`
- [ ] Gate: `pnpm test:smoke`
- [ ] Gate: `pnpm build`
- [ ] Gate: 3 consecutive green remote runs for PR + 10k workflows
- [ ] Gate: agent-browser end-to-end scripted episode route checkpoint
- [ ] Tests green
- [ ] Phase commit pushed (`g11: full-episode parity freeze and ci stabilization`)

## G12: Merge + Release Closure

- [ ] Merge branch to `main`.
- [ ] Tag release candidate.
- [ ] Publish evidence bundle in `artifacts/` (screenshots, trace locks, run IDs, repro protocol).
- [ ] Gate: clean tree and all prior phase gates green
- [ ] Gate: final acceptance checklist signed in specs/TODO
- [ ] Gate: agent-browser sanity replay on merged `main`
- [ ] Tests green
- [ ] Phase commit pushed (`g12: merge and gameplay-complete wl1 release baseline`)

## Global Rules

- Do not advance while any current phase gate is red.
- Every required-runtime symbol must have explicit oracle parity test coverage.
- Property thresholds: local `1,000` / CI `10,000` runs per function.
- Every mismatch must log seed/path and persist minimized repro under `test/repro/`.

# Wolf3D TypeScript Runtime Parity TODO (R-Phases)

**Status:** In Progress (`R0` active)  
**Last Updated:** 2026-02-12

## Scope Lock

- Target: gameplay-complete WL1 shareware in browser.
- End state: production gameplay runtime is pure TypeScript; C/WASM is oracle-only.
- Parity policy: deterministic TS-vs-C/WASM parity for all required-runtime behavior.
- Frame policy: per-tic exact indexed framebuffer parity (320x200).
- Phase policy: no advancement before gate is green and phase commit exists.

## Phase Checklist

## R0: Truth Reset + Guard Hardening

- [x] Rewrite project docs to reflect synthetic-harness reality (not complete runtime parity).
- [x] Add `specs/runtime-parity-execution-spec.md` as authoritative plan.
- [x] Extend guard scripts to block synthetic scenario fixtures in production path at/after R9.
- [x] Gate: `pnpm verify`
- [x] Tests green
- [ ] Phase commit pushed (`r0: truth reset and execution baseline`)

## R1: Real WL1 Data Pipeline

- [ ] Implement canonical map-plane decode + runtime boot extraction from WL1 assets.
- [ ] Remove 8x8 sampled map-bit runtime boot assumptions.
- [ ] Define deterministic trace seed policy for real gameplay traces.
- [ ] Gate: `pnpm test:property:local -- test/property/phase2.map-loading.test.ts`
- [ ] Gate: `pnpm test:property:ci -- test/property/phase2.map-loading.test.ts`
- [ ] Gate: `pnpm verify:assets`
- [ ] Tests green
- [ ] Phase commit pushed (`r1: wl1 data pipeline parity`)

## R2: Real C Runtime Oracle Driver

- [ ] Replace synthetic runtime state engine in `c-oracle/runtime/wolfsrc_runtime_oracle.c`.
- [ ] Drive real WOLFSRC runtime stepping/snapshot/framebuffer/save-load from oracle exports.
- [ ] Keep wrappers for oracle/test interfaces only.
- [ ] Gate: `pnpm wasm:build`
- [ ] Gate: `pnpm runtime:parity:test`
- [ ] Gate: deterministic replay equality for repeated traces
- [ ] Tests green
- [ ] Phase commit pushed (`r2: real wolfsrc runtime oracle`)

## R3: Runtime Symbol Reclassification From Real Traces

- [ ] Regenerate runtime hits using real runtime menu/gameplay/progression traces.
- [ ] Rebuild `specs/runtime-symbol-manifest.md` from artifacts.
- [ ] Ensure all inventory entries remain classified with explicit evidence.
- [ ] Gate: `pnpm runtime:manifest:extract`
- [ ] Gate: `pnpm runtime:classification:verify`
- [ ] Gate: `pnpm runtime:manifest:verify`
- [ ] Tests green
- [ ] Phase commit pushed (`r3: real-runtime symbol classification freeze`)

## R4: TS Port Wave A (Map/Memory/Cache Runtime Paths)

- [ ] Port runtime-required behavior from `ID_CA.C`, `ID_MM.C`, `ID_PM.C`, `WL_GAME.C::SetupGameLevel`.
- [ ] Add per-function property parity tests mapped to manifest entries.
- [ ] Gate: local 1k + CI 10k parity for all R4 functions
- [ ] Gate: deterministic representative level-load trace parity
- [ ] Tests green
- [ ] Phase commit pushed (`r4: map-memory-cache runtime parity`)

## R5: TS Port Wave B (Renderer Core)

- [ ] Port runtime-faithful renderer behavior from `WL_DRAW.C`, `WL_SCALE.C`, `ID_VH.C`, `ID_VL.C`.
- [ ] Verify deterministic indexed framebuffer output semantics.
- [ ] Gate: function-level parity suites green
- [ ] Gate: per-tic exact indexed framebuffer parity on deterministic traces
- [ ] Tests green
- [ ] Phase commit pushed (`r5: renderer runtime parity`)

## R6: TS Port Wave C (Player, Doors, Game Loop)

- [ ] Port runtime transitions from `WL_AGENT.C`, `WL_PLAY.C`, `WL_ACT1.C`, `WL_GAME.C`, `WL_INTER.C`.
- [ ] Remove synthetic HP countdown/revive behavior from runtime path.
- [ ] Gate: property parity suites for movement/use/fire/door/game-loop functions
- [ ] Gate: deterministic door/level-completion traces
- [ ] Tests green
- [ ] Phase commit pushed (`r6: player-doors-gameloop parity`)

## R7: TS Port Wave D (Actors/AI + Combat)

- [ ] Port actor/AI runtime transitions from `WL_STATE.C` and `WL_ACT2.C`.
- [ ] Add deterministic combat encounter parity traces.
- [ ] Gate: stateful actor tick parity tests
- [ ] Gate: deterministic combat trace parity
- [ ] Tests green
- [ ] Phase commit pushed (`r7: actors-ai-combat parity`)

## R8: TS Port Wave E (Menu/Text/Input/Audio State)

- [ ] Port runtime-required behavior from `WL_MENU.C`, `WL_TEXT.C`, `ID_US_1.C`, `ID_IN.C`, `ID_SD.C`.
- [ ] Keep audio parity at behavior/state level.
- [ ] Gate: deterministic menu/input trace parity
- [ ] Gate: deterministic audio state transition parity
- [ ] Tests green
- [ ] Phase commit pushed (`r8: menu-input-audio parity`)

## R9: Browser Runtime Swap to Pure TS Core

- [ ] Switch production gameplay path to TS runtime core.
- [ ] Keep oracle/WASM usage in tests only.
- [ ] Remove synthetic scenario-driver gameplay path from app runtime loop.
- [ ] Gate: agent-browser flow (boot -> menu -> start -> move -> door -> enemy -> fire -> damage -> exit)
- [ ] Tests green
- [ ] Phase commit pushed (`r9: browser app on ts runtime core`)

## R10: Full Episode Parity + CI Freeze

- [ ] Lock full deterministic WL1 episode traces (per-tic snapshot + indexed frame exact parity).
- [ ] Harden PR/nightly CI workflows and triage artifacts.
- [ ] Gate: `pnpm runtime:required:verify`
- [ ] Gate: `pnpm runtime:checkpoints:verify`
- [ ] Gate: `pnpm runtime:episode:verify`
- [ ] Gate: `pnpm test:smoke`
- [ ] Gate: `pnpm build`
- [ ] Gate: 3 consecutive green remote runs on `parity-pr.yml` and `parity-10k.yml`
- [ ] Tests green
- [ ] Phase commit pushed (`r10: wl1 gameplay-complete parity freeze`)

## Global Rules

- Do not advance phases while any current phase gate is red.
- Every required-runtime function needs explicit oracle parity test coverage.
- Property thresholds: local `1,000` / CI `10,000` runs per function.
- Every parity mismatch must emit seed/path and write repro under `test/repro/`.

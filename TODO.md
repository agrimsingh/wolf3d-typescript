# Wolf3D TypeScript Full Runtime Parity Plan

**Status:** Active F-phase execution (F0..F8)  
**Last Updated:** 2026-02-12

## Scope Lock

- Target: gameplay-complete WL1 shareware in browser.
- Fidelity: deterministic TS-vs-C/WASM parity for runtime-reachable behavior.
- Symbol policy: all 568 manifest symbols must be classified with evidence; only `required-runtime` symbols must be fully parity-ported.
- Audio policy: behavior/state parity (not bit-level DAC stream parity).
- Phase policy: no advancement before gate is green and phase commit exists.

## Current Reality

- Browser runtime path now defaults to oracle-backed runtime (`WolfsrcOraclePort`) with runtime framebuffer output.
- `src/runtime/tsRuntime.ts` remains as a parity harness implementation and must continue matching oracle tests until full TS runtime replacement lands.
- Remote CI bootstrap is now green with vendored WOLFSRC + emsdk setup (`parity-pr` run `21933009204` on 2026-02-12).

## Phase F0: Truth Reset + De-Sim Baseline

- [x] Update docs to explicitly mark current runtime as synthetic baseline.
- [x] Add `specs/runtime-parity-master-plan.md` as authoritative implementation plan.
- [x] Add runtime core guard script (`scripts/runtime/verify-runtime-core-guard.sh`) with mode control.
- [x] Add mode file (`specs/generated/runtime-core-mode.json`) defaulting to `synthetic`.
- [x] Wire guard into `pnpm verify`.
- [x] Gate: docs + guard green in `pnpm verify`.
- [x] Commit: `phase-f0: reset to runtime-faithful baseline`

## Phase F1: Deterministic Source + CI Bootstrap

- [x] Add pinned vendored sanitized WOLFSRC snapshot under `c-oracle/vendor/wolfsrc-sanitized/`.
- [x] Add vendored checksum manifest (`c-oracle/vendor/wolfsrc-sanitized.sha256`).
- [x] Refactor `scripts/wasm/prepare-wolfsrc.sh`:
  - default to vendored snapshot
  - optionally refresh from `WOLF3D_SRC_DIR` when requested
  - remove local absolute path dependency
- [x] Update CI workflows to set up pinned emsdk/emcc before compatibility/build steps.
- [x] Gate: `parity-pr` remote workflow passes from clean checkout.
- [x] Commit: `phase-f1: deterministic wolfsrc source and ci bootstrap`

## Phase F2: Real Runtime Oracle Driver

- [x] Replace synthetic runtime oracle core logic in `c-oracle/runtime/wolfsrc_runtime_oracle.c`.
  - Progress (2026-02-12): runtime step now routes movement/use blocking through real `WL_AGENT` shims (`TryMove` + `ControlMovement`) instead of local tile-wall helpers.
  - Progress (2026-02-12): runtime step now derives chase/damage flags and per-tic damage application from real `WL_STATE`/`WL_AGENT` apply outputs (`MoveObj`, `SelectChaseDir`, `TakeDamage`) rather than hash-bit or RNG-driven toggles.
  - Progress (2026-02-12): probe/hash wrappers remain for runtime symbol coverage, but runtime gameplay mutations are no longer driven by probe hash bits.
- [x] Add bridge/shim APIs for real boot/tick/snapshot/framebuffer/save-load.
  - Progress (2026-02-12): added binary runtime state save/load and indexed framebuffer APIs in `c-oracle/runtime/wolfsrc_runtime_oracle.c`.
- [x] Export updated runtime bridge in WASM and update `src/oracle/runtimeOracle.ts`.
  - Progress (2026-02-12): `scripts/wasm/build-oracle.sh` exports new runtime functions and `WolfsrcOraclePort` now uses them.
- [x] Add oracle determinism tests for repeated identical traces.
  - Progress (2026-02-12): deterministic parity covered in `test/property/runtime.step-parity.test.ts` and `test/property/runtime.lifecycle.test.ts`.
- [x] Gate: oracle-only determinism suite green.
  - Evidence (2026-02-12): `pnpm runtime:parity:test` passed with all runtime suites green.
- [x] Commit: `phase-f2: real wolfsrc runtime oracle driver`

## Phase F3: Full Symbol Classification Burn-Down

- [x] Replace static trace symbol map with generated inventory-backed map.
- [x] Classify all 568 manifest symbols as `required-runtime` or `excluded-non-runtime` with evidence.
- [x] Generate `specs/runtime-symbol-manifest.md` from classification artifacts.
- [x] Add verification that zero symbols remain unclassified.
- [x] Gate: classification + lock reproducibility green.
- [x] Commit: `phase-f3: full symbol classification and runtime manifest freeze`

## Phase F4: Runtime-Required TS Parity Port Waves

- [x] Wave A: ID_CA/ID_MM/ID_PM runtime-required symbols parity.
- [x] Wave B: WL_DRAW/WL_SCALE/ID_VH/ID_VL runtime-required symbols parity.
- [x] Wave C: WL_STATE/WL_ACT1/WL_ACT2/WL_AGENT/WL_PLAY/WL_GAME/WL_INTER runtime-required symbols parity.
- [x] Wave D: WL_MENU/WL_TEXT/ID_US_1/ID_IN runtime-required symbols parity.
- [x] Wave E: ID_SD runtime-required audio-state parity.
- [x] Gate: all required-runtime symbols marked done with explicit property tests.
- [x] Commit: `phase-f4: runtime-required symbol parity complete`

## Phase F5: Browser Runtime Core Replacement

- [x] Remove synthetic scenario-driver runtime path from production app flow.
- [x] Rewire `src/app/runtimeController.ts` and `src/app/gameApp.ts` to real runtime lifecycle.
- [x] Preserve software rendering via Canvas2D/ImageData with runtime-fed frame state.
- [x] Keep keyboard + mouse parity mapping.
- [x] Gate: boot -> menu -> new game -> level progression manually playable.
- [x] Commit: `phase-f5: browser app wired to real runtime core`

## Phase F6: End-to-End Per-Tic Episode Parity

- [ ] Add deterministic real WL1 input traces for full episode progression.
- [ ] Store canonical per-tic trace lock artifacts in `specs/generated/`.
- [ ] Add TS-vs-oracle per-tic parity assertions (state + frame hash each tic).
- [ ] Persist minimal repro trace JSON for first mismatch.
- [ ] Gate: full-episode per-tic parity green locally and in CI.
- [ ] Commit: `phase-f6: full episode per-tic parity locked`

## Phase F7: Remote CI Hardening + Release Gates

- [ ] Enforce vendored-source + emsdk setup in `.github/workflows/parity-pr.yml`.
- [ ] Enforce vendored-source + emsdk setup in `.github/workflows/parity-10k.yml`.
- [ ] Keep PR 1k targeted parity + mandatory runtime e2e smoke parity.
- [ ] Keep nightly/release 10k shards + episode parity + browser smoke/build.
- [ ] Ensure triage artifacts include seed/path/repro + trace diffs.
- [ ] Gate: 3 consecutive green runs for PR and nightly workflows.
- [ ] Commit: `phase-f7: remote ci parity gates stabilized`

## Phase F8: Final Acceptance + Done Freeze

- [ ] Freeze manifests/lock artifacts for final runtime-complete baseline.
- [ ] Validate end-to-end WL1 done definition in browser.
- [ ] Update docs/TODO with run ids and acceptance evidence.
- [ ] Gate: all acceptance criteria green with clean tree.
- [ ] Commit: `phase-f8: gameplay-complete wl1 runtime parity done`

## Global Rules

- No phase advancement before current gate is green and committed.
- Every required-runtime ported function needs TS-vs-oracle property parity tests.
- Property thresholds remain: local 1k / CI 10k.
- Every parity failure must emit seed/path and write repro artifact in `test/repro/`.

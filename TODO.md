# Wolf3D TypeScript Runtime-Complete Execution Plan

**Status:** Phase R5 in progress (tick + frame fidelity lock)
**Last Updated:** 2026-02-12

## Scope Lock

- Target: Full WL1 shareware gameplay-complete browser port.
- Fidelity: Deterministic tick-state parity + frame-hash checkpoint parity.
- Symbol policy: Runtime-path symbols only (derived from traced execution), not dead/debug-only paths.
- Portability policy: Modernized low-level internals allowed, gameplay behavior must match oracle.
- CI policy: PR `1k` runs, nightly/release sharded `10k` runs.

## Legacy Status (Superseded)

The previous phase `0..8` completion tracks prototype oracle parity wrappers and does **not** represent full WOLFSRC runtime completion.

## Phase R0: Recovery Reset to Runtime Truth

- [x] Add `specs/runtime-gap-assessment.md` with objective gaps from current prototype to runtime-complete state.
- [x] Add `specs/runtime-symbol-manifest.md` as authoritative runtime-path symbol tracker.
- [x] Update specs/workflows/TODO to R-phase model and runtime acceptance gates.
- [x] Mark old completion claims as superseded in docs.
- [x] Gate: docs reflect runtime reality and new phase model.
- [x] Commit: `phase-r0: reset baseline for full wl1 gameplay parity`

## Phase R1: Real WOLFSRC Oracle Bring-Up + Portability Layer

- [x] Add compatibility layer for DOS/BIOS/asm-era includes and calling conventions.
- [x] Add runtime oracle entrypoints (`init/reset/step/snapshot/render/serialize`).
- [x] Build real WOLFSRC runtime path to WASM (not synthetic hash wrappers).
: Completed baseline: compatibility pipeline now compiles all runtime-target files in probe (`18/18` pass via `pnpm wasm:verify:compat`), oracle links real `WL_STATE.C` + `WL_AGENT.C`, exports real wrappers `oracle_real_wl_state_check_line`, `oracle_real_wl_state_check_sight`, `oracle_real_wl_state_move_obj_hash`, `oracle_real_wl_state_select_chase_dir_hash`, `oracle_real_wl_agent_try_move`, `oracle_real_wl_agent_clip_move_hash`, and runtime step movement routes through real `WL_AGENT.ClipMove` (q8<->q16 bridge) with property gates green at `1k/10k`.
- [x] Add deterministic reset and state serialization API.
- [x] Gate: oracle boots, steps deterministically, can snapshot state.
- [x] Commit: `phase-r1: real wolfsrc oracle runtime + portability layer`

## Phase R2: Runtime-Path Symbol Discovery and Freeze

- [x] Instrument oracle with symbol hit tracing.
- [x] Run deterministic traces across menu/gameplay for all WL1 maps.
: Deterministic trace harness runs via `pnpm runtime:manifest:extract` against real WL1 assets (`MAPHEAD.WL1`/`GAMEMAPS.WL1`) for all 10 shareware maps, and includes a deterministic menu-flow digest (`3960187756`) generated from real menu/text oracle wrappers.
- [x] Generate runtime-path symbol set from actual execution.
- [x] Freeze runtime symbol manifest (`required` vs `excluded-non-runtime`).
- [x] Gate: runtime-path manifest locked and reproducible from trace tooling.
: `pnpm runtime:manifest:verify` now enforces lock parity (`specs/generated/runtime-symbol-lock.json`) against regenerated trace output and is green; full gates also green (`pnpm verify`, `pnpm test:property:ci`).
- [x] Commit: `phase-r2: lock runtime symbol manifest from wl1 traces`

## Phase R3: Deterministic Runtime Contracts + Harness

- [x] Add `RuntimePort` contract for oracle and TS runtimes.
- [x] Build parity harness for step parity and frame parity.
: Added reusable runtime trace/parity harness in `src/runtime/parityHarness.ts`, with runtime property tests moved to harness-based comparisons for step/frame/snapshot parity.
- [x] Add deterministic replay tooling and artifact capture.
: Added runtime repro artifact writer (`test/property/runtimeRepro.ts`) and replay script (`pnpm runtime:replay <artifact.json>`).
- [x] Gate: replay determinism and oracle self-consistency validated.
: Green on `pnpm verify`, `pnpm test:property:ci`, `pnpm runtime:manifest:verify`, and `pnpm runtime:parity:test`; runtime suite now includes explicit oracle and TS self-consistency checks.
- [x] Commit: `phase-r3: deterministic runtime contracts + parity harness`

## Phase R4: Runtime-Path Function Porting (Manifest-Driven)

- [x] Port runtime-path functions subsystem by subsystem.
: Runtime-path APIs listed in `specs/runtime-symbol-manifest.md` are implemented in TS runtime + oracle port layers and exercised through shared parity harness.
- [x] For every function: TS port + property parity test + green local gate.
: Added required-runtime function parity suite (`test/property/runtime.required-symbols.test.ts`) and marked all required symbols `done` in the frozen manifest.
- [x] Enforce no prototype fallback in runtime execution path.
: Added guard script `scripts/runtime/verify-no-prototype-fallback.sh` and gate command `pnpm runtime:required:verify`.
- [x] Gate: all required runtime symbols marked complete with parity tests.
: Green on `pnpm runtime:required:verify`, `pnpm verify`, and `pnpm test:property:ci` (1k/10k property gates).
- [x] Commit: `phase-r4: runtime-path symbol parity complete`

## Phase R5: Tick + Frame Fidelity Lock

- [ ] Add checkpointed frame hashing from software framebuffer.
- [ ] Run deterministic tick parity and frame-hash parity across map fixtures.
- [ ] Gate: no drift on parity checkpoints.
- [ ] Commit: `phase-r5: tick and frame hash parity locked`

## Phase R6: Browser Runtime Integration

- [ ] Replace prototype app path with real runtime integration.
- [ ] Wire WL1 assets + input + menu + audio adapters to runtime core.
- [ ] Add browser smoke tests for boot/menu/new-game/level transitions.
- [ ] Gate: browser runtime fully playable for WL1 flow.
- [ ] Commit: `phase-r6: browser runtime integration complete`

## Phase R7: End-to-End WL1 Episode Parity Acceptance

- [ ] Build deterministic traces for all WL1 maps.
- [ ] Validate full episode parity checkpoints (state + frame hashes).
- [ ] Gate: all-map + full-episode acceptance green.
- [ ] Commit: `phase-r7: full wl1 episode parity acceptance`

## Phase R8: CI Hardening + Release Gating

- [ ] Add sharded nightly/release `10k` parity jobs.
- [ ] Keep PR gate at `1k` with changed-symbol selection.
- [ ] Add reproducible triage artifacts for parity failures.
- [ ] Gate: stable CI over full runtime-path suite.
- [ ] Commit: `phase-r8: parity ci hardening and release gates`

## Global Rules

- No phase advancement before current phase gate is green and committed.
- Runtime-path manifest is authoritative for required function parity.
- Every parity failure must emit seed/path and minimized repro artifact.
- No approximate parity assertions in runtime-complete phases.

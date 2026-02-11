# Wolf3D TypeScript Runtime-Complete Execution Plan

**Status:** Phase R0 in progress (truthful runtime reset)
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

- [ ] Add `specs/runtime-gap-assessment.md` with objective gaps from current prototype to runtime-complete state.
- [ ] Add `specs/runtime-symbol-manifest.md` as authoritative runtime-path symbol tracker.
- [ ] Update specs/workflows/TODO to R-phase model and runtime acceptance gates.
- [ ] Mark old completion claims as superseded in docs.
- [ ] Gate: docs reflect runtime reality and new phase model.
- [ ] Commit: `phase-r0: reset baseline for full wl1 gameplay parity`

## Phase R1: Real WOLFSRC Oracle Bring-Up + Portability Layer

- [ ] Add compatibility layer for DOS/BIOS/asm-era includes and calling conventions.
- [ ] Add runtime oracle entrypoints (`init/reset/step/snapshot/render/serialize`).
- [ ] Build real WOLFSRC runtime path to WASM (not synthetic hash wrappers).
- [ ] Add deterministic reset and state serialization API.
- [ ] Gate: oracle boots, steps deterministically, can snapshot state.
- [ ] Commit: `phase-r1: real wolfsrc oracle runtime + portability layer`

## Phase R2: Runtime-Path Symbol Discovery and Freeze

- [ ] Instrument oracle with symbol hit tracing.
- [ ] Run deterministic traces across menu/gameplay for all WL1 maps.
- [ ] Generate runtime-path symbol set from actual execution.
- [ ] Freeze runtime symbol manifest (`required` vs `excluded-non-runtime`).
- [ ] Gate: runtime-path manifest locked and reproducible from trace tooling.
- [ ] Commit: `phase-r2: lock runtime symbol manifest from wl1 traces`

## Phase R3: Deterministic Runtime Contracts + Harness

- [ ] Add `RuntimePort` contract for oracle and TS runtimes.
- [ ] Build parity harness for step parity and frame parity.
- [ ] Add deterministic replay tooling and artifact capture.
- [ ] Gate: replay determinism and oracle self-consistency validated.
- [ ] Commit: `phase-r3: deterministic runtime contracts + parity harness`

## Phase R4: Runtime-Path Function Porting (Manifest-Driven)

- [ ] Port runtime-path functions subsystem by subsystem.
- [ ] For every function: TS port + property parity test + green local gate.
- [ ] Enforce no prototype fallback in runtime execution path.
- [ ] Gate: all required runtime symbols marked complete with parity tests.
- [ ] Commit: `phase-r4: runtime-path symbol parity complete`

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

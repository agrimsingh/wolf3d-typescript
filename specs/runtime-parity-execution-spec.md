# One-Pass Autonomous Execution Spec: WL1 Gameplay-Complete TS Runtime Parity

> Superseded by `specs/wl1-real-runtime-execution-spec.md` for active `G0..G12` execution.

## Summary

This runbook defines the strict no-skip execution path from the current synthetic parity harness to a real gameplay-complete WL1 TypeScript runtime.

## Execution Policy

1. Work on branch `codex/wl1-runtime-r0-r10` (or `main` if branching is disallowed).
2. Do not start a phase until previous phase gate is green.
3. Commit once per completed phase, immediately after gate passes.
4. Use oracle/WASM only as reference oracle, never final production runtime.
5. Use `agent-browser` for browser acceptance in R9 and R10.
6. No approximation assertions in core runtime parity.

## Public API / Interface Changes

1. `src/runtime/contracts.ts`
 - define `RuntimeBootParams`, `RuntimeFrameInput`, `RuntimeCoreSnapshot`, `RuntimeFramebufferView`, `RuntimeSaveBlob`, `RuntimePort`
2. `src/oracle/types.ts`
 - add `OracleRuntimeExportId`, `OracleFunctionManifestEntry`, `OracleTraceRecord`, `OracleTraceDiff`, `ParityEvidenceRef`
3. `src/wolf/state/types.ts`
 - canonical mirrors for runtime-relevant C structs with deterministic normalize/serialize helpers
4. `src/wolf/io/types.ts`
 - WL1 asset package/index/decode contracts for map, VSWAP, VGA, audio metadata
5. `src/runtime/wl1RuntimeScenarios.ts`
 - replace 8x8 synthetic scenario model with deterministic real-runtime trace fixtures

## Phase Plan (R0-R10)

1. R0: Truth reset + guard hardening
2. R1: Real WL1 data pipeline
3. R2: Real C runtime oracle driver
4. R3: Runtime symbol reclassification from real traces
5. R4: TS port wave A (map/memory/cache runtime paths)
6. R5: TS port wave B (renderer core)
7. R6: TS port wave C (player/doors/game loop)
8. R7: TS port wave D (actors/AI/combat)
9. R8: TS port wave E (menu/text/input/audio state)
10. R9: Browser runtime swap to pure TS core
11. R10: Full episode parity + CI freeze

## Exact Test / Gate Standard

1. Function-level parity: local `1k`, CI `10k` per required-runtime function.
2. Trace-level parity: deterministic per-tic state + full 320x200 indexed frame exact compare.
3. Repro standard: every failure logs seed/path and writes minimized repro JSON under `test/repro/`.

## Agent-Browser Acceptance (R9/R10)

1. Start app: `pnpm dev --host 127.0.0.1 --port 4173`
2. Drive deterministic flow with `agent-browser`:
 - boot -> menu -> start game -> move -> open door -> engage enemy -> fire -> take damage -> exit
3. Capture artifacts:
 - screenshots in `artifacts/`
 - runtime trace JSON in `specs/generated/`
 - mismatch diffs in `test/repro/`

## Project-Scaffold Control Plane

1. `TODO.md` is the phase state machine.
2. `specs/runtime-parity-execution-spec.md` is authoritative execution spec.
3. `.agents/workflows/implement-and-verify.md` enforces per-function parity loop and no phase skipping.

## Assumptions and Defaults

1. Target is WL1 shareware assets in `assets/wl1/`.
2. Final runtime is pure TS in production.
3. Oracle/WASM is reference-only for parity checks.
4. Renderer target remains software + Canvas2D.
5. Audio parity is behavior/state, not DAC-byte identity.

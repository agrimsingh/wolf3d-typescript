# Full WOLFSRC Runtime Parity Master Plan

## Summary

The current runtime is parity-checked but still synthetic. The objective is a gameplay-complete WL1 browser port with deterministic TS-vs-C/WASM parity for all runtime-reachable WOLFSRC behavior.

## Locked Decisions

1. WOLFSRC source is vendored and checksum-verified in-repo.
2. All `568` manifest symbols must be classified with evidence into `required-runtime` or `excluded-non-runtime`.
3. Audio completion requires behavior/state parity, not bit-level DAC parity.

## Required API Changes

1. `src/runtime/contracts.ts`
 - introduce `RuntimeFrameInput`, `RuntimeCoreSnapshot`, `RuntimeFramebufferView`
 - evolve `RuntimePort` lifecycle APIs toward real runtime contracts
2. `src/oracle/types.ts`
 - add runtime export identifiers and symbol-manifest parity metadata types
 - add per-tic `OracleTraceRecord` parity structures
3. `src/wolf/state/types.ts`
 - add canonical runtime-relevant C-struct mirrors and deterministic normalize helpers
4. `src/wolf/io/types.ts`
 - add validated WL1 package metadata + decode/index contract types

## Phases

1. F0: truth reset + de-sim baseline
2. F1: deterministic source + CI bootstrap
3. F2: real runtime oracle driver
4. F3: symbol instrumentation + full classification
5. F4: runtime-required TS parity port waves
6. F5: browser runtime core replacement
7. F6: full episode per-tic parity traces
8. F7: remote CI hardening + release gates
9. F8: final acceptance + done freeze

## Gate Rules

- No phase advancement without green gates and a phase commit.
- Function-level parity is mandatory for every required-runtime symbol.
- Property gates remain: `1k` local / `10k` CI.
- Every mismatch must emit seed/path and write a repro artifact.

## Completion Definition

The project is complete only when the browser runtime is gameplay-complete for WL1 and deterministic TS-vs-oracle parity gates pass for runtime-reachable behavior, including full-episode per-tic parity in CI.

# Runtime Gap Assessment (Synthetic Runtime -> Full WOLFSRC Runtime Parity)

## Objective

Track the gap from synthetic runtime behavior to runtime-faithful WL1 browser parity against WOLFSRC, and capture closure evidence.

## Current Reality (2026-02-12, F8)

1. Browser runtime defaults to real oracle-backed runtime (`WolfsrcOraclePort`) with deterministic framebuffer output and runtime snapshots.
2. Runtime symbol inventory is fully classified (`568` total, `required=130`, `excluded=438`, `unclassified=0`) with generated artifacts under `specs/generated/`.
3. Runtime-required parity coverage gates are enforced by property suites and manifest verification tooling.
4. Deterministic checkpoint and full-episode per-tic parity locks are in place and verified (`runtime-checkpoints` and `runtime-episode-checkpoints` lock files).
5. CI is reproducible from clean checkout using vendored WOLFSRC and pinned emsdk setup.

## Closed Gaps

- Replaced synthetic runtime C driver behavior with real WOLFSRC-backed runtime stepping/snapshotting APIs.
- Replaced static/manual runtime symbol manifest mapping with generated, evidence-based classification.
- Wired browser production path to runtime-backed frame output and lifecycle flow.
- Added deterministic full-episode trace locks and replay-ready parity checks.
- Stabilized PR and nightly parity workflows with reproducible artifact collection and triage summaries.

## Residual Scope (Outside This F-Phase Completion)

- `src/runtime/tsRuntime.ts` remains a parity harness implementation and is not the production runtime driver.
- WL6/Spear of Destiny variants remain out of scope for this WL1 completion track.
- Audio parity remains behavior/state-level, not bit-level DAC stream equivalence.

## Acceptance Evidence for Gap Closure

- All F-phases (`F0..F8`) completed with phase commits.
- Runtime classification and required-symbol parity verification pass.
- Full-episode per-tic parity lock verification passes locally and in CI.
- CI hardening gate satisfied by three consecutive green runs for both:
  - `parity-pr`: `21942569861`, `21942444879`, `21942313625`
  - `parity-10k`: `21942620377`, `21942620230`, `21935039117`

# Runtime Gap Assessment (Synthetic Runtime -> Full WOLFSRC Runtime Parity)

## Objective

Document the concrete gaps between current synthetic runtime behavior and full runtime-faithful WL1 browser gameplay parity against WOLFSRC.

## Current Reality (2026-02-12)

1. The browser app boots/renders and supports menu/start flow, but runtime gameplay core is still synthetic (`src/runtime/tsRuntime.ts`) rather than real WOLFSRC runtime logic.
2. Runtime parity currently validates wrapper-level runtime APIs and checkpoint artifacts, not full runtime-reachable symbol coverage.
3. Full inventory-wide symbol classification now exists (`specs/generated/wolfsrc-runtime-classification.json`, `568` symbols), but evidence is still derived from synthetic-runtime trace scenarios and must be revalidated after real runtime core replacement.
4. CI failed remotely because WOLFSRC preparation referenced a local absolute path; deterministic vendored source flow is required.
5. The oracle runtime driver (`c-oracle/runtime/wolfsrc_runtime_oracle.c`) still includes synthetic step/state logic and needs replacement with real runtime driver behavior.

## Required End-State

1. Real WOLFSRC runtime driver compiled to WASM with deterministic lifecycle APIs (`bootWl1`, `stepFrame`, `snapshot`, `framebuffer`, `saveState`, `loadState`).
2. Full-symbol inventory classification with evidence: every symbol marked `required-runtime` or `excluded-non-runtime`.
3. TS implementation parity-complete for all `required-runtime` symbols, with function-level property tests.
4. Deterministic per-tic WL1 episode parity (state + frame hash), not only fixture checkpoints.
5. Browser runtime fully driven by runtime-faithful core with keyboard/mouse parity and episode progression flow.

## Hard Technical Gaps

- Oracle runtime core replacement from synthetic tick model to real runtime state transitions.
- Deterministic source and toolchain reproducibility in local + CI environments.
- Runtime-wide symbol instrumentation + classification pipeline with objective evidence.
- Per-tic trace capture and replay for full episode parity.
- Browser runtime integration that consumes real runtime core outputs end-to-end.

## Non-Goals

- WL6/SOD runtime completion in this execution track.
- Bit-level DAC sample parity for DOS-era audio hardware emulation.

## Acceptance Criteria for Gap Closure

- All F-phases (`F0..F8`) complete with green gates and required phase commits.
- `specs/runtime-symbol-manifest.md` has zero unclassified symbols.
- All `required-runtime` symbols are parity-complete with explicit property tests.
- Full-episode per-tic parity gates pass locally and in CI release workflows.

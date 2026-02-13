# WL6 Full Runtime Hardening One-Shot (Completed)

Date: 2026-02-13
Branch: `codex/wl6-full-hardening`

## Scope Delivered

1. Canonical WL6 plane1 marker classification and runtime usage.
2. Pickup/dead-guard/pushwall semantics hardening in full-map runtime.
3. Palette/sprite-visibility deterministic regression coverage.
4. Deterministic browser scene-check harness using `agent-browser`.
5. One-shot orchestrator for rerunnable staged verification and commit flow.

## Stage Gates

1. H1: `pnpm typecheck` + actor/full-map property tests.
2. H2: full-map interactions + actor sprite render + smoke.
3. H3: WL6 palette + actor sprite render + typecheck.
4. H4: smoke + deterministic browser scene check script.
5. H5: runtime parity + required runtime verify + smoke + browser scene check.

## Artifacts

1. Browser scenes and hashes:
 - `artifacts/one-shot-hardening/browser/scenes/`
 - `artifacts/one-shot-hardening/browser/hash-manifest.json`
 - `artifacts/one-shot-hardening/browser/hash-manifest.lock.json`
2. Stage logs:
 - `artifacts/one-shot-hardening/logs/`

## Scripts

1. Browser deterministic check:
 - `scripts/one-shot/run-wl6-browser-scene-check.sh`
2. Full one-shot orchestration:
 - `scripts/one-shot/run-wl6-full-hardening.sh`

## Notes

1. Browser scene capture is deterministic at fixed viewport and scripted input path, and hash drift is treated as a gate failure once lock manifest exists.
2. Existing unrelated worktree changes were preserved and not reverted.

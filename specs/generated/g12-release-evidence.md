# G12 Release Evidence

Date: 2026-02-12  
Branch merged to `main`: `codex/wl1-real-runtime-one-shot`  
Head SHA at closure: `d0a63dbceb6896f5db93888a8e22c1880f3c3e21`

## Local Acceptance Gates

All commands executed on `main` and passed:

1. `pnpm runtime:required:verify`
2. `pnpm runtime:checkpoints:verify`
3. `pnpm runtime:episode:verify`
4. `pnpm test:smoke`
5. `pnpm build`

## Remote CI Evidence

### parity-pr (3 consecutive successful attempts)

- Run: <https://github.com/agrimsingh/wolf3d-typescript/actions/runs/21956014888>
- Attempts: 1, 2, 3 all `success` on SHA `d0a63db...`

### parity-10k (3 consecutive successful runs)

1. <https://github.com/agrimsingh/wolf3d-typescript/actions/runs/21956285908> (`success`)
2. <https://github.com/agrimsingh/wolf3d-typescript/actions/runs/21956472111> (`success`)
3. <https://github.com/agrimsingh/wolf3d-typescript/actions/runs/21956641931> (`success`)

Note: run `21956653965` was an accidental duplicate dispatch and was canceled after round-3 success.

## Browser Sanity Replay (Merged Main)

Artifacts (local, under ignored `artifacts/`):

- Screenshot: `artifacts/g12-agent-browser-main-sanity.png`
- Trace JSON: `artifacts/g12-agent-browser-main-sanity-trace.json`

Trace summary:

- Booted to playing map 0.
- Completed level transition checkpoint.
- Ended in playing mode on map 1.

## Repro Protocol

- Runtime mismatch repro files are emitted to `test/repro/` by parity tests.
- CI triage snapshots are emitted to `artifacts/ci-triage-summary.md` and uploaded from workflow jobs.

# Wolf3D TypeScript Port Agent Guidelines

## Overview

This project ports the original Wolfenstein 3D C codebase to TypeScript for browser execution, using a C-to-WASM oracle and property-based testing as the primary correctness mechanism. Correctness is defined by parity with original C behavior.

Current execution track is the runtime-complete WL1 plan (`R0..R8`). Legacy phase `0..8` completion reflects prototype oracle wrappers and is superseded for full runtime acceptance.

## Architecture

```text
Original C (WOLFSRC) --Emscripten--> WASM Oracle --OracleBridge--> Property Tests
                                                     |
                                          TypeScript Ported Systems
```

## Key Directories

| Directory | Purpose |
| :--- | :--- |
| `specs/` | Design specifications and phase-by-phase oracle parity requirements |
| `.agents/workflows/` | Reusable agent workflow prompts for strict implement-and-verify execution |
| `src/` | Planned TypeScript gameplay and engine modules |
| `src/oracle/` | Planned oracle bridge wrappers for calling C/WASM exports |
| `test/property/` | Planned fast-check parity tests |
| `scripts/wasm/` | Planned Emscripten build scripts and export configuration |

## Specifications

Read specs before implementing:

- Spec index: `specs/README.md`
- Required first read: `specs/testing-strategy.md`
- Bridge contract: `specs/c-wasm-bridge.md`
- Runtime truth baseline: `specs/runtime-gap-assessment.md`
- Runtime symbol authority: `specs/runtime-symbol-manifest.md`

Rules:

- Specs define intended behavior and process.
- Code must align with specs.
- If behavior changes, update specs in the same change.

## Commands

### Development

- Install dependencies: `pnpm install`
- Prepare sanitized real WOLFSRC sources: `pnpm wasm:prepare:wolfsrc`
- Probe real-source compile compatibility: `pnpm wasm:probe:wolfsrc`
- Verify real-source compatibility gate (expects zero probe failures): `pnpm wasm:verify:compat`
- Build C/WASM oracle: `pnpm wasm:build`
- Extract runtime trace symbol manifest: `pnpm runtime:manifest:extract`
- Verify runtime symbol manifest lock: `pnpm runtime:manifest:verify`
- Run runtime parity harness tests: `pnpm runtime:parity:test`
- Generate deterministic runtime tick/frame checkpoints: `pnpm runtime:checkpoints:generate`
- Verify runtime checkpoint lock: `pnpm runtime:checkpoints:verify`
- Generate deterministic WL1 episode checkpoints: `pnpm runtime:episode:generate`
- Verify WL1 episode checkpoint lock: `pnpm runtime:episode:verify`
- Run browser-runtime smoke suite: `pnpm runtime:browser:smoke`
- Verify required-runtime symbol parity coverage + no-fallback policy: `pnpm runtime:required:verify`
- Verify runtime core mode guard (`synthetic` vs `real`): `bash scripts/runtime/verify-runtime-core-guard.sh`
- Replay runtime repro artifact: `pnpm runtime:replay <artifact.json>`
- Run smoke tests directly: `pnpm test:smoke`
- Run PR 1k changed-symbol property selection: `pnpm ci:property:pr`
- Run one 10k shard parity slice: `CI_PARITY_SHARD=4 pnpm ci:property:shard`
- Collect CI triage summary/artifacts: `pnpm ci:triage:collect`
- Run local property tests (1k): `pnpm test:property:local`
- Run CI property tests (10k): `pnpm test:property:ci`
- Replay failing seed: `pnpm test:property -- --seed <seed>`
- Lint: `pnpm lint`
- Format: `pnpm format`

### Build / Verification

- Type-check: `pnpm typecheck`
- Full verification gate: `pnpm verify`

## Code Style

- Preserve C integer semantics explicitly (signedness and overflow behavior).
- Keep gameplay logic deterministic and side-effect boundaries explicit.
- Add property tests with every behavior port.

## Environment Variables

| Variable | Purpose | Required |
| :--- | :--- | :--- |
| `WOLF3D_SRC_DIR` | Absolute path to original C source root (`.../wolf3d-master/WOLFSRC`) | Yes |
| `WOLF3D_DATA_DIR` | Path to canonical WL1 shareware game data used for test fixtures | Yes |
| `EMSDK` | Emscripten SDK root when `emcc` is not globally available | Yes |
| `ORACLE_WASM_PATH` | Optional override for compiled oracle artifact path | No |

## Phase Gate Rules

- Never move to the next phase until all tests in the current phase are green.
- Every ported function must have a TS-vs-oracle property test.
- Phase gate thresholds:
  - Local: 1,000 random cases per function.
  - CI: 10,000 random cases per function.
- Every completed phase requires a commit before phase advancement.
- For runtime completion, `specs/runtime-symbol-manifest.md` `required-runtime` bucket is authoritative.

## Git Policy

- Repository initialization is mandatory before scaffold and implementation.
- Keep one commit per completed phase after tests are green.
- Suggested commit format:
  - `phase-0: c-wasm bridge + parity harness`
  - `phase-1: math fixed-point parity complete`
  - `phase-2: map loading parity complete`

## Common Task: Port One Function

1. Locate next unchecked function in current phase in `TODO.md`.
2. Port that function from C to TS.
3. Add property test comparing TS and C/WASM oracle outputs.
4. Run local property gate (1k random cases).
5. Fix until green.
6. Mark function complete in `TODO.md`.
7. After all phase tasks are done, run CI-strength property gate (10k).
8. Commit phase completion.

# Wolf3D TypeScript Port

Ports the original Wolfenstein 3D C codebase to TypeScript for browser execution. Correctness = parity with C/WASM oracle via property-based testing. Active track: WL6 runtime (`K0..K12`).

## Repository Map

This file is the entry point. Read the linked files for detail.

### Knowledge Base

| Document | Purpose | Read when... |
| :--- | :--- | :--- |
| `docs/architecture.md` | Domain map, package layering, key directories | You need to understand how the codebase is organized |
| `docs/core-beliefs.md` | Agent-first operating principles | You're unsure how to approach a decision |
| `docs/quality.md` | Per-domain quality scorecard | You need to know what's solid vs. what has gaps |
| `specs/README.md` | Index of all specifications with verification status | You're about to implement or modify a feature |
| `specs/testing-strategy.md` | Oracle parity methodology, gate policy | You're writing or reviewing tests |
| `TODO.md` | K-phase implementation checklist | You need to know what to work on next |

### Execution Plans

| Location | Purpose |
| :--- | :--- |
| `docs/plans/active/` | Living plans for work touching 2+ systems or 5+ files |
| `docs/plans/completed/` | Finished plans kept for retrospective |

For work touching 2+ systems or 5+ files, create or follow an ExecPlan. See `docs/plans/` for format.

### Workflows

| Workflow | Purpose | When to use |
| :--- | :--- | :--- |
| `.agents/workflows/implement-and-verify.md` | K-phase strict oracle parity loop | When implementing any TODO task |
| `.agents/workflows/safe-refactor.md` | Property-based testing for safe refactors | When rewriting existing code |

## Architecture

```
Original C (WOLFSRC) --Emscripten--> WASM Oracle --OracleBridge--> Property Tests
                                                     |
                                          TypeScript Ported Systems
```

## Key Directories

| Directory | Purpose |
| :--- | :--- |
| `specs/` | Design specifications, phase oracle parity requirements |
| `docs/` | Architecture, core-beliefs, quality, plans |
| `.agents/workflows/` | Implement-and-verify, safe-refactor |
| `src/` | TypeScript gameplay and engine modules |
| `src/oracle/` | Oracle bridge wrappers for C/WASM exports |
| `test/property/` | fast-check parity tests |
| `scripts/wasm/` | Emscripten build, probe |

## Commands

| Command | Purpose |
| :--- | :--- |
| `pnpm install` | Install dependencies |
| `pnpm wasm:build` | Build C/WASM oracle |
| `pnpm test:smoke` | Smoke tests |
| `pnpm test:property:local` | Property tests (1k runs) |
| `pnpm test:property:ci` | Property tests (10k runs) |
| `pnpm runtime:parity:test` | Runtime parity harness |
| `pnpm runtime:checkpoints:verify` | Verify checkpoint lock |
| `pnpm runtime:episode:verify` | Verify episode lock |
| `pnpm runtime:required:verify` | Required symbol parity + no-fallback |
| `pnpm verify` | Full verification gate |
| `pnpm typecheck` | Type-check |
| `pnpm lint` / `pnpm format` | Lint, format |

## How to Work in This Repo

### Before implementing

1. Read `specs/README.md` to find the spec for the system you're touching.
2. Read `docs/quality.md` for that domain's state.
3. For work touching 2+ systems or 5+ files: check `docs/plans/active/` or create an ExecPlan.

### Implementation flow

1. Read `TODO.md` for current K-phase and next task.
2. Read the spec (see `specs/README.md`). Include it in context.
3. Implement following the spec.
4. Add property tests (TS vs oracle). See `specs/testing-strategy.md`.
5. Run implement-and-verify workflow.
6. Before marking phase complete, run the **Done checklist** below.

### Before marking a phase complete

- [ ] `TODO.md` — all tasks checked off, phase status updated
- [ ] `docs/quality.md` — grades updated for affected domains
- [ ] `specs/README.md` — verification status updated if specs changed
- [ ] If you followed an ExecPlan: update status; when done, move to `docs/plans/completed/`

### Refactoring existing code

Follow `.agents/workflows/safe-refactor.md` — bridge old/new, verify equivalence with fast-check, then replace.

### Where artifacts go

| Artifact | Location |
| :--- | :--- |
| Execution plans | `docs/plans/active/` (move to `completed/` when done) |
| Specs | `specs/` |
| Reports / analysis | `docs/reports/` |
| Test coverage | `coverage/` (gitignored) |

## Code Style

- Preserve C integer semantics (signedness, overflow).
- Deterministic gameplay; explicit side-effect boundaries.
- Add property tests with every behavior port.
- See `docs/architecture.md` for naming and formatting.

## Environment Variables

| Variable | Purpose | Required |
| :--- | :--- | :--- |
| `WOLF3D_SRC_DIR` | Path to original C source root | No |
| `WOLF3D_DATA_DIR` | Path to canonical WL6 game data | Yes |
| `EMSDK` | Emscripten SDK root | Yes |
| `ORACLE_WASM_PATH` | Override for oracle artifact path | No |

## Phase Gate Rules

- Never advance phase until all tests are green.
- Every ported function must have TS-vs-oracle property test.
- Local: 1,000 random cases. CI: 10,000 random cases.
- Phase commit required before advancement.
- `specs/runtime-symbol-manifest.md` `required-runtime` is authoritative for runtime completion.

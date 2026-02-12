# Implement and Verify Workflow (R-Phase Strict)

## Purpose

Enforce strict function-by-function oracle parity workflow for runtime-complete WL1 execution phases (`R0..R10`).

## Trigger

Use whenever implementing any execution task from `TODO.md`.

## Steps

1. Read `TODO.md` and identify current R-phase tasks.
2. Read `specs/testing-strategy.md`, `specs/runtime-gap-assessment.md`, and `specs/runtime-symbol-manifest.md`.
3. If in `R4..R8`, select next unchecked symbol from `required-runtime`.
4. Implement one function or one deterministic runtime contract unit.
5. Add parity test (function-level or runtime-step/frame parity) against the oracle.
6. Run local gate (minimum 1,000 random runs for function tests, deterministic replay for runtime traces).
7. If failure occurs, fix and rerun until green.
8. Mark task/symbol complete in tracker docs.
9. Repeat until all tasks in current R-phase are complete.
10. Run CI-strength gate (`10,000` random runs in sharded mode where configured).
11. Create phase commit with required naming convention.
12. Mark `TODO.md` checkboxes for `Tests green` and `Phase commit pushed`.
13. Advance only after commit exists and all phase gates are green.

## Important Notes

- Never skip parity tests for required-runtime symbols.
- Never advance phase while any gate is red.
- Preserve deterministic seed replay output for any failure.
- Keep specs, manifest, and TODO in sync with implementation reality.
- Use `agent-browser` for browser-acceptance steps in `R9` and `R10`.

## Success Criteria

- Current R-phase gates are all green.
- Runtime-path symbol checklist is updated (where applicable).
- Phase completion commit is created.

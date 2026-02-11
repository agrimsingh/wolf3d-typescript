# Implement and Verify Workflow

## Purpose

Enforce strict function-by-function oracle parity workflow for each phase of the Wolf3D TS port.

## Trigger

Use whenever implementing any phase task from `TODO.md`.

## Steps

1. Read `TODO.md` and identify the current phase and next unchecked function.
2. Read the related system spec in `specs/` and `specs/testing-strategy.md`.
3. Implement one function in TypeScript.
4. Add property-based test comparing TS and C/WASM oracle outputs for that function.
5. Run local parity gate (minimum 1,000 random runs).
6. If failure occurs, fix implementation and rerun until green.
7. Mark function task complete in `TODO.md`.
8. Repeat until all phase tasks are complete.
9. Run CI-strength parity gate (minimum 10,000 random runs per covered function).
10. Create phase commit with required naming convention.
11. Advance to next phase only after commit exists and all gates are green.

## Important Notes

- Never skip property tests for ported functions.
- Never advance phase while any current-phase test is red.
- Preserve deterministic seed replay output for any failure.
- Keep specs and TODO in sync with implementation reality.

## Success Criteria

- Current phase has full function parity coverage.
- Required test gates pass.
- Phase completion commit is created.

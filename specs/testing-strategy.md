# Testing Strategy: C/WASM Oracle + Property-Based Parity

## Overview

This project ports Wolf3D C code to TypeScript in strict, test-first parity mode. The original C implementation is compiled to WebAssembly and treated as the oracle. The TypeScript implementation is correct only when it matches oracle behavior under randomized property testing.

## Non-Negotiable Rules

- Every ported function must have a property test comparing TypeScript output to C/WASM output.
- Porting proceeds one function at a time.
- A function is not done until its property tests are green.
- A phase is not done until all functions in that phase are green.
- The next phase cannot begin until the current phase is green and committed.

## Oracle Pattern

1. Build C oracle from `WOLFSRC` via Emscripten.
2. Expose selected C functions through a stable WASM export interface.
3. Wrap exports in a Node/TS adapter (`OracleBridge`).
4. For each TS ported function, generate randomized inputs with fast-check.
5. Feed identical inputs to both TS and C/WASM implementations.
6. Assert structural and numerical equivalence (bit-exact where required).

## Required Test Execution Levels

- Local development gate per function: at least `1,000` random cases.
- CI phase-completion gate per function: at least `10,000` random cases.
- Replay support: all failures must print seed and shrinking path for deterministic reruns.
- Runtime visual gate: deterministic browser-scene screenshot hash checks must pass when render/entity behavior changes.

## Implement-And-Verify Loop (Mandatory)

1. Select next unchecked function in current phase from `TODO.md`.
2. Port function to TypeScript.
3. Add/extend property test comparing TS and oracle outputs.
4. Run local random test gate (`1,000` cases minimum).
5. Fix mismatches and rerun until green.
6. Check function task in `TODO.md`.
7. After all phase functions are done, run CI-strength gate (`10,000` cases).
8. Commit phase only after all gates are green.

## Input Domain Design

Property generators should emphasize:

- Numeric boundaries (signed 16-bit/32-bit limits, overflow edges).
- Zero and one cases.
- Symmetry cases (positive/negative pairs).
- Gameplay-realistic domains (tile coordinates, angles, map dimensions).
- Stress cases near discontinuities (angle wrap, clipping boundaries, door thresholds).
- Stateful interaction domains (door open/hold/close timers, locked-door key states, actor-vs-door occupancy).

## Equality Semantics

- Arithmetic and fixed-point outputs: bit-exact integer equality.
- Compound state transitions: deep structural equality on serialized snapshots.
- Floating values introduced in TS wrappers: deterministic quantization before compare.

## Failure Handling

On mismatch:

1. Record fast-check seed and counterexample.
2. Save minimal repro input in test failure output.
3. Do not bypass with relaxed assertions unless spec explicitly allows tolerance.
4. Keep phase blocked until mismatch root cause is fixed.

## Coverage and Regression Expectations

- Each newly ported function adds at least one property test file or block.
- Any discovered bug must add a regression case (seeded deterministic test) alongside property test.
- No implementation-only PR is valid without parity tests for touched functions.

## Completion Criteria

A phase can be marked complete only when all are true:

- All function checkboxes in the phase are complete.
- Local and CI property gates are green.
- Deterministic browser-scene hash gate is green for runtime-affecting changes.
- `TODO.md` gate checklist is complete, including phase commit checkbox.
- Phase commit has been created.

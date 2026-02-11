# Wolf3D TypeScript Port Implementation Plan

**Status:** Phase 2 in progress
**Last Updated:** 2026-02-11

---

## Phase -1: Git Bootstrap and Scaffold Baseline - Complete

Initialize repository and establish docs/workflow baseline.

### -1.1 Repository Setup

- [x] Initialize Git repository in project root.
- [x] Create baseline scaffold docs (`AGENTS.md`, `specs/`, `TODO.md`, workflow).

### -1.2 Bootstrap Commit Gate

- [x] Tests green (not applicable for doc-only scaffold bootstrap)
- [x] Phase commit pushed (`chore: scaffold project docs/workflows`)

---

## Phase 0: C->WASM Bridge and Parity Harness - Complete

Build the oracle bridge and reusable parity testing infrastructure.

### 0.1 Oracle Build Pipeline

- [x] Set up Emscripten-based build scripts for oracle artifacts.
- [x] Define stable export list for initial phase functions.
- [x] Implement `OracleBridge` adapter initialization and teardown.

### 0.2 Property Harness

- [x] Configure Vitest + fast-check for parity testing.
- [x] Add shared parity assertion helpers and seed replay support.
- [x] Add one end-to-end sample parity test using oracle and TS placeholder.

### 0.3 Gate Checklist

- [x] All Phase 0 tasks checked
- [x] Local gate green (>=1k random cases per covered function)
- [x] CI gate green (>=10k random cases per covered function)
- [x] Phase commit pushed (`phase-0: c-wasm bridge + parity harness`)

---

## Phase 1: Math and Fixed-Point Utilities - Complete

Port foundational arithmetic and table generation logic.

### 1.1 Function Porting

- [x] Port fixed-point arithmetic functions.
- [x] Port trig and projection table builders.
- [x] Port projection helper calculations.

### 1.2 Property Parity

- [x] Add parity tests for each ported function.
- [x] Add boundary and overflow-focused generators.
- [x] Add deterministic seed replay tests for any discovered mismatch.

### 1.3 Gate Checklist

- [x] All Phase 1 tasks checked
- [x] Local gate green (>=1k random cases per covered function)
- [x] CI gate green (>=10k random cases per covered function)
- [x] Phase commit pushed (`phase-1: math fixed-point parity complete`)

---

## Phase 2: Map Loading and Parsing - Not Started

Port map decode and level parse behavior.

### 2.1 Function Porting

- [ ] Port RLEW/map decode routines.
- [ ] Port map header and plane parse logic.
- [ ] Port level geometry extraction logic.

### 2.2 Property Parity

- [ ] Add parity tests for each decode/parse function.
- [ ] Add randomized compressed stream generators.
- [ ] Add deterministic seed replay tests for failures.

### 2.3 Gate Checklist

- [ ] All Phase 2 tasks checked
- [ ] Local gate green (>=1k random cases per covered function)
- [ ] CI gate green (>=10k random cases per covered function)
- [ ] Phase commit pushed (`phase-2: map loading parity complete`)

---

## Phase 3: Raycasting Engine - Not Started

Port core renderer math and ray hit/projection behavior.

### 3.1 Function Porting

- [ ] Port transform and projection helpers.
- [ ] Port wall hit and height calculations.
- [ ] Port per-frame raycast refresh core.

### 3.2 Property Parity

- [ ] Add parity tests for each helper and core routine.
- [ ] Add randomized deterministic camera/map input generators.
- [ ] Add deterministic seed replay tests for failures.

### 3.3 Gate Checklist

- [ ] All Phase 3 tasks checked
- [ ] Local gate green (>=1k random cases per covered function)
- [ ] CI gate green (>=10k random cases per covered function)
- [ ] Phase commit pushed (`phase-3: raycasting parity complete`)

---

## Phase 4: Actor and Enemy AI - Not Started

Port actor state transitions and enemy behavior logic.

### 4.1 Function Porting

- [ ] Port actor movement/state transition routines.
- [ ] Port chase/dodge/path decision routines.
- [ ] Port combat-related actor routines.

### 4.2 Property Parity

- [ ] Add parity tests for each transition routine.
- [ ] Add randomized world/actor snapshot generators.
- [ ] Add deterministic seed replay tests for failures.

### 4.3 Gate Checklist

- [ ] All Phase 4 tasks checked
- [ ] Local gate green (>=1k random cases per covered function)
- [ ] CI gate green (>=10k random cases per covered function)
- [ ] Phase commit pushed (`phase-4: actors ai parity complete`)

---

## Phase 5: Player Movement, Input, and Collision - Not Started

Port player-centric control, movement, and interaction behavior.

### 5.1 Function Porting

- [ ] Port movement integration and clipping logic.
- [ ] Port interaction and weapon command logic.
- [ ] Port per-tick player update routine.

### 5.2 Property Parity

- [ ] Add parity tests for each player routine.
- [ ] Add randomized control stream generators.
- [ ] Add deterministic seed replay tests for failures.

### 5.3 Gate Checklist

- [ ] All Phase 5 tasks checked
- [ ] Local gate green (>=1k random cases per covered function)
- [ ] CI gate green (>=10k random cases per covered function)
- [ ] Phase commit pushed (`phase-5: player movement parity complete`)

---

## Phase 6: Game State Management - Not Started

Port doors, items, score/lives, and level transition state handling.

### 6.1 Function Porting

- [ ] Port door operation/movement state transitions.
- [ ] Port score/lives/items/keys mutation routines.
- [ ] Port level-end and playstate transition routines.

### 6.2 Property Parity

- [ ] Add parity tests for each game-state routine.
- [ ] Add randomized event and state generators.
- [ ] Add deterministic seed replay tests for failures.

### 6.3 Gate Checklist

- [ ] All Phase 6 tasks checked
- [ ] Local gate green (>=1k random cases per covered function)
- [ ] CI gate green (>=10k random cases per covered function)
- [ ] Phase commit pushed (`phase-6: game state parity complete`)

---

## Phase 7: Menu System and Text Rendering - Not Started

Port menu flow logic and text rendering/layout behavior.

### 7.1 Function Porting

- [ ] Port menu state machine and control panel flow.
- [ ] Port text measure and layout logic.
- [ ] Port UI draw model generation.

### 7.2 Property Parity

- [ ] Add parity tests for each menu/text routine.
- [ ] Add randomized menu input sequence generators.
- [ ] Add deterministic seed replay tests for failures.

### 7.3 Gate Checklist

- [ ] All Phase 7 tasks checked
- [ ] Local gate green (>=1k random cases per covered function)
- [ ] CI gate green (>=10k random cases per covered function)
- [ ] Phase commit pushed (`phase-7: menu text parity complete`)

---

## Phase 8: Audio (Optional) - Not Started

Optional final phase for audio parity behavior.

### 8.1 Function Porting

- [ ] Port selected audio mode and playback state routines.
- [ ] Port positioned sound state behavior.

### 8.2 Property Parity

- [ ] Add parity tests for each chosen audio routine.
- [ ] Add randomized audio event generators.
- [ ] Add deterministic seed replay tests for failures.

### 8.3 Gate Checklist

- [ ] All Phase 8 tasks checked
- [ ] Local gate green (>=1k random cases per covered function)
- [ ] CI gate green (>=10k random cases per covered function)
- [ ] Phase commit pushed (`phase-8: audio parity complete`)

---

## Global Verification Checklist

Before marking any phase complete:

- [ ] All tasks in that phase are checked off.
- [ ] Property parity tests are green at required thresholds.
- [ ] Specs and code remain aligned.
- [ ] Phase completion commit is created.

## Notes

- Canonical target is WL1 shareware behavior.
- Emscripten tools are currently missing on PATH and must be installed before Phase 0 execution.
- Audio is optional and does not block core completion through Phase 7.

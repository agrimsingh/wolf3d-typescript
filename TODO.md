# Wolf3D TypeScript Full Port Implementation Plan

**Status:** Phase -0.5 in progress
**Last Updated:** 2026-02-11

---

## Phase -1: Git Bootstrap and Initial Scaffold - Complete

- [x] Repository initialized.
- [x] Base docs and workflow files created.

---

## Phase 0: Recovery to Truthful Baseline - Complete

Convert prototype-complete claims into truthful full-port baseline.

### 0.1 Recovery Tasks

- [x] Reopen plan status to reflect that full WOLFSRC port is not yet complete.
- [x] Add canonical symbol manifest pipeline and generated outputs.
- [x] Add stable type contracts for oracle/parity/state/io layers.
- [x] Mark previous prototype code as spike history (kept in git history only).

### 0.2 Recovery Gate

- [x] Manifest generated from WOLFSRC and committed
- [x] `specs/port-manifest.md` present and authoritative
- [x] Phase commit pushed (`phase-0: recovery + true manifest baseline`)

---

## Phase -0.5: WL1 Data Bootstrap - In Progress

Acquire and validate WL1 shareware data for playable verification.

### -0.5.1 Data Tasks

- [x] Add script to download and unpack WL1 archive into `assets/wl1/`.
- [x] Add script to validate required WL1 files.
- [x] Wire validation into `pnpm verify:assets`.

### -0.5.2 Gate

- [x] WL1 data files downloaded into `assets/wl1/`
- [x] `pnpm verify:assets` passes
- [ ] Phase commit pushed (`phase-0.5: wl1 asset bootstrap complete`)

---

## Phase 1: Math and Fixed-Point from Real WOLFSRC - Not Started

Port actual WOLFSRC math semantics and test against C oracle wrappers.

### 1.1 Oracle C Tasks

- [ ] Add phase-1 WOLFSRC-style oracle wrappers (`FixedByFrac`, `BuildTables`, `CalcProjection`).
- [ ] Verify wrappers match source behavior with deterministic fixture vectors.

### 1.2 TypeScript Tasks

- [ ] Port fixed-point and projection-table logic with matching integer semantics.
- [ ] Integrate Phase 1 ported math into rendering path behind feature flag.

### 1.3 Test Tasks

- [ ] Add property tests for `FixedByFrac` parity.
- [ ] Add property tests for `BuildTables` hash parity.
- [ ] Add property tests for `CalcProjection` hash parity.
- [ ] Add deterministic regression replay outputs under `test/repro/` on failures.

### 1.4 Gate

- [ ] All Phase 1 manifest entries complete
- [ ] Local gate green (>=1k random cases per covered function)
- [ ] CI gate green (>=10k random cases per covered function)
- [ ] Phase commit pushed (`phase-1: math fixed-point parity complete`)

---

## Phase 2: Map/Cache Loading and Parsing - Not Started

- [ ] Oracle wrappers from `ID_CA.C` / `WL_GAME.C`
- [ ] TS Carmack + RLEW decode and map reconstruction
- [ ] Arbitrary input + real asset parity tests
- [ ] Local/CI gates green
- [ ] Phase commit pushed (`phase-2: map loading parity complete`)

---

## Phase 3: Raycasting Core - Not Started

- [ ] Oracle wrappers from `WL_DRAW.C`, `WL_MAIN.C`, `WL_SCALE.C`
- [ ] TS software raycasting parity implementation
- [ ] Column/frame hash parity tests
- [ ] Local/CI gates green
- [ ] Phase commit pushed (`phase-3: raycasting parity complete`)

---

## Phase 4: Actors/AI State Machines - Not Started

- [ ] Oracle wrappers from `WL_STATE.C`, `WL_ACT1.C`, `WL_ACT2.C`
- [ ] TS actor tick/state transition parity
- [ ] Stateful property parity suite
- [ ] Local/CI gates green
- [ ] Phase commit pushed (`phase-4: actors ai parity complete`)

---

## Phase 5: Player Movement/Input/Collision - Not Started

- [ ] Oracle wrappers from `WL_AGENT.C`, `WL_PLAY.C`
- [ ] TS keyboard+mouse movement/collision parity
- [ ] Trace and property parity suite
- [ ] Local/CI gates green
- [ ] Phase commit pushed (`phase-5: player movement parity complete`)

---

## Phase 6: Game State Management - Not Started

- [ ] Oracle wrappers from `WL_GAME.C`, `WL_INTER.C`, `WL_ACT1.C`
- [ ] TS score/lives/doors/intermission parity
- [ ] Event sequence property suite
- [ ] Local/CI gates green
- [ ] Phase commit pushed (`phase-6: game state parity complete`)

---

## Phase 7: Menu/Text/UI Flow - Not Started

- [ ] Oracle wrappers from `WL_MENU.C`, `WL_TEXT.C`, `ID_US_1.C`
- [ ] TS menu state and text layout parity
- [ ] Scripted input and property suite
- [ ] Local/CI gates green
- [ ] Phase commit pushed (`phase-7: menu text parity complete`)

---

## Phase 8: Audio (Optional) - Not Started

- [ ] Oracle wrappers from `ID_SD.C`, `ID_CA.C`, `WL_GAME.C`
- [ ] TS audio state parity + WebAudio adapter
- [ ] Property/event sequence parity suite
- [ ] Local/CI gates green
- [ ] Phase commit pushed (`phase-8: audio parity complete`)

---

## Global Rules

- No phase advancement unless current phase gates are all green.
- One commit per completed phase gate.
- Porting is function-by-function and manifest-driven.
- No approximate parity assertions in core phases.

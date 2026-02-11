# C-to-WASM Bridge Specification

## Overview

The bridge compiles original Wolf3D C source into WebAssembly, exposes selected functions, and provides a stable Node/TS interface used by fast-check parity tests.

## Scope

- Canonical target: WL1 shareware-compatible behavior.
- Source root: `/Users/agrim/Downloads/ai fun projects/wolf3d-master/WOLFSRC`.
- Purpose: reference oracle for correctness, not production runtime.

## Prerequisites

- Node.js and pnpm.
- Emscripten SDK (`emcc`, `emcmake`) available on PATH.
- Note: current environment check showed Emscripten is not installed on PATH; this must be resolved before Phase 0 implementation.

## Bridge Architecture

```text
WOLFSRC C -> Emscripten build -> wolf_oracle.wasm + JS loader
                                      |
                              src/oracle/bridge.ts
                                      |
                         fast-check parity tests (Vitest)
```

## Initial Export Targets By Phase

- Phase 1 (math/fixed): `FixedByFrac`, table builders and helper math routines from `WL_DRAW.C`, `WL_MAIN.C`, `WL_DEF.H`.
- Phase 2 (map): map cache/decode paths such as `CA_RLEWexpand`, `CA_CacheMap` from `ID_CA.C` and dependent level setup from `WL_GAME.C`.
- Phase 3 (raycast): projection and transform helpers from `WL_DRAW.C`, `WL_MAIN.C`, `WL_SCALE.C`.
- Phase 4 (actors/AI): movement/state routines from `WL_STATE.C`, `WL_ACT1.C`, `WL_ACT2.C`.
- Phase 5 (player): player and collision routines from `WL_AGENT.C`, `WL_PLAY.C`.
- Phase 6 (game state): state and transition logic from `WL_GAME.C`, `WL_INTER.C`, `WL_ACT1.C`.
- Phase 7 (menu/text): UI/text flow from `WL_MENU.C`, `WL_TEXT.C`, `ID_US_1.C`.
- Phase 8 optional (audio): sound manager routines from `ID_SD.C` and related cache/sound integration code.

## Type and ABI Constraints

- Preserve C integer semantics for signedness and overflow.
- Avoid implicit JS floating behavior in oracle-facing wrappers.
- Prefer typed arrays and explicit bitwise casts in adapters.
- Document every marshaled struct layout in adapter code.

## Oracle Adapter Interface (Planned)

```ts
export interface OracleBridge {
  init(): Promise<void>;
  call<TInput, TOutput>(fn: string, input: TInput): TOutput;
  resetState(): void;
  shutdown(): Promise<void>;
}
```

## Build and Test Contract (Planned Commands)

- `pnpm wasm:build` -> produces bridge artifacts.
- `pnpm test:property:local` -> 1k random runs gate.
- `pnpm test:property:ci` -> 10k random runs gate.

## Risks and Mitigations

- Inline assembly and DOS-era dependencies may block direct compilation.
  - Mitigation: isolate pure logic functions first; stub non-portable hardware I/O for oracle-only builds.
- Hidden global state can contaminate tests.
  - Mitigation: require per-test reset path in bridge adapter.
- Data-variant drift (WL1 vs WL6/SOD).
  - Mitigation: lock WL1 first and treat other variants as explicit future work.

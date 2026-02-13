# WL1 Real Runtime Execution Spec (G0..G12)

## Summary

This spec is the authoritative autonomous execution plan to convert the current synthetic runtime harness into a gameplay-complete WL1 TypeScript runtime that matches `/Users/agrim/Downloads/ai fun projects/wolf3d-master/WOLFSRC` behavior in browser.

Execution rules:

1. Run phases strictly in order (`G0..G12`).
2. No phase advancement until all gates are green.
3. Create one commit immediately after each green phase gate.
4. Run agent-browser scripted acceptance checks every phase.
5. Treat oracle/WASM as reference only; production path must end as pure TS runtime.
6. No approximation assertions for core runtime behavior.

## Locked Runtime Contracts

1. `src/runtime/contracts.ts`
- Use full runtime boot payload (not 8x8 bit-window boot).
- Keep `RuntimePort` lifecycle methods: `bootWl6`, `stepFrame`, `snapshot`, `framebuffer`, `saveState`, `loadState`, `shutdown`.
- Expand `RuntimeCoreSnapshot` for runtime-critical state parity (world/map index, player, doors/pushwalls, actor summaries, weapons/ammo, score/lives/keys, menu/intermission mode, RNG/time counters).

2. `src/wolf/state/types.ts`
- Canonical runtime-relevant C-struct mirrors with deterministic normalize/serialize helpers.

3. `src/wolf/io/types.ts`
- Full WL1 package/index/decode contracts for maps, VSWAP/VGA, audio metadata.

4. `src/oracle/types.ts`
- Runtime export IDs, function manifest evidence typing, per-tic trace record/diff types.

5. `src/runtime/wl1RuntimeScenarios.ts`
- Deterministic real gameplay trace fixtures only (no synthetic random-step fixtures).

## Phases

1. G0: truth reset and anti-synthetic guard lock.
2. G1: deterministic WOLFSRC source + asset baseline.
3. G2: real oracle runtime stepping (no probe-driven runtime semantics).
4. G3: runtime symbol reclassification from real traces.
5. G4: replace 8x8 runtime world model with full map/world state.
6. G5: TS Wave A (cache/memory/map runtime paths).
7. G6: TS Wave B (real renderer pipeline).
8. G7: TS Wave C (player/doors/pushwalls/game loop core).
9. G8: TS Wave D (actors/AI/combat).
10. G9: TS Wave E (menu/text/input/intermission/audio state).
11. G10: production runtime swap + oracle isolation.
12. G11: full-episode parity lock + CI freeze.
13. G12: merge + release closure.

## Mandatory Gates

- Function parity: local `1k` and CI `10k` random runs per required-runtime function.
- Trace parity: deterministic per-tic snapshot + indexed framebuffer exact compare.
- Repro standard: each failure must log seed/path and write minimized replay JSON under `test/repro/`.
- Browser acceptance: scripted agent-browser scenario after each phase.

## Acceptance Script Expectations (Agent-Browser)

Minimum scripted checks:

1. Boot to title/menu with WL1 assets.
2. Start new game and spawn correctly.
3. Move/turn/fire/use with expected behavior.
4. Open door and push wall where applicable.
5. Engage enemy, exchange damage, and resolve death state.
6. Complete level and transition through intermission/progression flow.

Artifacts captured per phase:

- screenshots in `artifacts/`
- trace JSON in `specs/generated/`
- mismatch repro files in `test/repro/`

## Completion Definition

Done means all of the following:

1. Browser runtime is gameplay-complete for WL1 episode flow.
2. Production path is pure TS runtime with no synthetic fallback.
3. Required-runtime symbols are parity-covered against oracle.
4. Full deterministic episode traces pass per-tic snapshot + framebuffer parity.
5. CI gates (`parity-pr`, `parity-10k`) are stable and reproducible.

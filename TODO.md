# Wolf3D TypeScript WL6 Runtime TODO (K-Phases)

**Status:** In Progress (`K2` active)  
**Last Updated:** 2026-02-12

## Scope Lock

- Canonical runtime target: WL6.
- Canonical raw runtime files: `MAPHEAD.WL6`, `GAMEMAPS.WL6`, `VSWAP.WL6`.
- Supplemental presentation/audio assets: deterministic mapping from `/Users/agrim/Downloads/wolf3d-assets.zip`.
- Production runtime: pure TypeScript.
- Oracle runtime: C/WASM test reference only.
- Gate policy: no phase advancement before green gates + immediate phase commit.

## K-Phase Checklist

## K0: README Baseline + Truth Reset

- [x] Add root `README.md` with project purpose, execution history, commands, and TODO direction.
- [x] Reset specs/TODO truth to WL6 migration baseline.
- [x] Add `specs/wl6-modern-runtime-execution-spec.md`.
- [x] Add docs verification script (`pnpm verify:docs`).
- [x] Add visible baseline status label in browser app for migration track.
- [x] Gate: `pnpm typecheck`
- [x] Gate: `pnpm test:smoke`
- [x] Gate: `pnpm verify:docs`
- [x] Agent-browser check recorded
- [x] Tests green
- [x] Phase commit pushed (`k0: add readme and reset wl6 execution baseline`)

## K1: WL6 Raw Asset Source Lock + Modern Zip Intake

- [x] Pin vpoupet source commit and ingest WL6 raw lumps under `assets/wl6/raw`.
- [x] Import modern asset pack under `assets/wl6-modern`.
- [x] Create checksum/provenance lock manifests.
- [x] Add `verify:assets:wl6` command.
- [x] Gate: `pnpm verify:assets:wl6`
- [x] Gate: `pnpm wasm:build`
- [x] Gate: provenance checksum verification
- [x] Agent-browser check recorded
- [x] Tests green
- [x] Phase commit pushed (`k1: lock wl6 raw assets and import modern pack`)

## K2: Asset Mapping Layer

- [ ] Add deterministic mapping manifest and loader pipeline.
- [ ] Validate missing IDs, duplicate IDs, orientation flags, and palette mode.
- [ ] Add mapping hash tests and known orientation checks (Achtung included).
- [ ] Gate: mapping validation suite
- [ ] Gate: deterministic hash tests for sampled assets
- [ ] Agent-browser check recorded
- [ ] Tests green
- [ ] Phase commit pushed (`k2: deterministic modern asset mapping layer`)

## K3: WL6 Runtime Data/Boot Pipeline

- [ ] Replace 8x8 window boot model with full WL6 map planes and canonical spawn.
- [ ] Migrate runtime scenarios to variant-aware full-world fixtures.
- [ ] Gate: map decode parity (1k local / 10k CI where applicable)
- [ ] Gate: representative boot trace parity
- [ ] Agent-browser check recorded
- [ ] Tests green
- [ ] Phase commit pushed (`k3: wl6 full-world boot and map decode parity`)

## K4: Oracle Runtime Driver WL6 Alignment

- [ ] Align oracle runtime stepping/snapshot/frame/save-load for WL6 traces.
- [ ] Gate: `pnpm runtime:parity:test`
- [ ] Gate: deterministic replay equality suite
- [ ] Agent-browser check recorded
- [ ] Tests green
- [ ] Phase commit pushed (`k4: wl6 oracle runtime determinism`)

## K5: Symbol Classification Refresh (WL6)

- [ ] Regenerate runtime hits/classification from real WL6 traces.
- [ ] Rebuild `specs/runtime-symbol-manifest.md`.
- [ ] Enforce zero unclassified symbols.
- [ ] Gate: `pnpm runtime:manifest:extract`
- [ ] Gate: `pnpm runtime:classification:verify`
- [ ] Gate: `pnpm runtime:manifest:verify`
- [ ] Agent-browser check recorded
- [ ] Tests green
- [ ] Phase commit pushed (`k5: wl6 runtime symbol manifest freeze`)

## K6: TS Parity Wave A (Cache/Memory/Map)

- [ ] Integrate runtime-required map/cache/memory ports into production flow.
- [ ] Add/refresh function-level property parity tests.
- [ ] Gate: per-function parity local 1k and CI 10k
- [ ] Gate: deterministic multi-map load traces
- [ ] Agent-browser check recorded
- [ ] Tests green
- [ ] Phase commit pushed (`k6: wl6 cache-memory-map parity`)

## K7: TS Parity Wave B (Renderer/Orientation/Sprites/HUD)

- [ ] Drive renderer from TS runtime framebuffer semantics.
- [ ] Fix mirror/axis/orientation issues across runtime visuals.
- [ ] Integrate mapped modern HUD/UI assets where VGA lumps are unavailable.
- [ ] Gate: helper parity + per-tic indexed framebuffer parity
- [ ] Gate: orientation-sensitive screenshot hash baselines
- [ ] Agent-browser check recorded
- [ ] Tests green
- [ ] Phase commit pushed (`k7: wl6 renderer and orientation parity`)

## K8: TS Parity Wave C (Player/Doors/Pushwalls/Game Loop)

- [ ] Port player movement/use/fire/collision and door/pushwall loop transitions.
- [ ] Remove synthetic countdown behavior from gameplay flow.
- [ ] Gate: stateful property suites
- [ ] Gate: deterministic interaction traces
- [ ] Agent-browser check recorded
- [ ] Tests green
- [ ] Phase commit pushed (`k8: wl6 player-doors-gameloop parity`)

## K9: TS Parity Wave D (Actors/AI/Combat)

- [ ] Port actor state machines and combat side effects.
- [ ] Gate: actor tick parity suites
- [ ] Gate: deterministic combat traces
- [ ] Agent-browser check recorded
- [ ] Tests green
- [ ] Phase commit pushed (`k9: wl6 actors-ai-combat parity`)

## K10: TS Parity Wave E (Menu/Text/Input/Intermission/Audio SFX)

- [ ] Port menu/text/input/intermission behavior and mapped SFX audio-state behavior.
- [ ] Keep BGM explicitly disabled/stubbed for now.
- [ ] Gate: menu/input/audio parity suites
- [ ] Gate: deterministic progression traces
- [ ] Agent-browser check recorded
- [ ] Tests green
- [ ] Phase commit pushed (`k10: wl6 menu-text-input-sfx parity`)

## K11: Production Runtime Swap + Oracle Isolation

- [ ] Ensure production path is pure TS runtime only.
- [ ] Enforce anti-fallback guard scripts.
- [ ] Gate: `pnpm runtime:required:verify`
- [ ] Gate: `pnpm test:smoke`
- [ ] Gate: `pnpm build`
- [ ] Agent-browser check recorded
- [ ] Tests green
- [ ] Phase commit pushed (`k11: production runtime on pure ts with oracle isolation`)

## K12: Full-Episode Parity Lock + CI Freeze + Merge

- [ ] Lock deterministic WL6 episode traces and artifacts.
- [ ] Harden parity workflows and triage outputs.
- [ ] Merge to `main` with final evidence bundle.
- [ ] Gate: `pnpm runtime:checkpoints:verify`
- [ ] Gate: `pnpm runtime:episode:verify`
- [ ] Gate: `pnpm runtime:required:verify`
- [ ] Gate: `pnpm test:smoke`
- [ ] Gate: `pnpm build`
- [ ] Gate: 3 consecutive green remote parity runs
- [ ] Agent-browser check recorded
- [ ] Tests green
- [ ] Phase commit pushed (`k12: wl6 gameplay parity freeze and merge`)

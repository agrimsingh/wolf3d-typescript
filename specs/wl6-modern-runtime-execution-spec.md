# WL6 Canonical Runtime + Modern Asset Execution Spec (K0..K12)

## Summary

This document is the authoritative execution spec for migrating the current runtime toward gameplay-complete WL6 parity while consuming modern sprite/audio assets through deterministic mapping.

## Locked Inputs

1. Canonical runtime lumps:
  `assets/wl6/raw/MAPHEAD.WL6`
  `assets/wl6/raw/GAMEMAPS.WL6`
  `assets/wl6/raw/VSWAP.WL6`
2. Supplemental modern assets:
  `/Users/agrim/Downloads/wolf3d-assets.zip`
3. Oracle source:
  `/Users/agrim/Downloads/ai fun projects/wolf3d-master/WOLFSRC`

## Mandatory Policies

1. No phase skipping.
2. One commit per phase after all gates are green.
3. Agent-browser acceptance check after every phase.
4. Production runtime stays pure TS; oracle is reference-only.
5. Core runtime parity assertions remain exact.

## Phase Sequence

1. K0: README baseline + truth reset + docs verification.
2. K1: WL6 raw asset lock + modern zip intake + checksums.
3. K2: deterministic asset mapping layer.
4. K3: full WL6 data/boot pipeline (no 8x8 runtime window model).
5. K4: oracle runtime WL6 determinism.
6. K5: runtime symbol manifest/classification refresh.
7. K6: parity wave A (cache/memory/map runtime paths).
8. K7: parity wave B (renderer/orientation/sprites/HUD).
9. K8: parity wave C (player/doors/pushwalls/game loop).
10. K9: parity wave D (actors/AI/combat).
11. K10: parity wave E (menu/text/input/intermission/SFX state).
12. K11: production runtime swap + oracle isolation.
13. K12: full-episode parity lock + CI freeze + merge.

## Required Artifacts

1. Asset provenance and checksum manifests in `assets/manifests/`.
2. Runtime symbol manifests and generated locks in `specs/generated/`.
3. Browser screenshots and replay traces in `artifacts/`.
4. Minimized parity repro JSON under `test/repro/`.

## Acceptance Standard

1. Per-function parity: local 1k and CI 10k runs for required-runtime symbols.
2. Per-tic trace parity: snapshot + indexed framebuffer exact compare.
3. Browser acceptance scripts pass phase-specific scenarios with captured artifacts.

## Implementation Notes (2026-02-13)

1. Renderer now uses canonical WL6 palette conversion for indexed frame presentation (`src/runtime/wl6Palette.ts` and app wiring).
2. Floor/ceiling indexed span defaults are aligned to reference behavior (`25` floor, `29` ceiling).
3. Full-map doors now preserve door tile IDs and use runtime door state (open amount, opening/open/closing modes, hold time) instead of mutating door tiles to floor.
4. Locked door semantics are enforced in runtime interaction path:
 - `92/93` require gold key.
 - `94/95` require silver key.
5. Runtime property coverage includes explicit locked-door and door-animation interaction checks.
6. Actor update loop uses deterministic WL6 archetype classes (guard/officer/SS/dog/zombie/boss) for chase speed, attack cadence, and combat pressure.

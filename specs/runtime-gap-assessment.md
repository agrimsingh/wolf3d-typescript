# Runtime Gap Assessment (WL6 Modern Track Baseline)

## Objective

Track the remaining gap between the current browser runtime and a gameplay-complete, parity-verified WL6 TypeScript runtime.

## Current Reality (2026-02-12)

Progress checkpoint: `K0..K11` are complete; `K12` (episode parity lock, CI freeze, merge closure) is now active.

1. Runtime currently boots and renders in browser, but the experience still exposes prototype-era behavior and presentation shortcuts.
2. The app has existing WL1-centric file/contract paths that must be generalized for WL6 canonical runtime ingestion.
3. Oracle parity infrastructure exists, but WL6-specific trace locks and symbol evidence must be regenerated from WL6 gameplay traces.
4. Modern presentation assets (PNG/WAV) are available, but deterministic target-ID mapping has not yet been locked.
5. Root project-level README documentation was previously missing and has now been added for baseline clarity.

## Primary Gaps To Close

1. Lock canonical WL6 raw runtime assets and checksums in-repo.
2. Build deterministic mapping from modern asset atlases/audio to runtime IDs.
3. Remove remaining production dependence on windowed map abstractions and WL1-only boot assumptions.
4. Regenerate runtime symbol classification from WL6 traces with zero unclassified symbols.
5. Reach full gameplay parity waves (map/memory, renderer, player, AI, menu/intermission, SFX-state).
6. Lock per-tic episode parity and stabilize CI with reproducible artifacts.

## Done Criteria (WL6 Track)

Project is complete for this track only when:

1. Browser runtime is gameplay-complete for WL6 route coverage under defined acceptance traces.
2. Production runtime path is pure TypeScript.
3. Every required-runtime symbol has explicit oracle parity evidence.
4. Deterministic traces pass per-tic snapshot and indexed framebuffer parity.
5. K-phase gates (`K0..K12`) are green with corresponding commits and artifacts.

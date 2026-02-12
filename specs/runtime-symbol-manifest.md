# Runtime Symbol Manifest (WL1 Runtime Path)

Authoritative symbol checklist for full runtime-complete WL1 parity.

## Status

- Current state: `frozen`
- Source of truth: deterministic oracle symbol trace outputs from Phase R2
- Trace scenarios: 10 (WL1 asset-backed)
- Deterministic menu-trace digest: `3960187756`
- Refresh command: `pnpm runtime:manifest:extract`

## Buckets

### required-runtime

Symbols exercised by deterministic runtime trace scenarios.

| File | Function | Status | Notes |
| :--- | :--- | :--- | :--- |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_init | `todo` | runtime bootstrap entrypoint |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_reset | `todo` | restores boot snapshot |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_step | `todo` | runtime tick loop entrypoint |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_snapshot_hash | `todo` | snapshot hash API |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_render_frame_hash | `todo` | frame-hash API |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_set_state | `todo` | deserialize/state restore API |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_map_lo | `todo` | snapshot readout |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_map_hi | `todo` | snapshot readout |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_xq8 | `todo` | snapshot readout |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_yq8 | `todo` | snapshot readout |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_angle_deg | `todo` | snapshot readout |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_health | `todo` | snapshot readout |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_ammo | `todo` | snapshot readout |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_cooldown | `todo` | snapshot readout |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_flags | `todo` | snapshot readout |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_tick | `todo` | snapshot readout |
| WL_AGENT.C | ClipMove | `todo` | called via real_wl_agent_clip_move_apply shim |

### excluded-non-runtime

Symbols known to the runtime trace map but not hit by current deterministic trace scenarios.

| File | Function | Reason |
| :--- | :--- | :--- |
| _none_ | _none_ | all traced symbols are currently required-runtime |

## Rules

1. No symbol may move from `required-runtime` to `excluded-non-runtime` without trace evidence and commit note.
2. Phase R4 completion requires all `required-runtime` symbols marked `done` with parity tests.
3. Any new trace that hits an excluded symbol must reopen the manifest and add it to required.

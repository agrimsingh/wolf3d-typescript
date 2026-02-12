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
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_init | `done` | runtime bootstrap entrypoint; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_reset | `done` | restores boot snapshot; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_step | `done` | runtime tick loop entrypoint; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_snapshot_hash | `done` | snapshot hash API; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_render_frame_hash | `done` | frame-hash API; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_set_state | `done` | deserialize/state restore API; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_map_lo | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_map_hi | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_xq8 | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_yq8 | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_angle_deg | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_health | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_ammo | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_cooldown | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_flags | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| runtime/wolfsrc_runtime_oracle.c | oracle_runtime_get_tick | `done` | snapshot readout; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |
| WL_AGENT.C | ClipMove | `done` | called via real_wl_agent_clip_move_apply shim; parity: test/property/runtime.required-symbols.test.ts:required runtime API symbols stay in parity |

### excluded-non-runtime

Symbols known to the runtime trace map but not hit by current deterministic trace scenarios.

| File | Function | Reason |
| :--- | :--- | :--- |
| _none_ | _none_ | all traced symbols are currently required-runtime |

## Rules

1. No symbol may move from `required-runtime` to `excluded-non-runtime` without trace evidence and commit note.
2. Phase R4 completion requires all `required-runtime` symbols marked `done` with parity tests.
3. Any new trace that hits an excluded symbol must reopen the manifest and add it to required.

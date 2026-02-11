# Runtime Symbol Manifest (WL1 Runtime Path)

Authoritative symbol checklist for full runtime-complete WL1 parity.

## Status

- Current state: `unfrozen`
- Source of truth: deterministic oracle symbol trace outputs from Phase R2
- Refresh command: `pnpm runtime:manifest:extract` (to be added)

## Buckets

### required-runtime

Symbols exercised by deterministic WL1 runtime traces and required for full completion.

| File | Function | Status | Notes |
| :--- | :--- | :--- | :--- |
| _pending_ | _pending_ | `todo` | Generated in Phase R2 |

### excluded-non-runtime

Symbols not hit by WL1 runtime traces. Excluded from mandatory function-level parity, but retained as documented exclusions.

| File | Function | Reason |
| :--- | :--- | :--- |
| _pending_ | _pending_ | _pending_ |

## Rules

1. No symbol may move from `required-runtime` to `excluded-non-runtime` without trace evidence and commit note.
2. Phase R4 completion requires all `required-runtime` symbols marked `done` with parity tests.
3. Any new trace that hits an excluded symbol must reopen the manifest and add it to required.

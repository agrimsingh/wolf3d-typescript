# WOLFSRC Compatibility Baseline (G1)

## Goal

Create a deterministic pathway from upstream DOS-era `WOLFSRC` sources to a compilable WASM oracle build target.

## Source Preparation

- Command: `pnpm wasm:prepare:wolfsrc`
- Script: `scripts/wasm/prepare-wolfsrc.sh`
- Output: `c-oracle/wolfsrc-sanitized/`
- Vendored snapshot source: `c-oracle/vendor/wolfsrc-sanitized/`
- Vendored checksum manifest: `c-oracle/vendor/wolfsrc-sanitized.sha256`
- Vendored snapshot metadata: `c-oracle/vendor/wolfsrc-sanitized.snapshot.json`

Default behavior:

1. Verify vendored snapshot checksums.
2. Copy vendored snapshot to `c-oracle/wolfsrc-sanitized/`.
3. Use source refresh mode only when explicitly requested (`--refresh` + `WOLF3D_SRC_DIR`).

Preparation rules currently applied:

1. Copy only `*.C` and `*.H` from upstream source.
2. Strip DOS EOF bytes (`0x1A`) that break modern compilers.
3. Normalize legacy include paths:
 - `SYS\STAT.H` -> `SYS/STAT.H`
 - `FOREIGN\...` -> `FOREIGN/...`
4. Strip inline `asm ...` instruction lines to unblock Clang parse during compatibility probing.
5. Rewrite recurring non-portable cast-lvalue forms:
 - `(unsigned)linecmds = ...` -> `WOLF_SET_LOW_WORD(linecmds, ...)`
 - `(unsigned)postsource = ...` -> `WOLF_SET_LOW_WORD(postsource, ...)`
 - `(unsigned)actorat[...] = ...` -> `actorat[...] = (objtype *)(uintptr_t)(...)`
 - `*((unsigned far *)ptr)++` -> `WOLF_READ_U16_INC(ptr)` / `WOLF_WRITE_U16_INC(ptr, ...)`
 - `*((unsigned char far *)ptr)++` -> `WOLF_READ_U8_INC(ptr)`
 - `(long)ptr = ...` -> `ptr = (__typeof__(ptr))(uintptr_t)(...)`
 - `&(memptr)foo` / `&((memptr)foo)` -> `(memptr *)&foo`
6. Normalize legacy function-pointer and asm-macro constructs for Clang:
 - menu callback `routine` typedef/prototype relaxed to old-style function pointer
 - `VGAMAPMASK` / `VGAREADMAP` / `VGAWRITEMODE` / `COLORBORDER` asm macros rewritten as no-op macros in sanitized sources.

Source refresh options:

- `pnpm wasm:prepare:wolfsrc -- --refresh`:
  rebuilds sanitized output from `WOLF3D_SRC_DIR`.
- `WOLF3D_UPDATE_VENDOR=1 pnpm wasm:prepare:wolfsrc -- --refresh`:
  rebuilds from source and updates vendored snapshot + checksum manifest.

## Compatibility Headers

- Path: `c-oracle/compat/include/`
- Provides:
 - DOS/Turbo C header shims (`DOS.H`, `CONIO.H`, `BIOS.H`, etc.)
 - calling convention and pointer-model macros (`far`, `near`, `_seg`, etc.) through `wolfsrc_compat.h`
 - cast-lvalue helper macros used by sanitize rewrites (`WOLF_SET_LOW_WORD`, `WOLF_READ_U16_INC`, `WOLF_WRITE_U16_INC`, `WOLF_READ_U8_INC`)
 - stdlib/dir compatibility for Borland-era APIs (`itoa/ltoa/ultoa`, `FA_ARCH`, `findfirst/findnext`)
 - uppercase system header compatibility (`ALLOC.H`, `STRING.H`, etc.)

## Compile Probe

- Command: `pnpm wasm:probe:wolfsrc`
- Script: `scripts/wasm/probe-wolfsrc-runtime.sh`
- Gate command: `pnpm wasm:verify:compat`
- Gate script: `scripts/wasm/verify-wolfsrc-compat.sh`
- Report: `artifacts/wolfsrc-compat/probe-summary.txt`

Current probe snapshot:

- Passed syntax compile: `18/18` runtime-target files (`WL_ACT1.C`, `WL_ACT2.C`, `WL_AGENT.C`, `WL_DRAW.C`, `WL_GAME.C`, `WL_INTER.C`, `WL_MAIN.C`, `WL_MENU.C`, `WL_PLAY.C`, `WL_SCALE.C`, `WL_STATE.C`, `WL_TEXT.C`, `ID_CA.C`, `ID_IN.C`, `ID_SD.C`, `ID_US_1.C`, `ID_VH.C`, `ID_VL.C`)
- Failed syntax compile: none in current probe baseline.

## Real-Source Oracle Slice Integrated

`scripts/wasm/build-oracle.sh` now compiles:

1. `c-oracle/wolfsrc-sanitized/WL_STATE.C` (real upstream module)
2. `c-oracle/wolfsrc-sanitized/WL_AGENT.C` (real upstream module)
3. `c-oracle/wolfsrc_real_state_bridge.c` (state/agent setup + glue)

and exports:

- `oracle_real_wl_state_check_line`
- `oracle_real_wl_state_check_sight`
- `oracle_real_wl_state_move_obj_hash`
- `oracle_real_wl_agent_try_move`
- `oracle_real_wl_agent_clip_move_hash`

This enables property parity against real WOLFSRC line-of-sight and movement/collision function paths while broader real-module linking continues.

Runtime note:

- `c-oracle/runtime/wolfsrc_runtime_oracle.c` movement stepping now calls real `WL_AGENT.ClipMove` via `real_wl_agent_clip_move_apply` (with q8<->q16 conversion), reducing synthetic movement logic inside runtime stepping.

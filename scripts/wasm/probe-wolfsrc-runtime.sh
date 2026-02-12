#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EMSDK_ENV="$ROOT_DIR/.tools/emsdk/emsdk_env.sh"
PREPARE_SCRIPT="$ROOT_DIR/scripts/wasm/prepare-wolfsrc.sh"
SRC_DIR="${WOLF3D_SANITIZED_SRC_DIR:-$ROOT_DIR/c-oracle/wolfsrc-sanitized}"
COMPAT_DIR="$ROOT_DIR/c-oracle/compat/include"
OUT_DIR="$ROOT_DIR/artifacts/wolfsrc-compat"

if [[ -f "$EMSDK_ENV" ]]; then
  # shellcheck disable=SC1090
  source "$EMSDK_ENV" >/dev/null
fi

if ! command -v emcc >/dev/null 2>&1; then
  echo "emcc not found. Install emsdk or ensure emcc is on PATH." >&2
  exit 1
fi

if [[ ! -d "$SRC_DIR" ]]; then
  if [[ -x "$PREPARE_SCRIPT" ]]; then
    "$PREPARE_SCRIPT" >/dev/null
  fi
fi

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Sanitized WOLFSRC directory not found: $SRC_DIR" >&2
  echo "Set WOLF3D_SRC_DIR and run scripts/wasm/prepare-wolfsrc.sh first." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

FILES=(
  "WL_ACT1.C"
  "WL_ACT2.C"
  "WL_AGENT.C"
  "WL_DRAW.C"
  "WL_GAME.C"
  "WL_INTER.C"
  "WL_MAIN.C"
  "WL_MENU.C"
  "WL_PLAY.C"
  "WL_SCALE.C"
  "WL_STATE.C"
  "WL_TEXT.C"
  "ID_CA.C"
  "ID_IN.C"
  "ID_SD.C"
  "ID_US_1.C"
  "ID_VH.C"
  "ID_VL.C"
)

SUMMARY="$OUT_DIR/probe-summary.txt"
PASS_LIST="$OUT_DIR/passed.txt"
FAIL_LIST="$OUT_DIR/failed.txt"

: >"$PASS_LIST"
: >"$FAIL_LIST"

COMMON_FLAGS=(
  -x c
  -std=gnu89
  -fsyntax-only
  -Wno-unknown-pragmas
  -Wno-error=implicit-function-declaration
  -Wno-error=implicit-int
  -I"$COMPAT_DIR"
  -I"$SRC_DIR"
  -include "$COMPAT_DIR/wolfsrc_compat.h"
  -DWL1
  -DWOLF3D
)

for file in "${FILES[@]}"; do
  src="$SRC_DIR/$file"
  log="$OUT_DIR/${file}.log"
  if emcc "${COMMON_FLAGS[@]}" "$src" >"$log" 2>&1; then
    printf '%s\n' "$file" >>"$PASS_LIST"
  else
    printf '%s\n' "$file" >>"$FAIL_LIST"
  fi
done

{
  echo "WOLFSRC Runtime Compile Probe"
  echo "Date: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  echo "Source: $SRC_DIR"
  echo "Compat include: $COMPAT_DIR"
  echo
  echo "Passed: $(wc -l < "$PASS_LIST" | tr -d ' ')"
  cat "$PASS_LIST"
  echo
  echo "Failed: $(wc -l < "$FAIL_LIST" | tr -d ' ')"
  cat "$FAIL_LIST"
  echo
  echo "Per-file compiler logs are in: $OUT_DIR"
  if [[ -s "$FAIL_LIST" ]]; then
    echo
    echo "Failure excerpts (first 60 lines per failed file):"
    while IFS= read -r failed_file; do
      [[ -z "$failed_file" ]] && continue
      echo
      echo "--- $failed_file ---"
      sed -n '1,60p' "$OUT_DIR/${failed_file}.log"
    done < "$FAIL_LIST"
  fi
} >"$SUMMARY"

cat "$SUMMARY"

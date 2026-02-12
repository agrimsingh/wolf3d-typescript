#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="$ROOT_DIR/artifacts/wolfsrc-compat"

bash "$ROOT_DIR/scripts/wasm/prepare-wolfsrc.sh" >/dev/null
bash "$ROOT_DIR/scripts/wasm/probe-wolfsrc-runtime.sh" >/dev/null

PASS_FILE="$OUT_DIR/passed.txt"
FAIL_FILE="$OUT_DIR/failed.txt"
SUMMARY_FILE="$OUT_DIR/probe-summary.txt"

pass_count="$(wc -l <"$PASS_FILE" | tr -d ' ')"
fail_count="$(wc -l <"$FAIL_FILE" | tr -d ' ')"

if [[ "$fail_count" != "0" ]]; then
  cat "$SUMMARY_FILE"
  echo "WOLFSRC compatibility probe failed: $fail_count file(s) did not compile." >&2
  exit 1
fi

echo "WOLFSRC compatibility probe green: $pass_count file(s) compile."

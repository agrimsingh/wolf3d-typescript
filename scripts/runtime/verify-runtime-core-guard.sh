#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE_FILE="$ROOT_DIR/specs/generated/runtime-core-mode.json"
TS_RUNTIME="$ROOT_DIR/src/runtime/tsRuntime.ts"

if [[ ! -f "$MODE_FILE" ]]; then
  echo "Missing runtime core mode file: $MODE_FILE" >&2
  exit 1
fi

mode="$(node -e "const fs=require('fs'); const v=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(v.mode||''));" "$MODE_FILE")"

if [[ "$mode" != "synthetic" && "$mode" != "real" ]]; then
  echo "Invalid runtime core mode '$mode' in $MODE_FILE" >&2
  exit 1
fi

if [[ "$mode" == "synthetic" ]]; then
  if ! rg -q "RUNTIME_CORE_KIND = 'synthetic'" "$TS_RUNTIME"; then
    echo "Mode is synthetic, but synthetic runtime marker was not found in $TS_RUNTIME" >&2
    exit 1
  fi
  echo "Runtime core guard: synthetic mode active (expected for pre-F5 phases)."
  exit 0
fi

if rg -q "RUNTIME_CORE_KIND = 'synthetic'" "$TS_RUNTIME"; then
  echo "Runtime core guard failed: mode=real but synthetic runtime marker still exists in $TS_RUNTIME" >&2
  exit 1
fi

echo "Runtime core guard: real mode active and synthetic marker is absent."

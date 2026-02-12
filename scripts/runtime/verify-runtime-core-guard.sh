#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE_FILE="$ROOT_DIR/specs/generated/runtime-core-mode.json"
TS_RUNTIME="$ROOT_DIR/src/runtime/tsRuntime.ts"
RUNTIME_CONTROLLER="$ROOT_DIR/src/app/runtimeController.ts"

if [[ ! -f "$MODE_FILE" ]]; then
  echo "Missing runtime core mode file: $MODE_FILE" >&2
  exit 1
fi

mode="$(node -e "const fs=require('fs'); const v=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(v.mode||''));" "$MODE_FILE")"
phase="$(node -e "const fs=require('fs'); const v=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(v.phase||''));" "$MODE_FILE")"

if [[ "$mode" != "synthetic" && "$mode" != "real" ]]; then
  echo "Invalid runtime core mode '$mode' in $MODE_FILE" >&2
  exit 1
fi

if [[ "$phase" != "" && ! "$phase" =~ ^([FRG][0-9]+)$ ]]; then
  echo "Invalid runtime phase '$phase' in $MODE_FILE (expected F#, R#, or G#)." >&2
  exit 1
fi

phase_family="$(node -e "const p=process.argv[1]||''; const m=p.match(/^([FRG])[0-9]+$/); process.stdout.write(m?m[1]:'');" "$phase")"
phase_num="$(node -e "const p=process.argv[1]||''; const m=p.match(/^[FRG]([0-9]+)$/); process.stdout.write(m?String(Number(m[1])):'-1');" "$phase")"

if [[ "$mode" == "synthetic" ]]; then
  if ! rg -q "RUNTIME_CORE_KIND = 'synthetic'" "$TS_RUNTIME"; then
    echo "Mode is synthetic, but synthetic runtime marker was not found in $TS_RUNTIME" >&2
    exit 1
  fi
  echo "Runtime core guard: synthetic mode active for phase '$phase'."
  exit 0
fi

requires_pure_ts="false"
if [[ "$phase_family" == "R" && "$phase_num" -ge 9 ]]; then
  requires_pure_ts="true"
elif [[ "$phase_family" == "G" && "$phase_num" -ge 10 ]]; then
  requires_pure_ts="true"
fi

if [[ "$requires_pure_ts" == "true" ]]; then
  if ! rg -q "new TsRuntimePort\\(" "$RUNTIME_CONTROLLER"; then
    echo "Runtime core guard failed: phase '$phase' requires browser runtime to default to TsRuntimePort." >&2
    exit 1
  fi
  if rg -q "new WolfsrcOraclePort\\(" "$RUNTIME_CONTROLLER"; then
    echo "Runtime core guard failed: phase '$phase' still defaults browser runtime to WolfsrcOraclePort." >&2
    exit 1
  fi
  if rg -q "RUNTIME_CORE_KIND = 'synthetic'" "$TS_RUNTIME"; then
    echo "Runtime core guard failed: phase '$phase' requires non-synthetic TS runtime core." >&2
    exit 1
  fi
  echo "Runtime core guard: phase '$phase' uses non-synthetic TsRuntimePort production runtime path."
  exit 0
fi

echo "Runtime core guard: real mode active for phase '$phase'."

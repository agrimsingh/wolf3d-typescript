#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE_FILE="$ROOT_DIR/specs/generated/runtime-core-mode.json"
WL1_DATA="$ROOT_DIR/src/runtime/wl1LevelData.ts"
RUNTIME_CONTRACTS="$ROOT_DIR/src/runtime/contracts.ts"

if [[ ! -f "$MODE_FILE" ]]; then
  echo "Missing runtime core mode file: $MODE_FILE" >&2
  exit 1
fi

phase="$(node -e "const fs=require('fs'); const v=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(v.phase||''));" "$MODE_FILE")"
phase_family="$(node -e "const p=process.argv[1]||''; const m=p.match(/^([FRG])[0-9]+$/); process.stdout.write(m?m[1]:'');" "$phase")"
phase_num="$(node -e "const p=process.argv[1]||''; const m=p.match(/^[FRG]([0-9]+)$/); process.stdout.write(m?String(Number(m[1])):'-1');" "$phase")"

requires_full_world="false"
if [[ "$phase_family" == "G" && "$phase_num" -ge 4 ]]; then
  requires_full_world="true"
fi

if [[ "$requires_full_world" == "true" ]]; then
  if rg -n "buildRuntimeWindowBits|runtimeWindowOriginX|runtimeWindowOriginY|mapLo:|mapHi:" "$WL1_DATA" "$RUNTIME_CONTRACTS" >/tmp/runtime_world_guard_matches.txt 2>/dev/null; then
    echo "Runtime world guard failed: 8x8/windowed world modeling artifacts remain after phase '$phase'." >&2
    cat /tmp/runtime_world_guard_matches.txt >&2
    rm -f /tmp/runtime_world_guard_matches.txt
    exit 1
  fi
  rm -f /tmp/runtime_world_guard_matches.txt
  echo "Runtime world guard: full-world runtime model check passed for phase '$phase'."
  exit 0
fi

echo "Runtime world guard: phase '$phase' does not require full-world model enforcement yet."

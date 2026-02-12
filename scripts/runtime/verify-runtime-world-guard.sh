#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE_FILE="$ROOT_DIR/specs/generated/runtime-core-mode.json"
WL1_DATA="$ROOT_DIR/src/runtime/wl1LevelData.ts"
RUNTIME_CONTRACTS="$ROOT_DIR/src/runtime/contracts.ts"
RUNTIME_CONTROLLER="$ROOT_DIR/src/app/runtimeController.ts"

if [[ ! -f "$MODE_FILE" ]]; then
  echo "Missing runtime core mode file: $MODE_FILE" >&2
  exit 1
fi

phase="$(node -e "const fs=require('fs'); const v=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(v.phase||''));" "$MODE_FILE")"
phase_family="$(node -e "const p=process.argv[1]||''; const m=p.match(/^([FRGK])[0-9]+$/); process.stdout.write(m?m[1]:'');" "$phase")"
phase_num="$(node -e "const p=process.argv[1]||''; const m=p.match(/^[FRGK]([0-9]+)$/); process.stdout.write(m?String(Number(m[1])):'-1');" "$phase")"

requires_full_world="false"
if [[ "$phase_family" == "G" && "$phase_num" -ge 4 ]]; then
  requires_full_world="true"
elif [[ "$phase_family" == "K" && "$phase_num" -ge 4 ]]; then
  requires_full_world="true"
fi

if [[ "$requires_full_world" == "true" ]]; then
  if ! rg -q "runtime\\.init\\(\\{ \\.\\.\\.scenario\\.config \\}\\)" "$RUNTIME_CONTROLLER"; then
    echo "Runtime world guard failed: runtime controller is not initializing from full scenario config at phase '$phase'." >&2
    exit 1
  fi
  if ! rg -q "plane0" "$WL1_DATA" || ! rg -q "plane1" "$WL1_DATA" || ! rg -q "worldStartXQ8|worldStartYQ8" "$WL1_DATA"; then
    echo "Runtime world guard failed: WL1 loader is missing full plane data fields at phase '$phase'." >&2
    exit 1
  fi
  if ! rg -q "worldXQ8|worldYQ8|mapWidth|mapHeight" "$RUNTIME_CONTRACTS"; then
    echo "Runtime world guard failed: runtime contracts do not expose full-world state fields at phase '$phase'." >&2
    exit 1
  fi
  echo "Runtime world guard: full-world runtime model check passed for phase '$phase'."
  exit 0
fi

echo "Runtime world guard: phase '$phase' does not require full-world model enforcement yet."

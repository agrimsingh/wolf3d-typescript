#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE_FILE="$ROOT_DIR/specs/generated/runtime-core-mode.json"
RUNTIME_CONTROLLER="$ROOT_DIR/src/app/runtimeController.ts"

if [[ ! -f "$MODE_FILE" ]]; then
  echo "Missing runtime core mode file: $MODE_FILE" >&2
  exit 1
fi

phase="$(node -e "const fs=require('fs'); const v=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(v.phase||''));" "$MODE_FILE")"
phase_num="$(node -e "const p=process.argv[1]||''; const m=p.match(/^R([0-9]+)$/); process.stdout.write(m?String(Number(m[1])):'-1');" "$phase")"

if [[ "$phase_num" -ge 9 ]]; then
  if rg -n "loadWl1RuntimeScenarios|wl1RuntimeScenarios" "$RUNTIME_CONTROLLER" >/tmp/runtime_fixture_guard_matches.txt 2>/dev/null; then
    echo "Runtime scenario fixture guard failed: synthetic scenario loader remains in production runtime path at phase '$phase'." >&2
    cat /tmp/runtime_fixture_guard_matches.txt >&2
    rm -f /tmp/runtime_fixture_guard_matches.txt
    exit 1
  fi
  rm -f /tmp/runtime_fixture_guard_matches.txt
  echo "Runtime scenario fixture guard: no synthetic scenario fixture usage detected for phase '$phase'."
  exit 0
fi

echo "Runtime scenario fixture guard: phase '$phase' (<R9), synthetic scenario loader usage is allowed."

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE_FILE="$ROOT_DIR/specs/generated/runtime-core-mode.json"
RUNTIME_CONTROLLER="$ROOT_DIR/src/app/runtimeController.ts"
GAME_APP="$ROOT_DIR/src/app/gameApp.ts"

if [[ ! -f "$MODE_FILE" ]]; then
  echo "Missing runtime core mode file: $MODE_FILE" >&2
  exit 1
fi

phase="$(node -e "const fs=require('fs'); const v=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(v.phase||''));" "$MODE_FILE")"
phase_family="$(node -e "const p=process.argv[1]||''; const m=p.match(/^([FRGK])[0-9]+$/); process.stdout.write(m?m[1]:'');" "$phase")"
phase_num="$(node -e "const p=process.argv[1]||''; const m=p.match(/^[FRGK]([0-9]+)$/); process.stdout.write(m?String(Number(m[1])):'-1');" "$phase")"

requires_no_fixture_loader="false"
if [[ "$phase_family" == "R" && "$phase_num" -ge 9 ]]; then
  requires_no_fixture_loader="true"
elif [[ "$phase_family" == "G" && "$phase_num" -ge 10 ]]; then
  requires_no_fixture_loader="true"
elif [[ "$phase_family" == "K" && "$phase_num" -ge 11 ]]; then
  requires_no_fixture_loader="true"
fi

if [[ "$requires_no_fixture_loader" == "true" ]]; then
  if rg -n "loadWl1RuntimeScenarios|wl1RuntimeScenarios" "$RUNTIME_CONTROLLER" "$GAME_APP" >/tmp/runtime_fixture_guard_matches.txt 2>/dev/null; then
    echo "Runtime scenario fixture guard failed: synthetic/runtime fixture loader remains in production runtime path at phase '$phase'." >&2
    cat /tmp/runtime_fixture_guard_matches.txt >&2
    rm -f /tmp/runtime_fixture_guard_matches.txt
    exit 1
  fi

  if rg -n "wl1Campaign|wl1LevelData|Wl1RuntimeScenario" "$RUNTIME_CONTROLLER" "$GAME_APP" >/tmp/runtime_legacy_links.txt 2>/dev/null; then
    echo "Runtime scenario fixture guard failed: legacy WL1 runtime links remain in production app/runtime path at phase '$phase'." >&2
    cat /tmp/runtime_legacy_links.txt >&2
    rm -f /tmp/runtime_legacy_links.txt
    exit 1
  fi

  rm -f /tmp/runtime_fixture_guard_matches.txt
  rm -f /tmp/runtime_legacy_links.txt
  echo "Runtime scenario fixture guard: no synthetic fixture loader usage detected for phase '$phase'."
  exit 0
fi

echo "Runtime scenario fixture guard: phase '$phase' does not require fixture-loader removal yet."

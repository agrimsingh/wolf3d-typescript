#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

PATTERN="from ['\\\"]\\.\\./(actors|audio|game|map|math|player|render|ui)/"

if rg -n "$PATTERN" src/runtime src/oracle/runtimeOracle.ts >/tmp/runtime_fallback_matches.txt 2>/dev/null; then
  echo "Prototype fallback imports detected in runtime execution path:" >&2
  cat /tmp/runtime_fallback_matches.txt >&2
  rm -f /tmp/runtime_fallback_matches.txt
  exit 1
fi

rm -f /tmp/runtime_fallback_matches.txt
echo "No prototype fallback imports detected in runtime execution path."

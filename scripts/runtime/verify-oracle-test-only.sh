#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

TMP_FILE="/tmp/runtime_oracle_import_matches.txt"
PATTERN="from ['\"][^'\"]*oracle"

if rg -n "$PATTERN" src/app src/runtime src/main.ts >"$TMP_FILE" 2>/dev/null; then
  echo "Oracle import detected in production runtime path (oracle must remain test-only):" >&2
  cat "$TMP_FILE" >&2
  rm -f "$TMP_FILE"
  exit 1
fi

rm -f "$TMP_FILE"
echo "Oracle isolation guard: production runtime path has no oracle imports."

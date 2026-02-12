#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

require_file() {
  local path="$1"
  if [[ ! -f "$ROOT_DIR/$path" ]]; then
    echo "Missing required file: $path" >&2
    exit 1
  fi
}

require_text() {
  local path="$1"
  local pattern="$2"
  if ! rg -q --fixed-strings "$pattern" "$ROOT_DIR/$path"; then
    echo "Expected text not found in $path: $pattern" >&2
    exit 1
  fi
}

require_file "README.md"
require_file "TODO.md"
require_file "specs/runtime-gap-assessment.md"
require_file "specs/wl6-modern-runtime-execution-spec.md"

require_text "README.md" "Wolf3D TypeScript Port (Oracle-Driven)"
require_text "README.md" "C/WASM oracle"
require_text "README.md" "TODO.md"
require_text "TODO.md" "K0: README Baseline + Truth Reset"
require_text "TODO.md" "K12: Full-Episode Parity Lock + CI Freeze + Merge"
require_text "specs/runtime-gap-assessment.md" "WL6"
require_text "specs/wl6-modern-runtime-execution-spec.md" "K0..K12"

echo "Docs verification passed."

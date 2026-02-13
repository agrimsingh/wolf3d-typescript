#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ARTIFACT_DIR="$ROOT_DIR/artifacts/one-shot-vswap"
STATE_FILE="$ARTIFACT_DIR/state.json"

mkdir -p "$ARTIFACT_DIR"

log() {
  local ts
  ts="$(date +"%Y-%m-%dT%H:%M:%S%z")"
  echo "[$ts] $*"
}

write_state() {
  local stage="$1"
  local status="$2"
  cat >"$STATE_FILE" <<EOF_JSON
{
  "stage": "$stage",
  "status": "$status",
  "updatedAt": "$(date +"%Y-%m-%dT%H:%M:%S%z")"
}
EOF_JSON
}

run_cmd() {
  local stage="$1"
  shift
  log "[$stage] $*"
  if ! "$@"; then
    write_state "$stage" "failed"
    log "Failed stage: $stage"
    log "Resume by rerunning: bash scripts/one-shot/run-wl6-vswap-integration.sh"
    exit 1
  fi
}

commit_stage() {
  local stage="$1"
  local message="$2"
  if [[ -z "$(git status --porcelain)" ]]; then
    log "[$stage] no changes to commit"
    return 0
  fi
  git add -A
  git commit -m "$message"
}

run_stage() {
  local stage="$1"
  local message="$2"
  shift 2

  write_state "$stage" "running"
  for cmd in "$@"; do
    # shellcheck disable=SC2086
    run_cmd "$stage" bash -lc "$cmd"
  done
  commit_stage "$stage" "$message"
  write_state "$stage" "done"
}

cd "$ROOT_DIR"

run_stage "decode-foundation" "k7a: add wl6 vswap/map decode foundation" \
  "pnpm typecheck" \
  "pnpm exec vitest run test/property/runtime.vswap-decode.test.ts"

run_stage "wall-door-runtime" "k7b: drive wall and door textures from wl6 tile ids" \
  "pnpm exec vitest run test/property/runtime.renderer-orientation.test.ts test/property/runtime.fullmap-interactions.test.ts"

run_stage "actor-sprites-runtime" "k7c: render actors from vswap sprite posts" \
  "pnpm exec vitest run test/property/runtime.actor-combat.test.ts test/property/runtime.actor-sprite-render.test.ts"

run_stage "app-wiring-smoke" "k7d: remove manual sprite patching and wire canonical asset path" \
  "pnpm test:smoke" \
  "pnpm typecheck"

run_stage "full-verification" "k7e: lock wl6 canonical asset-driven rendering parity" \
  "pnpm runtime:parity:test" \
  "pnpm runtime:required:verify"

write_state "complete" "done"
log "All stages passed."
log "Artifacts: $ARTIFACT_DIR"
log "Rerun command: bash scripts/one-shot/run-wl6-vswap-integration.sh"

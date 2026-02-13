#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/artifacts/one-shot-hardening/logs"
mkdir -p "$LOG_DIR"

STAGES=(
  "h1|pnpm typecheck && pnpm exec vitest run test/property/runtime.actor-combat.test.ts test/property/runtime.fullmap-interactions.test.ts|k10a: centralize wl6 plane1 marker classification and semantics"
  "h2|pnpm exec vitest run test/property/runtime.fullmap-interactions.test.ts test/property/runtime.actor-sprite-render.test.ts && pnpm test:smoke|k10b: harden wl6 collectibles keys treasures and dead-guard semantics"
  "h3|pnpm exec vitest run test/property/runtime.wl6-palette.test.ts test/property/runtime.actor-sprite-render.test.ts && pnpm typecheck|k10c: lock wl6 palette and deterministic sprite visibility stability"
  "h4|pnpm test:smoke && bash scripts/one-shot/run-wl6-browser-scene-check.sh|k10d: add deterministic browser scene check artifacts and hash manifest"
  "h5|pnpm runtime:parity:test && pnpm runtime:required:verify && pnpm test:smoke && bash scripts/one-shot/run-wl6-browser-scene-check.sh|k10e: ship one-shot wl6 full hardening pipeline and documentation sync"
)

log() {
  local ts
  ts="$(date +"%Y-%m-%dT%H:%M:%S%z")"
  echo "[$ts] $*"
}

run_stage() {
  local stage_name=$1
  local gate_cmd=$2
  local commit_msg=$3
  local stage_log="$LOG_DIR/${stage_name}.log"

  log "=== Stage ${stage_name} ==="
  log "Gates: ${gate_cmd}"

  if ! (cd "$ROOT_DIR" && bash -lc "$gate_cmd") >"$stage_log" 2>&1; then
    log "Stage ${stage_name} failed."
    log "Log: ${stage_log}"
    log "Resume with: bash scripts/one-shot/run-wl6-full-hardening.sh --from ${stage_name}"
    return 1
  fi

  if [[ -n "$(cd "$ROOT_DIR" && git status --porcelain)" ]]; then
    (cd "$ROOT_DIR" && git add -A && git commit -m "$commit_msg") || {
      log "Commit failed for ${stage_name}."
      log "Resume with: bash scripts/one-shot/run-wl6-full-hardening.sh --from ${stage_name}"
      return 1
    }
  else
    log "No changes to commit for ${stage_name}."
  fi

  log "Stage ${stage_name} passed."
}

START_FROM="h1"
if [[ "${1:-}" == "--from" ]]; then
  START_FROM="${2:-h1}"
fi

seen_start=false
for entry in "${STAGES[@]}"; do
  IFS='|' read -r stage_name gate_cmd commit_msg <<<"$entry"

  if [[ "$seen_start" == false ]]; then
    if [[ "$stage_name" != "$START_FROM" ]]; then
      continue
    fi
    seen_start=true
  fi

  run_stage "$stage_name" "$gate_cmd" "$commit_msg"
done

log "WL6 full hardening one-shot complete."

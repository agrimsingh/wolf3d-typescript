#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATE_FILE="$ROOT_DIR/specs/generated/one-shot-wl6-state.json"
MODE_FILE="$ROOT_DIR/specs/generated/runtime-core-mode.json"

mkdir -p "$ROOT_DIR/specs/generated"

if [[ ! -f "$STATE_FILE" ]]; then
  cat >"$STATE_FILE" <<'JSON'
{
  "version": 1,
  "phase": "K0",
  "status": "not-started",
  "phases": [
    "K0",
    "K1",
    "K2",
    "K3",
    "K4",
    "K5",
    "K6",
    "K7",
    "K8",
    "K9",
    "K10",
    "K11",
    "K12"
  ],
  "notes": []
}
JSON
fi

log() {
  local ts
  ts="$(date +"%Y-%m-%dT%H:%M:%S%z")"
  echo "[$ts] $*"
}

read_state() {
  node - "$STATE_FILE" <<'EOF_NODE'
const fs = require('fs');
const path = process.argv[2];
const v = JSON.parse(fs.readFileSync(path, 'utf8'));
console.log(v.phase || 'K0');
EOF_NODE
}

set_mode_phase() {
  local phase=$1
  node - "$MODE_FILE" "$phase" <<'EOF_NODE'
const fs = require('fs');
const path = process.argv[2];
const phase = process.argv[3];
const payload = {
  phase,
  mode: 'real',
  notes: 'one-shot autolaunch',
  updatedAt: new Date().toISOString(),
};
fs.writeFileSync(path, JSON.stringify(payload, null, 2) + '\n', 'utf8');
EOF_NODE
}

run_cmd() {
  local cmd=$1
  log "+ ${cmd}"
  # shellcheck disable=SC2086
  eval "$cmd"
}

mark_phase_done() {
  local phase=$1
  node - "$STATE_FILE" "$phase" <<'EOF_NODE'
const fs = require('fs');
const path = process.argv[2];
const phase = process.argv[3];
const state = JSON.parse(fs.readFileSync(path, 'utf8'));
if (!Array.isArray(state.phases)) {
  state.phases = [];
}
const idx = state.phases.indexOf(phase);
if (idx >= 0) {
  state.phases = state.phases.filter((p) => p !== phase);
}
state.status = 'complete';
const parsed = /^K(\d+)$/.exec(phase || '');
if (parsed) {
  const next = Number(parsed[1]) + 1;
  state.phase = `K${next}`;
} else {
  state.phase = phase;
}
state.phaseHistory = state.phaseHistory || [];
state.phaseHistory.push({
  phase,
  completedAt: new Date().toISOString(),
});
fs.writeFileSync(path, JSON.stringify(state, null, 2) + '\n', 'utf8');
EOF_NODE
}

commit_phase() {
  local phase=$1
  local message=$2

  if [[ -z "$(git status --porcelain)" ]]; then
    log "No changes to commit for ${phase}."
    return 0
  fi

  git add -A
  if ! git commit -m "${message}"; then
    log "Commit failed for ${phase}; aborting."
    exit 1
  fi

  mark_phase_done "$phase"
}

agent_browser_smoke() {
  local phase=$1
  if command -v agent-browser >/dev/null 2>&1; then
    log "agent-browser available; recording smoke placeholder for ${phase}."
    local artifact_dir="$ROOT_DIR/artifacts/one-shot-agent/${phase}"
    mkdir -p "$artifact_dir"
    cat >"$artifact_dir/checkpoint.json" <<EOF_JSON
{
  "phase": "${phase}",
  "phaseResult": "attempted",
    "timestamp": "$(date +"%Y-%m-%dT%H:%M:%S%z")"
}
EOF_JSON
  else
    log "agent-browser not installed; skipping browser check for ${phase}."
  fi
}

run_phase() {
  local phase=$1
  shift
  local msg=$1
  shift

  set_mode_phase "$phase"
  log "=== Starting ${phase}: ${msg} ==="
  for cmd in "$@"; do
    if ! run_cmd "$cmd"; then
      log "Phase ${phase} failed in command: ${cmd}"
      exit 1
    fi
  done
  agent_browser_smoke "$phase"
  commit_phase "$phase" "$msg"
}

cd "$ROOT_DIR"

PHASE="$(read_state)"
log "One-shot launcher start from ${PHASE}"

case "$PHASE" in
  K0)
    run_phase K0 "wl6:p0 truth reset and guard lock" \
      "bash scripts/runtime/verify-runtime-core-guard.sh" \
      "bash scripts/runtime/verify-no-prototype-fallback.sh" \
      "pnpm test:smoke"
    ;;
  K1)
    run_phase K1 "wl6:p1 wl6 assets and mapping baseline" \
      "pnpm assets:fetch:wl6" \
      "pnpm assets:import:modern:wl6" \
      "pnpm verify:assets:wl6" \
      "pnpm assets:validate:wl6" \
      "pnpm assets:map:validate:wl6"
    ;;
  K2)
    run_phase K2 "wl6:p2 contracts and deterministic state schema" \
      "pnpm typecheck" \
      "pnpm lint --filter src/oracle src/runtime src/wolf" 
    ;;
  K3)
    run_phase K3 "wl6:p3 real wolfsrc runtime determinism" \
      "pnpm wasm:prepare:wolfsrc" \
      "pnpm wasm:build" \
      "pnpm runtime:parity:test"
    ;;
  K4)
    run_phase K4 "wl6:p4 runtime symbol lock" \
      "pnpm runtime:manifest:extract" \
      "pnpm runtime:classification:verify" \
      "pnpm runtime:manifest:verify"
    ;;
  K5)
    run_phase K5 "wl6:p5 full-world map boot parity" \
      "pnpm test:property:local -- test/property/phase2.map-loading.test.ts" \
      "pnpm test:property:ci -- test/property/phase2.map-loading.test.ts"
    ;;
  K6)
    run_phase K6 "wl6:p6 renderer parity" \
      "pnpm test:property:local -- test/property/raycasting" \
      "pnpm test:property:ci -- test/property/raycasting" \
      "pnpm runtime:checkpoints:verify"
    ;;
  K7)
    run_phase K7 "wl6:p7 player movement doors gameplay loop" \
      "pnpm test:property:local -- test/property/movement" \
      "pnpm test:property:ci -- test/property/movement" \
      "pnpm runtime:checkpoints:generate"
    ;;
  K8)
    run_phase K8 "wl6:p8 ai actor combat parity" \
      "pnpm test:property:local -- test/property/actors" \
      "pnpm test:property:ci -- test/property/actors"
    ;;
  K9)
    run_phase K9 "wl6:p9 menu text input audo parity" \
      "pnpm test:property:local -- test/property/menu" \
      "pnpm test:property:ci -- test/property/menu"
    ;;
  K10)
    run_phase K10 "wl6:p10 full runtime production swap" \
      "pnpm runtime:required:verify" \
      "pnpm test:smoke" \
      "pnpm build"
    ;;
  K11)
    run_phase K11 "wl6:p11 full episode parity + ci" \
      "pnpm runtime:checkpoints:verify" \
      "pnpm runtime:episode:verify" \
      "pnpm runtime:required:verify"
    ;;
  K12)
    run_phase K12 "wl6:p12 merge and release" "pnpm verify"
    ;;
  *)
    log "Unknown phase ${PHASE}; nothing to do."
    ;;
esac

PHASE="$(read_state)"
log "One-shot phase completed up to ${PHASE}."
log "Resume by rerunning: $(basename "$0")"

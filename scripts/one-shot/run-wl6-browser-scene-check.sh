#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ART_DIR="$ROOT_DIR/artifacts/one-shot-hardening/browser"
SCENES_DIR="$ART_DIR/scenes"
MANIFEST_PATH="$ART_DIR/hash-manifest.json"
LOCK_PATH="$ART_DIR/hash-manifest.lock.json"
DEV_LOG="$ART_DIR/dev-server.log"
SESSION="wl6-hardening-$$"
URL="http://127.0.0.1:5173"

mkdir -p "$SCENES_DIR"

cleanup() {
  if [[ -n "${DEV_PID:-}" ]]; then
    kill "$DEV_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

run_ab() {
  agent-browser --session "$SESSION" "$@"
}

hold_key() {
  local code=$1
  local key=$2
  local ms=$3
  run_ab eval "window.dispatchEvent(new KeyboardEvent('keydown',{code:'${code}',key:'${key}'}));" >/dev/null
  run_ab wait "$ms" >/dev/null
  run_ab eval "window.dispatchEvent(new KeyboardEvent('keyup',{code:'${code}',key:'${key}'}));" >/dev/null
}

capture_scene() {
  local scene_id=$1
  local map_index=$2
  local note=$3
  local image_path="$SCENES_DIR/${scene_id}.png"
  run_ab screenshot "$image_path" >/dev/null
  local sha
  sha="$(shasum -a 256 "$image_path" | awk '{print $1}')"
  printf '%s\t%s\t%s\t%s\t%s\n' "$scene_id" "$image_path" "$sha" "$map_index" "$note" >>"$ART_DIR/.scene_rows.tsv"
}

rm -f "$ART_DIR/.scene_rows.tsv"

pnpm dev --host 127.0.0.1 --port 5173 >"$DEV_LOG" 2>&1 &
DEV_PID=$!

for _ in $(seq 1 60); do
  if curl -fsS "$URL" >/dev/null 2>&1; then
    break
  fi
  sleep 0.2
done

run_ab set viewport 1280 720 >/dev/null
run_ab open "$URL" >/dev/null
run_ab wait 1400 >/dev/null
run_ab click canvas >/dev/null
run_ab press Enter >/dev/null
run_ab wait 200 >/dev/null
run_ab press Enter >/dev/null
run_ab wait 1400 >/dev/null

capture_scene "e1m1_spawn_opening_area" 0 "map0 start after deterministic boot"

hold_key "KeyW" "w" 700
run_ab wait 250 >/dev/null
capture_scene "e1m1_deadguard_corridor_zone" 0 "map0 corridor move from spawn"

run_ab eval "window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW',key:'w'}));" >/dev/null
run_ab eval "window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyS',key:'s'}));" >/dev/null
run_ab wait 700 >/dev/null
run_ab eval "window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyS',key:'s'}));" >/dev/null
run_ab wait 200 >/dev/null
capture_scene "door_before_interaction" 0 "door closed before use"

run_ab press e >/dev/null
run_ab wait 900 >/dev/null
capture_scene "door_after_interaction" 0 "same view after use interaction"

hold_key "ArrowLeft" "ArrowLeft" 550
run_ab wait 250 >/dev/null
capture_scene "enemy_occlusion_probe" 0 "occlusion probe view"

node - "$ART_DIR/.scene_rows.tsv" "$MANIFEST_PATH" <<'EOF_NODE'
const fs = require('fs');
const rowsPath = process.argv[2];
const outPath = process.argv[3];
const lines = fs.readFileSync(rowsPath, 'utf8').trim().split(/\n+/).filter(Boolean);
const scenes = lines.map((line) => {
  const [sceneId, imagePath, sha256, mapIndex, note] = line.split('\t');
  return {
    sceneId,
    imagePath,
    sha256,
    metadata: {
      mapIndex: Number(mapIndex),
      note,
      seed: 0,
      config: 'wl6-default',
    },
  };
});
const payload = {
  generatedAt: new Date().toISOString(),
  session: 'wl6-hardening',
  sceneCount: scenes.length,
  scenes,
};
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
EOF_NODE

if [[ ! -f "$LOCK_PATH" ]]; then
  cp "$MANIFEST_PATH" "$LOCK_PATH"
  echo "Created lock manifest: $LOCK_PATH"
else
  node - "$LOCK_PATH" "$MANIFEST_PATH" <<'EOF_NODE'
const fs = require('fs');
const lockPath = process.argv[2];
const curPath = process.argv[3];
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
const cur = JSON.parse(fs.readFileSync(curPath, 'utf8'));
const lockMap = new Map((lock.scenes || []).map((s) => [s.sceneId, s.sha256]));
const curMap = new Map((cur.scenes || []).map((s) => [s.sceneId, s.sha256]));
let ok = true;
for (const [id, hash] of lockMap) {
  const next = curMap.get(id);
  if (!next || next !== hash) {
    console.error(`Hash drift for scene ${id}: expected ${hash}, got ${next || '<missing>'}`);
    ok = false;
  }
}
for (const id of curMap.keys()) {
  if (!lockMap.has(id)) {
    console.error(`Unexpected new scene id in manifest: ${id}`);
    ok = false;
  }
}
if (!ok) {
  process.exit(1);
}
EOF_NODE
fi

echo "Browser scene check complete: $MANIFEST_PATH"

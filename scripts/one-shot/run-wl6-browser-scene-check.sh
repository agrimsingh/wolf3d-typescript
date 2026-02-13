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
run_ab wait 1000 >/dev/null

run_ab eval "(async()=>{for(let i=0;i<300;i++){const c=window.__wolfDebugController;if(c&&typeof c.getState==='function'&&c.getState().mode!=='loading'){return c.getState().mode;} await new Promise(r=>setTimeout(r,10));} throw new Error('Runtime controller not ready');})()" >/dev/null
run_ab eval "(()=>{const c=window.__wolfDebugController; if(!c){throw new Error('missing debug controller');} const d=window.__wl6Det || {controller:c,time:0}; d.origTick=d.origTick||c.tick.bind(c); d.time=0; c.tick=()=>{}; window.__wl6Det=d; return true;})()" >/dev/null
run_ab eval "(async()=>{const d=window.__wl6Det; await d.controller.startScenario(0); d.time=0; d.origTick(0); d.origTick(100); d.origTick(200); d.origTick(300); return d.controller.getState().mode;})()" >/dev/null
run_ab wait 80 >/dev/null

capture_scene "e1m1_spawn_opening_area" 0 "map0 deterministic start"

run_ab eval "(()=>{const d=window.__wl6Det; const c=d.controller; c.onKeyDown('KeyW'); for(let i=0;i<10;i++){ d.time += 80; d.origTick(d.time); } c.onKeyUp('KeyW'); return c.getState().snapshot?.tick ?? -1;})()" >/dev/null
run_ab wait 60 >/dev/null
capture_scene "e1m1_deadguard_corridor_zone" 0 "map0 deterministic forward move"

run_ab eval "(async()=>{const d=window.__wl6Det; await d.controller.startScenario(0); d.time=0; d.origTick(0); d.origTick(100); d.origTick(200); return true;})()" >/dev/null
run_ab wait 60 >/dev/null
capture_scene "door_before_interaction" 0 "deterministic door view before use"

run_ab eval "(()=>{const d=window.__wl6Det; const c=d.controller; c.onKeyDown('KeyE'); d.time += 120; d.origTick(d.time); c.onKeyUp('KeyE'); for(let i=0;i<8;i++){ d.time += 80; d.origTick(d.time); } return c.getState().snapshot?.tick ?? -1;})()" >/dev/null
run_ab wait 60 >/dev/null
capture_scene "door_after_interaction" 0 "same deterministic view after use"

run_ab eval "(()=>{const d=window.__wl6Det; const c=d.controller; c.onKeyDown('ArrowLeft'); for(let i=0;i<8;i++){ d.time += 80; d.origTick(d.time); } c.onKeyUp('ArrowLeft'); return c.getState().snapshot?.angleDeg ?? -1;})()" >/dev/null
run_ab wait 60 >/dev/null
capture_scene "enemy_occlusion_probe" 0 "deterministic rotated occlusion probe"

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
      config: 'wl6-deterministic-debug-tick',
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

if [[ "${UPDATE_SCENE_LOCK:-0}" == "1" ]]; then
  cp "$MANIFEST_PATH" "$LOCK_PATH"
  echo "Updated lock manifest: $LOCK_PATH"
elif [[ ! -f "$LOCK_PATH" ]]; then
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

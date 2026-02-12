#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ASSET_DIR="$ROOT_DIR/assets/wl6/raw"
MANIFEST_DIR="$ROOT_DIR/assets/manifests"

REPO_URL="https://github.com/vpoupet/wolfenstein"
PINNED_COMMIT="5a1464d0bc907f4216f8db5e7f874ee8817771c5"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

echo "Cloning WL6 source repo..."
git clone --depth 1 "$REPO_URL" "$TMPDIR/repo" >/dev/null 2>&1
cd "$TMPDIR/repo"

git fetch --depth 1 origin "$PINNED_COMMIT" >/dev/null 2>&1
git checkout --quiet "$PINNED_COMMIT"

mkdir -p "$ASSET_DIR" "$MANIFEST_DIR"

cp -f data/MAPHEAD.WL6 "$ASSET_DIR/MAPHEAD.WL6"
cp -f data/GAMEMAPS.WL6 "$ASSET_DIR/GAMEMAPS.WL6"
cp -f data/VSWAP.WL6 "$ASSET_DIR/VSWAP.WL6"

cat > "$MANIFEST_DIR/wl6-source.json" <<JSON
{
  "repo": "$REPO_URL",
  "commit": "$PINNED_COMMIT",
  "subdir": "data",
  "files": [
    "MAPHEAD.WL6",
    "GAMEMAPS.WL6",
    "VSWAP.WL6"
  ]
}
JSON

echo "WL6 raw assets copied to $ASSET_DIR"

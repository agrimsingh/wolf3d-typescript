#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET_DIR="$ROOT_DIR/assets/wl6-modern"
MANIFEST_DIR="$ROOT_DIR/assets/manifests"
DEFAULT_ZIP="/Users/agrim/Downloads/wolf3d-assets.zip"
ZIP_PATH="${WOLF3D_MODERN_ASSETS_ZIP:-$DEFAULT_ZIP}"

if [[ ! -f "$ZIP_PATH" ]]; then
  echo "Modern asset zip not found: $ZIP_PATH" >&2
  echo "Set WOLF3D_MODERN_ASSETS_ZIP to the zip location." >&2
  exit 1
fi

rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR" "$MANIFEST_DIR"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

unzip -q "$ZIP_PATH" -d "$TMPDIR/unpack"

if [[ -d "$TMPDIR/unpack/wolf3d-assets" ]]; then
  cp -R "$TMPDIR/unpack/wolf3d-assets/." "$TARGET_DIR/"
else
  cp -R "$TMPDIR/unpack/." "$TARGET_DIR/"
fi

cat > "$MANIFEST_DIR/wl6-modern-source.json" <<JSON
{
  "zipPath": "$ZIP_PATH",
  "targetDir": "assets/wl6-modern"
}
JSON

echo "Modern WL6 assets imported to $TARGET_DIR"

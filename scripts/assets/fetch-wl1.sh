#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ASSET_DIR="$ROOT_DIR/assets"
WL1_DIR="$ASSET_DIR/wl1"
ZIP_PATH="$ASSET_DIR/wolf3dsw.zip"
URL="https://archive.org/download/wolf3dsw/wolf3dsw.zip"

mkdir -p "$ASSET_DIR"

if command -v wget >/dev/null 2>&1; then
  wget -O "$ZIP_PATH" "$URL"
else
  curl -L "$URL" -o "$ZIP_PATH"
fi

rm -rf "$WL1_DIR"
mkdir -p "$WL1_DIR"
unzip -o "$ZIP_PATH" -d "$WL1_DIR"

echo "WL1 assets downloaded to $WL1_DIR"

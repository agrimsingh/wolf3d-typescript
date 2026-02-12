#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ASSET_DIR="$ROOT_DIR/assets"
WL1_DIR="$ASSET_DIR/wl1"
ZIP_PATH="$ASSET_DIR/wolf3dsw.zip"
URL_PRIMARY="https://archive.org/download/wolf3dsw/wolf3dsw.zip"
URL_FALLBACK="https://archive.org/download/wolf3dsw/wolf3dsw.zip?download=1"
USER_AGENT="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

mkdir -p "$ASSET_DIR"

download_zip() {
  local url="$1"
  echo "Fetching WL1 assets from: $url"
  curl --fail --location \
    --retry 5 \
    --retry-all-errors \
    --retry-delay 2 \
    --connect-timeout 30 \
    --max-time 300 \
    --user-agent "$USER_AGENT" \
    "$url" \
    -o "$ZIP_PATH"
}

if ! download_zip "$URL_PRIMARY"; then
  echo "Primary download failed, retrying with fallback URL..." >&2
  download_zip "$URL_FALLBACK"
fi

rm -rf "$WL1_DIR"
mkdir -p "$WL1_DIR"
unzip -o "$ZIP_PATH" -d "$WL1_DIR"

echo "WL1 assets downloaded to $WL1_DIR"

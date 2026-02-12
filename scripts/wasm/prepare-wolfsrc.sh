#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="$ROOT_DIR/c-oracle/wolfsrc-sanitized"
VENDORED_DIR="$ROOT_DIR/c-oracle/vendor/wolfsrc-sanitized"
VENDORED_SHA="$ROOT_DIR/c-oracle/vendor/wolfsrc-sanitized.sha256"
SRC_DIR="${WOLF3D_SRC_DIR:-}"

REFRESH="${WOLF3D_PREPARE_REFRESH:-0}"
UPDATE_VENDOR="${WOLF3D_UPDATE_VENDOR:-0}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --refresh)
      REFRESH=1
      shift
      ;;
    --update-vendor)
      UPDATE_VENDOR=1
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "Usage: $0 [--refresh] [--update-vendor]" >&2
      exit 1
      ;;
  esac
done

if ! command -v shasum >/dev/null 2>&1; then
  echo "shasum command not found; required for vendored snapshot verification." >&2
  exit 1
fi

generate_checksums() {
  local dir="$1"
  local out="$2"
  (
    cd "$dir"
    find . -type f | sed 's#^./##' | sort | while IFS= read -r file; do
      shasum -a 256 "$file"
    done
  ) >"$out"
}

verify_vendored_snapshot() {
  if [[ ! -d "$VENDORED_DIR" ]]; then
    echo "Vendored snapshot directory missing: $VENDORED_DIR" >&2
    return 1
  fi
  if [[ ! -f "$VENDORED_SHA" ]]; then
    echo "Vendored checksum manifest missing: $VENDORED_SHA" >&2
    return 1
  fi

  local check_log
  check_log="$(mktemp)"
  if ! (cd "$VENDORED_DIR" && shasum -a 256 -c "$VENDORED_SHA" >"$check_log" 2>&1); then
    cat "$check_log" >&2
    rm -f "$check_log"
    echo "Vendored WOLFSRC snapshot checksum verification failed." >&2
    return 1
  fi
  rm -f "$check_log"
  return 0
}

prepare_from_source() {
  if [[ -z "$SRC_DIR" ]]; then
    echo "WOLF3D_SRC_DIR is not set. Set it to your wolf3d-master/WOLFSRC path and rerun with --refresh." >&2
    return 1
  fi
  if [[ ! -d "$SRC_DIR" ]]; then
    echo "WOLFSRC directory not found: $SRC_DIR" >&2
    return 1
  fi

  rm -rf "$OUT_DIR"
  mkdir -p "$OUT_DIR"

  rsync -a \
    --include='*/' \
    --include='*.C' \
    --include='*.H' \
    --exclude='*' \
    "$SRC_DIR/" "$OUT_DIR/"

  while IFS= read -r -d '' file; do
    perl -0777 -i -pe '
      s/\x1A//g;
      s#SYS\\STAT\.H#SYS/STAT.H#g;
      s#FOREIGN\\#FOREIGN/#g;
      s/^[ \t]*asm[^\n]*\n//mg;
      s/\(unsigned\)\s*linecmds\s*=\s*([^;]+);/WOLF_SET_LOW_WORD(linecmds, $1);/g;
      s/\(unsigned\)\s*postsource\s*=\s*([^;]+);/WOLF_SET_LOW_WORD(postsource, $1);/g;
      s/\(unsigned\)\s*actorat(\[[^\n;]+\])\s*=(?!=)\s*([^;]+);/actorat$1 = (objtype *)(uintptr_t)($2);/g;
      s/\*\s*\(\(unsigned\s+far\s+\*\)\s*code\)\+\+\s*=\s*([^;]+);/WOLF_WRITE_U16_INC(code, $1);/g;
      s/\*\s*\(\(unsigned\s+far\s+\*\)\s*([A-Za-z_][A-Za-z0-9_]*)\)\+\+/WOLF_READ_U16_INC($1)/g;
      s/\*\s*\(\(unsigned\s+char\s+far\s+\*\)\s*([A-Za-z_][A-Za-z0-9_]*)\)\+\+/WOLF_READ_U8_INC($1)/g;
      s/\(long\)\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([^;]+);/$1 = (__typeof__($1))(uintptr_t)($2);/g;
      s/&\s*\(\s*memptr\s*\)\s*([A-Za-z_][A-Za-z0-9_]*(?:\[[^\]]+\])*)/(memptr *)&$1/g;
      s/&\s*\(\(\s*memptr\s*\)\s*([A-Za-z_][A-Za-z0-9_]*(?:\[[^\]]+\])*)\)/(memptr *)&$1/g;
      s/(\.routine\s*=\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*;)/$1(void (*)(int))$2$3/g;
      s/void\s*\(\*\s*routine\s*\)\s*\(int\s+[A-Za-z_][A-Za-z0-9_]*\)/void (*routine)()/g;
      s/,\s*CP_LoadGame(\s*[\},])/, (void (*)())CP_LoadGame$1/g;
      s/,\s*CP_SaveGame(\s*[\},])/, (void (*)())CP_SaveGame$1/g;
      s/#define\s+VGAMAPMASK\(x\)\s+asm\{[^\n]*\}/#define VGAMAPMASK(x) ((void)0)/g;
      s/#define\s+VGAREADMAP\(x\)\s+asm\{[^\n]*\}/#define VGAREADMAP(x) ((void)0)/g;
      s/#define\s+VGAWRITEMODE\(x\)\s+asm\{\\.*?sti;\}/#define VGAWRITEMODE(x) ((void)0)/sg;
      s/#define\s+COLORBORDER\(color\)\s+asm\{.*?\};/#define COLORBORDER(color) ((void)0)/sg;
    ' "$file"
  done < <(find "$OUT_DIR" -type f \( -name '*.C' -o -name '*.H' \) -print0)

  echo "Prepared sanitized WOLFSRC from source: $SRC_DIR"
  echo "Output: $OUT_DIR"
}

if [[ "$REFRESH" != "1" ]]; then
  if verify_vendored_snapshot; then
    rm -rf "$OUT_DIR"
    mkdir -p "$OUT_DIR"
    rsync -a "$VENDORED_DIR/" "$OUT_DIR/"
    echo "Prepared sanitized WOLFSRC from vendored snapshot: $VENDORED_DIR"
    echo "Output: $OUT_DIR"
    exit 0
  fi
fi

prepare_from_source

if [[ "$UPDATE_VENDOR" == "1" ]]; then
  rm -rf "$VENDORED_DIR"
  mkdir -p "$VENDORED_DIR"
  rsync -a "$OUT_DIR/" "$VENDORED_DIR/"
  generate_checksums "$VENDORED_DIR" "$VENDORED_SHA"
  echo "Updated vendored snapshot and checksums:"
  echo "  - $VENDORED_DIR"
  echo "  - $VENDORED_SHA"
fi

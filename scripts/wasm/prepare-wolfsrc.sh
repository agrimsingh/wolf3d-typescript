#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC_DIR="${WOLF3D_SRC_DIR:-/Users/agrim/Downloads/ai fun projects/wolf3d-master/WOLFSRC}"
OUT_DIR="$ROOT_DIR/c-oracle/wolfsrc-sanitized"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "WOLFSRC directory not found: $SRC_DIR" >&2
  echo "Set WOLF3D_SRC_DIR to your wolf3d-master/WOLFSRC path." >&2
  exit 1
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

echo "Prepared sanitized WOLFSRC at $OUT_DIR"

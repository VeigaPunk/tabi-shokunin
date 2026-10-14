#!/usr/bin/env bash
# VER-B11 closeout verification (read-only). Run when training-closeout.md lands.
set -u
T=/home/vgpnk/Projects/shokunin/tabi-shokunin
F=/home/vgpnk/Projects/shokunin
C=$T/corpus/knowledge/training-closeout.md
OUT=/tmp/w11-ver-b11-poll/verify_closeout.txt
[ -f "$C" ] || { echo "NO CLOSEOUT at $(date -u +%FT%TZ)"; exit 1; }
{
echo "== VER-B11 closeout verification $(date -u +%FT%TZ)"
echo "== file: $(sha256sum "$C" | cut -c1-12) $(wc -l < "$C") lines $(wc -c < "$C") bytes"
echo "== header (first 6 lines)"; head -6 "$C"
echo "== mandatory markers"
for pat in 'round index\|Round index\|## 1\.\|## Round' 'axes\|Axes' 'debt\|Debt' 'operator\|Operator' 'never-set\|Never-set' 'residue\|Residue' 'handoff\|Handoff' 'closing\|Closing'; do
  printf '%s :: ' "$pat"; grep -cEi "$pat" "$C"
done
echo "== hex tokens and resolution (tabi repo + main)"
grep -oP '(?<![0-9a-f])[0-9a-f]{7,40}(?![0-9a-f])' "$C" | sort -u | while read h; do
  r1=$(git -C "$T" cat-file -t "$h" 2>/dev/null || echo -)
  r2=$(git -C "$F" cat-file -t "$h" 2>/dev/null || echo -)
  echo "$h tabi=$r1 main=$r2"
done
echo "== resolvable as tabi commits / total unique hex"
tot=$(grep -oP '(?<![0-9a-f])[0-9a-f]{7,40}(?![0-9a-f])' "$C" | sort -u | wc -l)
res=$(grep -oP '(?<![0-9a-f])[0-9a-f]{7,40}(?![0-9a-f])' "$C" | sort -u | while read h; do git -C "$T" cat-file -t "$h" 2>/dev/null; done | grep -c commit)
echo "total=$tot tabi-commits=$res"
echo "== standing negative sweeps (independent)"
echo "evidence groups: $(ls -d $T/corpus/evidence/*/ | wc -l) manifests: $(find $T/corpus/evidence -name MANIFEST.txt | wc -l)"
echo "L0: $(sha256sum $F/.ufo/l0-questions.md | cut -c1-12) $(wc -l < $F/.ufo/l0-questions.md) lines tabi-lines=$(grep -c tabi $F/.ufo/l0-questions.md)"
echo "port10086 listeners: $(ss -ltn 2>/dev/null | grep -c 10086) ; webbridge procs: $(pgrep -x kimi-webbridge | wc -l) ; chromium: $(pgrep -c chromium)"
echo "brave: $(ls -A ~/.config/BraveSoftware/Brave-Browser/ | tr '\n' ' ')"
echo "== path citations (file:line)"
grep -oE '`[A-Za-z0-9_./-]+\.(md|json|sh|mjs|py|txt|log|tsv)(:[0-9-]+)?`' "$C" | sort -u | head -40
} > "$OUT" 2>&1
echo "written $OUT"

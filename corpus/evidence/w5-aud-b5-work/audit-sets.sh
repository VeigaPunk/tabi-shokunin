#!/bin/bash
# AUD-B5 manifest audit — READ-ONLY over tabi-shokunin. Evidence: /tmp/w5-aud-b5-evidence/
T=/home/vgpnk/Projects/shokunin/tabi-shokunin
E=$T/corpus/evidence
EV=/tmp/w5-aud-b5-evidence
OUT=$EV/audit-sets.txt
exec > >(tee "$OUT") 2>&1
echo "AUD-B5 manifest audit — $(date -u +%Y-%m-%dT%H:%M:%SZ) (local $(date +%H:%M:%S%z))"
echo "tabi HEAD $(git -C "$T" rev-parse HEAD 2>/dev/null)"

hash_of(){ sha256sum "$1" | cut -d' ' -f1; }

# ---------- helpers ----------
check_set(){ # $1=setdir name
  local D=$E/$1
  echo
  echo "=== SET $1 ==="
  echo "files=$(find "$D" -type f ! -name MANIFEST.txt | wc -l) entries=$(grep -vc '^#' "$D/MANIFEST.txt") profile_dirs=$(find "$D" -type d -name profile | wc -l)"
  ( cd "$D" && sha256sum -c MANIFEST.txt ) > "$EV/richi-$1.txt" 2>&1
  echo "re-hash: exit=$? OK=$(grep -c ': OK$' "$EV/richi-$1.txt") FAILED_LINES=$(grep -c 'FAILED' "$EV/richi-$1.txt")"
  local miss=0
  while read -r p; do [ -f "$D/$p" ] || { echo "MISSING: $p"; miss=$((miss+1)); }; done < <(grep -v '^#' "$D/MANIFEST.txt" | awk '{print $2}')
  echo "unresolvable entries=$miss"
  local extra=0
  while read -r f; do grep -q "  ${f#$D/}$" "$D/MANIFEST.txt" || { echo "EXTRA-FILE: ${f#$D/}"; extra=$((extra+1)); }; done < <(find "$D" -type f ! -name MANIFEST.txt | sort)
  echo "files-not-in-manifest=$extra"
}

pin_check(){ # $1=set $2=relpath $3=pin $4=kind
  local D=$E/$1 h
  h=$(awk -v p="$2" '$2==p {print $1}' "$D/MANIFEST.txt")
  local res
  if [ -z "$h" ]; then res="NO-ENTRY"; else
    case "$h" in "$3"*) res="MATCH";; *) res="MISMATCH";; esac
  fi
  printf '%-11s %-52s pin=%-16s manifest=%-16s %s\n' "${4:-PIN}" "$2" "$3" "${h:0:16}" "$res"
}

# ---------- SET A: tabi-r2-2-state ↔ webbridge-daemon-disposition §8 (full sha pins) ----------
check_set tabi-r2-2-state
NOTE=$T/corpus/knowledge/webbridge-daemon-disposition.md
echo "--- pin equality vs note §8 (extracted mechanically: rows with /tmp/tabi-r2-2-* and a 64-hex)"
while IFS= read -r line; do
  b=$(echo "$line" | grep -o 'tabi-r2-2-[a-z0-9._-]*\.[a-z]*' | head -1)
  h=$(echo "$line" | grep -o '[0-9a-f]\{64\}' | head -1)
  [ -n "$b" ] && [ -n "$h" ] && pin_check tabi-r2-2-state "$b" "$h" FULL
done < <(grep -E '/tmp/tabi-r2-2-.*[0-9a-f]{64}' "$NOTE")

# ---------- SET B: tabi-r3-1-journey ↔ multi-step-journey.md §1-2 ----------
check_set tabi-r3-1-journey
NOTE=$T/corpus/knowledge/multi-step-journey.md
echo "--- §1 12-hex pins (fixture + harness)"
for n in index.html detail.html form.html confirm.html style.css data.json journey.mjs driver.sh compare.mjs; do
  line=$(grep -m1 "\`$n\`" "$NOTE")
  p=$(echo "$line" | grep -o '[0-9a-f]\{12\}' | head -1)
  rel=$n; case "$n" in *.html|*.css|*.json) rel="site/$n";; esac
  pin_check tabi-r3-1-journey "$rel" "$p" 12HEX
done
echo "--- §2 full 64-hex pins (bullets: png/shape step-N)"
while IFS= read -r line; do
  tok=$(echo "$line" | sed -n 's/^- \(png\|shape\) \(.*\) `\([0-9a-f]\{64\}\)`.*/\1 \2/p')
  pin=$(echo "$line" | grep -o '[0-9a-f]\{64\}' | head -1)
  kind=${tok%% *}; stepstr=${tok#* }
  [ -z "$pin" ] && continue
  case "$kind $stepstr" in
    "png step-1 / step-1-idem") for r in run1/step-1-index.png run1/step-1-index-idem.png run2/step-1-index.png run2/step-1-index-idem.png; do pin_check tabi-r3-1-journey "$r" "$pin" "PNG-full"; done;;
    "png step-2") for r in run1/step-2-detail.png run2/step-2-detail.png; do pin_check tabi-r3-1-journey "$r" "$pin" "PNG-full"; done;;
    "png step-3") for r in run1/step-3-form.png run2/step-3-form.png; do pin_check tabi-r3-1-journey "$r" "$pin" "PNG-full"; done;;
    "png step-3-filled") for r in run1/step-3-form-filled.png run2/step-3-form-filled.png; do pin_check tabi-r3-1-journey "$r" "$pin" "PNG-full"; done;;
    "png step-4") for r in run1/step-4-confirm.png run2/step-4-confirm.png; do pin_check tabi-r3-1-journey "$r" "$pin" "PNG-full"; done;;
    "shape step-1") for r in run1/step-1-index.shape.txt run1/step-1-index-idem.shape.txt run2/step-1-index.shape.txt run2/step-1-index-idem.shape.txt; do pin_check tabi-r3-1-journey "$r" "$pin" "SHP-full"; done;;
    "shape step-2") for r in run1/step-2-detail.shape.txt run2/step-2-detail.shape.txt; do pin_check tabi-r3-1-journey "$r" "$pin" "SHP-full"; done;;
    "shape step-3 / filled") for r in run1/step-3-form.shape.txt run1/step-3-form-filled.shape.txt run2/step-3-form.shape.txt run2/step-3-form-filled.shape.txt; do pin_check tabi-r3-1-journey "$r" "$pin" "SHP-full"; done;;
    "shape step-4") for r in run1/step-4-confirm.shape.txt run2/step-4-confirm.shape.txt; do pin_check tabi-r3-1-journey "$r" "$pin" "SHP-full"; done;;
    *) echo "UNMAPPED-BULLET: $line";;
  esac
done < <(grep -E '^- (png|shape) .*`[0-9a-f]{64}`' "$NOTE")

# ---------- SET C: w4-t41-network ↔ network-evidence-rung.md §2 ----------
check_set w4-t41-network
NOTE=$T/corpus/knowledge/network-evidence-rung.md
echo "--- §2 12-hex pins"
for n in index.html async.html confirm.html style.css slow.json quick.json server.py net-journey.mjs net-driver.sh compare.mjs summary.mjs pixel-scan.py pngdiff.py; do
  line=$(grep -m1 "\`$n\`" "$NOTE")
  p=$(echo "$line" | grep -o '[0-9a-f]\{12\}' | head -1)
  rel=$n; case "$n" in *.html|*.css|*.json|*.py) [ "$n" = server.py ] && rel=site/$n || rel=site/$n;; esac
  pin_check w4-t41-network "$rel" "$p" 12HEX
done

# ---------- source byte-identity (archived vs /tmp source) ----------
echo
echo "=== source byte-identity (archived sha256 vs /tmp source sha256) ==="
src_diff(){ # $1=set $2=srcdir
  local D=$E/$1 S=$2 n=0 m=0 miss=0
  [ -d "$S" ] || { echo "$1: SOURCE-DIR-MISSING $S"; return; }
  while read -r p; do
    if [ -f "$S/$p" ]; then n=$((n+1)); if [ "$(hash_of "$D/$p")" = "$(hash_of "$S/$p")" ]; then m=$((m+1)); else echo "$1/$p SOURCE-DIFF"; fi
    else miss=$((miss+1)); fi
  done < <(grep -v '^#' "$D/MANIFEST.txt" | awk '{print $2}')
  echo "$1: compared=$n identical=$m source-missing=$miss"
}
for f in /tmp/tabi-r2-2-baseline.txt /tmp/tabi-r2-2-cli-help.txt /tmp/tabi-r2-2-final-state.txt /tmp/tabi-r2-2-poststart.txt /tmp/tabi-r2-2-start.log /tmp/tabi-r2-2-status-2.txt; do
  bn=$(basename "$f")
  if [ -f "$f" ]; then a=$(hash_of "$E/tabi-r2-2-state/$bn"); s=$(hash_of "$f"); [ "$a" = "$s" ] && echo "tabi-r2-2-state/$bn IDENTICAL" || echo "tabi-r2-2-state/$bn SOURCE-DIFF"; else echo "tabi-r2-2-state/$bn SOURCE-MISSING"; fi
done
src_diff tabi-r3-1-journey /tmp/tabi-r3-1-journey
src_diff w4-t41-network /tmp/w4-t41-network

echo
echo "=== audited-artifact snapshot hashes ==="
sha256sum "$T/corpus/evidence/tabi-r2-2-state/MANIFEST.txt" "$T/corpus/evidence/tabi-r3-1-journey/MANIFEST.txt" "$T/corpus/evidence/w4-t41-network/MANIFEST.txt" "$T/corpus/lessons/round-"*.md /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md
echo "audit end $(date -u +%Y-%m-%dT%H:%M:%SZ)"
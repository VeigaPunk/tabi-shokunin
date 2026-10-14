#!/bin/bash
# AUD-B5 corrected pin extraction (name-adjacent) — READ-ONLY.
T=/home/vgpnk/Projects/shokunin/tabi-shokunin
E=$T/corpus/evidence
EV=/tmp/w5-aud-b5-evidence
OUT=$EV/audit-sets2.txt
exec > >(tee "$OUT") 2>&1
echo "AUD-B5 corrected pin extraction — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
pin_check(){ local D=$E/$1 h res; h=$(awk -v p="$2" '$2==p {print $1}' "$D/MANIFEST.txt")
  if [ -z "$h" ]; then res="NO-ENTRY"; else case "$h" in "$3"*) res="MATCH";; *) res="MISMATCH";; esac; fi
  printf '%-11s %-46s pin=%-16s manifest=%-16s %s\n' "$4" "$2" "$3" "${h:0:16}" "$res"; }

echo "=== SET B (tabi-r3-1-journey) name-adjacent §1 12-hex ==="
NOTE=$T/corpus/knowledge/multi-step-journey.md
for n in index.html detail.html form.html confirm.html style.css data.json journey.mjs driver.sh compare.mjs; do
  p=$(sed -n '1,40{s/.*`'"$n"'`[^`]*`\([0-9a-f]\{12\}\)`.*/\1/p;}' "$NOTE" | head -1)
  rel=$n; case "$n" in *.html|*.css|*.json) rel="site/$n";; esac
  pin_check tabi-r3-1-journey "$rel" "$p" 12HEX
done
echo "=== SET B full-64 shape bullets (first hex after step token) ==="
while IFS= read -r line; do
  kind=$(echo "$line" | sed -n 's/^- \([a-z]*\) .*/\1/p')
  step=$(echo "$line" | sed -n 's/^- [a-z]* \([^`]*\) .*/\1/p')
  pin=$(echo "$line" | sed -n 's/^[^`]*`\([0-9a-f]\{64\}\)`.*/\1/p')
  case "$kind $step" in
    "shape step-1"|"shape step-1 ") for r in run1/step-1-index.shape.txt run1/step-1-index-idem.shape.txt run2/step-1-index.shape.txt run2/step-1-index-idem.shape.txt; do pin_check tabi-r3-1-journey "$r" "$pin" SHP64; done;;
    "shape step-2"|"shape step-2 ") for r in run1/step-2-detail.shape.txt run2/step-2-detail.shape.txt; do pin_check tabi-r3-1-journey "$r" "$pin" SHP64; done;;
    "shape step-3 / filled"|"shape step-3 / filled ") for r in run1/step-3-form.shape.txt run1/step-3-form-filled.shape.txt run2/step-3-form.shape.txt run2/step-3-form-filled.shape.txt; do pin_check tabi-r3-1-journey "$r" "$pin" SHP64; done;;
    "shape step-4"|"shape step-4 ") for r in run1/step-4-confirm.shape.txt run2/step-4-confirm.shape.txt; do pin_check tabi-r3-1-journey "$r" "$pin" SHP64; done;;
    *) :;;
  esac
done < <(grep -E '^- shape ' "$NOTE")

echo "=== SET C (w4-t41-network) name-adjacent §2 12-hex ==="
NOTE=$T/corpus/knowledge/network-evidence-rung.md
for n in index.html async.html confirm.html style.css slow.json quick.json server.py net-journey.mjs net-driver.sh compare.mjs summary.mjs pixel-scan.py pngdiff.py; do
  p=$(sed -n '1,80{s/.*`'"$n"'`[^`]*`\([0-9a-f]\{12\}\)`.*/\1/p;}' "$NOTE" | head -1)
  case "$n" in
    index.html|async.html|confirm.html|style.css|slow.json|quick.json|server.py) rel="site/$n";;
    *) rel="$n";;
  esac
  pin_check w4-t41-network "$rel" "$p" 12HEX
done
echo "=== SET C: server.py presence probe ==="
grep -n "server" "$E/w4-t41-network/MANIFEST.txt" | head -5
ls -la /tmp/w4-t41-network/site/server.py /tmp/w4-t41-network/server.py 2>&1
echo "=== SET C: root-level py/mjs probes ==="
grep -nE "^(.*  )(pixel-scan|pngdiff|summary|net-journey|net-driver|compare)" "$E/w4-t41-network/MANIFEST.txt" | head -10
echo "=== SET A artifacts re-confirm (all 6) ==="
for b in tabi-r2-2-baseline.txt tabi-r2-2-cli-help.txt tabi-r2-2-start.log tabi-r2-2-poststart.txt tabi-r2-2-status-2.txt tabi-r2-2-final-state.txt; do
  h=$(awk -v p="$b" '$2==p {print $1}' "$E/tabi-r2-2-state/MANIFEST.txt"); echo "$b ${h:0:16}."
done
echo "end $(date -u +%Y-%m-%dT%H:%M:%SZ)"
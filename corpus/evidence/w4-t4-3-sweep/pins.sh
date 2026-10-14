#!/usr/bin/env bash
# T4-3 hygiene sweep — scratch inventory + artifact pins + prior-attempt integrity (read-only)
S=/tmp/w4-t4-3-sweep
{
echo "# T4-3 scratch + pins — $(date -Is)"
echo
echo "## r1-3 scratch groups (files|size|mtime)"
for d in tabi3-cdp tabi-audit2-cdp tabi-a1-r2b-capture tabi-a2-r2b-evidence tabi-b1-r3b-journey tabi-b1-r3b-scratch tabi-r2-1-capture tabi-r2-3-verify tabi-r2-4-poll tabi-r3-1-journey tabi-r3-2-spot tabi-r3-3-anchors tabi-r3-3-smoke tabi-r3-4-work; do
  if [ -e "/tmp/$d" ]; then
    f=$(find "/tmp/$d" -type f | wc -l); sz=$(du -sh "/tmp/$d" | cut -f1); mt=$(stat -c '%y' "/tmp/$d")
    echo "$d | files=$f | size=$sz | mtime=$mt"
  else echo "$d | ABSENT"; fi
done
echo
echo "## r2-2 loose files"
ls -la /tmp/tabi-r2-2-* 2>/dev/null
du -ch /tmp/tabi-r2-2-* 2>/dev/null | tail -1
echo
echo "## r4 sibling + own scratch (concurrent; out of r1-3 audit scope)"
ls -ld /tmp/tabi-r4-1-network /tmp/tabi-r4-2-async /tmp/tabi-r4-3-sweep /tmp/w4-t4-3-sweep 2>/dev/null
echo
echo "## ports cited per r1-3 group (files mentioning each port)"
for d in tabi3-cdp tabi-a1-r2b-capture tabi-a2-r2b-evidence tabi-audit2-cdp tabi-b1-r3b-journey tabi-b1-r3b-scratch tabi-r2-1-capture tabi-r2-3-verify tabi-r2-4-poll tabi-r3-1-journey tabi-r3-2-spot tabi-r3-3-anchors tabi-r3-3-smoke tabi-r3-4-work; do
  [ -e "/tmp/$d" ] || continue
  line="$d :"
  for p in 9232 19333 19411 19412 19421 19422 19441 19471 19472 19481 19482 10086; do
    c=$(grep -rl -- "$p" "/tmp/$d" 2>/dev/null | wc -l)
    [ "$c" -gt 0 ] && line="$line $p($c)"
  done
  echo "$line"
done
echo
echo "## context greps: 9232 / 19441 / 19481"
grep -rna -- '9232' /tmp/tabi-r3-4-work 2>/dev/null | head -4
echo "---"
grep -rna -- '19441' /tmp/tabi-audit2-cdp 2>/dev/null | head -4
echo "---"
grep -rna -- '19481' /tmp/tabi-b1-r3b-journey 2>/dev/null | head -4
echo
echo "## r2b evidence dir peek (shape)"
ls -la /tmp/tabi-a2-r2b-evidence/ 2>/dev/null
echo
echo "## pins — r1 screenshot (expect c1ba9588baa833dd33f9378a10f4f0e9a1cb50e06667ddd99b1198fd58c93b6e)"
sha256sum /tmp/tabi3-cdp/screenshot.png 2>&1
echo "## pins — r3 journey methodology (expect b52074a33876… / 9509c07f49f9… / ecce1c73dc56…)"
sha256sum /tmp/tabi-r3-1-journey/journey.mjs /tmp/tabi-r3-1-journey/driver.sh /tmp/tabi-r3-1-journey/compare.mjs 2>&1
echo "## pins — r2-2 baseline + start log (expect b255d1f80d59… / 869fda13…)"
sha256sum /tmp/tabi-r2-2-baseline.txt /tmp/tabi-r2-2-start.log 2>&1
echo "## pins — corpus notes (compare vs README/SCORECARD citations)"
sha256sum /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/*.md
echo "## wc corpus notes"
wc -l /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/*.md
echo
echo "## hygiene note already present?"
ls -la /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/hygiene-sweep-r4.md 2>&1
echo
echo "## prior attempt integrity (sha256sum -c on its PINS.txt)"
cd /tmp/tabi-r4-3-sweep && sha256sum -c PINS.txt 2>&1
echo "## prior attempt PINS.txt own hash"
sha256sum /tmp/tabi-r4-3-sweep/PINS.txt 2>&1
} 2>&1 | tee "$S/pins.log"
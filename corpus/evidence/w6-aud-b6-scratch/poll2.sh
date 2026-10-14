#!/bin/bash
# AUD-B6 poll (widened): wait for the fixture-v2 doc (name containing
# external-class or fixture-v2) OR log any new .md under tabi corpus/knowledge|evidence.
LOG=/tmp/w6-aud-b6-scratch/poll2.log
BASE=/tmp/w6-aud-b6-scratch/seen-md.base
find /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus /tmp/w6-tabi-b61 -name '*.md' 2>/dev/null | sort > "$BASE"
for i in $(seq 1 480); do
  HIT=$(find /home/vgpnk/Projects/shokunin/tabi-shokunin /home/vgpnk/Projects/shokunin/.ufo /tmp -iname '*external-class*' -o -iname '*fixture-v2*' 2>/dev/null | grep -v '/\.git/' | head -5)
  if [ -n "$HIT" ]; then echo "FOUND $(date -u +%FT%TZ)" >> "$LOG"; echo "$HIT" >> "$LOG"; exit 0; fi
  CUR=$(find /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus /tmp/w6-tabi-b61 -name '*.md' 2>/dev/null | sort)
  NEWF=$(comm -13 "$BASE" <(echo "$CUR") | head -5)
  if [ -n "$NEWF" ]; then echo "NEW-MD $(date -u +%FT%TZ)" >> "$LOG"; echo "$NEWF" >> "$LOG"; fi
  echo "$CUR" > "$BASE"
  sleep 10
done
echo "TIMEOUT $(date -u +%FT%TZ)" >> "$LOG"; exit 1
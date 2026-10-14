#!/bin/bash
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
LOG=/tmp/w10-tabi-b104/poll.log
SYN=corpus/knowledge/ten-round-synthesis.md
prev=""
end=$((SECONDS+1800))
while [ $SECONDS -lt $end ]; do
  now=$(date -u +%FT%TZ)
  if [ -f "$SYN" ]; then
    cur=$(sha256sum "$SYN" | cut -d' ' -f1)
    lines=$(wc -l < "$SYN")
    echo "$now SYNTH $cur $lines" >> "$LOG"
    if [ -n "$prev" ] && [ "$cur" = "$prev" ]; then
      echo "$now STABLE" >> "$LOG"; exit 0
    fi
    prev=$cur
  else
    echo "$now no-synth" >> "$LOG"
    prev=""
  fi
  # also track other round-10 surfaces cheaply
  ls corpus/lessons/round-10.md plans/round-10-record-draft.md 2>/dev/null | while read f; do
    echo "$now SIDE $f $(sha256sum "$f" | cut -d' ' -f1) $(wc -l < "$f")" >> "$LOG"
  done
  sleep 15
done
echo "$(date -u +%FT%TZ) CAP-REACHED" >> "$LOG"

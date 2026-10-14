#!/bin/bash
# TABI-R2-4 poll: wait for the two round-2 source notes (15-min cap)
set -u
ROOT=/home/vgpnk/Projects/shokunin/tabi-shokunin
LOG=/tmp/tabi-r2-4-poll/poll.log
START=$(date +%s)
echo "[$(date '+%H:%M:%S')] poll start" >> "$LOG"
while :; do
  NOW=$(date +%s); EL=$((NOW-START))
  A=$(find "$ROOT" -maxdepth 4 -name 'live-dynamic-capture.md' -not -path '*/.git/*' 2>/dev/null | head -1)
  B=$(find "$ROOT" -maxdepth 4 -name 'webbridge-daemon-disposition.md' -not -path '*/.git/*' 2>/dev/null | head -1)
  C=$(find /tmp/tabi-r2-1-* /tmp/tabi-r2-2-* /tmp/tabi-r2-3-* -maxdepth 3 -name '*.md' 2>/dev/null | head -8)
  echo "[$(date '+%H:%M:%S')] elapsed=${EL}s A=${A:-none} B=${B:-none} r2tmp=${C:-none}" >> "$LOG"
  if [ -n "$A" ] && [ -n "$B" ]; then
    echo "BOTH_FOUND elapsed=${EL}s"; echo "A=$A"; echo "B=$B"; exit 0
  fi
  if [ "$EL" -ge 900 ]; then
    echo "TIMEOUT elapsed=${EL}s"; echo "A=${A:-none}"; echo "B=${B:-none}"; exit 2
  fi
  sleep 15
done
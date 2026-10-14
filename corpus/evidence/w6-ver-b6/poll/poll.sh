#!/bin/bash
# VER-B6 poll: wait for tabi B6-1 fixture deliverable (25-min cap)
LOG=/tmp/w6-ver-b6/poll/poll.log
end=$(( $(date +%s) + 1500 ))
while [ "$(date +%s)" -lt "$end" ]; do
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  F=$(find /home/vgpnk/Projects/shokunin/tabi-shokunin -path '*/.git' -prune -o -type f -iname '*external-class*' -print 2>/dev/null | head -1)
  T=$(ls /tmp/w6-tabi-b61/*.md 2>/dev/null | head -1)
  if [ -n "$F" ]; then
    echo "$ts FOUND-PROJECT $F $(stat -c%s "$F")" >> "$LOG"; echo found-project > /tmp/w6-ver-b6/poll/state; break
  fi
  if [ -n "$T" ]; then
    echo "$ts FOUND-TMP $T $(stat -c%s "$T")" >> "$LOG"
  fi
  echo "$ts absent" >> "$LOG"
  sleep 30
done
echo "poll end $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$LOG"

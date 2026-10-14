#!/bin/sh
# T4-4 poll for network-evidence-rung.md — 20-min cap, 15 s cadence
CAP=1200; INT=15; START=$(date +%s)
LOG=/tmp/w4-t4-4-tabi/poll-rung.log
: > "$LOG"
while :; do
  NOW=$(date +%s); E=$((NOW-START))
  FOUND=""
  for P in \
    /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md \
    /home/vgpnk/Projects/shokunin/tabi-shokunin/network-evidence-rung.md ; do
    [ -s "$P" ] && FOUND="$P"
  done
  if [ -z "$FOUND" ]; then
    FOUND=$(find /tmp -maxdepth 3 -name 'network-evidence-rung.md' -size +0c 2>/dev/null | head -1)
  fi
  if [ -n "$FOUND" ]; then
    echo "elapsed=${E}s FOUND path=$FOUND bytes=$(stat -c%s "$FOUND")" >> "$LOG"
    exit 0
  fi
  if [ "$E" -ge "$CAP" ]; then
    echo "elapsed=${E}s TIMEOUT cap=${CAP}s rung-file absent" >> "$LOG"
    exit 2
  fi
  echo "elapsed=${E}s waiting rung-absent corpus=absent tmp=absent" >> "$LOG"
  sleep "$INT"
done

#!/bin/bash
# AUD-B6 poll: wait for external-class-fixture-v2.md to appear (project trees + /tmp)
LOG=/tmp/w6-aud-b6-scratch/poll.log
for i in $(seq 1 360); do
  HIT=$(find /home/vgpnk/Projects/shokunin/tabi-shokunin /home/vgpnk/Projects/shokunin/mado-shokunin /home/vgpnk/Projects/shokunin/tameshi-shokunin /home/vgpnk/Projects/shokunin/tsukuroi-shokunin /tmp -iname '*external-class*' -not -path '*/.git/*' 2>/dev/null | head -5)
  if [ -n "$HIT" ]; then
    echo "FOUND $(date -u +%FT%TZ)" >> "$LOG"; echo "$HIT" >> "$LOG"; exit 0
  fi
  sleep 10
done
echo "TIMEOUT $(date -u +%FT%TZ)" >> "$LOG"; exit 1

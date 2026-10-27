#!/usr/bin/env bash
# Independent external observer: samples host-wide `ss -Htnp` and keeps rows
# whose users:(...) field names a firefox process, logging wall-clock timestamps.
set -u
LOG="$1"
: > "$LOG"
while [ ! -f "$LOG.stop" ]; do
  ts=$(date +%s%3N)
  ss -Htnp 2>/dev/null | grep 'firefox' | while IFS= read -r l; do
    [ -z "$l" ] && continue
    echo "$ts|$l"
  done >> "$LOG"
  echo "$ts|__tick__" >> "$LOG"
  sleep 0.05
done

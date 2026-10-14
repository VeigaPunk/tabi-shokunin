#!/bin/bash
# VER-B6: wait for the fixture note; on appearance freeze the then-live revision.
LOG=/tmp/w6-ver-b6/poll/freeze.log
end=$(( $(date +%s) + 1500 ))
while [ "$(date +%s)" -lt "$end" ]; do
  F=$(find /home/vgpnk/Projects/shokunin/tabi-shokunin -path '*/.git' -prune -o -type f -iname '*external-class*' -print 2>/dev/null | head -1)
  if [ -n "$F" ]; then
    ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    echo "$ts NOTE $F $(stat -c%s "$F") sha256=$(sha256sum "$F" | awk '{print $1}')" >> "$LOG"
    mkdir -p /tmp/w6-ver-b6/frozen3
    cp -a /tmp/w6-tabi-b61/server.py /tmp/w6-tabi-b61/v2-driver.sh /tmp/w6-tabi-b61/v2-journey.mjs /tmp/w6-tabi-b61/compare-v2.mjs /tmp/w6-tabi-b61/extract.mjs /tmp/w6-tabi-b61/site-a /tmp/w6-tabi-b61/site-b /tmp/w6-ver-b6/frozen3/ 2>/dev/null
    find /tmp/w6-ver-b6/frozen3 -type f | sort | while read -r f; do sha256sum "$f"; done > /tmp/w6-ver-b6/evidence/frozen3-hashes.txt
    echo "$ts FROZEN3 $(wc -l < /tmp/w6-ver-b6/evidence/frozen3-hashes.txt) files" >> "$LOG"
    exit 0
  fi
  sleep 20
done
echo "FREEZE-WAIT TIMEOUT $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$LOG"; exit 3

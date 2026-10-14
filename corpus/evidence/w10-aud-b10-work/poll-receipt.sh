#!/bin/bash
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
LOG=/tmp/w10-aud-b10-work/poll-receipt.log
end=$((SECONDS+1500))
while [ $SECONDS -lt $end ]; do
  now=$(date -u +%FT%TZ)
  if [ -f corpus/knowledge/archive-receipt-r10.md ]; then
    h=$(sha256sum corpus/knowledge/archive-receipt-r10.md | cut -c1-16)
    l=$(wc -l < corpus/knowledge/archive-receipt-r10.md)
    echo "$now RECEIPT $h $l" >> "$LOG"
    sleep 25
    h2=$(sha256sum corpus/knowledge/archive-receipt-r10.md | cut -c1-16)
    if [ "$h" = "$h2" ]; then echo "$(date -u +%FT%TZ) RECEIPT-STABLE $h" >> "$LOG"; exit 0; fi
  else
    echo "$now no-receipt-know=$(ls corpus/knowledge | wc -l)" >> "$LOG"
  fi
  sleep 20
done
echo "$(date -u +%FT%TZ) CAP-REACHED" >> "$LOG"

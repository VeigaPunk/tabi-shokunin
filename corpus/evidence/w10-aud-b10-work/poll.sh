#!/bin/bash
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
LOG=/tmp/w10-aud-b10-work/poll.log
SYN=corpus/knowledge/arc-synthesis.md
GRP=corpus/evidence/w9-tabi-b91
prev_syn=""; prev_grp=""
end=$((SECONDS+2700))
while [ $SECONDS -lt $end ]; do
  now=$(date -u +%FT%TZ)
  syn_state="absent"
  if [ -f "$SYN" ]; then
    cur=$(sha256sum "$SYN" | cut -d' ' -f1); lines=$(wc -l < "$SYN"); syn_state="$cur/$lines"
  fi
  grp_state="absent"
  if [ -d "$GRP" ]; then
    nfiles=$(find "$GRP" -type f | wc -l); man=$([ -f "$GRP/MANIFEST.txt" ] && echo yes || echo no); grp_state="$nfiles/$man"
  fi
  know=$(ls corpus/knowledge/ | wc -l)
  echo "$now SYN=$syn_state GRP=$grp_state KNOW=$know HEAD=$(git log --oneline -1 | cut -d' ' -f1)" >> "$LOG"
  if [ -n "$prev_syn" ] && [ "$syn_state" = "$prev_syn" ] && [ "${syn_state%%/*}" != "absent" ] && [ "$grp_state" = "$prev_grp" ] && [ "${grp_state##*/}" = "yes" ]; then
    echo "$now READY-STABLE" >> "$LOG"; exit 0
  fi
  prev_syn="$syn_state"; prev_grp="$grp_state"
  sleep 20
done
echo "$(date -u +%FT%TZ) CAP-REACHED" >> "$LOG"

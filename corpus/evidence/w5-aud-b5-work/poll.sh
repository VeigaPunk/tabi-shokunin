#!/bin/bash
# AUD-B5 poll: watch tabi B5 deliverables — MANIFEST.txt sets, lessons w/ ## Gate, the L0 line.
# Ready = >=3 manifests AND 4 lessons AND >=4 gates AND >=1 tabi L0 line, fingerprint stable 4x15s.
T=/home/vgpnk/Projects/shokunin/tabi-shokunin
L0=/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md
W=/tmp/w5-aud-b5-work
LOG=$W/poll.log
: > "$LOG"
deadline=$(( $(date +%s) + 2700 ))   # 45 min cap
prev_fp=""; stable=0; i=0
while [ "$(date +%s)" -lt "$deadline" ]; do
  i=$((i+1))
  TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  nm=$(find "$T/corpus/evidence" -name MANIFEST.txt 2>/dev/null | wc -l)
  nf=$(find "$T/corpus/evidence" -type f 2>/dev/null | wc -l)
  nl=$(ls -1 "$T/corpus/lessons/"*.md 2>/dev/null | wc -l)
  ng=$(grep -l '^## Gate' "$T/corpus/lessons/"*.md 2>/dev/null | wc -l)
  lt=$(grep -c '^tabi | round-' "$L0" 2>/dev/null); lt=${lt:-0}
  tl=$(wc -l < "$L0")
  fp=$( { find "$T/corpus/evidence" -name MANIFEST.txt -exec sha256sum {} \; 2>/dev/null
          find "$T/corpus/evidence" -type f -newermt "@$(( $(date +%s) - 3600 ))" -printf '%p %s\n' 2>/dev/null
          sha256sum "$T/corpus/lessons/"*.md 2>/dev/null
          sha256sum "$L0"; } | sha256sum | cut -c1-16 )
  echo "$TS poll=$i manifests=$nm evfiles=$nf lessons=$nl gates=$ng l0tabi=$lt l0lines=$tl fp=$fp" >> "$LOG"
  if [ "$nm" -ge 3 ] && [ "$nl" -ge 4 ] && [ "$ng" -ge 4 ] && [ "$lt" -ge 1 ]; then
    if [ "$fp" = "$prev_fp" ]; then stable=$((stable+1)); else stable=0; fi
    if [ "$stable" -ge 4 ]; then
      echo "$TS READY stable fp=$fp manifests=$nm lessons=$nl gates=$ng l0tabi=$lt" >> "$LOG"
      echo "READY $TS fp=$fp" > "$W/status"; exit 0
    fi
  else
    stable=0
  fi
  prev_fp=$fp
  sleep 15
done
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) CAP-REACHED manifests=$nm lessons=$nl gates=$ng l0tabi=$lt" >> "$LOG"
echo "CAP manifests=$nm lessons=$nl gates=$ng l0tabi=$lt" > "$W/status"
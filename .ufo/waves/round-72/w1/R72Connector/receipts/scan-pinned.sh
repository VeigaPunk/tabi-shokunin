#!/usr/bin/env bash
# Pinned sibling-overlap scan for tabi C1 surface (round 72 connector).
# Reads lanes from lanes.txt, pins each lane's HEAD once, then binds every
# git grep to that hash so rows stay reproducible if the lane commits again.
set -u
FLEET=/home/vgpnk/Projects/shokunin
OUT=${OUT:-/fast/scratch/hyaku/tabi-r72/R72Connector/pinned}
mkdir -p "$OUT"
SNAP="$OUT/sibling-heads-scan.tsv"
printf 'lane\tbranch\thead\tcaptured_at\n' > "$SNAP"
while read -r l; do
  h=$(git -C "$FLEET/$l" rev-parse HEAD 2>/dev/null) || continue
  b=$(git -C "$FLEET/$l" rev-parse --abbrev-ref HEAD 2>/dev/null)
  printf '%s\t%s\t%s\t%s\n' "$l" "$b" "$h" "$(date -Iseconds)" >> "$SNAP"
done < /fast/scratch/hyaku/tabi-r72/R72Connector/lanes.txt

PATS='synthesizePinchGesture|PinchGesture|visualViewport|setPageScaleFactor|pageScaleFactor|touchpad_pinch|TouchpadPinch|Input\.synthesize|Emulation\.setDeviceMetrics|ctrlKey[^,)]*wheel|wheel[^,)]*ctrlKey|components/input/'
HITS="$OUT/hits.tsv"
: > "$HITS"
while IFS=$'\t' read -r l _b h _t; do
  [ "$l" = lane ] && continue
  git -C "$FLEET/$l" grep -Iin -E "$PATS" "$h" -- . 2>/dev/null \
    | grep -vE 'node_modules|strings\.txt|three\.core\.js|/corpus/captures/|/corpus/live/runs/' \
    | while IFS= read -r line; do
        # line = <hash>:<path>:<lineno>:<text>
        rest=${line#"$h":}
        path=${rest%%:*}
        rest2=${rest#*:}
        ln=${rest2%%:*}
        txt=${rest2#*:}
        pat=$(printf '%s' "$txt" | grep -oE "$PATS" | head -1)
        printf '%s\t%s\t%s\t%s\t%s\n' "$l" "$path" "$ln" "$pat" "$(printf '%s' "$txt" | cut -c1-200)" >> "$HITS"
      done
done < "$SNAP"
wc -l "$HITS"

#!/usr/bin/env bash
# R73Connector pinned sibling scan (read-only). Each lane is searched at the SHA
# pinned in sibling-heads.tsv, never at HEAD, so mid-round commits cannot drift
# the evidence between the table and the scan.
set -u
ROOT=/home/vgpnk/Projects/shokunin
SEAT=$ROOT/tabi-shokunin/.ufo/waves/round-73/w1/R73Connector
HEADS=$SEAT/sibling-heads.tsv
OUT=$SEAT/pinned-hits.tsv
: > "$OUT"

pats=(
  'web_mouse_wheel_event'
  'web_input_event_conversion'
  'local_frame_view'
  'wheel_event\.cc'
  'InputEventsScaleFactor'
  'DeltaYInRootFrame'
  'synthesizePinchGesture'
  'PinchGesture'
  'visualViewport'
  'third_party/blink'
  'setPageScaleFactor|pageScaleFactor'
  'ctrl\+wheel|ctrlKey[^)]{0,40}wheel|wheel[^)]{0,40}ctrlKey'
  'touchpad_pinch|TouchpadPinch'
)

while IFS=$'\t' read -r lane sha _rest; do
  [ -z "$lane" ] && continue
  for p in "${pats[@]}"; do
    n=$(git -C "$ROOT/$lane" grep -I -c -E "$p" "$sha" -- . ':(exclude)*node_modules*' 2>/dev/null | wc -l)
    printf '%s\t%s\t%s\t%s\n' "$p" "$lane" "$sha" "$n" >> "$OUT"
    if [ "$n" -gt 0 ]; then
      git -C "$ROOT/$lane" grep -I -n -E "$p" "$sha" -- . ':(exclude)*node_modules*' 2>/dev/null \
        | cut -c1-200 | sed "s|^|HIT\t$p\t$lane\t|" >> "$OUT"
    fi
  done
done < "$HEADS"

grep -c '^HIT' "$OUT" | sed 's/^/hit_lines=/'
awk -F'\t' '$1!="HIT" && $4>0 {print $1"\t"$2"\t"$4}' "$OUT" | sort | uniq

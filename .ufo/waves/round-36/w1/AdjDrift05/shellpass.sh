#!/usr/bin/env bash
# AdjDrift05 second, independent (pure git+sed) re-derivation of the 20 chunk rows.
# Usage: bash shellpass.sh   -> prints sibling_ref<TAB>status on stdout.
# Lane-specific to this seat's chunk (all rows cite kaidoku-shokunin).
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
K=/home/vgpnk/Projects/shokunin/kaidoku-shokunin
H=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["kaidoku"])' \
  "$LANE/.ufo/waves/round-36/baseline/c1-delta-pins.json")
CHUNK="$LANE/.ufo/waves/round-36/w1-chunks/AdjDrift05.tsv"
T="${TMPDIR:-/tmp}/adj05-shellpass"; mkdir -p "$T"
while IFS=$'\t' read -r ref _ _; do
  pin=$(printf '%s' "$ref" | sed 's/.*@//; s/:.*//')
  path=$(printf '%s' "$ref" | sed 's/^[^:]*@[^:]*://; s/:[0-9]*$//')
  ln=$(printf '%s' "$ref" | sed 's/.*://')
  total=$(git -C "$K" show "$pin:$path" | wc -l)
  if [ "$ln" -gt "$total" ]; then
    printf '%s\tstale: pin line absent\n' "$ref"; continue
  fi
  cited=$(git -C "$K" show "$pin:$path" | sed -n "${ln}p" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
  if [ -z "$cited" ]; then
    printf '%s\tstale: pin line absent\n' "$ref"; continue
  fi
  if ! git -C "$K" show "$H:$path" > "$T/head.txt" 2>/dev/null; then
    printf '%s\tstale: head file absent\n' "$ref"; continue
  fi
  hline=$(sed -n "${ln}p" "$T/head.txt" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
  if [ "$hline" = "$cited" ]; then
    printf '%s\tunchanged\n' "$ref"
  else
    n=$(grep -nxF -- "$cited" "$T/head.txt" | head -1 | cut -d: -f1)
    if [ -n "$n" ]; then printf '%s\tmoved :%s\n' "$ref" "$n"; else printf '%s\tstale\n' "$ref"; fi
  fi
done < "$CHUNK"
rm -rf -- "$T"

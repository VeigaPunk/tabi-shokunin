#!/usr/bin/env bash
# AdjDrift07 independent drift re-derivation. Read-only git only.
set -u
export TMPDIR=/fast/scratch/hyaku/tabi-r36/AdjDrift07/tmp
S=/fast/scratch/hyaku/tabi-r36/AdjDrift07
FLEET=/home/vgpnk/Projects/shokunin
PINS=$FLEET/tabi-shokunin/.ufo/waves/round-36/baseline/c1-delta-pins.json
IN=$FLEET/tabi-shokunin/.ufo/waves/round-36/w1-chunks/AdjDrift07.tsv
OUT=$S/derived.tsv

trim() { sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//'; }

: > "$OUT"
n=0
while IFS=$'\t' read -r ref committed note; do
  n=$((n+1))
  lane=${ref%%@*}
  rest=${ref#*@}
  pin=${rest%%:*}
  rest2=${rest#*:}
  path=${rest2%:*}
  line=${rest2##*:}
  repo=$FLEET/$lane
  lanekey=${lane%-shokunin}
  H=$(jq -r --arg l "$lanekey" '.[$l] // empty' "$PINS")

  status=""; mynote=""

  if ! git -C "$repo" rev-parse --verify --quiet "$pin^{commit}" >/dev/null; then
    status="stale"; mynote="pin commit absent"
    printf '%s\t%s\t%s\t%s\n' "$ref" "$status" "$mynote" "$committed" >> "$OUT"; continue
  fi
  if ! git -C "$repo" cat-file -e "$pin:$path" 2>/dev/null; then
    status="stale"; mynote="pin file absent"
    printf '%s\t%s\t%s\t%s\n' "$ref" "$status" "$mynote" "$committed" >> "$OUT"; continue
  fi
  git -C "$repo" show "$pin:$path" > "$S/pin.txt"
  pintotal=$(awk 'END{print NR}' "$S/pin.txt")
  if [ "$line" -gt "$pintotal" ] || [ "$line" -lt 1 ]; then
    status="stale"; mynote="pin line absent (pin has $pintotal lines)"
    printf '%s\t%s\t%s\t%s\n' "$ref" "$status" "$mynote" "$committed" >> "$OUT"; continue
  fi
  cited=$(sed -n "${line}p" "$S/pin.txt" | trim)

  if [ -z "$H" ]; then
    status="stale"; mynote="no frozen delta head for lane"
    printf '%s\t%s\t%s\t%s\n' "$ref" "$status" "$mynote" "$committed" >> "$OUT"; continue
  fi
  if ! git -C "$repo" cat-file -e "$H:$path" 2>/dev/null; then
    status="stale"; mynote="head file absent"
    printf '%s\t%s\t%s\t%s\n' "$ref" "$status" "$mynote" "$committed" >> "$OUT"; continue
  fi
  git -C "$repo" show "$H:$path" > "$S/head.txt"
  headtotal=$(awk 'END{print NR}' "$S/head.txt")

  headline=""
  [ "$line" -le "$headtotal" ] && headline=$(sed -n "${line}p" "$S/head.txt" | trim)

  if [ -n "$cited" ] && [ "$headline" = "$cited" ]; then
    status="unchanged"; mynote="-"
  elif [ -z "$cited" ]; then
    status="stale"; mynote="blank cited line; equality not assertable"
  else
    # search head file for a line whose trimmed text equals cited text
    matches=$(awk -v want="$cited" '{ t=$0; sub(/^[ \t]+/,"",t); sub(/[ \t]+$/,"",t); if (t==want) print NR }' "$S/head.txt")
    if [ -n "$matches" ]; then
      first=$(printf '%s\n' "$matches" | head -1)
      count=$(printf '%s\n' "$matches" | wc -l)
      status="moved :$first"
      mynote="verbatim at :$first"
      [ "$count" -gt 1 ] && mynote="$mynote (+$((count-1)) more match(es): $(printf '%s' "$matches" | tr '\n' ',' ))"
      # record the head line N text sha for evidence
      printf '%s\t%s\t%s\t%s\t%s\n' "$ref" "$status" "$mynote" "$committed" "cited_sha=$(printf '%s' "$cited" | sha256sum | cut -c1-16)" >> "$OUT"
      continue
    else
      status="stale"; mynote="cited text not present in head file (head $headtotal lines)"
    fi
  fi
  printf '%s\t%s\t%s\t%s\t%s\n' "$ref" "$status" "$mynote" "$committed" "cited_sha=$(printf '%s' "$cited" | sha256sum | cut -c1-16)" >> "$OUT"
done < "$IN"
echo "rows=$n" >&2

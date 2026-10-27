#!/usr/bin/env bash
set -u
CHUNK=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-36/w1-chunks/AdjDrift08.tsv
PINS=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-36/baseline/c1-delta-pins.json
LEDGER=/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-screen-drift.tsv
OUT="$1"

trim() { sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'; }

: > "$OUT"
while IFS=$'\t' read -r ref ledger_status ledger_note; do
  [ -z "$ref" ] && continue
  lane=${ref%%-shokunin@*}
  rest=${ref#*-shokunin@}
  pin=${rest%%:*}
  rest2=${rest#*:}
  path=${rest2%:*}
  line=${rest2##*:}
  repo=/home/vgpnk/Projects/shokunin/${lane}-shokunin
  head=$(awk -v k="\"$lane\"" 'index($0,k)&&/:[[:space:]]*"/{gsub(/[",[:space:]]/,"");split($0,a,":");print a[2]}' "$PINS")
  pin_ok=1
  if ! git -C "$repo" cat-file -e "${pin}:${path}" 2>/dev/null; then
    my_status="stale"; my_note="pin line absent"; pin_ok=0
  else
    cited=$(git -C "$repo" show "${pin}:${path}" | awk -v n="$line" 'NR==n' | trim)
  fi
  if [ "$pin_ok" = 1 ]; then
    if ! git -C "$repo" cat-file -e "${head}:${path}" 2>/dev/null; then
      my_status="stale"; my_note="head file absent"
    else
      headline=$(git -C "$repo" show "${head}:${path}" | awk -v n="$line" 'NR==n' | trim)
      if [ "$headline" = "$cited" ]; then
        my_status="unchanged"; my_note="-"
      else
        hits=$(git -C "$repo" show "${head}:${path}" | awk -v t="$cited" '{l=$0; sub(/^[[:space:]]+/,"",l); sub(/[[:space:]]+$/,"",l); if (l==t) printf "%d ", NR}')
        if [ -n "$hits" ]; then
          my_status="moved"; my_note="verbatim at :${hits% }"
        else
          my_status="stale"; my_note="cited text absent at head"
        fi
      fi
    fi
  fi
  if [ "$my_status" = "$ledger_status" ]; then agree=agree; else agree=MISMATCH; fi
  printf '%s\t%s\t%s\t%s\t%s\n' "$ref" "$my_status" "$my_note" "$ledger_status" "$agree" >> "$OUT"
done < "$CHUNK"

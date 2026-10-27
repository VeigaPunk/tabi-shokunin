#!/usr/bin/env bash
# AdjDrift03 independent drift re-derivation — git objects only.
set -uo pipefail
FLEET=/home/vgpnk/Projects/shokunin
LANE=$FLEET/tabi-shokunin
IN=${IN:-$LANE/.ufo/waves/round-36/w1-chunks/AdjDrift03.tsv}
LEDGER=$LANE/corpus/adjacency-screen-drift.tsv
PINS=${PINS:-$LANE/.ufo/waves/round-36/baseline/c1-delta-pins.json}
OUT=${OUT:-$LANE/.ufo/waves/round-36/w1/AdjDrift03/receipt.tsv}
mkdir -p "$(dirname "$OUT")"

rows=0; mism=0
: > "$OUT"
while IFS=$'\t' read -r ref lstatus lnote; do
  [ -z "${ref:-}" ] && continue
  rows=$((rows+1))
  # per-row state reset: nothing may leak between rows
  mystatus=""; mynote="-"; cited=""; hits=""; htrim=""; exist=0

  lane=${ref%%-shokunin@*}
  rest=${ref#*-shokunin@}
  pin=${rest%%:*}
  tail=${rest#*:}
  line=${tail##*:}
  path=${tail%:*}
  repo=$FLEET/$lane-shokunin
  head=$(node -p "require('$PINS')['$lane']")

  # 1. cited text at the pin
  if ! pintext=$(git -C "$repo" show "$pin:$path" 2>/dev/null); then
    mystatus="stale: pin file absent"
  else
    cited=$(printf '%s\n' "$pintext" | awk -v L="$line" 'NR==L{v=$0; f=1; sub(/^[ \t\r]+/,"",v); sub(/[ \t\r]+$/,"",v); print v} END{if(!f) exit 7}')
    [ $? -eq 7 ] && mystatus="stale: pin line absent"
  fi

  # 2. compare against the lane's frozen delta head
  #    degenerate-citation guard (disclosed): a blank pin line cannot be re-identified
  #    by text search, so it is reported stale rather than "moved :<every blank line>".
  if [ -z "$mystatus" ] && [ -z "$cited" ]; then
    mystatus="stale"; mynote="blank pin line (degenerate citation)"
  fi
  if [ -z "$mystatus" ]; then
    if ! headtext=$(git -C "$repo" show "$head:$path" 2>/dev/null); then
      mystatus="stale: head file absent"
    else
      htrim=$(printf '%s\n' "$headtext" | awk -v L="$line" 'NR==L{v=$0; f=1; sub(/^[ \t\r]+/,"",v); sub(/[ \t\r]+$/,"",v); print v} END{if(!f) exit 7}')
      if [ $? -eq 7 ]; then
        mystatus="stale: head line absent"
      elif [ "$htrim" = "$cited" ]; then
        mystatus="unchanged"; mynote="-"
      else
        hits=$(printf '%s\n' "$headtext" | awk -v C="$cited" '{s=$0; sub(/^[ \t\r]+/,"",s); sub(/[ \t\r]+$/,"",s); if(s==C) print NR}' | paste -sd, -)
        if [ -n "$hits" ]; then
          mystatus="moved"; mynote=":$hits"
        else
          mystatus="stale"; mynote="-"
        fi
      fi
    fi
  fi

  # 3. committed ledger row for this exact sibling_ref
  lrow=$(awk -F'\t' -v r="$ref" '$1==r{print $2"\t"$3; exit}' "$LEDGER")
  ldups=$(awk -F'\t' -v r="$ref" '$1==r{n++} END{print n+0}' "$LEDGER")
  if [ -z "$lrow" ]; then
    lstat="absent"; lnote2="-"; verdict="MISMATCH"
  else
    lstat=${lrow%%$'\t'*}; lnote2=${lrow#*$'\t'}
    verdict="agree"
    [ "$lstat" != "$mystatus" ] && verdict="MISMATCH"
    if [ "$mystatus" = "moved" ]; then
      # ledger note convention: "verbatim at :N" — compare the relocation line numbers
      mynums=$(printf '%s' "$mynote" | tr -d ':' | tr ',' '\n')
      lnum=$(printf '%s' "$lnote2" | grep -oE ':[0-9]+' | tr -d ':')
      printf '%s\n' "$mynums" | grep -qx -- "${lnum:-x}" || verdict="MISMATCH"
    fi
    [ "$ldups" != "1" ] && verdict="MISMATCH"
  fi
  [ "$verdict" = "MISMATCH" ] && mism=$((mism+1))
  printf '%s\t%s\t%s\t%s\t%s\n' "$ref" "$mystatus" "$mynote" "$lstat" "$verdict" >> "$OUT"
  printf 'ROW %s lane=%s pin=%s head=%s path=%s line=%s htrim=[%s] cited=[%s] hits=[%s] mine=%s%s ledger=%s/%s -> %s\n' \
    "$rows" "$lane" "$pin" "$head" "$path" "$line" "$htrim" "$cited" "$hits" "$mystatus" "$mynote" "$lstat" "$lnote2" "$verdict" >> "${TRACE:-/dev/null}"
done < "$IN"
printf '# AdjDrift03: %d rows, %d mismatches\n' "$rows" "$mism" >> "$OUT"
echo "rows=$rows mismatches=$mism"

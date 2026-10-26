#!/usr/bin/env bash
# compare.sh — diff the wave-1 baseline matrix (061e620) against the tip matrix
# (072af95) for the ExecNoHarmTip seat. Rows are keyed by script|mode; the
# baseline's row 38 command carries a <clone> placeholder, so the key is used,
# never the row number.
set -u
BASE=${BASE:?}
TIP=${TIP:?}
OUT=${OUT:?}

key() { awk -F'\t' 'NR>1{print $4"|"$5}' "$1"; }

paste <(key "$BASE") <(awk -F'\t' 'NR>1{print $6"\t"$7}' "$BASE") \
      <(key "$TIP")  <(awk -F'\t' 'NR>1{print $6"\t"$7}' "$TIP") > "$OUT/joined.tsv"

{
  printf 'row_key\tbase_exit\ttip_exit\tclass\n'
  awk -F'\t' '{
    cls = "same";
    if ($1 != $4) cls = "KEY-MISMATCH";
    else if ($2 != $5) cls = ($2 == "0" && $5 != "0") ? "HARM(green->red)" : (($2 != "0" && $5 == "0") ? "flip(red->green)" : "exit-changed(red->red)");
    printf "%s\t%s\t%s\t%s\n", $1, $2, $5, cls
  }' "$OUT/joined.tsv"
} > "$OUT/exit-class.tsv"

{
  printf 'row_key\tbase_tally\ttip_tally\ttally_changed\n'
  awk -F'\t' '{ printf "%s\t%s\t%s\t%s\n", $1, $3, $6, ($3 == $6 ? "no" : "yes") }' "$OUT/joined.tsv"
} > "$OUT/tally-changes.tsv"

printf 'row_key\tbase_exit\ttip_exit\tclass\n' > "$OUT/harm-findings.tsv"
awk -F'\t' 'NR>1 && $4=="HARM(green->red)"' "$OUT/exit-class.tsv" >> "$OUT/harm-findings.tsv"
awk -F'\t' 'NR>1 && ($4=="flip(red->green)" || $4=="exit-changed(red->red)")' "$OUT/exit-class.tsv" > "$OUT/red-movements.tsv"

printf 'joined rows: %s\n' "$(($(wc -l < "$OUT/joined.tsv")))"
printf 'HARM(green->red): %s\n' "$(($(grep -c 'HARM(green->red)' "$OUT/harm-findings.tsv" || true)))"
printf 'red->green flips: %s\n' "$(($(grep -c 'flip(red->green)' "$OUT/red-movements.tsv" || true)))"
printf 'red->red exit changes: %s\n' "$(($(grep -c 'exit-changed(red->red)' "$OUT/red-movements.tsv" || true)))"
printf 'tallies changed: %s\n' "$(($(awk -F'\t' 'NR>1 && $4=="yes"' "$OUT/tally-changes.tsv" | wc -l)))"

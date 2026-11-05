#!/bin/sh
# make-c1-forgeries-r68.sh — builds the C1 red-state forgeries from the committed
# round-66 ledger + the regenerated round-68 worksheet, into a scratch dir.
# Usage: make-c1-forgeries-r68.sh <worksheet.tsv> <ledger.tsv> <outdir>
# Writes: p5-ws.tsv (lane self-adjudication); p7-ws.tsv + p7-ledger.tsv (quotes of
# two same-file rows swapped at the line level, both files consistent, re-pinned in
# p7-ledger.sha256); pdeg-ws.tsv + pdeg-ledger.tsv (degenerate quote '-').
# Never touches the lane.
set -eu
W="$1"; L="$2"; O="$3"
mkdir -p "$O"

# P5: worksheet row 2 adjudicated by the lane itself
awk -F'\t' -v OFS='\t' 'NR==2{$5="adjudicated-agree";$6="tabi-shokunin";$7="agree";$8="holds";$9="2026-11-05"} {print}' "$W" > "$O/p5-ws.tsv"

# P7: worksheet rows 38/39 (same file, lines 227/228) swap their quotes
K38=$(awk -F'\t' 'NR==38{print $1"\t"$2}' "$W")
K39=$(awk -F'\t' 'NR==39{print $1"\t"$2}' "$W")
Q38=$(awk -F'\t' 'NR==38{print $4}' "$W")
Q39=$(awk -F'\t' 'NR==39{print $4}' "$W")
awk -F'\t' -v OFS='\t' -v q38="$Q38" -v q39="$Q39" \
  'NR==38{$4=q39} NR==39{$4=q38} {print}' "$W" > "$O/p7-ws.tsv"
awk -F'\t' -v OFS='\t' -v k38="$K38" -v k39="$K39" -v q38="$Q38" -v q39="$Q39" \
  '{ if ($1=="line") { k=$2"\t"$3; if (k==k38) $7=q39; else if (k==k39) $7=q38 } print }' "$L" > "$O/p7-ledger.tsv"
sha256sum "$O/p7-ledger.tsv" | cut -d' ' -f1 > "$O/p7-ledger.sha256"

# PDEG: worksheet row 4 and its ledger line quote degenerated to '-'
K4=$(awk -F'\t' 'NR==4{print $1"\t"$2}' "$W")
awk -F'\t' -v OFS='\t' 'NR==4{$4="-"} {print}' "$W" > "$O/pdeg-ws.tsv"
awk -F'\t' -v OFS='\t' -v k4="$K4" \
  '{ if ($1=="line" && ($2"\t"$3)==k4) $7="-"; print }' "$L" > "$O/pdeg-ledger.tsv"
sha256sum "$O/pdeg-ledger.tsv" | cut -d' ' -f1 > "$O/pdeg-ledger.sha256"

echo "built P5 P7 PDEG under $O"

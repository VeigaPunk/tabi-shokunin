#!/bin/sh
# ExecAssimGuard — round 31 §10 assimilation re-derivation (addoption: none this round).
# Reads only: a scratch clone of the lane at the freeze commit, and the read-only staged
# package / defect register under shokuknow. Writes only inside $OUT.
# Usage: OUT=<dir> sh derive.sh
set -eu

CLONE=${CLONE:-/fast/scratch/hyaku/tabi-r31/ExecAssimGuard/clone}
STAGED=${STAGED:-/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md}
REGISTER=${REGISTER:-/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md}
OUT=${OUT:?set OUT to the output directory}

# Fleet CORPUS.md maintained-parser clause: table rows may carry 0-3 leading ASCII
# spaces; 4 or more spaces are indented code and are ignored. Every row extractor
# below therefore uses the 0-3-space form, never a column-zero-only form.
ID_PATTERN='^ {0,3}\|[[:space:]]*S[0-9]{3,}'

grep -oE "$ID_PATTERN" "$CLONE/corpus/SOURCES.md" | grep -oE 'S[0-9]+' | sort -u > "$OUT/reg-ids"
grep -oE "$ID_PATTERN" "$STAGED"                  | grep -oE 'S[0-9]+' | sort -u > "$OUT/staged-ids"
comm -12 "$OUT/reg-ids" "$OUT/staged-ids" > "$OUT/collisions"

# Quarantine slice: every `tabi` data row of the ABSENT register (both the `## Rows`
# section and `## Rows whose quotes were NEVER CHECKED`), in file order, rendered as
# " <id>   <class cell> " exactly as the id and class cells appear. The `## By lane`
# summary row `| `tabi` | 37 |` has no S-id cell and is excluded by the S[0-9]{3} filter.
grep -E '^\| `tabi` \| [^|]+ \| S[0-9]{3}' "$REGISTER" \
  | sed -E 's/^\| `tabi` \| [^|]+ \| (S[0-9]+[^|]*) \| ([^|]+) \|.*$/ \1   \2 /' \
  > "$OUT/quarantine-slice"

sha256sum "$REGISTER" "$STAGED" "$CLONE/corpus/SOURCES.md" > "$OUT/input-sha256.txt"
sha256sum "$OUT/reg-ids" "$OUT/staged-ids" "$OUT/collisions" "$OUT/quarantine-slice" > "$OUT/derived-sha256.txt"

printf 'reg-ids %s\nstaged-ids %s\ncollisions %s\nquarantine-slice %s\n' \
  "$(wc -l < "$OUT/reg-ids")" "$(wc -l < "$OUT/staged-ids")" \
  "$(wc -l < "$OUT/collisions")" "$(wc -l < "$OUT/quarantine-slice")"

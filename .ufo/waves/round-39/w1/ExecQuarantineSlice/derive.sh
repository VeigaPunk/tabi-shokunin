#!/usr/bin/env bash
# Round-39 seat ExecQuarantineSlice: re-derive the complete tabi quarantine slice
# from the absent-defect register with the exact awk extraction.
# READ-ONLY on the register; all output under this seat's scratch dir.
set -euo pipefail
S=/fast/scratch/hyaku/tabi-r39/ExecQuarantineSlice
REG=/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
cd "$S"

echo "### register identity"
sha256sum "$REG"
stat -c 'size=%s mtime=%y' "$REG"
echo "total_lines=$(wc -l < "$REG")"

echo
echo "### A: all-lanes data predicate"
awk -F'|' '$3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/' "$REG" | wc -l

echo
echo "### B: canonical lane predicate (round-36 form): \$2 ~ /\`tabi\`/ && \$3 ~ /round[0-9]+/ && \$4 ~ /S[0-9]+/"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/' "$REG" | wc -l

echo
echo "### C: looser lane predicate (round-25 form): \$2 ~ /tabi/ && \$3 ~ /round/ && \$4 ~ /S[0-9]+/"
awk -F'|' '$2 ~ /tabi/ && $3 ~ /round/ && $4 ~ /S[0-9]+/' "$REG" | wc -l

echo
echo "### D: every line containing the lane token \`tabi\` (data rows + By-lane summary row)"
grep -n '`tabi`' "$REG" | wc -l

echo
echo "### E: \`tabi\` lines EXCLUDED by the data predicate (i.e. the summary rows)"
grep -n '`tabi`' "$REG" | awk -F'|' '!($3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/)'

echo
echo "### F: slice rows -> id | round | class | source-url (row order preserved)"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {
  id=$4; gsub(/[[:space:]]/,"",id); gsub(/`/,"",id);
  round=$3; gsub(/^[[:space:]]+|[[:space:]]+$/,"",round);
  cls=$5; gsub(/^[[:space:]]+|[[:space:]]+$/,"",cls);
  url=$6; gsub(/^[[:space:]]+|[[:space:]]+$/,"",url);
  printf "%s\t%s\t%s\t%s\n", id, round, cls, url;
}' "$REG" > slice.tsv
cat slice.tsv
echo "slice_rows=$(wc -l < slice.tsv)"

echo
echo "### G: every data row carries an S-id? (rows whose id cell lacks S<digits>)"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {id=$4; gsub(/[[:space:]]/,"",id); gsub(/`/,"",id); if (id !~ /^S[0-9]+$/) {n++; print "NO_SID: [" id "] line=" NR}} END{printf "rows_without_sid=%d\n", n+0}' "$REG"

echo
echo "### H: duplicate ids inside the slice"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {id=$4; gsub(/[[:space:]]/,"",id); gsub(/`/,"",id); print id}' "$REG" | sort | uniq -d
echo "dup_count=$(awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {id=$4; gsub(/[[:space:]]/,"",id); gsub(/`/,"",id); print id}' "$REG" | sort | uniq -d | wc -l)"

echo
echo "### I: ids in row order, comma-joined"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {id=$4; gsub(/[[:space:]]/,"",id); gsub(/`/,"",id); printf "%s ", id}' "$REG"; echo

echo
echo "### J: slice by round cell"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {r=$3; gsub(/^[[:space:]]+|[[:space:]]+$/,"",r); n[r]++} END{for (k in n) printf "%s=%d ", k, n[k]; print ""}' "$REG" | tr ' ' '\n' | sort | paste -sd' '

echo
echo "### K: class-cell distribution (raw class cell text)"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {c=$5; gsub(/^[[:space:]]+|[[:space:]]+$/,"",c); n[c]++} END{for (k in n) printf "%d\t[%s]\n", n[k], k}' "$REG" | sort -rn

echo
echo "### L: does any slice row carry a pipe inside a cell (column count != 7)?"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {print NF}' "$REG" | sort | uniq -c

echo
echo "### M: cross-check against round-22 frozen slice ids and round-25 id list"
for f in /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-22/assimilation/quarantine-slice \
         /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/assimilation/quarantine-ids.txt; do
  if [ -f "$f" ]; then
    echo "-- $f"
    grep -oE 'S[0-9]+' "$f" | sort -u > "x_$(basename "$f").ids"
    echo "  prior_ids=$(wc -l < "x_$(basename "$f").ids")"
    cut -f1 slice.tsv | sort -u > mine.ids
    echo "  mine_ids=$(wc -l < mine.ids)"
    echo "  common=$(comm -12 mine.ids "x_$(basename "$f").ids" | wc -l)  only_mine=$(comm -23 mine.ids "x_$(basename "$f").ids" | wc -l)  only_prior=$(comm -13 mine.ids "x_$(basename "$f").ids" | wc -l)"
  else
    echo "-- MISSING $f"
  fi
done

echo
echo "### N: register header totals vs actual (self-consistency control)"
grep -nE '^[^|]*\|[^|]*\|' "$REG" | head -0 || true
grep -nE 'rows|ABSENT|total' "$REG" | head -12 | cut -c1-160

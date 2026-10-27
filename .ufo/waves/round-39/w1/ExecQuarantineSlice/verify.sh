#!/usr/bin/env bash
# Round-39 seat ExecQuarantineSlice — strict verification of the quarantine slice derivation.
set -euo pipefail
S=/fast/scratch/hyaku/tabi-r39/ExecQuarantineSlice
REG=/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
cd "$S"

echo "### 1. Which SECTION does each extracted tabi row live in?"
awk -F'|' -v OFS='\t' '
  /^## / { section=$0 }
  $2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {
    id=$4; gsub(/[[:space:]]/,"",id); gsub(/`/,"",id);
    print NR, section, id
  }' "$REG" | awk -F'\t' '{sec[$2]++; print} END{for (s in sec) printf "SECTION_COUNT\t%s\t%d\n", s, sec[s]}'

echo
echo "### 2. Strict id-cell test WITHOUT stripping backticks (raw cell must be exactly S<digits>)"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {
  raw=$4; gsub(/[[:space:]]/,"",raw);
  if (raw ~ /^S[0-9]+$/) ok++; else { bad++; print "RAW_NOT_PURE_SID: [" raw "] line " NR }
} END {printf "pure_sid_rows=%d  non_pure_sid_rows=%d\n", ok+0, bad+0}' "$REG"

echo
echo "### 3. Summary rows in the register that could contaminate the slice (all summary tables)"
echo "-- Totals section tables (lines 16-24) and By lane table (lines 232-254):"
awk 'NR>=16 && NR<=24 || NR>=232 && NR<=254' "$REG" | grep -n 'tabi' || echo "(no tabi in Totals/By-lane except shown above)"
echo
echo "-- does the By-lane tabi summary row match the data predicate?"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {print "MATCHED: " $0}' "$REG" | grep -c 'By lane' || true
echo "   (0 = the By-lane summary row was NOT matched; matching lines printed above would be data rows only)"

echo
echo "### 4. Negative control: inject a synthetic summary row that LOOKS like the By-lane row"
{ awk 'NR==236 {print; print "| `tabi` | 37 |"} NR!=236' "$REG"; } > /fast/scratch/hyaku/tabi-r39/ExecQuarantineSlice/reg-injected.md
echo "-- original slice count:      $(awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/' "$REG" | wc -l)"
echo "-- injected-file slice count: $(awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/' reg-injected.md | wc -l)"
echo "   (equal => the predicate ignores By-lane-style summary rows)"

echo
echo "### 5. Negative control: inject a summary row that DOES carry round+S-id in the wrong cells"
{ awk 'NR==236 {print; print "| `tabi` | round9 | S999 |"} NR!=236' "$REG"; } > reg-injected2.md
echo "-- injected2 slice count: $(awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/' reg-injected2.md | wc -l) (expect 39 => the predicate is positional, not semantic)"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ && $4 ~ /S999/' reg-injected2.md | cut -c1-120

echo
echo "### 6. Round-39 generator partition vs derived row order (8 x deterministic row-order partition)"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {id=$4; gsub(/[[:space:]]/,"",id); gsub(/`/,"",id); print id}' "$REG" > order.ids
cat > partition.txt <<'EOF'
1|S102 S106 S109 S110 S111
2|S114 S117 S118 S124 S125
3|S126 S130 S131 S133 S134
4|S135 S137 S138 S140 S142
5|S143 S144 S145 S147 S148
6|S149 S153 S154 S158 S163
7|S164 S165 S166 S167 S174
8|S175 S176 S171
EOF
python3 - <<'PY'
order = [l.strip() for l in open('/fast/scratch/hyaku/tabi-r39/ExecQuarantineSlice/order.ids') if l.strip()]
print("derived rows:", len(order))
bad = 0
for line in open('/fast/scratch/hyaku/tabi-r39/ExecQuarantineSlice/partition.txt'):
    line = line.strip()
    if not line: continue
    n, ids = line.split('|')
    ids = ids.split()
    exp = order[(int(n)-1)*5 : int(n)*5] if int(n) < 8 else order[35:38]
    ok = exp == ids
    if not ok: bad += 1
    print(f"partition {n}: expected={exp} gen={ids} match={ok}")
print("PARTITION_MISMATCHES:", bad)
PY

echo
echo "### 7. Register hash re-check after all reads (must be unchanged)"
sha256sum "$REG"

echo
echo "### 8. Class-token classification hazard: token-only counter would report"
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {c=$5; gsub(/^[[:space:]]+|[[:space:]]+$/,"",c); if (c=="`payload-absent`") pa++; else {other++; print "NON_TOKEN_CLASS: [" c "] id=[" $4 "]"}} END{printf "payload-absent=%d  other=%d\n", pa+0, other+0}' "$REG"

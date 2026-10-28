set -u
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
D=.ufo/waves/round-42/w1/MutSliceExtraction
R=/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
OLD='$2 ~ ("`" l "`") && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/'

echo "=== A. sort -u ALONE (no gsub) — is sort the fix? ==="
awk -F'|' -v l='tabi' "$OLD"'{print $4, $5}' "$R" | sort -u | grep 'S171' | cat -A
awk -F'|' -v l='tabi' "$OLD"'{print $4, $5}' "$R" | sort -u | awk '{print $1}' | sort -u > "$D/sortunly-ids.txt"
diff -u "$D/slice-ids.committed.txt" "$D/sortunly-ids.txt" > "$D/sortunly.diff"; echo "diff exit=$?"
grep '^[-+][^-+]' "$D/sortunly.diff" | cat -A

echo
echo "=== B. gsub ALONE (no sort -u) — is gsub sufficient? ==="
awk -F'|' -v l='tabi' "$OLD"'{id=$4; gsub(/[^A-Za-z0-9]/,"",id); print id, $5}' "$R" > "$D/gsubonly.out"
wc -l < "$D/gsubonly.out"
awk '{print $1}' "$D/gsubonly.out" | sort -u > "$D/gsubonly-ids.txt"
diff -u "$D/slice-ids.committed.txt" "$D/gsubonly-ids.txt" >/dev/null; echo "gsub-only vs committed diff exit=$?"

echo
echo "=== C. COMPETING FIX: strip backtick only (keeps the space) ==="
awk -F'|' -v l='tabi' "$OLD"'{id=$4; gsub(/`/,"",id); print id, $5}' "$R" | awk '{print $1}' | sort -u > "$D/backtickonly-ids.txt"
diff -u "$D/slice-ids.committed.txt" "$D/backtickonly-ids.txt" > "$D/backtickonly.diff"; echo "diff exit=$?"
grep '^[-+][^-+]' "$D/backtickonly.diff" | cat -A
echo "note: above diff shows a LEADING-SPACE token, i.e. ' S171' not 'S171'"

echo
echo "=== D. DOWNSTREAM JOIN CONSEQUENCE ==="
echo -n "old-ids  exact S171 count: "; grep -cx 'S171' "$D/old-ids.txt"
echo -n "fixed-ids exact S171 count: "; grep -cx 'S171' "$D/fixed-ids.txt"
grep -q '^S171$' "$D/old-ids.txt" && echo "old: MATCH" || echo "old: NO MATCH -> id join drops the S171 row"
grep -q '^S171$' "$D/fixed-ids.txt" && echo "fixed: MATCH -> row retained"

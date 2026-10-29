#!/usr/bin/env bash
# Decisive harness v2 for seat MutC1Nonce — CORRECTED pin neutralization.
#
# v1 bug: I appended a comment to the self-digest array entry, which is a
# NO-OP — the counter still digested its own running bytes and still tripped
# 'digest-mismatch:...counter'. Here the self-digest array entry is REMOVED
# outright, identically in both copies, so:
#   diff(frozen-nopin, mutant-nopin) == exactly the assigned nonce mutation
# and neither copy carries an orthogonal self-digest refusal.
#
# The pair's measure record records the digest of the counter actually being
# run, so the measure-digest-mismatch layer cannot fire either.
set -u
S=/fast/scratch/hyaku/tabi-r43/MutC1Nonce
OUT="$S/out"
mkdir -p "$OUT"

python3 - "$S" <<'EOF'
import sys, pathlib
S = sys.argv[1]
ENTRY = "['.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs', selfPath]"
for srcname, dstname in [("frozen", "frozen-nopin2"), ("mutant", "mutant-nopin2")]:
    src = pathlib.Path(f"{S}/{srcname}/c1-signature-bound-v5.mjs").read_text()
    assert src.count(ENTRY) == 1, (srcname, src.count(ENTRY))
    # remove the entry AND its trailing comma so the array stays valid
    out = src.replace(ENTRY, "")
    assert ENTRY not in out
    d = pathlib.Path(f"{S}/{dstname}")
    d.mkdir(exist_ok=True)
    (d / "c1-signature-bound-v5.mjs").write_text(out)
    print(f"built {dstname}: self-digest entry removed")
EOF

echo "=== diff(frozen-nopin2, mutant-nopin2) — must be exactly the assigned nonce mutation ==="
diff -u "$S/frozen-nopin2/c1-signature-bound-v5.mjs" "$S/mutant-nopin2/c1-signature-bound-v5.mjs" | tee "$OUT/nopin2.diff"
echo "removed: $(grep -c '^-[^-]' "$OUT/nopin2.diff")  added: $(grep -c '^+[^+]' "$OUT/nopin2.diff")"
echo "=== sanity: no self-digest entry remains in either copy ==="
grep -c "selfPath" "$S/frozen-nopin2/c1-signature-bound-v5.mjs" "$S/mutant-nopin2/c1-signature-bound-v5.mjs"

show () {
  local label="$1"
  node -e '
    const fs=require("fs");const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
    const c=d.stdout||{};
    console.log("    exit:",d.exit,"challengeBytes:",d.challengeBytes);
    console.log("    findings:",JSON.stringify(c.findings));
    console.log("    predicate:",c.predicate,"challengeVerified:",c.challengeVerified);
    console.log("    named run-nonce-mismatch="+(c.findings||[]).includes("run-nonce-mismatch"));
  ' "$OUT/$label.json"
}

run () { # counter pairdir label
  node "$S/mini-wrapper.mjs" --dir "$2" --counter "$1" >"$OUT/$3.json" 2>"$OUT/$3.err"
  echo "=== $3"
  show "$3"
}

for pair in consistent nonceonly; do
  echo "########## pair=$pair"
  # rebuild the pair so its measure record records the digest of each counter
  node "$S/build-nonceonly.mjs" --dir "$S/pairs/$pair-frozen" --counter "$S/frozen/c1-signature-bound-v5.mjs" $( [ "$pair" = consistent ] && echo --consistent ) >"$OUT/pair-$pair-frozen.json"
  node "$S/build-nonceonly.mjs" --dir "$S/pairs/$pair-mutant" --counter "$S/mutant/c1-signature-bound-v5.mjs" $( [ "$pair" = consistent ] && echo --consistent ) >"$OUT/pair-$pair-mutant.json"
  run "$S/frozen/c1-signature-bound-v5.mjs"            "$S/pairs/$pair-frozen" "${pair}-v2-frozen"
  run "$S/mutant/c1-signature-bound-v5.mjs"            "$S/pairs/$pair-mutant" "${pair}-v2-mutant"
  run "$S/frozen-nopin2/c1-signature-bound-v5.mjs"     "$S/pairs/$pair-frozen" "${pair}-v2-frozen-nopin"
  run "$S/mutant-nopin2/c1-signature-bound-v5.mjs"     "$S/pairs/$pair-mutant" "${pair}-v2-mutant-nopin"
done

echo "########## LANE counter (committed bytes, read-only invocation) vs the pairs"
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
run "$LANE" "$S/pairs/consistent-frozen" "consistent-v2-LANE-counter"
run "$LANE" "$S/pairs/nonceonly-frozen"  "nonceonly-v2-LANE-counter"

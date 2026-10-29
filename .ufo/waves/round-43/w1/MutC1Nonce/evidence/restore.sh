#!/usr/bin/env bash
# Restoration + isolation checks for seat MutC1Nonce.
#  (1) RESTORE: overwrite the mutated scratch copy with the exact pristine
#      frozen bytes and re-run the same detector — the restored copy must
#      reproduce the pristine output byte-for-byte.
#  (2) The pin-neutralized mutant must still refuse the REAL committed r43
#      receipt/witness/measure triple (the honest pair) — the mutation must
#      not green an honest input.
#  (3) The pin-neutralized mutant must still refuse the committed r42 replay
#      control input.
set -u
S=/fast/scratch/hyaku/tabi-r43/MutC1Nonce
OUT="$S/out"

echo "########## (1) RESTORE the mutated copy to pristine frozen bytes"
cp -p "$S/frozen/c1-signature-bound-v5.mjs" "$S/mutant/c1-signature-bound-v5.mjs"
sha256sum "$S/mutant/c1-signature-bound-v5.mjs" "$S/frozen/c1-signature-bound-v5.mjs" "$S/frozen-nopin2/c1-signature-bound-v5.mjs"
echo "restored-mutant == pristine-frozen ?"
if cmp -s "$S/mutant/c1-signature-bound-v5.mjs" "$S/frozen/c1-signature-bound-v5.mjs"; then echo "  YES (byte-identical)"; else echo "  NO"; fi

run () { # counter pairdir label
  node "$S/mini-wrapper.mjs" --dir "$2" --counter "$1" >"$OUT/$3.json" 2>"$OUT/$3.err"
  echo "=== $3"
  node -e '
    const fs=require("fs");const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));const c=d.stdout||{};
    console.log("    exit:",d.exit,"findings:",JSON.stringify(c.findings),"predicate:",c.predicate,"challengeVerified:",c.challengeVerified);
  ' "$OUT/$3.json"
}

echo "########## (2) restored copy on the nonceonly pair must reproduce the PRISTINE refusal"
run "$S/mutant/c1-signature-bound-v5.mjs" "$S/pairs/nonceonly-frozen" "restore-nonceonly"
echo "   (compare with nonceonly-v2-frozen: findings [run-nonce-mismatch], exit 1)"

echo "########## (3) pin-neutralized MUTANT on the honest committed r43 triple"
# build a mini-wrapper-compatible dir around the committed r43 artifacts:
# the committed measure record's wrapper key is not available, so the challenge
# cannot be answered by us — we therefore run the DIRECT form (no fd3/fd4
# channel) for the honest pair, which is exactly the committed control's shape.
R=/home/vgpnk/Projects/shokunin/tabi-shokunin
mkdir -p "$S/pairs/honest"
cp "$R/corpus/evidence/round43/playwright-egress/receipt.json" "$S/pairs/honest/receipt.json"
cp "$R/corpus/evidence/round43/playwright-egress/receipt.witness.json" "$S/pairs/honest/receipt.witness.json"
cp "$R/.ufo/waves/round-43/measure/c1-measure-r43.json" "$S/pairs/honest/measure.json"
for c in frozen-nopin2 mutant-nopin2; do
  ( cd "$S/$c" && node c1-signature-bound-v5.mjs "$S/pairs/honest/receipt.json" --measure "$S/pairs/honest/measure.json" 3<"$S/pairs/honest/measure.json" ) >"$OUT/honest-$c.json" 2>"$OUT/honest-$c.err"
  printf '%s\n' "$?" >"$OUT/honest-$c.exit"
  echo "=== honest-$c : exit=$(cat "$OUT/honest-$c.exit")"
  node -e '
    const fs=require("fs");const c=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
    console.log("    findings:",JSON.stringify(c.findings),"predicate:",c.predicate,"challengeVerified:",c.challengeVerified,"challengeError:",c.challengeError);
  ' "$OUT/honest-$c.json"
done

echo "########## (4) pin-neutralized MUTANT on the committed r42 replay control input"
mkdir -p "$S/pairs/replay42"
cp "$R/corpus/evidence/round42/playwright-egress/receipt.json" "$S/pairs/replay42/receipt.json"
cp "$R/corpus/evidence/round42/playwright-egress/receipt.witness.json" "$S/pairs/replay42/receipt.witness.json"
cp "$R/.ufo/waves/round-41/measure/c1-measure.json" "$S/pairs/replay42/measure.json"
for c in frozen-nopin2 mutant-nopin2; do
  ( cd "$S/$c" && node c1-signature-bound-v5.mjs "$S/pairs/replay42/receipt.json" --measure "$S/pairs/replay42/measure.json" 3<"$S/pairs/replay42/measure.json" ) >"$OUT/replay42-$c.json" 2>"$OUT/replay42-$c.err"
  printf '%s\n' "$?" >"$OUT/replay42-$c.exit"
  echo "=== replay42-$c : exit=$(cat "$OUT/replay42-$c.exit")"
  node -e '
    const fs=require("fs");const c=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
    console.log("    findings:",JSON.stringify(c.findings),"predicate:",c.predicate);
  ' "$OUT/replay42-$c.json"
done

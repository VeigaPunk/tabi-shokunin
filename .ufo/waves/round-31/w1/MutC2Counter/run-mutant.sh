#!/bin/sh
# run-mutant.sh <label> <mutant-path>
# Swap the mutant into the scratch clone's scripts/, run the frozen v2
# self-test detector (TMPDIR under seat scratch), restore pristine bytes,
# and print hashes + verdict evidence. Never touches the lane checkout.
set -u
S=/fast/scratch/hyaku/tabi-r31/MutC2Counter
B="$S/clone/scripts/check-selfassessment.mjs"
P="$S/pristine/check-selfassessment.mjs"
label="$1"
mutant="$2"
echo "== mutant $label =="
echo "hash_pristine $(sha256sum "$P" | cut -d' ' -f1)"
cp "$mutant" "$B"
echo "hash_mutant   $(sha256sum "$B" | cut -d' ' -f1)"
diff -u "$P" "$mutant" > "$S/out/$label.diff" || true
TMPDIR="$S/tmp" node "$B" --selftest > "$S/out/$label.txt" 2>&1
code=$?
echo "selftest_exit $code"
cp "$P" "$B"
echo "hash_restored $(sha256sum "$B" | cut -d' ' -f1)"
if cmp -s "$B" "$P"; then echo "restored byte-identical"; else echo "restored MISMATCH"; fi
grep -E "^SELFASSESSMENT_SELFTEST" "$S/out/$label.txt" || echo "no summary line printed"
echo "failing cases:"
grep " FAIL" "$S/out/$label.txt" || echo "  (none)"

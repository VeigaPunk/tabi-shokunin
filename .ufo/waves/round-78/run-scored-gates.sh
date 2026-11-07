#!/usr/bin/env bash
# Round 78 C1 scored gates over the ALREADY PRODUCED canonical receipt (corpus/evidence/round78/
# chromium-file-chooser/receipt.json, sha256 8bcf8290…5d1f, taken once with run-scored.sh after D).
# This replaces only run-scored.sh's copy step: that harness also copied the receipt to
# .ufo/waves/round-78/scored/receipt.json and .../evidence/receipt.json, i.e. INSIDE the walked tree,
# and the counter refused its own harness duplicate (prior-set-complete, c1-counter-a.json run 1).
# The receipt bytes are unchanged; this runner writes outputs to scratch and copies them after
# (QUALITY 151).
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
R=$LANE/.ufo/waves/round-78
C=$R/controls/c1
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r78/L1-scored
EV=$LANE/corpus/evidence/round78/chromium-file-chooser/receipt.json
PIN=$(sha256sum "$LANE/scripts/chrome-cdp-filechooser-round78.mjs" | cut -c1-64)
D12=$(cut -c1-12 "$R/scored/digests-commit.txt")
NA=tabi-r78-l1-$D12
DEG=(); for k in page-stub eval-trigger swap-files; do DEG+=(--laundered "$C/deg-$k.receipt.json"); done
mkdir -p "$S"
node "$LANE/scripts/check-filechooser-r78.mjs" --lane "$LANE" --receipt "$EV" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" --prior-set "$C/prior-set.txt" --json > "$S/counter-a.json"; echo $? > "$S/counter-a.exit"
cp "$S/counter-a.json" "$R/scored/c1-counter-a.json"; cp "$S/counter-a.exit" "$R/scored/counter-a.exit"
rm -rf "$S/n"; node "$LANE/scripts/negatives-filechooser-r78.mjs" --lane "$LANE" --real "$EV" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" --prior-set "$C/prior-set.txt" "${DEG[@]}" --work "$S/n" --jobs "${JOBS:-8}" --json > "$S/negatives-a.json"; echo $? > "$S/negatives-a.exit"
cp "$S/negatives-a.json" "$R/scored/c1-negatives-a.json"; cp "$S/negatives-a.exit" "$R/scored/negatives-a.exit"
rm -rf "$S/k"; mkdir -p "$S/k"; node "$C/kill-power-r78.mjs" --lane "$LANE" --real "$EV" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" --prior-set "$C/prior-set.txt" "${DEG[@]}" --work "$S/k" --out "$S/killpower-a.json" --jobs "${JOBS:-8}" > "$S/killpower-a.out" 2>&1; echo $? > "$S/killpower-a.exit"
cp "$S/killpower-a.json" "$R/scored/c1-killpower-a.json"; cp "$S/killpower-a.out" "$R/scored/killpower-a.out"; cp "$S/killpower-a.exit" "$R/scored/killpower-a.exit"
echo "counter=$(cat "$S/counter-a.exit") battery=$(cat "$S/negatives-a.exit") killpower=$(cat "$S/killpower-a.exit")"

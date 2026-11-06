#!/usr/bin/env bash
# R69Critic reproduction — tabi round 69, C1 (adjacency) and C2 (coverage) attack.
# Read-only against the lane; every output lands in this directory (or a fresh scratch dir).
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
EV=$LANE/.ufo/waves/round-69/w1/R69Critic/evidence
SNAP=$LANE/.ufo/waves/round-69/c1/sibling-heads-r69.tsv
FLEET=/home/vgpnk/Projects/shokunin
SCRATCH=$(mktemp -d -p /fast/scratch/hyaku/tabi-r69/R69Critic repro.XXXX)
cd "$LANE" || exit 1

echo "== 0. freeze pins (must equal freeze.txt) =="
sha256sum scripts/check-sibling-matrix-r69.mjs scripts/negatives-sibling-matrix-r69.mjs \
  scripts/chrome-cdp-synthscroll-round69.mjs scripts/check-synthscroll-r69.mjs \
  scripts/negatives-synthscroll-r69.mjs .ufo/waves/round-69/c1/sibling-heads-r69.tsv

echo "== 1. C1 do-nothing (base PROVINCE has no matrix) =="
git show d65546b3:PROVINCE.md > "$SCRATCH/head-PROVINCE.md"
node scripts/check-sibling-matrix-r69.mjs --province "$SCRATCH/head-PROVINCE.md" --snapshot "$SNAP" --fleet "$FLEET" --json ; echo "exit=$?"

echo "== 2. C1 on the scored draft (archived digest 700e0d45...) =="
sha256sum "$EV/draft-PROVINCE-snapshot.md"
node scripts/check-sibling-matrix-r69.mjs --province "$EV/draft-PROVINCE-snapshot.md" --snapshot "$SNAP" --fleet "$FLEET" --json ; echo "exit=$?"

echo "== 3. C1 cheapest passing matrix (17/20 title-line quotes, 1 tabi side) =="
node scripts/check-sibling-matrix-r69.mjs --province "$EV/cheap2-PROVINCE.md" --snapshot "$SNAP" --fleet "$FLEET" --json ; echo "exit=$?"
node scripts/negatives-sibling-matrix-r69.mjs --province "$EV/cheap2-PROVINCE.md" --snapshot "$SNAP" --fleet "$FLEET" --work "$SCRATCH/b-cheap" --out "$SCRATCH/b-cheap.json" ; echo "exit=$?"

echo "== 4. C1 over-claim variant (19 adjacent, 1 contested) =="
node scripts/check-sibling-matrix-r69.mjs --province "$EV/cheap3-all-adjacent-PROVINCE.md" --snapshot "$SNAP" --fleet "$FLEET" --json ; echo "exit=$?"

echo "== 5. C1 with the independent connector's labels (3 refused) =="
node scripts/check-sibling-matrix-r69.mjs --province "$EV/connector-labels-PROVINCE.md" --snapshot "$SNAP" --fleet "$FLEET" --json ; echo "exit=$?"

echo "== 6. C2 fabricated receipt (nonce rewritten 6x, host identity forged) =="
node scripts/check-synthscroll-r69.mjs --receipt "$EV/control-forged-seat-receipt.json" \
  --expect-driver-sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3 --json ; echo "exit=$?"
node scripts/negatives-synthscroll-r69.mjs --real "$EV/control-forged-seat-receipt.json" --work "$SCRATCH/b-forged" \
  --laundered .ufo/waves/round-69/controls/c2-degenerate/js-scroll-receipt.json \
  --laundered .ufo/waves/round-69/controls/c2-degenerate/dispatch-wheel-receipt.json \
  --laundered .ufo/waves/round-69/controls/c2-degenerate/skip-touch-receipt.json \
  --out "$SCRATCH/b-forged.json" ; echo "exit=$?"

echo "== 7. C2 receipt with no host evidence and a zeroed timeline =="
node scripts/check-synthscroll-r69.mjs --receipt "$EV/control-mut-no-stderr.json" \
  --expect-driver-sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3 --json ; echo "exit=$?"
node scripts/check-synthscroll-r69.mjs --receipt "$EV/control-mut-zero-times.json" \
  --expect-driver-sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3 --json ; echo "exit=$?"
node scripts/check-synthscroll-r69.mjs --receipt "$EV/control-mut-events-redistributed.json" \
  --expect-driver-sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3 --json ; echo "exit=$?"

echo "== 8. C2 scored vs seat receipt: the manual (a)/(b) independence check =="
node "$EV/diff-receipts.mjs" corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json \
  .ufo/waves/round-69/w1/R69Exec1/receipt.json

echo "== 9. C1 duplicate-section brittleness =="
node scripts/check-sibling-matrix-r69.mjs --province "$EV/dup-section-PROVINCE.md" --snapshot "$SNAP" --fleet "$FLEET" --json ; echo "exit=$? (counter: clean with two sections)"
node scripts/negatives-sibling-matrix-r69.mjs --province "$EV/dup-section-PROVINCE.md" --snapshot "$SNAP" --fleet "$FLEET" --work "$SCRATCH/b-dup" --out "$SCRATCH/b-dup.json" ; echo "exit=$? (battery: matrix-removed negative fails)"

rm -rf "$SCRATCH"

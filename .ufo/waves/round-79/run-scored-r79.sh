#!/bin/sh
# Round 79 scored run: driver -> counter -> battery -> kill power -> record drift -> selftest.
# Every instrument writes into $S (scratch) and is copied into .ufo/waves/round-79/scored/ only after
# the run (QUALITY 151: an instrument never writes its own JSON into a tree another instrument walks).
set -eu
L=/home/vgpnk/Projects/shokunin/tabi-shokunin
R=$L/.ufo/waves/round-79
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r79/l1-scored
PS=$R/controls/c1/prior-set.txt
EV=$L/corpus/evidence/round79/chromium-showpicker/receipt.json
D=$(cat "$R/scored/digests-commit.txt")
D12=$(printf '%s' "$D" | cut -c1-12)
NONCE=tabi-r79-l1-$D12
PIN=$(awk '$2=="scripts/chrome-cdp-showpicker-round79.mjs"{print $1}' "$R/freeze.txt")
mkdir -p "$S" "$L/corpus/evidence/round79/chromium-showpicker" "$R/scored"
echo "D=$D nonce=$NONCE driver-pin=$PIN"

node "$L/scripts/chrome-cdp-showpicker-round79.mjs" --lane "$L" --nonce "$NONCE" --scratch "$S" \
  --out "$EV" --http-port 18970 --cdp-port 18971 > "$S/driver.out" 2> "$S/driver.err"
echo "driver exit=$?"
FIX=$(python3 -c "import json,sys;print(json.load(open('$EV'))['fixture']['sha256'])")
echo "fixture=$FIX"

node "$L/scripts/check-showpicker-r79.mjs" --lane "$L" --receipt "$EV" --expect-driver-sha256 "$PIN" \
  --expect-nonce "$NONCE" --expect-fixture-sha256 "$FIX" --prior-set "$PS" --json > "$S/c1-counter-a.json" 2> "$S/c1-counter-a.err" || true
node -e "const j=require('$S/c1-counter-a.json');console.log('counter',j.verdict,j.checkCount,j.findings.map(f=>f.id).join(','))"

node "$L/scripts/negatives-showpicker-r79.mjs" --lane "$L" --real "$EV" --expect-driver-sha256 "$PIN" \
  --expect-nonce "$NONCE" --expect-fixture-sha256 "$FIX" --prior-set "$PS" --work "$S/battery" --json > "$S/c1-negatives-a.json" 2> "$S/c1-negatives-a.err" || true
node -e "const j=require('$S/c1-negatives-a.json');console.log('battery',j.cases,j.passed,j.failed,JSON.stringify(j.coverage))"

node "$L/scripts/kill-power-r79.mjs" --lane "$L" --real "$EV" --expect-driver-sha256 "$PIN" \
  --expect-nonce "$NONCE" --expect-fixture-sha256 "$FIX" --prior-set "$PS" --work "$S/killpower" --json > "$S/c1-killpower-a.json" 2> "$S/c1-killpower-a.err" || true
node -e "const j=require('$S/c1-killpower-a.json');console.log('killpower',j.mutants,j.killed,j.survived,j.crashed,JSON.stringify(j.survivorsList))"

node "$L/scripts/check-record-drift-r79.mjs" --lane "$L" --json > "$S/c2-after.json" 2> "$S/c2-after.err" || true
node -e "const j=require('$S/c2-after.json');console.log('drift',j.claims,j.mismatches,JSON.stringify(j.failed.map(f=>f.id)))"

node "$L/scripts/selftest-r79-gates.mjs" --lane "$L" --work "$S/selftest" --json > "$S/selftest-r79-gates.out" 2> "$S/selftest-r79-gates.err" || true
node -e "const j=require('$S/selftest-r79-gates.out');console.log('selftest',j.clean,j.cases,JSON.stringify(j.failed))"

cp "$S/c1-counter-a.json" "$S/c1-negatives-a.json" "$S/c1-killpower-a.json" "$S/c2-after.json" "$S/selftest-r79-gates.out" "$R/scored/"
cp "$S/driver.out" "$R/scored/driver.out"
echo "scored evidence copied to $R/scored"

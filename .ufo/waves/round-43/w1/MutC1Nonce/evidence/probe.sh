#!/usr/bin/env bash
# Probe matrix for seat MutC1Nonce.
# Runs the FROZEN counter copy and the MUTATED counter copy (both from scratch)
# against each fixture variant, records stdout JSON / stderr / exit code.
#
# Challenge channel: fd3 is opened read-only, so the counter's
# fs.writeSync(3, challenge) fails with EINVAL — reproducing the committed
# direct-invocation control environment (controls/c1-relabel-refused.json).
set -u
S=/fast/scratch/hyaku/tabi-r43/MutC1Nonce
R=/home/vgpnk/Projects/shokunin/tabi-shokunin
OUT="$S/out"
mkdir -p "$OUT"

run_one () { # label counter receipt measure
  local label="$1" counter="$2" receipt="$3" measure="$4"
  ( cd "$(dirname "$counter")" && node "$counter" "$receipt" --measure "$measure" 3<"$measure" ) \
     >"$OUT/$label.stdout.json" 2>"$OUT/$label.stderr.txt"
  local code=$?
  printf '%s\n' "$code" >"$OUT/$label.exit"
  echo "--- $label : exit=$code"
  echo "    cmd: node $counter $receipt --measure $measure  (fd3 read-only)"
  node -e '
    const fs=require("fs");
    const p=process.argv[1];
    let d=null; try{d=JSON.parse(fs.readFileSync(p,"utf8"))}catch(e){console.log("    <unparsable stdout>",fs.readFileSync(p,"utf8").slice(0,400));process.exit(0)}
    const named=["run-nonce-mismatch","witness-nonce-mismatch","measure-nonce-shape"];
    console.log("    findings:",JSON.stringify(d.findings));
    console.log("    named:",named.map(n=>n+"="+d.findings.includes(n)).join(" "));
    console.log("    nonceMatched:",d.nonceMatched,"predicate:",d.predicate,"challengeVerified:",d.challengeVerified,"challengeError:",d.challengeError);
  ' "$OUT/$label.stdout.json"
  if [ -s "$OUT/$label.stderr.txt" ]; then echo "    stderr: $(cat "$OUT/$label.stderr.txt")"; fi
}

echo "=========== BASE (committed r43 receipt/witness/measure, direct invocation)"
run_one base-frozen   "$S/frozen/c1-signature-bound-v5.mjs"  "$S/fixtures/base/receipt.json" "$S/fixtures/base/measure.json"
run_one base-mutant   "$S/mutant/c1-signature-bound-v5.mjs"  "$S/fixtures/base/receipt.json" "$S/fixtures/base/measure.json"

echo "=========== RELABEL-RECEIPT (receipt.runNonce + runs[].runNonce relabeled)"
run_one relrec-frozen "$S/frozen/c1-signature-bound-v5.mjs"  "$S/fixtures/relabel-receipt/receipt.json" "$S/fixtures/relabel-receipt/measure.json"
run_one relrec-mutant "$S/mutant/c1-signature-bound-v5.mjs"  "$S/fixtures/relabel-receipt/receipt.json" "$S/fixtures/relabel-receipt/measure.json"

echo "=========== RELABEL-MEASURE (measure.nonce relabeled, receipt+witness untouched)"
run_one relmea-frozen "$S/frozen/c1-signature-bound-v5.mjs"  "$S/fixtures/relabel-measure/receipt.json" "$S/fixtures/relabel-measure/measure.json"
run_one relmea-mutant "$S/mutant/c1-signature-bound-v5.mjs"  "$S/fixtures/relabel-measure/receipt.json" "$S/fixtures/relabel-measure/measure.json"

echo "=========== RELABEL-WITNESS (witness.nonce relabeled, receipt+measure untouched)"
run_one relwit-frozen "$S/frozen/c1-signature-bound-v5.mjs"  "$S/fixtures/relabel-witness/receipt.json" "$S/fixtures/relabel-witness/measure.json"
run_one relwit-mutant "$S/mutant/c1-signature-bound-v5.mjs"  "$S/fixtures/relabel-witness/receipt.json" "$S/fixtures/relabel-witness/measure.json"

echo "=========== COMMITTED CONTROL REPLAY (r42 committed receipt + r41 measure record)"
# committed control: .ufo/waves/round-43/controls/c1-replay-r42-refused.json
mkdir -p "$S/fixtures/replay42"
cp "$R/corpus/evidence/round42/playwright-egress/receipt.json" "$S/fixtures/replay42/receipt.json"
cp "$R/corpus/evidence/round42/playwright-egress/receipt.witness.json" "$S/fixtures/replay42/receipt.witness.json"
cp "$R/.ufo/waves/round-41/measure/c1-measure.json" "$S/fixtures/replay42/measure.json"
run_one replay42-frozen "$S/frozen/c1-signature-bound-v5.mjs" "$S/fixtures/replay42/receipt.json" "$S/fixtures/replay42/measure.json"
run_one replay42-mutant "$S/mutant/c1-signature-bound-v5.mjs" "$S/fixtures/replay42/receipt.json" "$S/fixtures/replay42/measure.json"

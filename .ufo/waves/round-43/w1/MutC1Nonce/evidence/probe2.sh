#!/usr/bin/env bash
# Second probe pass for seat MutC1Nonce:
#  (1) in-place committed counter (read-only invocation, cwd=ROOT) on the same
#      fixtures -> zero self-digest confound, since import.meta.url is the
#      committed path whose bytes match the frozen pin.
#  (2) the committed control scenario from controls/c1-relabel-refused.json:
#      "same synthetic pair with one tampered field in the measure record
#      (signature not renewed)" -> here the tampered field is the nonce.
set -u
S=/fast/scratch/hyaku/tabi-r43/MutC1Nonce
R=/home/vgpnk/Projects/shokunin/tabi-shokunin
COMMITTED="$R/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs"
OUT="$S/out"

show () { # label
  local label="$1"
  echo "--- $label : exit=$(cat "$OUT/$label.exit")"
  node -e '
    const fs=require("fs");const p=process.argv[1];
    let d=null;try{d=JSON.parse(fs.readFileSync(p,"utf8"))}catch(e){console.log("    <unparsable>");process.exit(0)}
    console.log("    findings:",JSON.stringify(d.findings));
    console.log("    named: run-nonce-mismatch="+d.findings.includes("run-nonce-mismatch")+
                " witness-nonce-mismatch="+d.findings.includes("witness-nonce-mismatch")+
                " measure-signature-invalid="+d.findings.includes("measure-signature-invalid"));
    console.log("    nonceMatched:",d.nonceMatched,"predicate:",d.predicate,"challengeVerified:",d.challengeVerified,"challengeError:",d.challengeError);
  ' "$OUT/$label.stdout.json"
}

run_inplace () { # label receipt measure
  ( cd "$R" && node "$COMMITTED" "$2" --measure "$3" 3<"$3" ) >"$OUT/$1.stdout.json" 2>"$OUT/$1.stderr.txt"
  printf '%s\n' "$?" >"$OUT/$1.exit"
  echo "=== in-place committed counter :: $1"
  echo "    cmd: (cd $R && node .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs $2 --measure $3) 3<measure"
  show "$1"
}

echo "########## (1) in-place committed counter, zero self-digest confound"
run_inplace inplace-base       "$S/fixtures/base/receipt.json"           "$S/fixtures/base/measure.json"
run_inplace inplace-relrec     "$S/fixtures/relabel-receipt/receipt.json" "$S/fixtures/relabel-receipt/measure.json"
run_inplace inplace-relmea     "$S/fixtures/relabel-measure/receipt.json" "$S/fixtures/relabel-measure/measure.json"
run_inplace inplace-relwit     "$S/fixtures/relabel-witness/receipt.json" "$S/fixtures/relabel-witness/measure.json"

echo "########## (2) committed control scenario: measure record tampered in the nonce field only"
# relabel-measure is exactly that: the measure record's nonce field replaced,
# signature NOT renewed. Confirm the single-field property.
node -e '
const fs=require("fs");
const a=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
const b=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
const ka=Object.keys(a).sort(),kb=Object.keys(b).sort();
console.log("    top-level keys identical:",JSON.stringify(ka)===JSON.stringify(kb));
const diffs=[];
for(const k of ka){ if(JSON.stringify(a[k])!==JSON.stringify(b[k])) diffs.push(k); }
console.log("    differing top-level fields:",JSON.stringify(diffs));
' "$S/fixtures/base/measure.json" "$S/fixtures/relabel-measure/measure.json"

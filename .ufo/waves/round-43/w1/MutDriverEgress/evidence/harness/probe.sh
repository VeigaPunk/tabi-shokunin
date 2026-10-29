#!/usr/bin/env bash
# probe.sh <label> <counter> <receipt> <measure> [privkey]
# Runs the counter and always exits 0, echoing the JSON summary.
set +e
LABEL="$1"; COUNTER="$2"; RECEIPT="$3"; MEASURE="$4"; PRIV="${5:-}"
S=/fast/scratch/hyaku/tabi-r43/MutDriverEgress
echo "########## $LABEL ##########"
if [ -n "$PRIV" ]; then
  node "$S/harness/run-counter.mjs" "$COUNTER" "$RECEIPT" "$MEASURE" "$PRIV" > "$S/out/$LABEL.json" 2> "$S/out/$LABEL.err"
else
  node "$COUNTER" "$RECEIPT" --measure "$MEASURE" > "$S/out/$LABEL.json" 2> "$S/out/$LABEL.err"
fi
rc=$?
echo "counter_exit=$rc"
node -e '
const fs=require("fs");
const p=process.argv[1];
let raw="";try{raw=fs.readFileSync(p,"utf8")}catch(e){}
let j=null;try{j=JSON.parse(raw)}catch(e){}
if(!j){console.log("UNPARSEABLE stdout:",JSON.stringify(raw.slice(0,800)));try{console.log("stderr:",fs.readFileSync(process.argv[2],"utf8").slice(0,800))}catch(e){}}
else console.log(JSON.stringify({predicate:j.predicate,findings:j.findings,challengeVerified:j.challengeVerified,challengeError:j.challengeError,measureSignatureVerified:j.measureSignatureVerified,witnessAttestationVerified:j.witnessAttestationVerified,egressDetail:j.egressDetail,receiptSha256:j.receiptSha256},null,1));
' "$S/out/$LABEL.json" "$S/out/$LABEL.err"
echo "########## end $LABEL ##########"
exit 0

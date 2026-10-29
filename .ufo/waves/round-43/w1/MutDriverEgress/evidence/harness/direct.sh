#!/usr/bin/env bash
# direct.sh <label> <counter> <receipt> <measure>
# Frozen-counter direct invocation, no challenge channel. Always exits 0.
set +e
LABEL="$1"; COUNTER="$2"; RECEIPT="$3"; MEASURE="$4"
S=/fast/scratch/hyaku/tabi-r43/MutDriverEgress
echo "===== $LABEL ====="
node "$COUNTER" "$RECEIPT" --measure "$MEASURE" > "$S/out/$LABEL.json" 2> "$S/out/$LABEL.err"
rc=$?
echo "counter_exit=$rc"
node -e '
const fs=require("fs");
let raw="";try{raw=fs.readFileSync(process.argv[1],"utf8")}catch(e){}
let j=null;try{j=JSON.parse(raw)}catch(e){}
if(!j){console.log("UNPARSEABLE:",JSON.stringify(raw.slice(0,600)));try{console.log("stderr:",fs.readFileSync(process.argv[2],"utf8").slice(0,600))}catch(e){}}
else console.log(JSON.stringify({predicate:j.predicate,findings:j.findings,egressDetail:j.egressDetail,challengeVerified:j.challengeVerified,challengeError:j.challengeError,measureSignatureVerified:j.measureSignatureVerified,witnessAttestationVerified:j.witnessAttestationVerified},null,1));
' "$S/out/$LABEL.json" "$S/out/$LABEL.err"
echo "===== end $LABEL ====="
exit 0

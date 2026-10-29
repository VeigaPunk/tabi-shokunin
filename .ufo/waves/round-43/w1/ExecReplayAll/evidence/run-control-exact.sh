#!/usr/bin/env bash
set -u
S=/fast/scratch/hyaku/tabi-r43/ExecReplayAll
COUNTER=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
cd "$S"
node "$COUNTER" "$S/r42/receipt.json" --measure "$S/r41/measure.json" 3>&- 4>&- > "$S/out/control-cmdexact.stdout" 2> "$S/out/control-cmdexact.stderr"
ec=$?
echo "EXIT: $ec" | tee "$S/out/control-cmdexact.exit"
wc -c "$S/out/control-cmdexact.stdout" "$S/out/control-cmdexact.stderr"
node -e "const d=require('$S/out/control-cmdexact.stdout'); console.log('findings:', JSON.stringify(d.findings)); console.log('challengeVerified:',d.challengeVerified,'challengeError:',d.challengeError,'predicate:',d.predicate,'measureSig:',d.measureSignatureVerified,'witnessAtt:',d.witnessAttestationVerified);"
echo "--- stderr ---"; cat "$S/out/control-cmdexact.stderr"
exit 0

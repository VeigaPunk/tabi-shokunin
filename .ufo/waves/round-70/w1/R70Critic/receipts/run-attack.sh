#!/usr/bin/env bash
set -u
W=/fast/scratch/hyaku/tabi-r70/R70Critic
L=$W/lane
A=$W/vatk
rm -rf "$A"; mkdir -p "$A"
export NODE_OPTIONS="--require $W/preload.cjs"
export FORGED_TEMPLATE="$L/corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json"
node "$L/scripts/verify-live-r70.mjs" --profile synthtap-r70 --scratch "$A" --json > "$A/out.json" 2> "$A/err" &
VP=$!
swapped=0
for i in $(seq 1 500); do
  if pgrep -f "$L/scripts/check-synthtap-r70.mjs" >/dev/null 2>&1; then
    cp "$W/do-nothing.mjs" "$L/scripts/chrome-cdp-synthtap-round70.mjs"
    swapped=$i
    break
  fi
  sleep 0.01
done
wait $VP
rc=$?
echo "swapped_at=$swapped verifier_exit=$rc"
node -e 'try{const j=require(process.argv[1]);console.log(JSON.stringify({predicate:j.predicate,exit:j.exit,pinSource:j.pinSource,findings:j.findings,agreement:j.agreement,runs:j.runs.map(r=>({n:r.name,exit:r.exit,counter:r.counterExit,wall:r.wallMs,bind:r.binding,sha:r.receiptSha256}))},null,1))}catch(e){console.log("no json",e.message)}' "$A/out.json"

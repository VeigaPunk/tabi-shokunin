#!/usr/bin/env bash
# Replay the C1 counter-v4 mutation matrix.
#   scratch:  /fast/scratch/hyaku/tabi-r42/MutC1Counter  (pristine.mjs m1..m6.mjs,
#             receipt.json witness.json w_bogus.json pins.json pins-r41.json, f_*.json)
#   node:     the pinned interpreter, fnm node v24.21.0
#             (process.execPath sha256 7fde7b8a... == producerPins.nodeSha256)
# Prints one CMD line per (counter, fixture) pair, then EXIT and the finding list.
set -uo pipefail
S=${S:-/fast/scratch/hyaku/tabi-r42/MutC1Counter}
NODE=${NODE:-/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node}
NONCE=$("$NODE" -e "console.log(require('$S/receipt.json').runNonce)")

case_spec() { # label|receipt|extra args
  cat <<'SPEC'
f_base|f_base|--witness witness.json
f_base_pins|f_base|--witness witness.json --pins pins-r41.json
f_base_pins42|f_base|--witness witness.json --pins pins.json
f_span|f_span|--witness witness.json
f_ticks|f_ticks|--witness witness.json
f_egress|f_egress|--witness witness.json
f_exe_roots|f_exe_roots|--witness witness.json
f_tree_exe|f_tree_exe|--witness witness.json
f_nonce|f_nonce|--witness witness.json
f_base_nowit|f_base|
f_base_bogus|f_base|--witness w_bogus.json
SPEC
}

cd "$S" || exit 1
for c in pristine m1 m2 m3 m4 m5 m6; do
  while IFS='|' read -r label rec extra; do
    [ -z "$label" ] && continue
    # shellcheck disable=SC2086
    out=$("$NODE" "$c.mjs" "$rec.json" --nonce "$NONCE" $extra)
    rc=$?
    summary=$(printf '%s' "$out" | "$NODE" -e 'let s="";process.stdin.on("data",(d)=>s+=d).on("end",()=>{try{const o=JSON.parse(s);console.log(JSON.stringify({predicate:o.predicate,nonceMatched:o.nonceMatched,nfindings:o.findings.length,findings:o.findings.slice(0,4)}))}catch{console.log("UNPARSEABLE")}})')
    echo "[$label] CMD: $c.mjs $rec.json --nonce $NONCE $extra"
    echo "[$label] EXIT: $rc $summary"
  done < <(case_spec)
done

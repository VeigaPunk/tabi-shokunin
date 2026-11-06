#!/usr/bin/env bash
# Pre-freeze executed controls, tabi round 70. Every control records its argv, its exit code
# (captured on the line directly after the command -- QUALITY 130) and its stdout.
# Usage: run-controls.sh <ABS scratch dir>   (writes only under the lane's
# .ufo/waves/round-70/controls/ and the given scratch dir)
set -u
L=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$L/.ufo/waves/round-70/controls
S=${1:?scratch}
mkdir -p "$S" "$C/c1" "$C/c2" "$C/c1-receipts" "$C/c2-receipts"
F=$C/forgers/forger.mjs
R69E=$L/corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json
R69D=$L/scripts/chrome-cdp-synthscroll-round69.mjs
R70D=$L/scripts/chrome-cdp-synthtap-round70.mjs
V=$L/scripts/verify-live-r70.mjs
FSHA=$(sha256sum "$F" | cut -c1-64)

rec() { # rec <dir> <name> <expected-exit> <expected-findings-csv> -- cmd...
  local d=$1 n=$2 ee=$3 ef=$4; shift 5
  "$@" > "$C/$d/$n.out" 2> "$C/$d/$n.err"
  local rc=$?
  printf '{"control":"%s","argv":%s,"exit":%d,"expectedExit":%d,"expectedFindings":"%s"}\n' "$n" "$(printf '%s\n' "$@" | node -e 'const l=require("fs").readFileSync(0,"utf8").split("\n");l.pop();console.log(JSON.stringify(l))')" "$rc" "$ee" "$ef" > "$C/$d/$n.exit.json"
  echo "$d/$n exit=$rc expected=$ee"
}

# ---- C2: live re-derivation of the r69 capability (profile synthscroll-r69) ----
rm -rf "$S/base" && mkdir -p "$S/base" && git -C "$L" archive master scripts | tar -x -C "$S/base"
rec c2 donothing-base 1 MODULE_NOT_FOUND -- node "$S/base/scripts/verify-live-r70.mjs" --profile synthscroll-r69 --scratch "$S/c2-base" --json
rec c2 no-run 1 no-run -- node "$V" --profile synthscroll-r69 --scratch "$S/c2-norun" --no-run --json
cp "$R69D" "$S/tampered-r69.mjs" && printf '\n// tampered\n' >> "$S/tampered-r69.mjs"
rec c2 tampered-driver 2 driver-pin -- node "$V" --profile synthscroll-r69 --scratch "$S/c2-tamper" --driver "$S/tampered-r69.mjs" --driver-sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3 --json
rec c2 forger-replay 1 run-a-nonce,run-b-nonce -- env FORGER_MODE=replay FORGER_SOURCE="$R69E" node "$V" --profile synthscroll-r69 --scratch "$S/c2-rp" --driver "$F" --driver-sha256 "$FSHA" --json
rec c2 forger-rewrite 1 run-a-cdpPort,run-a-httpPort,cross-run-identity -- env FORGER_MODE=rewrite FORGER_SOURCE="$R69E" node "$V" --profile synthscroll-r69 --scratch "$S/c2-rw" --driver "$F" --driver-sha256 "$FSHA" --json
cp "$S/c2-rw/run-a/receipt.json" "$C/c2-receipts/forger-rewrite-run-a.json"
rec c2 r69-counter-accepts-rewrite 0 none -- node "$L/scripts/check-synthscroll-r69.mjs" --receipt "$C/c2-receipts/forger-rewrite-run-a.json" --json
rec c2 forger-rewrite-full-lying 1 run-a-driverDigest,run-b-driverDigest -- env FORGER_MODE=rewrite-full FORGER_CLAIM_SHA=13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3 FORGER_SOURCE="$R69E" node "$V" --profile synthscroll-r69 --scratch "$S/c2-rfl" --driver "$F" --driver-sha256 "$FSHA" --json
rec c2 forger-rewrite-full-honest 1 counter-a,counter-b -- env FORGER_MODE=rewrite-full FORGER_SOURCE="$R69E" node "$V" --profile synthscroll-r69 --scratch "$S/c2-rfh" --driver "$F" --driver-sha256 "$FSHA" --json
cp "$R69D" "$S/copy-of-frozen-r69.mjs"
rec c2 override-copy-of-frozen 4 none -- node "$V" --profile synthscroll-r69 --scratch "$S/c2-ocf" --driver "$S/copy-of-frozen-r69.mjs" --driver-sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3 --json
for k in js-scroll dispatch-wheel skip-touch; do
  rec c2 forger-degenerate-$k 1 counter-a,counter-b -- env FORGER_MODE=degenerate FORGER_DRIVER="$R69D" FORGER_DEG=$k node "$V" --profile synthscroll-r69 --scratch "$S/c2-d-${k:0:4}" --driver "$F" --driver-sha256 "$FSHA" --json
done
rec c2 scratch-too-long 2 scratch-path-too-long -- node "$V" --profile synthscroll-r69 --scratch "$S/c2-a-deliberately-long-scratch-directory-name-xxxxxxxx" --json
rec c2 positive 0 none -- node "$V" --profile synthscroll-r69 --scratch "$S/c2-pos" --json
cp "$S/c2-pos/run-a/receipt.json" "$C/c2-receipts/positive-run-a.json"; cp "$S/c2-pos/run-b/receipt.json" "$C/c2-receipts/positive-run-b.json"

# ---- C1: capability chromium-synth-tap-gesture-linux ----
rec c1 donothing-no-receipt 2 receipt-unreadable -- node "$L/scripts/check-synthtap-r70.mjs" --receipt "$L/corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json" --json
rec c1 donothing-live-no-evidence 1 evidence-counter -- node "$V" --profile synthtap-r70 --scratch "$S/c1-live" --json
for n in smoke1 smoke2 smoke3; do
  P=$((47200 + ${n#smoke} * 10))
  rec c1 driver-$n 0 CONFIRMED -- node "$R70D" --scratch "$S/c1-$n" --out "$C/c1-receipts/$n.json" --nonce tabi-r70-ctl-$n --http-port $P --cdp-port $((P+1))
  rec c1 counter-$n 0 none -- node "$L/scripts/check-synthtap-r70.mjs" --receipt "$C/c1-receipts/$n.json" --expect-driver-sha256 "$(sha256sum "$R70D" | cut -c1-64)" --json
done
for k in js-click dispatch-mouse skip-touch; do
  P=$((47300 + ${#k} * 10))
  rec c1 driver-degenerate-$k 1 REFUTED -- node "$R70D" --scratch "$S/c1-deg-$k" --out "$C/c1-receipts/degenerate-$k.json" --nonce tabi-r70-ctl-deg-$k --http-port $P --cdp-port $((P+1)) --degenerate $k
  rec c1 counter-degenerate-$k 1 scored-run-not-degenerate -- node "$L/scripts/check-synthtap-r70.mjs" --receipt "$C/c1-receipts/degenerate-$k.json" --expect-driver-sha256 "$(sha256sum "$R70D" | cut -c1-64)" --json
done
rec c1 negatives-battery 0 all-refused -- node "$L/scripts/negatives-synthtap-r70.mjs" --real "$C/c1-receipts/smoke1.json" --expect-driver-sha256 "$(sha256sum "$R70D" | cut -c1-64)" --work "$S/c1-neg" --laundered "$C/c1-receipts/degenerate-js-click.json" --laundered "$C/c1-receipts/degenerate-dispatch-mouse.json" --laundered "$C/c1-receipts/degenerate-skip-touch.json" --json
rec c1 forger-rewrite 1 run-a-cdpPort,run-a-httpPort,cross-run-identity -- env FORGER_MODE=rewrite FORGER_SOURCE="$C/c1-receipts/smoke1.json" node "$V" --profile synthtap-r70 --scratch "$S/c1-rewrite" --driver "$F" --driver-sha256 "$FSHA" --json
cp "$S/c1-rewrite/run-a/receipt.json" "$C/c1-receipts/forger-rewrite-run-a.json"
rec c1 counter-accepts-rewrite 0 none -- node "$L/scripts/check-synthtap-r70.mjs" --receipt "$C/c1-receipts/forger-rewrite-run-a.json" --json
echo done

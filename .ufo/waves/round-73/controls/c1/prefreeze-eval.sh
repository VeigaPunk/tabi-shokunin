#!/usr/bin/env bash
# Round 73 C1 pre-freeze evaluation (QUALITY 135): counter, battery AND kill power over EVERY
# pre-freeze repetition receipt (smoke1..9), each with priors = every other committed pre-freeze
# receipt (the other smokes + the three degenerate control receipts).
# Usage: prefreeze-eval.sh <smoke numbers...>     outputs: pf-smoke<n>.{counter,battery,killpower}.{json,exit}
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$LANE/.ufo/waves/round-73/controls/c1
CTR=$LANE/scripts/check-synthpinch-r73.mjs
BAT=$LANE/scripts/negatives-synthpinch-r73.mjs
KP=$C/kill-power-r73.mjs
PIN=$(sha256sum "$LANE/scripts/chrome-cdp-synthpinch-round73.mjs" | cut -c1-64)
SCR=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r73/L1-prefreeze
DEG=()
for k in dispatch-wheel set-scale skip-touch; do DEG+=(--laundered "$C/degenerate-$k.receipt.json"); done
for n in "$@"; do
  R=$C/smoke$n.receipt.json
  N=$(cut -d' ' -f1 "$C/smoke$n.args.txt")
  P=()
  for i in 1 2 3 4 5 6 7 8 9; do [ "$i" = "$n" ] || P+=(--prior "$C/smoke$i.receipt.json"); done
  for k in dispatch-wheel set-scale skip-touch; do P+=(--prior "$C/degenerate-$k.receipt.json"); done
  W=$SCR/smoke$n; rm -rf "$W"; mkdir -p "$W"
  node "$CTR" --receipt "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" "${P[@]}" --json > "$C/pf-smoke$n.counter.json"; echo $? > "$C/pf-smoke$n.counter.exit"
  node "$BAT" --real "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" "${P[@]}" --work "$W/bat" "${DEG[@]}" --json > "$C/pf-smoke$n.battery.json"; echo $? > "$C/pf-smoke$n.battery.exit"
  node "$KP" --lane "$LANE" --real "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" "${P[@]}" --work "$W/kp" --out "$C/pf-smoke$n.killpower.json" --jobs "${JOBS:-6}" > /dev/null; echo $? > "$C/pf-smoke$n.killpower.exit"
  echo "smoke$n counter=$(cat "$C/pf-smoke$n.counter.exit") battery=$(cat "$C/pf-smoke$n.battery.exit") killpower=$(cat "$C/pf-smoke$n.killpower.exit")"
  rm -rf "$W"
done

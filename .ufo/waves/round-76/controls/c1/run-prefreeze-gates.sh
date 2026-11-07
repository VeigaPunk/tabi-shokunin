#!/usr/bin/env bash
# Round 76 C1 pre-freeze gate pass: the counter over every probe receipt (p1-p4), and counter,
# battery AND kill power over every smoke receipt (smoke1-9). For smoke k the prior set is controls/c1/prior-set.txt without smoke k
# (pf/ps-smoke<k>.txt, committed). Outputs pf-smoke<k>.{counter,battery,killpower}.{json,exit}.
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$LANE/.ufo/waves/round-76/controls/c1
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r76/L1-gates
trap 'rm -rf -- "$S"' EXIT
mkdir -p "$C/pf" "$S"
PIN=$(sha256sum "$LANE/scripts/chrome-cdp-dialog-round76.mjs" | cut -c1-64)
DEG=(); for k in page-stub eval-trigger swap-accept; do DEG+=(--laundered "$C/degenerate-$k.receipt.json"); done
for k in ${PS_PROBES:-1 2 3 4}; do
  R=$C/probe/p$k.receipt.json; N=tabi-r76-probe-p$k; PS=$C/pf/ps-p$k.txt
  grep -v "/probe/p$k.receipt.json\$" "$C/prior-set.txt" > "$PS"
  node "$LANE/scripts/check-dialog-r76.mjs" --lane "$LANE" --receipt "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" --prior-set "$PS" --json > "$C/pf/pf-p$k.counter.json"; echo $? > "$C/pf/pf-p$k.counter.exit"
  echo "p$k counter=$(cat "$C/pf/pf-p$k.counter.exit")"
done
for k in ${KS:-1 2 3 4 5 6 7 8 9}; do
  R=$C/smoke$k.receipt.json; N=tabi-r76-smoke$k; PS=$C/pf/ps-smoke$k.txt
  grep -v "/smoke$k.receipt.json\$" "$C/prior-set.txt" > "$PS"
  node "$LANE/scripts/check-dialog-r76.mjs" --lane "$LANE" --receipt "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" --prior-set "$PS" --json > "$C/pf/pf-smoke$k.counter.json"; echo $? > "$C/pf/pf-smoke$k.counter.exit"
  rm -rf "$S/n"; node "$LANE/scripts/negatives-dialog-r76.mjs" --lane "$LANE" --real "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" --prior-set "$PS" "${DEG[@]}" --work "$S/n" --json > "$C/pf/pf-smoke$k.battery.json"; echo $? > "$C/pf/pf-smoke$k.battery.exit"
  rm -rf "$S/k"; node "$C/kill-power-r76.mjs" --lane "$LANE" --real "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" --prior-set "$PS" "${DEG[@]}" --work "$S/k" --out "$C/pf/pf-smoke$k.killpower.json" --jobs "${JOBS:-12}" > "$C/pf/pf-smoke$k.killpower.out"; echo $? > "$C/pf/pf-smoke$k.killpower.exit"
  echo "smoke$k counter=$(cat "$C/pf/pf-smoke$k.counter.exit") battery=$(cat "$C/pf/pf-smoke$k.battery.exit") killpower=$(cat "$C/pf/pf-smoke$k.killpower.exit") $(cat "$C/pf/pf-smoke$k.killpower.out")"
done

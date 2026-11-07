#!/usr/bin/env bash
# Round 77 C1 pre-freeze gate pass (QUALITY 135/137/139/144): counter AND battery over every honest
# pre-freeze receipt (probes p1-p4 and smokes 1-9: every rule and every battery placement guard on
# all of them), and kill power over every smoke receipt (smoke1-9). For receipt k the prior set is
# controls/c1/prior-set.txt without k (pf/ps-<k>.txt, committed).
# Outputs pf/pf-<k>.{counter,battery,killpower}.{json,exit}.
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$LANE/.ufo/waves/round-77/controls/c1
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r77/L1-gates
trap 'rm -rf -- "$S"' EXIT
mkdir -p "$C/pf" "$S"
PIN=$(sha256sum "$LANE/scripts/chrome-cdp-filechooser-round77.mjs" | cut -c1-64)
DEG=(); for k in page-stub eval-trigger swap-files; do DEG+=(--laundered "$C/degenerate-$k.receipt.json"); done
gate() { # name receipt nonce killpower(0/1)
  local k=$1 R=$2 N=$3 KP=$4 PS=$C/pf/ps-$1.txt
  grep -vF "/${R#$C/}" "$C/prior-set.txt" > "$PS"
  node "$LANE/scripts/check-filechooser-r77.mjs" --lane "$LANE" --receipt "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" --prior-set "$PS" --json > "$C/pf/pf-$k.counter.json"; echo $? > "$C/pf/pf-$k.counter.exit"
  rm -rf "$S/n-$k"; node "$LANE/scripts/negatives-filechooser-r77.mjs" --lane "$LANE" --real "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" --prior-set "$PS" "${DEG[@]}" --work "$S/n-$k" --json > "$C/pf/pf-$k.battery.json"; echo $? > "$C/pf/pf-$k.battery.exit"; rm -rf "$S/n-$k"
  if [ "$KP" = 1 ]; then
    rm -rf "$S/k-$k"; mkdir -p "$S/k-$k"; node "$C/kill-power-r77.mjs" --lane "$LANE" --real "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" --prior-set "$PS" "${DEG[@]}" --work "$S/k-$k" --out "$C/pf/pf-$k.killpower.json" --jobs "${JOBS:-12}" > "$C/pf/pf-$k.killpower.out"; echo $? > "$C/pf/pf-$k.killpower.exit"; rm -rf "$S/k-$k"
  fi
  echo "$k counter=$(cat "$C/pf/pf-$k.counter.exit") battery=$(cat "$C/pf/pf-$k.battery.exit") killpower=$( [ "$KP" = 1 ] && cat "$C/pf/pf-$k.killpower.exit" || echo -)"
}
for i in ${PS_PROBES:-1 2 3 4}; do gate "p$i" "$C/probe/p$i.receipt.json" "tabi-r77-probe-p$i" 0; done
for i in ${KS:-1 2 3 4 5 6 7 8 9}; do gate "smoke$i" "$C/smoke$i.receipt.json" "tabi-r77-smoke$i" 1; done

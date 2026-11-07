#!/usr/bin/env bash
# Round 78 C1 pre-freeze gate pass (QUALITY 135/137/139/144): counter AND battery over every honest
# pre-freeze receipt (probes p1-p4 and smokes s1-s3), and kill power over p1 and smokes s1-s3.
# For receipt k the prior set is controls/c1/prior-set.txt without k (pf/ps-<k>.txt, committed).
# Instrument outputs are written to scratch and copied in AFTER the run: a counter that writes its
# JSON inside the trees it walks parses a half-written file and reports prior-set-unparsable
# (measured this round; lesson-proof/self-write-collision.*).
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$LANE/.ufo/waves/round-78/controls/c1
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r78/L1-gates
mkdir -p "$C/pf/out" "$S"
PIN=$(sha256sum "$LANE/scripts/chrome-cdp-filechooser-round78.mjs" | cut -c1-64)
DEG=(); for k in page-stub eval-trigger swap-files; do DEG+=(--laundered "$C/deg-$k.receipt.json"); done
gate() { # name receipt nonce killpower(0/1)
  local k=$1 R=$2 N=$3 KP=$4 PS=$C/pf/ps-$1.txt
  node "$LANE/scripts/check-filechooser-r78.mjs" --lane "$LANE" --receipt "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" --prior-set "$PS" --json > "$S/pf-$k.counter.json"; echo $? > "$S/pf-$k.counter.exit"
  rm -rf "$S/n-$k"; node "$LANE/scripts/negatives-filechooser-r78.mjs" --lane "$LANE" --real "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" --prior-set "$PS" "${DEG[@]}" --work "$S/n-$k" --json > "$S/pf-$k.battery.json"; echo $? > "$S/pf-$k.battery.exit"; rm -rf "$S/n-$k"
  if [ "$KP" = 1 ]; then
    rm -rf "$S/k-$k"; mkdir -p "$S/k-$k"; node "$C/kill-power-r78.mjs" --lane "$LANE" --real "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" --prior-set "$PS" "${DEG[@]}" --work "$S/k-$k" --out "$S/pf-$k.killpower.json" --jobs "${JOBS:-8}" > "$S/pf-$k.killpower.out" 2>&1; echo $? > "$S/pf-$k.killpower.exit"; rm -rf "$S/k-$k"
  fi
  echo "$k counter=$(cat "$S/pf-$k.counter.exit") battery=$(cat "$S/pf-$k.battery.exit") killpower=$( [ "$KP" = 1 ] && cat "$S/pf-$k.killpower.exit" || echo -)"
  for ext in counter.json counter.exit battery.json battery.exit killpower.json killpower.out killpower.exit; do
    [ -f "$S/pf-$k.$ext" ] && cp "$S/pf-$k.$ext" "$C/pf/out/pf-$k.$ext"
  done
}
for i in 1 2 3 4; do gate "p$i" "$C/probe/p$i.receipt.json" "tabi-r78-p$i" "$( [ "$i" = 1 ] && echo 1 || echo 0 )"; done
for i in 1 2 3; do gate "s$i" "$C/smoke/s$i.receipt.json" "tabi-r78-s$i" 1; done

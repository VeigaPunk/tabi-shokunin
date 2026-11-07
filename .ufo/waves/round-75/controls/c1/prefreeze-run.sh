#!/usr/bin/env bash
# Round 75 C1 pre-freeze evaluation (QUALITY 135/137): counter, battery AND kill power over EVERY
# pre-freeze repetition receipt smoke1..9, one stream, in order. Priors for smoke n = every receipt
# in prior-set.txt except smoke n itself. rc captured on the next line (QUALITY 130).
# Usage: prefreeze-run.sh [first] [last]   (default 1 9)
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
C1D=$LANE/.ufo/waves/round-75/controls/c1
SC=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r75/L1/pf
PIN=$(sha256sum "$LANE/scripts/chrome-cdp-dragdrop-round75.mjs" | cut -d' ' -f1)
DEG=(); for k in native-mouse no-intercept script-events; do DEG+=(--laundered "$C1D/degenerate-$k.receipt.json"); done
for n in $(seq "${1:-1}" "${2:-9}"); do
  P=(); while read -r rel; do case "$rel" in ''|'#'*) continue;; esac; [ "$rel" = ".ufo/waves/round-75/controls/c1/smoke$n.receipt.json" ] && continue; P+=(--prior "$LANE/$rel"); done < "$C1D/prior-set.txt"
  N=$(cut -d' ' -f1 "$C1D/smoke$n.args.txt")
  R=$C1D/smoke$n.receipt.json
  rm -rf "$SC/$n"; mkdir -p "$SC/$n"
  node "$LANE/scripts/check-dragdrop-r75.mjs" --receipt "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" "${P[@]}" --json > "$C1D/pf-smoke$n.counter.json"
  echo $? > "$C1D/pf-smoke$n.counter.exit"
  node "$LANE/scripts/negatives-dragdrop-r75.mjs" --real "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" "${P[@]}" "${DEG[@]}" --work "$SC/$n/b" --json > "$C1D/pf-smoke$n.battery.json"
  echo $? > "$C1D/pf-smoke$n.battery.exit"
  node "$C1D/kill-power-r75.mjs" --lane "$LANE" --real "$R" --expect-driver-sha256 "$PIN" --expect-nonce "$N" "${P[@]}" "${DEG[@]}" --work "$SC/$n/k" --out "$C1D/pf-smoke$n.killpower.json" --jobs "${JOBS:-5}" > /dev/null
  echo $? > "$C1D/pf-smoke$n.killpower.exit"
  echo "smoke$n counter=$(cat "$C1D/pf-smoke$n.counter.exit") battery=$(cat "$C1D/pf-smoke$n.battery.exit") killpower=$(cat "$C1D/pf-smoke$n.killpower.exit")"
  rm -rf "$SC/$n"
done

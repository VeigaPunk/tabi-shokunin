#!/usr/bin/env bash
# Round 74 C1 pre-freeze evaluation (QUALITY 135/137): counter, battery AND kill power over EVERY
# pre-freeze repetition receipt smoke1..9, ONE sequential stream (no backgrounded sub-streams),
# each receipt evaluated with the other eight smokes and the three degenerate receipts as priors.
# rc is captured on the line after each command (QUALITY 130). prefreeze-summary.mjs then reads
# the outputs fail-closed.
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$LANE/.ufo/waves/round-74/controls/c1
SB=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r74/pf
PIN=$(sha256sum "$LANE/scripts/chrome-cdp-imecompose-round74.mjs" | cut -d' ' -f1)
cd "$LANE"
for n in 1 2 3 4 5 6 7 8 9; do
  P=(); for j in 1 2 3 4 5 6 7 8 9; do [ "$j" = "$n" ] || P+=(--prior "$C/smoke$j.receipt.json"); done
  for k in dispatch-key exec-command script-events; do P+=(--prior "$C/degenerate-$k.receipt.json"); done
  L=(); for k in dispatch-key exec-command script-events; do L+=(--laundered "$C/degenerate-$k.receipt.json"); done
  NA=tabi-r74-pre-smoke$n
  node scripts/check-imecompose-r74.mjs --receipt "$C/smoke$n.receipt.json" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" "${P[@]}" --json > "$C/pf-smoke$n.counter.json"
  echo $? > "$C/pf-smoke$n.counter.exit"
  rm -rf "$SB/n$n"
  node scripts/negatives-imecompose-r74.mjs --real "$C/smoke$n.receipt.json" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" "${P[@]}" "${L[@]}" --work "$SB/n$n" --json > "$C/pf-smoke$n.battery.json"
  echo $? > "$C/pf-smoke$n.battery.exit"
  rm -rf "$SB/n$n"
  node "$C/kill-power-r74.mjs" --lane "$LANE" --real "$C/smoke$n.receipt.json" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" "${P[@]}" --work "$SB/k$n" --out "$C/pf-smoke$n.killpower.json" --jobs "${JOBS:-12}" > /dev/null
  echo $? > "$C/pf-smoke$n.killpower.exit"
  rm -rf "$SB/k$n"
  echo "smoke$n counter=$(cat "$C/pf-smoke$n.counter.exit") battery=$(cat "$C/pf-smoke$n.battery.exit") killpower=$(cat "$C/pf-smoke$n.killpower.exit")"
done
rm -rf "$SB"
node "$C/prefreeze-summary.mjs" --out "$C/prefreeze-summary.json"
echo $? > "$C/prefreeze-summary.exit"

#!/usr/bin/env bash
# Round 74 C1 scored run (leg a) and leg (c) on its receipt. Run ONCE, after the digests commit D.
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
R=$LANE/.ufo/waves/round-74
C1D=$R/controls/c1
S=$R/scored
mkdir -p "$S" "$LANE/corpus/evidence/round74/chromium-ime-composition"
D=$(cut -d' ' -f1 "$S/digests-commit.txt")
PIN=$(awk '$2=="scripts/chrome-cdp-imecompose-round74.mjs"{print $1}' "$R/freeze.txt")
NA="tabi-r74-l1-${D:0:12}"
EV=$LANE/corpus/evidence/round74/chromium-ime-composition/receipt.json
SCR=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r74/L1-a
[ -e "$EV" ] && { echo "receipt exists: refusing a second scored run"; exit 3; }
P=(); for i in 1 2 3 4 5 6 7 8 9; do P+=(--prior "$C1D/smoke$i.receipt.json"); done
for k in dispatch-key exec-command script-events; do P+=(--prior "$C1D/degenerate-$k.receipt.json"); done
DEG=(); for k in dispatch-key exec-command script-events; do DEG+=(--laundered "$C1D/degenerate-$k.receipt.json"); done
rm -rf "$SCR"; mkdir -p "$SCR/d"
read -r HP CP < <(node -e 'const s=require("net");const a=[];const go=()=>{if(a.length===2){console.log(a.join(" "));process.exit(0)}const srv=s.createServer();srv.listen(0,"127.0.0.1",()=>{a.push(srv.address().port);srv.close(go)})};go()')
echo "$NA $HP $CP $PIN" > "$S/c1-a.args.txt"
TMPDIR=$SCR node "$LANE/scripts/chrome-cdp-imecompose-round74.mjs" --scratch "$SCR/d" --out "$EV" --nonce "$NA" --http-port "$HP" --cdp-port "$CP" > "$S/c1-driver-a.out" 2> "$S/c1-driver-a.err"
echo $? > "$S/c1-driver-a.exit"
cd "$LANE"
node scripts/check-imecompose-r74.mjs --receipt corpus/evidence/round74/chromium-ime-composition/receipt.json --expect-driver-sha256 "$PIN" --expect-nonce "$NA" "${P[@]}" --json > "$S/c1-counter-a.json"
echo $? > "$S/c1-counter-a.exit"
node scripts/negatives-imecompose-r74.mjs --real "$EV" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" "${P[@]}" --work "$SCR/n" "${DEG[@]}" --json > "$S/c1-negatives-a.json"
echo $? > "$S/c1-negatives-a.exit"
node "$C1D/kill-power-r74.mjs" --lane "$LANE" --real "$EV" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" "${P[@]}" --work "$SCR/k" --out "$S/c1-kill-power-a.json" --jobs "${JOBS:-12}" > "$S/c1-kill-power-a.out"
echo $? > "$S/c1-kill-power-a.exit"
echo "driver=$(cat "$S/c1-driver-a.exit") counter=$(cat "$S/c1-counter-a.exit") battery=$(cat "$S/c1-negatives-a.exit") killpower=$(cat "$S/c1-kill-power-a.exit")"
rm -rf "$SCR"

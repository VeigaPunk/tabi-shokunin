#!/usr/bin/env bash
# Round 76 C1 scored run (leg a) and leg (c) on its receipt. Run ONCE, after the digests commit D.
# PRE is the committed controls/c1/prior-set.txt, passed by file (--prior-set).
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
R=$LANE/.ufo/waves/round-76
C1D=$R/controls/c1
S=$R/scored
mkdir -p "$S" "$LANE/corpus/evidence/round76/chromium-js-dialog"
D=$(cut -d' ' -f1 "$S/digests-commit.txt")
PIN=$(awk '$2=="scripts/chrome-cdp-dialog-round76.mjs"{print $1}' "$R/freeze.txt")
NA="tabi-r76-l1-${D:0:12}"
EV=$LANE/corpus/evidence/round76/chromium-js-dialog/receipt.json
SCR=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r76/L1-a
[ -e "$EV" ] && { echo "receipt exists: refusing a second scored run"; exit 3; }
DEG=(); for k in page-stub eval-trigger swap-accept; do DEG+=(--laundered "$C1D/degenerate-$k.receipt.json"); done
rm -rf "$SCR"; mkdir -p "$SCR/d"
trap 'rm -rf -- "$SCR"' EXIT
read -r HP CP < <(node -e 'const s=require("net");const a=[];const go=()=>{if(a.length===2){console.log(a.join(" "));process.exit(0)}const srv=s.createServer();srv.listen(0,"127.0.0.1",()=>{a.push(srv.address().port);srv.close(go)})};go()')
echo "$NA $HP $CP $PIN" > "$S/c1-a.args.txt"
TMPDIR=$SCR/d node "$LANE/scripts/chrome-cdp-dialog-round76.mjs" --scratch "$SCR/d" --out "$EV" --nonce "$NA" --http-port "$HP" --cdp-port "$CP" > "$S/c1-driver-a.out" 2> "$S/c1-driver-a.err"
echo $? > "$S/c1-driver-a.exit"
cd "$LANE"
node scripts/check-dialog-r76.mjs --lane "$LANE" --receipt corpus/evidence/round76/chromium-js-dialog/receipt.json --expect-driver-sha256 "$PIN" --expect-nonce "$NA" --prior-set "$C1D/prior-set.txt" --json > "$S/c1-counter-a.json"
echo $? > "$S/c1-counter-a.exit"
node scripts/negatives-dialog-r76.mjs --lane "$LANE" --real "$EV" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" --prior-set "$C1D/prior-set.txt" "${DEG[@]}" --work "$SCR/n" --json > "$S/c1-negatives-a.json"
echo $? > "$S/c1-negatives-a.exit"
node "$C1D/kill-power-r76.mjs" --lane "$LANE" --real "$EV" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" --prior-set "$C1D/prior-set.txt" "${DEG[@]}" --work "$SCR/k" --out "$S/c1-kill-power-a.json" --jobs "${JOBS:-12}" > "$S/c1-kill-power-a.out"
echo $? > "$S/c1-kill-power-a.exit"
echo "driver=$(cat "$S/c1-driver-a.exit") counter=$(cat "$S/c1-counter-a.exit") battery=$(cat "$S/c1-negatives-a.exit") killpower=$(cat "$S/c1-kill-power-a.exit")"

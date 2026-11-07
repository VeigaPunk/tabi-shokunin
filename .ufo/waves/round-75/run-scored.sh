#!/usr/bin/env bash
# Round 75 C1 scored run (leg a) and leg (c) on its receipt. Run ONCE, after the digests commit D.
# PRE is read from controls/c1/prior-set.txt (the schema enumeration at the freeze parent).
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
R=$LANE/.ufo/waves/round-75
C1D=$R/controls/c1
S=$R/scored
mkdir -p "$S" "$LANE/corpus/evidence/round75/chromium-drag-intercept"
D=$(cut -d' ' -f1 "$S/digests-commit.txt")
PIN=$(awk '$2=="scripts/chrome-cdp-dragdrop-round75.mjs"{print $1}' "$R/freeze.txt")
NA="tabi-r75-l1-${D:0:12}"
EV=$LANE/corpus/evidence/round75/chromium-drag-intercept/receipt.json
SCR=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r75/L1-a
[ -e "$EV" ] && { echo "receipt exists: refusing a second scored run"; exit 3; }
P=(); while read -r rel; do case "$rel" in ''|'#'*) continue;; esac; P+=(--prior "$LANE/$rel"); done < "$C1D/prior-set.txt"
DEG=(); for k in native-mouse no-intercept script-events; do DEG+=(--laundered "$C1D/degenerate-$k.receipt.json"); done
rm -rf "$SCR"; mkdir -p "$SCR/d"
read -r HP CP < <(node -e 'const s=require("net");const a=[];const go=()=>{if(a.length===2){console.log(a.join(" "));process.exit(0)}const srv=s.createServer();srv.listen(0,"127.0.0.1",()=>{a.push(srv.address().port);srv.close(go)})};go()')
echo "$NA $HP $CP $PIN" > "$S/c1-a.args.txt"
TMPDIR=$SCR node "$LANE/scripts/chrome-cdp-dragdrop-round75.mjs" --scratch "$SCR/d" --out "$EV" --nonce "$NA" --http-port "$HP" --cdp-port "$CP" > "$S/c1-driver-a.out" 2> "$S/c1-driver-a.err"
echo $? > "$S/c1-driver-a.exit"
cd "$LANE"
node scripts/check-dragdrop-r75.mjs --receipt corpus/evidence/round75/chromium-drag-intercept/receipt.json --expect-driver-sha256 "$PIN" --expect-nonce "$NA" "${P[@]}" --json > "$S/c1-counter-a.json"
echo $? > "$S/c1-counter-a.exit"
node scripts/negatives-dragdrop-r75.mjs --real "$EV" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" "${P[@]}" "${DEG[@]}" --work "$SCR/n" --json > "$S/c1-negatives-a.json"
echo $? > "$S/c1-negatives-a.exit"
node "$C1D/kill-power-r75.mjs" --lane "$LANE" --real "$EV" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" "${P[@]}" "${DEG[@]}" --work "$SCR/k" --out "$S/c1-kill-power-a.json" --jobs "${JOBS:-8}" > "$S/c1-kill-power-a.out"
echo $? > "$S/c1-kill-power-a.exit"
echo "driver=$(cat "$S/c1-driver-a.exit") counter=$(cat "$S/c1-counter-a.exit") battery=$(cat "$S/c1-negatives-a.exit") killpower=$(cat "$S/c1-kill-power-a.exit")"
rm -rf "$SCR"

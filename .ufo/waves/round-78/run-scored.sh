#!/usr/bin/env bash
# Round 78 C1 scored run and its gates, with the FROZEN arguments of claims.json.
# D12 comes from scored/digests-commit.txt (the digests commit D, which is written BEFORE this runs).
# Outputs are written to scratch and copied into scored/ after each step (QUALITY 151).
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
R=$LANE/.ufo/waves/round-78
C=$R/controls/c1
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r78/L1-scored
mkdir -p "$S" "$R/scored"
PIN=$(sha256sum "$LANE/scripts/chrome-cdp-filechooser-round78.mjs" | cut -c1-64)
D12=$(cut -c1-12 "$R/scored/digests-commit.txt")
NA=tabi-r78-l1-$D12
DEG=(); for k in page-stub eval-trigger swap-files; do DEG+=(--laundered "$C/deg-$k.receipt.json"); done
fp() { node -e 'const s=require("net");const a=[];const go=()=>{if(a.length===2){console.log(a.join(" "));process.exit(0)}const srv=s.createServer();srv.listen(0,"127.0.0.1",()=>{a.push(srv.address().port);srv.close(go)})};go()'; }
read -r HP CP < <(fp)
rm -rf "$S/d"; mkdir -p "$S/d"
echo "$NA $HP $CP" > "$S/args.txt"
TMPDIR=$S/d timeout 150 node "$LANE/scripts/chrome-cdp-filechooser-round78.mjs" --scratch "$S/d" --out "$S/receipt.json" --nonce "$NA" --http-port "$HP" --cdp-port "$CP" > "$S/driver.out" 2> "$S/driver.err"
echo $? > "$S/driver.exit"
EV="$LANE/corpus/evidence/round78/chromium-file-chooser"
mkdir -p "$EV"
cp "$S/receipt.json" "$EV/receipt.json" 2>/dev/null
cp "$S/receipt.json" "$R/scored/receipt.json" 2>/dev/null
node "$LANE/scripts/check-filechooser-r78.mjs" --lane "$LANE" --receipt "$EV/receipt.json" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" --prior-set "$C/prior-set.txt" --json > "$S/counter-a.json"
echo $? > "$S/counter-a.exit"
cp "$S/counter-a.json" "$R/scored/c1-counter-a.json"
rm -rf "$S/n"; node "$LANE/scripts/negatives-filechooser-r78.mjs" --lane "$LANE" --real "$EV/receipt.json" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" --prior-set "$C/prior-set.txt" "${DEG[@]}" --work "$S/n" --jobs "${JOBS:-8}" --json > "$S/negatives-a.json"
echo $? > "$S/negatives-a.exit"
cp "$S/negatives-a.json" "$R/scored/c1-negatives-a.json"
rm -rf "$S/k"; mkdir -p "$S/k"; node "$C/kill-power-r78.mjs" --lane "$LANE" --real "$EV/receipt.json" --expect-driver-sha256 "$PIN" --expect-nonce "$NA" --prior-set "$C/prior-set.txt" "${DEG[@]}" --work "$S/k" --out "$S/killpower-a.json" --jobs "${JOBS:-8}" > "$S/killpower-a.out" 2>&1
echo $? > "$S/killpower-a.exit"
cp "$S/killpower-a.json" "$R/scored/c1-killpower-a.json" 2>/dev/null
for f in args.txt driver.exit driver.out driver.err counter-a.exit negatives-a.exit killpower-a.exit killpower-a.out; do cp "$S/$f" "$R/scored/$f" 2>/dev/null; done
mkdir -p "$R/evidence" && cp "$S/receipt.json" "$R/evidence/receipt.json" 2>/dev/null
echo "nonce=$NA driver=$(cat "$S/driver.exit") counter=$(cat "$S/counter-a.exit") battery=$(cat "$S/negatives-a.exit") killpower=$(cat "$S/killpower-a.exit")"

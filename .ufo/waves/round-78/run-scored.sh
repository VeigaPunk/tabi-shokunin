#!/usr/bin/env bash
# Round 78 C1 scored run (frozen arguments of claims.json). Produces ONE receipt at the canonical
# evidence path and leaves the gates to run-scored-gates.sh (counter, battery, kill power).
# D12 comes from scored/digests-commit.txt (the digests commit D, written BEFORE this runs).
# The receipt is never copied into .ufo/waves/round-78/ (a second copy of the schema there is an
# unlisted receipt to the walker: QUALITY 151, lesson-proof/scored-harness-duplicate.json).
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
R=$LANE/.ufo/waves/round-78
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r78/L1-scored
EV=$LANE/corpus/evidence/round78/chromium-file-chooser
mkdir -p "$S" "$EV"
D12=$(cut -c1-12 "$R/scored/digests-commit.txt")
NA=tabi-r78-l1-$D12
fp() { node -e 'const s=require("net");const a=[];const go=()=>{if(a.length===2){console.log(a.join(" "));process.exit(0)}const srv=s.createServer();srv.listen(0,"127.0.0.1",()=>{a.push(srv.address().port);srv.close(go)})};go()'; }
read -r HP CP < <(fp)
rm -rf "$S/d"; mkdir -p "$S/d"
echo "$NA $HP $CP" > "$S/args.txt"
TMPDIR=$S/d timeout 150 node "$LANE/scripts/chrome-cdp-filechooser-round78.mjs" --scratch "$S/d" --out "$EV/receipt.json" --nonce "$NA" --http-port "$HP" --cdp-port "$CP" > "$S/driver.out" 2> "$S/driver.err"
echo $? > "$S/driver.exit"
for f in args.txt driver.exit driver.out driver.err; do cp "$S/$f" "$R/scored/$f" 2>/dev/null; done
echo "nonce=$NA driver=$(cat "$S/driver.exit")"

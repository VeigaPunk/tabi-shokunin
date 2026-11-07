#!/usr/bin/env bash
# R72Exec2 repetition: 3 cold driver runs, counter + battery on each.
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
DRV=$LANE/scripts/chrome-cdp-synthpinch-round72.mjs
CTR=$LANE/scripts/check-synthpinch-r72.mjs
BAT=$LANE/scripts/negatives-synthpinch-r72.mjs
PIN=d007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877
OUT=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-72/w1/R72Exec2
SCR=/fast/scratch/hyaku/tabi-r72/R72Exec2
mkdir -p "$OUT"

freeports() {
  node -e 'const s=require("net");const a=[],n=2;let k=0;const go=()=>{if(k===n){console.log(a.join(" "));process.exit(0)}const srv=s.createServer();srv.listen(0,"127.0.0.1",()=>{a.push(srv.address().port);srv.close(()=>{k++;go()})})};go()'
}

for n in 1 2 3; do
  D=$SCR/d$n
  rm -rf "$D"; mkdir -p "$D"
  HEX=$(node -e 'console.log(require("crypto").randomBytes(4).toString("hex"))')
  NONCE="tabi-r72-exec2-$n-$HEX"
  read -r HP CP < <(freeports)
  echo "=== d$n nonce=$NONCE http=$HP cdp=$CP"
  echo "$NONCE" > "$OUT/d$n.nonce.txt"
  echo "$HP $CP" > "$OUT/d$n.ports.txt"
  TMPDIR=$D node "$DRV" --scratch "$D/run" --out "$OUT/d$n.receipt.json" \
     --nonce "$NONCE" --http-port "$HP" --cdp-port "$CP" > "$OUT/d$n.driver.out" 2> "$OUT/d$n.driver.err"
  echo $? > "$OUT/d$n.driver.exit"
  echo "driver exit=$(cat "$OUT/d$n.driver.exit")"
  node "$CTR" --receipt "$OUT/d$n.receipt.json" --expect-driver-sha256 "$PIN" --json > "$OUT/d$n.counter.json" 2>&1
  echo $? > "$OUT/d$n.counter.exit"
  echo "counter exit=$(cat "$OUT/d$n.counter.exit") verdict=$(node -e 'const j=require(process.argv[1]);console.log(j.verdict,j.checkCount,JSON.stringify(j.findings))' "$OUT/d$n.counter.json" 2>/dev/null || echo unparsed)"
  node "$BAT" --real "$OUT/d$n.receipt.json" --expect-driver-sha256 "$PIN" --work "$SCR/work/d$n" --json > "$OUT/d$n.battery.json" 2>&1
  echo $? > "$OUT/d$n.battery.exit"
  node -e 'const j=require(process.argv[1]);console.log("battery",j.passed+"/"+j.cases,"failed="+j.failed.join(","))' "$OUT/d$n.battery.json" 2>/dev/null || echo "battery unparsed"
done

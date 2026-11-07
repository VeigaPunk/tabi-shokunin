#!/usr/bin/env bash
# Round 73 C1 degenerate control runs (r73 driver --degenerate; never scored runs).
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
DRV=$LANE/scripts/chrome-cdp-synthpinch-round73.mjs
OUT=$LANE/.ufo/waves/round-73/controls/c1
SCR=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r73/L1-degenerates
mkdir -p "$SCR"
freeports() {
  node -e 'const s=require("net");const a=[];const go=()=>{if(a.length===2){console.log(a.join(" "));process.exit(0)}const srv=s.createServer();srv.listen(0,"127.0.0.1",()=>{a.push(srv.address().port);srv.close(go)})};go()'
}
for k in dispatch-wheel set-scale skip-touch; do
  D=$SCR/$k; rm -rf "$D"; mkdir -p "$D/run"
  HEX=$(node -e 'console.log(require("crypto").randomBytes(4).toString("hex"))')
  NONCE="tabi-r73-degenerate-$k-$HEX"
  read -r HP CP < <(freeports)
  echo "$NONCE $HP $CP" > "$OUT/degenerate-$k.args.txt"
  TMPDIR=$D node "$DRV" --scratch "$D/run" --out "$OUT/degenerate-$k.receipt.json" --nonce "$NONCE" --http-port "$HP" --cdp-port "$CP" --degenerate "$k" \
    > "$OUT/degenerate-$k.driver.out" 2> "$OUT/degenerate-$k.driver.err"
  echo $? > "$OUT/degenerate-$k.driver.exit"
  echo "degenerate-$k driver exit=$(cat "$OUT/degenerate-$k.driver.exit")"
  rm -rf "$D"
done
rmdir "$SCR" 2>/dev/null || true

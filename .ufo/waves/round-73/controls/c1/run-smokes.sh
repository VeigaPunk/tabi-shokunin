#!/usr/bin/env bash
# Round 73 C1 pre-freeze repetitions: N cold runs of the r73 driver (QUALITY 135).
# Usage: run-smokes.sh <first> <last> [prefix]   receipts land in this directory as <prefix><n>.*
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
DRV=$LANE/scripts/chrome-cdp-synthpinch-round73.mjs
OUT=$LANE/.ufo/waves/round-73/controls/c1
SCR=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r73/L1-smokes
PFX=${3:-smoke}
mkdir -p "$SCR"
freeports() {
  node -e 'const s=require("net");const a=[];const go=()=>{if(a.length===2){console.log(a.join(" "));process.exit(0)}const srv=s.createServer();srv.listen(0,"127.0.0.1",()=>{a.push(srv.address().port);srv.close(go)})};go()'
}
for n in $(seq "$1" "$2"); do
  D=$SCR/$PFX$n; rm -rf "$D"; mkdir -p "$D/run"
  HEX=$(node -e 'console.log(require("crypto").randomBytes(4).toString("hex"))')
  NONCE="tabi-r73-$PFX$n-$HEX"
  read -r HP CP < <(freeports)
  echo "$NONCE $HP $CP" > "$OUT/$PFX$n.args.txt"
  TMPDIR=$D node "$DRV" --scratch "$D/run" --out "$OUT/$PFX$n.receipt.json" --nonce "$NONCE" --http-port "$HP" --cdp-port "$CP" \
    > "$OUT/$PFX$n.driver.out" 2> "$OUT/$PFX$n.driver.err"
  echo $? > "$OUT/$PFX$n.driver.exit"
  echo "$PFX$n driver exit=$(cat "$OUT/$PFX$n.driver.exit")"
  rm -rf "$D"
done

#!/usr/bin/env bash
# Round 75 C1 pre-freeze repetition: 9 cold runs of the driver (smoke1..9), each with its own
# nonce and free ports; rc captured on the line right after the command (QUALITY 130).
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
C1D=$LANE/.ufo/waves/round-75/controls/c1
SC=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r75/L1/smokes
freep() { node -e 'const s=require("net");const a=[];const go=()=>{if(a.length===2){console.log(a.join(" "));process.exit(0)}const srv=s.createServer();srv.listen(0,"127.0.0.1",()=>{a.push(srv.address().port);srv.close(go)})};go()'; }
for i in 1 2 3 4 5 6 7 8 9; do
  S=$SC/s$i; rm -rf "$S"; mkdir -p "$S"
  read -r HP CP < <(freep)
  N="tabi-r75-smoke$i-$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' \n')"
  echo "$N $HP $CP" > "$C1D/smoke$i.args.txt"
  TMPDIR=$S node "$LANE/scripts/chrome-cdp-dragdrop-round75.mjs" --scratch "$S" --out "$C1D/smoke$i.receipt.json" --nonce "$N" --http-port "$HP" --cdp-port "$CP" > "$C1D/smoke$i.driver.out" 2> "$C1D/smoke$i.driver.err"
  rc=$?
  echo "$rc" > "$C1D/smoke$i.driver.exit"
  echo "smoke$i rc=$rc"
done
rm -rf "$SC"

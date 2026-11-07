#!/usr/bin/env bash
# Round 77 C1 pre-freeze runs of the r77 file-chooser driver (LEG_SHAPE filled from the three shape probes):
# probes p1-p4 (controls/c1/probe/), smokes smoke1-9 and the three look-alike degenerates (controls/c1/).
# Each run gets its own nonce, its own free ports and a fresh scratch dir under
# $HYAKU_SCRATCH/tabi-r77/L1-prefreeze (removed on exit).
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$LANE/.ufo/waves/round-77/controls/c1
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r77/L1-prefreeze
trap 'rm -rf -- "$S"' EXIT
mkdir -p "$C/probe" "$S"
fp() { node -e 'const s=require("net");const a=[];const go=()=>{if(a.length===2){console.log(a.join(" "));process.exit(0)}const srv=s.createServer();srv.listen(0,"127.0.0.1",()=>{a.push(srv.address().port);srv.close(go)})};go()'; }
run() { # name nonce degenerate outdir
  local name=$1 nonce=$2 deg=$3 out=$4 HP CP
  read -r HP CP < <(fp)
  rm -rf "$S/r"; mkdir -p "$S/r"
  echo "$nonce $HP $CP ${deg:--}" > "$out/$name.args.txt"
  TMPDIR=$S/r timeout 150 node "$LANE/scripts/chrome-cdp-filechooser-round77.mjs" --scratch "$S/r" --out "$out/$name.receipt.json" --nonce "$nonce" --http-port "$HP" --cdp-port "$CP" ${deg:+--degenerate "$deg"} > "$out/$name.driver.out" 2> "$out/$name.driver.err"
  echo $? > "$out/$name.driver.exit"
  echo "$name exit=$(cat "$out/$name.driver.exit")"
}
for i in 1 2 3 4; do run "p$i" "tabi-r77-probe-p$i" "" "$C/probe"; done
for i in 1 2 3 4 5 6 7 8 9; do run "smoke$i" "tabi-r77-smoke$i" "" "$C"; done
for k in page-stub eval-trigger swap-files; do run "degenerate-$k" "tabi-r77-deg-$k" "$k" "$C"; done

#!/usr/bin/env bash
# Round 74 C1 pre-freeze repetitions (QUALITY 135): smoke1..9 honest runs and three look-alike
# control runs of the round-74 IME driver. Each run gets its own free ports, nonce and scratch dir
# under $HYAKU_SCRATCH/tabi-r74 (deleted after the run). rc is captured on the line after the
# command (QUALITY 130).
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
C=$LANE/.ufo/waves/round-74/controls/c1
SB=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r74
mkdir -p "$C" "$SB"
run() {
  local n=$1; shift
  local d=$SB/s-$n
  rm -rf "$d"; mkdir -p "$d"
  read -r HP CP < <(node -e 'const s=require("net");const a=[];const go=()=>{if(a.length===2){console.log(a.join(" "));process.exit(0)}const srv=s.createServer();srv.listen(0,"127.0.0.1",()=>{a.push(srv.address().port);srv.close(go)})};go()')
  local NA=tabi-r74-pre-$n
  echo "$NA $HP $CP $*" > "$C/$n.args.txt"
  TMPDIR=$d node "$LANE/scripts/chrome-cdp-imecompose-round74.mjs" --scratch "$d" --out "$C/$n.receipt.json" --nonce "$NA" --http-port "$HP" --cdp-port "$CP" "$@" > "$C/$n.driver.out" 2> "$C/$n.driver.err"
  local rc=$?
  echo "$rc" > "$C/$n.driver.exit"
  echo "$n rc=$rc"
  rm -rf "$d"
}
for i in 1 2 3 4 5 6 7 8 9; do run "smoke$i"; done
for k in dispatch-key exec-command script-events; do run "degenerate-$k" --degenerate "$k"; done

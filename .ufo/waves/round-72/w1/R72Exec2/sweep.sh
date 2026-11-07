#!/usr/bin/env bash
# Battery sweep: frozen vs proposed (fixed case) vs widened-counter variant, over all 9 receipts.
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
PIN=d007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877
BAT=$LANE/scripts/negatives-synthpinch-r72.mjs
PROP=/fast/scratch/hyaku/tabi-r72/R72Exec2/copies/frozen/negatives-synthpinch-proposed.mjs
WIDE=/fast/scratch/hyaku/tabi-r72/R72Exec2/copies/widened/negatives-synthpinch-proposed.mjs
OUT=$LANE/.ufo/waves/round-72/w1/R72Exec2
W=/fast/scratch/hyaku/tabi-r72/R72Exec2/work
mkdir -p "$OUT" "$W"

declare -A R=(
 [scored]="$LANE/corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json"
 [smoke1]="$LANE/.ufo/waves/round-72/controls/c1/smoke1.receipt.json"
 [smoke2]="$LANE/.ufo/waves/round-72/controls/c1/smoke2.receipt.json"
 [smoke3]="$LANE/.ufo/waves/round-72/controls/c1/smoke3.receipt.json"
 [smoke5]="$LANE/.ufo/waves/round-72/controls/c1/smoke5.receipt.json"
 [smoke6]="$LANE/.ufo/waves/round-72/controls/c1/smoke6.receipt.json"
 [d1]="$OUT/d1.receipt.json"
 [d2]="$OUT/d2.receipt.json"
 [d3]="$OUT/d3.receipt.json"
)

for k in scored smoke1 smoke2 smoke3 smoke5 smoke6 d1 d2 d3; do
  p="${R[$k]}"
  [ -f "$p" ] || { echo "$k MISSING $p"; continue; }
  echo "=== $k"
  node "$BAT" --real "$p" --expect-driver-sha256 "$PIN" --work "$W/$k/frozen" --json > "$OUT/battery-frozen-$k.json" 2>&1
  echo "frozen exit=$?" > "$OUT/battery-frozen-$k.exit"
  node "$PROP" --real "$p" --expect-driver-sha256 "$PIN" --work "$W/$k/proposed" --json > "$OUT/battery-proposed-$k.json" 2>&1
  echo "proposed exit=$?" > "$OUT/battery-proposed-$k.exit"
  node "$WIDE" --real "$p" --expect-driver-sha256 "$PIN" --work "$W/$k/widened" --json > "$OUT/battery-widened-$k.json" 2>&1
  echo "widened exit=$?" > "$OUT/battery-widened-$k.exit"
  node -e '
    const fs=require("fs");
    const one=(where,tag)=>{
      let j=null; try{ j=JSON.parse(fs.readFileSync(where,"utf8")); }catch(e){ return tag+" UNPARSED"; }
      const c=j.results.find(x=>x.case==="in-wheel-anchor-2px");
      return tag+" allOk="+j.allOk+" "+j.passed+"/"+j.cases+" failed=["+j.failed.join(",")+"] case="+JSON.stringify(c&&{ok:c.ok,exit:c.exit,ids:c.findingIds,extra:c.extra});
    };
    const k=process.argv[1];
    console.log(one(process.argv[2]+"/battery-frozen-"+k+".json","frozen  "));
    console.log(one(process.argv[2]+"/battery-proposed-"+k+".json","proposed"));
    console.log(one(process.argv[2]+"/battery-widened-"+k+".json","widened "));
  ' "$k" "$OUT"
done

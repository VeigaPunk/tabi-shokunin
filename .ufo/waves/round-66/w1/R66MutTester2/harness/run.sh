#!/usr/bin/env bash
# run.sh <baseDelta> <baseAudit> <outdir>  — scratch-only mutation runner for the frozen C1 meter (read-only on lane).
set -u
S=$(cd "$(dirname "$0")" && pwd)
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
REV=2816adb359a50c2fd83fa975e39f0650aa189984
SNAP=$LANE/.ufo/waves/round-66/measure/snapshot-live-r66.tsv
METER=$LANE/.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs
BD=$1; BA=$2; O=$3
M=$O/mutants; mkdir -p "$M"

sha256sum "$METER" > "$O/meter.sha256"
meter() { # <delta> <audit> <name>
  node "$METER" --rev "$REV" --repo "$LANE" --fleet "$FLEET" --snapshot "$SNAP" --delta "$1" --audit "$2" --json > "$M/$3.json" 2> "$M/$3.stderr"
  echo $? > "$M/$3.exit"
}
# baseline
cp -- "$BD" "$O/base-delta.tsv"; cp -- "$BA" "$O/base-audit.tsv"
meter "$O/base-delta.tsv" "$O/base-audit.tsv" baseline
# mutants a-e (delta-side)
node "$S/mutate.mjs" "$O/base-delta.tsv" "$O/base-audit.tsv" "$M/gen" > "$O/manifest.stdout"
for k in a b c d e; do
  f=$(node -e 'const m=require(process.argv[1]); console.log(m.mutants[process.argv[2]].file)' "$M/gen/manifest.json" "$k")
  meter "$f" "$O/base-audit.tsv" "mut-$k"
done
# mutant f: choose an audit row claimed `moved` that the meter derives `moved` at the live heads
cp -- "$LANE/corpus/adjacency.tsv" "$O/map-copy.tsv"; mkdir -p "$O/lf/corpus"; cp -- "$O/map-copy.tsv" "$O/lf/corpus/adjacency.tsv"
(cd "$O/lf" && node "$METER" --list-observed --fleet "$FLEET" --snapshot "$SNAP") > "$O/observed.json"
node -e '
const fs=require("fs");
const obs=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
const aud=fs.readFileSync(process.argv[2],"utf8").split("\n");
const movedRefs=new Set(obs.filter(o=>o.observed==="moved").map(o=>o.ref));
let hit=-1;
for(let i=1;i<aud.length;i++){const c=aud[i].replace(/\r$/,"").split("\t"); if(c[1]==="moved"&&movedRefs.has(c[0])){hit=i;break;}}
if(hit<0){console.error("no moved-derived audit row");process.exit(3);}
aud[hit]=aud[hit].replace(/\tmoved\t/,"\tunchanged\t");
fs.writeFileSync(process.argv[3],aud.join("\n"));
fs.writeFileSync(process.argv[4],JSON.stringify({line:hit+1,ref:aud[hit].split("\t")[0]}));
' "$O/observed.json" "$O/base-audit.tsv" "$M/mut-f-audit.tsv" "$M/mut-f.target.json"
meter "$O/base-delta.tsv" "$M/mut-f-audit.tsv" mut-f
echo done

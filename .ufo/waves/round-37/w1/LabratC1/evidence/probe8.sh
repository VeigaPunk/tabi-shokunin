#!/usr/bin/env bash
# LabratC1 probe part 8: (a) prove --list-delta's behaviour is CONTENT-DEPENDENT on the
# pins bytes (not merely count-shifted); (b) full-history scan for a BG line absent from
# the frozen pin set so --list-delta can be shown emitting UNFROZEN rows.
set -u -o pipefail
S=/fast/scratch/hyaku/tabi-r37/w1/LabratC1
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
OUT=$S/out; V5=$S/v5.mjs
mkdir -p "$OUT" "$S/tmp" "$S/fx"; export TMPDIR="$S/tmp"; export GIT_CONFIG_NOSYSTEM=1
note() { printf '%s\n' "$*" | tee -a "$OUT/probe8.log"; }
run() { local label=$1; shift; local o rc
  o=$("$@" 2>"$OUT/e.tmp"); rc=$?
  printf '%s :: exit=%s :: lines=%s :: stderr=%s\n' "$label" "$rc" "$(printf '%s' "$o" | grep -c '')" "$(head -2 "$OUT/e.tmp" | tr '\n' ' ' | cut -c1-190)" | tee -a "$OUT/probe8.log"
  printf '%s' "$o" > "$OUT/$label.stdout"; cp "$OUT/e.tmp" "$OUT/$label.stderr"; }

# ---------- (a) content-dependence: pins naming an UNKNOWN sibling -> --list-delta refuses ----------
D=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D"
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || exit 9
python3 - "$D" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1])/'.ufo/waves/round-36/baseline/c1-delta-pins.json'
d = json.loads(p.read_text())
d['zombie-lane'] = 'a'*40
p.write_text(json.dumps(d, indent=2)+'\n')
PY
git -C "$D" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: unknown sibling in pins'
RZ=$(git -C "$D" rev-parse HEAD)
run a-listdelta-zombie node "$V5" --list-delta --repo "$D" --fleet "$FLEET"
run a-listdrift-zombie node "$V5" --list-drift --repo "$D" --fleet "$FLEET"
run a-predicate-zombie node "$V5" --rev "$RZ" --repo "$D" --fleet "$FLEET" --json
note "(a) FROZEN pins over same clone for contrast:"
run a-listdelta-frozen node "$V5" --list-delta --repo "$LANE" --fleet "$FLEET"
run a-listdrift-frozen node "$V5" --list-drift --repo "$LANE" --fleet "$FLEET"

# ---------- (b) full-history scan: a BG line absent from the frozen pin set ----------
cat > "$S/scan4.mjs" <<'JS'
import { pinLines, BG } from '/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs';
import { execFileSync } from 'node:child_process';
const FLEET = '/home/vgpnk/Projects/shokunin';
const pinSet = pinLines(FLEET);
const v5 = (await import('node:fs')).readFileSync('/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs','utf8');
const block = v5.split('const PINS = Object.freeze({',1)[1].split('});',1)[0];
const PINS = Object.fromEntries([...block.matchAll(/'?([a-z0-9-]+)'?\s*:\s*'([0-9a-f]{40})'/g)].map(m=>[m[1],m[2]]));
const g = (repo,a) => execFileSync('git',['-C',repo,...a],{encoding:'utf8',maxBuffer:1<<28});
const out=[];
for (const sib of Object.keys(PINS)) {
  const repo = `${FLEET}/${sib}-shokunin`;
  let commits=[];
  try { commits = g(repo,['rev-list','--all']).split('\n').filter(Boolean); } catch(e){ console.error('skip',sib); continue; }
  let hit=null;
  for (const c of commits) {
    let files=[];
    try { files = g(repo,['ls-tree','-r','--name-only',c]).split('\n').filter(p=>p==='SKILL.md'||(p.startsWith('corpus/knowledge/')&&p.endsWith('.md'))); } catch { continue; }
    for (const f of files) {
      let txt; try { txt=g(repo,['show',`${c}:${f}`]); } catch { continue; }
      const ls=txt.split('\n');
      for (let i=0;i<ls.length;i++){
        const t=ls[i].trim();
        if(!t||!BG.test(t)||/\btabi\b/i.test(t)) continue;
        if(pinSet.has(`${sib}${f}${t}`)) continue;
        hit={sib,commit:c,path:f,line:i+1,text:t.slice(0,110)}; break;
      }
      if(hit) break;
    }
    if(hit) break;
  }
  if(hit){ out.push(hit); console.error(`HIT ${sib} @${hit.commit.slice(0,10)}`); }
  else console.error(`no-hit ${sib} (${commits.length} commits)`);
}
console.log(JSON.stringify(out,null,1));
JS
node "$S/scan4.mjs" > "$OUT/scan4.json" 2> "$OUT/scan4.err"; rc=$?
note "scan4 exit=$rc"
grep -E "HIT |no-hit " "$OUT/scan4.err" | head -25 | tee -a "$OUT/probe8.log"
cat "$OUT/scan4.json" | tee -a "$OUT/probe8.log"
rm -rf -- "$D"
note "=== probe8 done ==="

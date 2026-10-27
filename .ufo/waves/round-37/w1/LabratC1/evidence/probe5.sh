#!/usr/bin/env bash
# LabratC1 probe part 5:
#  (a) find a sibling commit whose BG lines are ABSENT from the frozen pin set, so an
#      UNFROZEN delta head makes --list-delta emit rows (proving the list mode can
#      surface unfrozen content, not just a shifted count);
#  (b) isolate: FROZEN pins at REV + a ledger built from UNFROZEN pins -> can the
#      predicate go false-green?
set -u -o pipefail
S=/fast/scratch/hyaku/tabi-r37/w1/LabratC1
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
OUT=$S/out; V5=$S/v5.mjs
mkdir -p "$OUT" "$S/tmp" "$S/fx"; export TMPDIR="$S/tmp"; export GIT_CONFIG_NOSYSTEM=1
note() { printf '%s\n' "$*" | tee -a "$OUT/probe5.log"; }

# --- (a) scan sibling commits for BG lines absent from the frozen pin set ---
cat > "$S/scan.mjs" <<'JS'
import { pinLines, BG } from '/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs';
import { execFileSync } from 'node:child_process';
const FLEET = '/home/vgpnk/Projects/shokunin';
const pinSet = pinLines(FLEET);
const sibs = ['audio','chousa','game-dev-2d','game-dev-3d','kagi','kaidoku','kake','kama','kasegi','kengaku','kotoba','kotodama','kumitate','lore','mado','mori','revenger','souji','tameshi','tsukuroi'];
const found = [];
for (const sib of sibs) {
  const repo = `${FLEET}/${sib}-shokunin`;
  let commits;
  try { commits = execFileSync('git',['-C',repo,'rev-list','--max-count=40','master'],{encoding:'utf8'}).split('\n').filter(Boolean); } catch { continue; }
  for (const c of commits) {
    let files;
    try { files = execFileSync('git',['-C',repo,'ls-tree','-r','--name-only',c],{encoding:'utf8'}).split('\n').filter(p=>p==='SKILL.md'||(p.startsWith('corpus/knowledge/')&&p.endsWith('.md'))); } catch { continue; }
    for (const f of files) {
      let txt; try { txt = execFileSync('git',['-C',repo,'show',`${c}:${f}`],{encoding:'utf8',maxBuffer:1<<26}); } catch { continue; }
      for (const line of txt.split('\n')) {
        const t = line.trim();
        if (!t || !BG.test(t) || /\btabi\b/i.test(t)) continue;
        if (pinSet.has(`${sib}${f}${t}`)) continue;
        found.push({ sib, commit: c, path: f, text: t.slice(0,80) });
        break;
      }
      if (found.length && found[found.length-1].sib === sib) break;
    }
    if (found.length && found[found.length-1].sib === sib) break;
  }
}
console.log(JSON.stringify(found.slice(0,8), null, 1));
JS
node "$S/scan.mjs" > "$OUT/scan.json" 2>"$OUT/scan.err"; rc=$?
note "scan exit=$rc"; head -30 "$OUT/scan.json" | tee -a "$OUT/probe5.log"
head -3 "$OUT/scan.err" | tee -a "$OUT/probe5.log"

# --- (b) isolate: FROZEN pins at REV + ledger built from UNFROZEN pins ---
BT=$LANE/.ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs
D=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D"
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || exit 9
# build a de-pinned ledger in a SEPARATE clone, then adopt ONLY the ledger into D (pins stay frozen)
DB=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$DB"
[ "$(git -C "$DB" rev-parse --show-toplevel)" = "$DB" ] || exit 9
python3 - "$DB" <<'PY'
import json, pathlib, re, sys
root = pathlib.Path(sys.argv[1])
v5 = pathlib.Path('/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs').read_text()
block = v5.split('const PINS = Object.freeze({',1)[1].split('});',1)[0]
PINS = dict(re.findall(r"'?([a-z0-9-]+)'?\s*:\s*'([0-9a-f]{40})'", block))
p = root/'.ufo/waves/round-36/baseline/c1-delta-pins.json'
d = json.loads(p.read_text())
for sib, head in d.items():
    if head != PINS[sib]:
        d[sib] = PINS[sib]; print(f'de-pinned: {sib}'); break
p.write_text(json.dumps(d, indent=2)+'\n')
PY
git -C "$DB" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: de-pin'
node "$BT" --repo "$DB" --fleet "$FLEET" --out "$OUT/ledger-unfrozen.tsv" >/dev/null 2>&1
note "unfrozen-built ledger rows=$(grep -c '' "$OUT/ledger-unfrozen.tsv") (honest ledger rows=$(grep -c '' "$OUT/ledger-honest.tsv"))"
# now adopt ONLY that ledger into D, whose pins stay FROZEN at REV
cp "$OUT/ledger-unfrozen.tsv" "$D/corpus/adjacency-screen-drift.tsv"
git -C "$D" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: adopt unfrozen-built ledger'
RD=$(git -C "$D" rev-parse HEAD)
note "D pins blob sha256=$(git -C "$D" show HEAD:.ufo/waves/round-36/baseline/c1-delta-pins.json | sha256sum | cut -d' ' -f1) (frozen=81019362...)"
TMPDIR="$S/tmp" node "$V5" --rev "$RD" --repo "$D" --fleet "$FLEET" --json > "$OUT/b-pred.json" 2> "$OUT/b-pred.stderr"
note "PREDICATE with FROZEN pins + UNFROZEN-built ledger: exit=$? :: $(head -c 300 "$OUT/b-pred.stderr")"
python3 -c "
import json
d=json.load(open('$OUT/b-pred.json'))
print('predicate=',d.get('predicate'),'drift.total=',d.get('drift',{}).get('total'),'auditCoverage=',d.get('drift',{}).get('auditCoverage'),'auditFindings=',len(d.get('drift',{}).get('auditFindings') or []),'staleFindings=',len(d.get('drift',{}).get('staleFindings') or []))
" 2>&1 | tee -a "$OUT/probe5.log"

# --- (c) does the build tool's unbound read ever touch the PREDICATE path? ---
note "--- predicate path pins read (v5 line 385-389) vs build tool (v2 line 65-71) ---"
grep -n "" "$V5" | sed -n '385,389p' | tee -a "$OUT/probe5.log"
rm -rf -- "$D" "$DB"
note "=== probe5 done ==="

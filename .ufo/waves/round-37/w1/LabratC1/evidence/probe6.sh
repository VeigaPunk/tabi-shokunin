#!/usr/bin/env bash
# LabratC1 probe part 6: make --list-delta emit rows from UNFROZEN pins bytes.
set -u -o pipefail
S=/fast/scratch/hyaku/tabi-r37/w1/LabratC1
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
OUT=$S/out; V5=$S/v5.mjs
mkdir -p "$OUT" "$S/tmp" "$S/fx"; export TMPDIR="$S/tmp"; export GIT_CONFIG_NOSYSTEM=1
note() { printf '%s\n' "$*" | tee -a "$OUT/probe6.log"; }

cat > "$S/scan2.mjs" <<'JS'
import { pinLines, BG } from '/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs';
import { execFileSync } from 'node:child_process';
const FLEET = '/home/vgpnk/Projects/shokunin';
const pinSet = pinLines(FLEET);
const sibs = ['audio','chousa','game-dev-2d','game-dev-3d','kagi','kaidoku','kake','kama','kasegi','kengaku','kotoba','kotodama','kumitate','lore','mado','mori','revenger','souji','tameshi','tsukuroi'];
const g = (repo, a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8', maxBuffer: 1<<28 });
const out = [];
for (const sib of sibs) {
  const repo = `${FLEET}/${sib}-shokunin`;
  let commits = [];
  for (const ref of ['master', 'HEAD', 'main']) {
    try { commits = g(repo, ['rev-list', '--max-count=30', ref]).split('\n').filter(Boolean); break; } catch {}
  }
  if (!commits.length) { console.error(`skip ${sib}: no resolvable ref`); continue; }
  for (const c of commits) {
    let files = [];
    try { files = g(repo, ['ls-tree','-r','--name-only',c]).split('\n').filter(p=>p==='SKILL.md'||(p.startsWith('corpus/knowledge/')&&p.endsWith('.md'))); } catch { continue; }
    let hit = null;
    for (const f of files) {
      let txt; try { txt = g(repo, ['show', `${c}:${f}`]); } catch { continue; }
      for (const line of txt.split('\n')) {
        const t = line.trim();
        if (!t || !BG.test(t) || /\btabi\b/i.test(t)) continue;
        if (pinSet.has(`${sib}${f}${t}`)) continue;
        hit = { sib, commit: c, path: f, text: t.slice(0,90) }; break;
      }
      if (hit) break;
    }
    if (hit) { out.push(hit); break; }
  }
}
console.log(JSON.stringify(out, null, 1));
JS
node "$S/scan2.mjs" > "$OUT/scan2.json" 2>"$OUT/scan2.err"; rc=$?
note "scan2 exit=$rc  stderr:"; head -5 "$OUT/scan2.err" | tee -a "$OUT/probe6.log"
cat "$OUT/scan2.json" | tee -a "$OUT/probe6.log"

# Build an unfrozen pins file pointing ONE lane at the scanned commit; commit it at HEAD.
D=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D"
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || exit 9
python3 - "$D" "$OUT/scan2.json" <<'PY'
import json, pathlib, sys
root = pathlib.Path(sys.argv[1]); scan = json.loads(pathlib.Path(sys.argv[2]).read_text())
if not scan: print('NO-SCAN-HIT'); raise SystemExit
hit = scan[0]
p = root/'.ufo/waves/round-36/baseline/c1-delta-pins.json'
d = json.loads(p.read_text())
d[hit['sib']] = hit['commit']
p.write_text(json.dumps(d, indent=2)+'\n')
print(f"repointed {hit['sib']} -> {hit['commit']} ({hit['path']})")
PY
git -C "$D" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: repoint one delta head to a commit with new BG lines'
R=$(git -C "$D" rev-parse HEAD)
note "fixture rev=$R"
note "HEAD pins digest=$(git -C "$D" show HEAD:.ufo/waves/round-36/baseline/c1-delta-pins.json | sha256sum | cut -d' ' -f1)  frozen=810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655"
TMPDIR="$S/tmp" node "$V5" --list-delta --repo "$D" --fleet "$FLEET" > "$OUT/f-delta-unfrozen.stdout" 2> "$OUT/f-delta-unfrozen.stderr"
note "--list-delta over UNFROZEN pins: exit=$? lines=$(grep -c '' "$OUT/f-delta-unfrozen.stdout")"
head -4 "$OUT/f-delta-unfrozen.stdout" | tee -a "$OUT/probe6.log"
TMPDIR="$S/tmp" node "$V5" --list-delta --repo "$LANE" --fleet "$FLEET" > "$OUT/f-delta-frozen.stdout" 2>&1
note "--list-delta over FROZEN pins: lines=$(grep -c '' "$OUT/f-delta-frozen.stdout")"
note "DIVERGES? $(cmp -s "$OUT/f-delta-frozen.stdout" "$OUT/f-delta-unfrozen.stdout" && echo identical || echo DIFFERS)"
TMPDIR="$S/tmp" node "$V5" --rev "$R" --repo "$D" --fleet "$FLEET" --json > "$OUT/f-pred.json" 2> "$OUT/f-pred.stderr"
note "--rev PREDICATE over the same unfrozen clone: exit=$? :: $(head -c 190 "$OUT/f-pred.stderr")"
rm -rf -- "$D"
note "=== probe6 done ==="

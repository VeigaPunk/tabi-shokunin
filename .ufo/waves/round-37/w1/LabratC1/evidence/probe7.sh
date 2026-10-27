#!/usr/bin/env bash
# LabratC1 probe part 7: focused --list-delta divergence search.
set -u -o pipefail
S=/fast/scratch/hyaku/tabi-r37/w1/LabratC1
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
OUT=$S/out; V5=$S/v5.mjs
mkdir -p "$OUT" "$S/tmp" "$S/fx"; export TMPDIR="$S/tmp"; export GIT_CONFIG_NOSYSTEM=1
note() { printf '%s\n' "$*" | tee -a "$OUT/probe7.log"; }

cat > "$S/scan3.mjs" <<'JS'
import { pinLines, BG, PINS } from '/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs';
import { execFileSync } from 'node:child_process';
const FLEET = '/home/vgpnk/Projects/shokunin';
const pinSet = pinLines(FLEET);
console.log('pinSet size =', pinSet.size);
const g = (repo, a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8', maxBuffer: 1<<28 });
const out = [];
for (const [sib, pin] of Object.entries(PINS)) {
  const repo = `${FLEET}/${sib}-shokunin`;
  let commits = [];
  for (const ref of ['master', 'main', 'HEAD']) {
    try { commits = g(repo, ['rev-list', '--max-count=120', ref]).split('\n').filter(Boolean); break; } catch (e) {}
  }
  if (!commits.length) { console.error(`SKIP ${sib}`); continue; }
  let hits = 0;
  for (const c of commits) {
    if (c === pin) continue;
    let files = [];
    try { files = g(repo, ['ls-tree','-r','--name-only',c]).split('\n').filter(p=>p==='SKILL.md'||(p.startsWith('corpus/knowledge/')&&p.endsWith('.md'))); } catch { continue; }
    let hit = null;
    for (const f of files) {
      let txt; try { txt = g(repo, ['show', `${c}:${f}`]); } catch { continue; }
      const lines = txt.split('\n');
      for (let i=0;i<lines.length;i++) {
        const t = lines[i].trim();
        if (!t || !BG.test(t) || /\btabi\b/i.test(t)) continue;
        if (pinSet.has(`${sib}${f}${t}`)) continue;
        hit = { sib, commit: c, path: f, line: i+1, text: t.slice(0,100) }; break;
      }
      if (hit) break;
    }
    if (hit) { out.push(hit); hits++; break; }
  }
  console.error(`  ${sib}: ${commits.length} commits scanned, hit=${hits?1:0}`);
}
console.log(JSON.stringify(out, null, 1));
JS
node "$S/scan3.mjs" > "$OUT/scan3.json" 2> "$OUT/scan3.err"; rc=$?
note "scan3 exit=$rc"
grep -E "hit=1|pinSet size" "$OUT/scan3.err" "$OUT/scan3.json" 2>/dev/null | head -25 | tee -a "$OUT/probe7.log"
cat "$OUT/scan3.json" | tee -a "$OUT/probe7.log"
note "stderr tail:"; tail -5 "$OUT/scan3.err" | tee -a "$OUT/probe7.log"

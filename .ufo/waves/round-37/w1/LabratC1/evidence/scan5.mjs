import { pinLines, BG } from '/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const FLEET = '/home/vgpnk/Projects/shokunin';
const pinSet = pinLines(FLEET);
const v5 = readFileSync('/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs', 'utf8');
const i = v5.indexOf('const PINS = Object.freeze(');
const block = v5.slice(i, v5.indexOf('});', i));
const PINS = Object.fromEntries([...block.matchAll(/'?([a-z0-9-]+)'?\s*:\s*'([0-9a-f]{40})'/g)].map(m => [m[1], m[2]]));
console.error('PINS lanes parsed =', Object.keys(PINS).length, 'pinSet size =', pinSet.size);
const g = (repo, a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8', maxBuffer: 1 << 28 });
const out = [];
for (const sib of Object.keys(PINS)) {
  const repo = `${FLEET}/${sib}-shokunin`;
  let commits = [];
  try { commits = g(repo, ['rev-list', '--all']).split('\n').filter(Boolean); } catch (e) { console.error('skip', sib); continue; }
  let hit = null;
  for (const c of commits) {
    let files = [];
    try { files = g(repo, ['ls-tree', '-r', '--name-only', c]).split('\n').filter(p => p === 'SKILL.md' || (p.startsWith('corpus/knowledge/') && p.endsWith('.md'))); } catch { continue; }
    for (const f of files) {
      let txt; try { txt = g(repo, ['show', `${c}:${f}`]); } catch { continue; }
      const ls = txt.split('\n');
      for (let j = 0; j < ls.length; j++) {
        const t = ls[j].trim();
        if (!t || !BG.test(t) || /\btabi\b/i.test(t)) continue;
        if (pinSet.has(`${sib}${f}${t}`)) continue;
        hit = { sib, commit: c, path: f, line: j + 1, text: t.slice(0, 110) }; break;
      }
      if (hit) break;
    }
    if (hit) break;
  }
  if (hit) { out.push(hit); console.error(`HIT ${sib} @${hit.commit.slice(0, 12)}`); }
  else console.error(`no-hit ${sib} (${commits.length} commits)`);
}
console.log(JSON.stringify(out, null, 1));

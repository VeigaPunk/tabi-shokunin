import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const FLEET = '/home/vgpnk/Projects/shokunin';
const ENV = { PATH: process.env.PATH, HOME: process.env.HOME, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C' };
function git(repo, args) {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', env: ENV, maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stdout;
}
const all = JSON.parse(readFileSync('./probe-all.json', 'utf8'));
const out = [];
let totalCommits = 0;
for (const [lane, v] of Object.entries(all)) {
  if (v.after === 0) continue;
  const R = `${FLEET}/${lane}-shokunin`;
  const files = git(R, ['diff', '--name-only', `${v.pin}..${v.tip}`]).trim().split('\n').filter(Boolean);
  const commits = git(R, ['log', '--format=%h %cI %s', `${v.pin}..${v.tip}`]).trim().split('\n');
  const relevant = files.filter((f) => f === 'SKILL.md' || f.startsWith('corpus/knowledge/'));
  out.push({ lane, pin: v.pin, tip: v.tip, after: v.after, files, commits, relevant });
  totalCommits += v.after;
  console.log(`=== ${lane}: ${v.after} commits, ${files.length} files changed, ${relevant.length} BG-relevant ===`);
  for (const c of commits) console.log('   ' + c);
  console.log('   BG-relevant files: ' + (relevant.length ? relevant.join(', ') : '(none)'));
  console.log('   all files: ' + files.join(', '));
}
console.log('TOTAL post-freeze commits across all 20 lanes: ' + totalCommits);
writeFileSync('./moved-lanes.json', JSON.stringify({ out, totalCommits }, null, 1));

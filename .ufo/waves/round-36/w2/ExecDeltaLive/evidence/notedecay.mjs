import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const FLEET = '/home/vgpnk/Projects/shokunin';
const ENV = { PATH: process.env.PATH, HOME: process.env.HOME, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C' };
function git(repo, args) {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', env: ENV, maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stdout;
}
const lines = (s) => s.split('\n').map((l) => l.replace(/\r$/, ''));
const frozen = JSON.parse(readFileSync('./freeze-pins.json', 'utf8'));
const live = JSON.parse(readFileSync('./live-pins-all.json', 'utf8'));
const src = readFileSync('./c1-counter.mjs', 'utf8');
const m = src.match(/const PINS = Object\.freeze\(\{([\s\S]*?)\}\);/);
const PINS = {};
for (const line of m[1].split('\n')) { const mm = line.match(/^\s*'?([a-z0-9-]+)'?:\s*'([0-9a-f]{40})'/); if (mm) PINS[mm[1]] = mm[2]; }
const drifted = new Set(Object.entries(frozen).filter(([s, h]) => h !== PINS[s]).map(([s]) => s));

console.log('=== post-freeze movement per drifted lane (12) ===');
const all = JSON.parse(readFileSync('./probe-all.json', 'utf8'));
let driftedCommits = 0, movedLanes = 0;
for (const lane of [...drifted].sort()) {
  const v = all[lane];
  if (v.after > 0) { movedLanes++; driftedCommits += v.after; }
  console.log('  ' + lane.padEnd(12) + String(v.after).padStart(3) + ' commits  ' + v.pin.slice(0, 10) + ' -> ' + v.tip.slice(0, 10) + '   ' + (v.after ? 'last ' + v.dates[0].slice(0, 19) : ''));
}
console.log(`  drifted lanes that moved: ${movedLanes}/12   total post-freeze commits in drifted lanes: ${driftedCommits}`);
const nonDriftMoved = Object.entries(all).filter(([l, v]) => !drifted.has(l) && v.after > 0);
console.log('  NON-drifted lanes that moved:', nonDriftMoved.map(([l, v]) => `${l}(${v.after})`).join(', ') || '(none)');
const grand = Object.values(all).reduce((a, v) => a + v.after, 0);
console.log(`  TOTAL post-freeze commits across all 20 lanes: ${grand}`);

console.log('\n=== note-field decay: 3 moved rows, ledger note vs live-head relocation ===');
const PIN_K = '49096c7e6f226af0c750c4b003be58883cb6049f';
const R = `${FLEET}/kaidoku-shokunin`;
const pinLs = lines(git(R, ['show', `${PIN_K}:SKILL.md`]));
const liveLs = lines(git(R, ['show', `${live.kaidoku}:SKILL.md`]));
for (const n of [585, 621, 652]) {
  const cited = pinLs[n - 1].trim();
  const reloc = liveLs.map((t, i) => [i + 1, t.trim()]).filter(([, t]) => t === cited).map(([i]) => i);
  const ledgerNote = { 585: 748, 621: 784, 652: 815 }[n];
  const ledgerLineNow = liveLs[ledgerNote - 1]?.trim();
  console.log(`  cited :${n}`);
  console.log(`    ledger note says "verbatim at :${ledgerNote}"`);
  console.log(`    at live head, cited text now at :${reloc.join(', :')}   (shift ${reloc[0] - ledgerNote >= 0 ? '+' : ''}${reloc[0] - ledgerNote} lines)`);
  console.log(`    at live head :${ledgerNote} holds: ${ledgerLineNow === cited ? 'THE CITED TEXT (note still valid)' : '<<DIFFERENT TEXT>> ' + JSON.stringify((ledgerLineNow || '').slice(0, 70))}`);
}
console.log('\n=== kaidoku SKILL.md growth frozen->live ===');
const frzLs = lines(git(R, ['show', `${frozen.kaidoku}:SKILL.md`]));
console.log(`  frozen head lines: ${frzLs.length - 1}   live head lines: ${liveLs.length - 1}   delta ${liveLs.length - frzLs.length}`);
console.log('  files changed kaidoku SKILL.md frozen->live:');
console.log(git(R, ['diff', '--stat', `${frozen.kaidoku}..${live.kaidoku}`, '--', 'SKILL.md']).trim());

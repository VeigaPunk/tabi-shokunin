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
const BG = /\b(?:playwright|puppeteer|chromedriver|geckodriver|webdriver|selenium|chromium|headless[ -](?:chrome|chromium|browser|firefox)|devtools protocol|chrome devtools|chrome-devtools|cdp|remote-debugging|browser automation|webbridge|burner[- ]?chrome|musketeer)\b/i;
const TABI = /\btabi\b/i;

function siblingFiles(repo, rev) {
  return git(repo, ['ls-tree', '-r', '--name-only', rev]).split('\n').filter((p) => p === 'SKILL.md' || (p.startsWith('corpus/knowledge/') && p.endsWith('.md'))).sort();
}

// independent re-implementation of the delta pool over the PIN->FROZEN interval,
// using plain git diff (added lines only), for each of the 12 drifted lanes.
console.log('=== independent check: BG lines ADDED by plain git diff, pin -> frozen delta head (12 drifted lanes) ===');
let totalAddedBG = 0;
for (const [lane, head] of Object.entries(frozen)) {
  if (head === PINS[lane]) continue;
  const R = `${FLEET}/${lane}-shokunin`;
  const diff = git(R, ['diff', '--unified=0', `${PINS[lane]}..${head}`, '--', 'SKILL.md', 'corpus/knowledge/']);
  const added = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
  const bg = added.filter((t) => BG.test(t) && !TABI.test(t));
  totalAddedBG += bg.length;
  console.log(`  ${lane.padEnd(12)} added lines (SKILL.md+corpus/knowledge): ${String(added.length).padStart(4)}   BG non-tabi: ${bg.length}`);
  for (const b of bg.slice(0, 5)) console.log('      BG+ ' + b.slice(0, 110));
}
console.log(`  TOTAL BG non-tabi lines added pin->frozen across drifted lanes: ${totalAddedBG}`);

console.log('\n=== independent check: BG lines ADDED by plain git diff, FROZEN -> LIVE tip (all lanes that moved) ===');
let liveAddedBG = 0;
for (const [lane, head] of Object.entries(frozen)) {
  const tip = live[lane];
  if (tip === head) continue;
  const R = `${FLEET}/${lane}-shokunin`;
  const diff = git(R, ['diff', '--unified=0', `${head}..${tip}`, '--', 'SKILL.md', 'corpus/knowledge/']);
  const added = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
  const bg = added.filter((t) => BG.test(t) && !TABI.test(t));
  liveAddedBG += bg.length;
  console.log(`  ${lane.padEnd(12)} added lines: ${String(added.length).padStart(4)}   BG non-tabi: ${bg.length}`);
  for (const b of bg.slice(0, 8)) console.log('      BG+ ' + b.slice(0, 110));
}
console.log(`  TOTAL BG non-tabi lines added frozen->live across moved lanes: ${liveAddedBG}`);

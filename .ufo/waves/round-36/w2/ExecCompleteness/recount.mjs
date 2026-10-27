// Independent recount of the C1 completeness population (383) and delta pool (0).
// Imports only the frozen BG/TABI regexes + PINS from the frozen counter module; the
// enumeration, keying, dedupe and prior-pool subtraction are re-implemented here so an
// off-by-one / dedupe / priorSkipped error in the counter surfaces as a mismatch.
import { BG } from './c1.mjs';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const C = process.argv[2];           // clean clone of the lane at the landing
const FLEET = '/home/vgpnk/Projects/shokunin';
const BASELINE = '11c64b96f357de106c30a71c5e21ca44a3eacdc0';
const TABI = /\btabi\b/i;

// tabs in the counter's own module source, to avoid re-deriving PINS by hand
const src = readFileSync(new URL('./c1.mjs', import.meta.url), 'utf8');
const pinsSrc = src.slice(src.indexOf('const PINS = Object.freeze({'));
const PINS = {};
for (const m of pinsSrc.matchAll(/^\s{2}'?([a-z0-9-]+)'?:\s*'([0-9a-f]{40})',$/gm)) PINS[m[1]] = m[2];

const git = (repo, args) => execFileSync('git', ['-C', repo, ...args], { maxBuffer: 1 << 28 });
const files = (repo, rev) => git(repo, ['ls-tree', '-r', '--name-only', rev]).toString('utf8')
  .split('\n').filter((p) => p === 'SKILL.md' || (p.startsWith('corpus/knowledge/') && p.endsWith('.md'))).sort();
const text = (buf) => { const s = buf.toString('utf8'); return s.endsWith('\n') ? s.slice(0, -1) : s; };
const splitLines = (s) => (s === '' ? [''] : s.split('\n'));

// prior round-34 pool keys: lane + path + trimmed text
const prior = new Set();
for (const row of splitLines(text(git(C, ['show', `${BASELINE}:.ufo/waves/round-34/baseline/c1-candidates.tsv`])))) {
  if (!row) continue;
  const f = row.split('\t');
  const m = /^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):([^:]+):([0-9]+)$/.exec(f[0] || '');
  if (!m) throw new Error(`prior row unparseable: ${row.slice(0, 80)}`);
  prior.add(`${m[1]}${m[3]}${(f.slice(2).join('\t') || '').trim()}`);
}

const pinLines = new Set();
const cands = [];
const seen = new Set();
let priorSkipped = 0;
for (const [sib, pin] of Object.entries(PINS)) {
  const repo = `${FLEET}/${sib}-shokunin`;
  git(repo, ['cat-file', '-e', `${pin}^{commit}`]);
  for (const p of files(repo, pin)) {
    const ls = splitLines(text(git(repo, ['show', `${pin}:${p}`])));
    ls.forEach((t, i) => {
      if (!BG.test(t) || TABI.test(t)) return;
      pinLines.add(`${sib}${p}${t.trim()}`);
      const k = `${sib}${p}${t.trim()}`;
      if (prior.has(k)) { priorSkipped += 1; return; }
      if (seen.has(k)) return;
      seen.add(k);
      cands.push({ key: `${sib}-shokunin@${pin}:${p}:${i + 1}`, text: t.trim() });
    });
  }
}

const deltaPins = JSON.parse(text(git(C, ['show', 'f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7:.ufo/waves/round-36/baseline/c1-delta-pins.json'])));
const delta = [];
for (const [sib, head] of Object.entries(deltaPins)) {
  if (!(sib in PINS)) throw new Error(`delta pin unknown sibling ${sib}`);
  const repo = `${FLEET}/${sib}-shokunin`;
  git(repo, ['cat-file', '-e', `${head}^{commit}`]);
  for (const p of files(repo, head)) {
    const ls = splitLines(text(git(repo, ['show', `${head}:${p}`])));
    ls.forEach((t, i) => {
      if (!BG.test(t) || TABI.test(t)) return;
      const k = `${sib}${p}${t.trim()}`;
      if (pinLines.has(k)) return;
      delta.push(`${sib}-shokunin@${head}:${p}:${i + 1}`);
    });
  }
}

const driftedLanes = Object.keys(deltaPins).filter((s) => deltaPins[s] !== PINS[s]);
if (process.argv[3]) (await import('node:fs')).writeFileSync(process.argv[3], cands.map((c) => `${c.key}\t${c.text}`).join('\n') + '\n');
console.log(JSON.stringify({
  pins: Object.keys(PINS).length,
  deltaPins: Object.keys(deltaPins).length,
  driftedLanes: driftedLanes.length,
  driftedLaneNames: driftedLanes,
  priorPoolKeys: prior.size,
  candidates: cands.length,
  priorSkipped,
  pinLines: pinLines.size,
  deltaPool: delta.length,
  deltaKeys: delta,
}, null, 1));

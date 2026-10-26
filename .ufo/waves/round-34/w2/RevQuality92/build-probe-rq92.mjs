// Build an attack construction in the scratch clone: three cosmetic renames of the
// already-mapped kake crawler-discipline-vs-publishing boundary, on three kake candidate
// lines, all quoting ONE new tabi declaration line. Everything else screened.
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const CLONE = "/fast/scratch/hyaku/tabi-r34/RevQuality92/clone";
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FLEET = '/home/vgpnk/Projects/shokunin';

const list = execFileSync(process.execPath, [`${LANE}/.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs`, '--list-candidates', '--repo', LANE, '--fleet', FLEET], { encoding: 'utf8', maxBuffer: 1 << 26 });
const cands = list.split('\n').filter(Boolean).map((l) => { const f = l.split('\t'); return { key: f[0], set: f[1], text: f[2] }; });
console.error(`candidates=${cands.length}`);

const MAP_TARGETS = [
  { path: 'SKILL.md', line: 408, surface: 'kake-browser-handoff-restated-a' },
  { path: 'SKILL.md', line: 697, surface: 'kake-browser-handoff-restated-b' },
  { path: 'corpus/knowledge/field-performance-cwv.md', line: 153, surface: 'kake-browser-handoff-restated-c' },
];

// --- 1. new tabi declaration line
const DECL = 'Round 34 declares the kake browser hand-off';
const declLine = `- ${DECL}: kake routes browser execution and lab-performance runs to tabi under the crawler split (round-34 declaration, outside PROVINCE).`;
let skill = readFileSync(`${CLONE}/SKILL.md`, 'utf8');
if (!skill.includes(DECL)) {
  const block = `${skill.endsWith('\n') ? '' : '\n'}\n## Round 34 — sibling-overlap declarations (outside PROVINCE)\n\n${declLine}\n`;
  appendFileSync(`${CLONE}/SKILL.md`, block);
  skill = readFileSync(`${CLONE}/SKILL.md`, 'utf8');
}
let declNo = skill.split('\n').findIndex((l) => l.includes(DECL)) + 1;
const declText = skill.split('\n')[declNo - 1];
if (declNo === 0 || !declText.includes(DECL)) throw new Error(`decl line mismatch at ${declNo}: ${declText}`);
if (!declText.includes(DECL)) throw new Error(`decl line mismatch at ${declNo}: ${declText}`);
console.error(`declLine=${declNo}`);

// --- 2. quote helper: verbatim word window of a line
function windowQuote(text, { minWords = 4, maxWords = 25, minNonSpace = 20 } = {}) {
  const ws = [...text.matchAll(/\S+/g)].map((m) => ({ s: m.index, e: m.index + m[0].length }));
  for (let len = Math.min(maxWords, ws.length); len >= minWords; len -= 1) {
    for (let i = 0; i + len <= ws.length; i += 1) {
      const q = text.slice(ws[i].s, ws[i + len - 1].e);
      if (q.replace(/\s/g, '').length >= minNonSpace && !text.includes('\t')) return q;
    }
  }
  return null;
}

// sibling lines
function siblingLine(path, line) {
  return execFileSync('git', ['-C', `${FLEET}/kake-shokunin`, 'show', `044048597d62f3199494b63b36e90dd57825e350:${path}`], { encoding: 'utf8' }).split('\n')[line - 1];
}

const header = readFileSync(`${CLONE}/corpus/adjacency.tsv`, 'utf8').split('\n')[0];
const baseRows = readFileSync(`${CLONE}/corpus/adjacency.tsv`, 'utf8').split('\n').filter((l, i) => i > 0 && l !== '');
const newRows = [];
const mappedKeys = new Set();
for (const t of MAP_TARGETS) {
  const sibText = siblingLine(t.path, t.line);
  const key = `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:${t.path}:${t.line}`;
  const cand = cands.find((c) => c.key === key);
  if (!cand) throw new Error(`not a candidate: ${key}`);
  const sq = windowQuote(sibText);
  if (!sq) throw new Error(`no quote for ${key}`);
  mappedKeys.add(key);
  newRows.push([t.surface, 'kake', key, sq, `SKILL.md:${declNo}`, DECL, 'refused-route', '-', DECL].join('\t'));
  console.error(`row ${t.surface} <- ${key} :: ${sq}`);
}
writeFileSync(`${CLONE}/corpus/adjacency.tsv`, [header, ...baseRows, ...newRows].join('\n') + '\n');

// --- 3. screen the rest
const SCREENED_SURFACE = 'crawler-discipline-vs-publishing';
const out = ['sibling_ref\treason\tsurface\tquote\tnote'];
let n = 0;
for (const c of cands) {
  if (mappedKeys.has(c.key)) continue;
  const alreadyMapped = c.key === 'kama-shokunin@54a29268e2083caa2b1e0d54ee1e7d90961302f3:corpus/knowledge/listener-census.md:355';
  if (alreadyMapped) continue;
  const q = windowQuote(c.text);
  if (!q) { console.error(`NO QUOTE: ${c.key} :: ${c.text.slice(0, 80)}`); continue; }
  out.push([c.key, 'not-browser-sense', '-', q, 'attack construction: blanket screen'].join('\t'));
  n += 1;
}
writeFileSync(`${CLONE}/corpus/adjacency-screen-skill.tsv`, out.join('\n') + '\n');
console.error(`screened=${n} rows written`);

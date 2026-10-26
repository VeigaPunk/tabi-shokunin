#!/usr/bin/env node
// Independent re-derivation of the C1 clause set from git objects only.
// Does not import or reuse the frozen counter's code.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const CLONE = process.argv[2];
const FLEET = process.argv[3];
const REV = process.argv[4];
const BASE = '15dfaccb34601c2d221c78501e2befd8998d600c';
const FROZEN_CANDS = process.argv[5];

const git = (repo, args) => {
  const r = spawnSync('git', ['-C', repo, ...args], { maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git -C ${repo} ${args.join(' ')} -> ${r.status}: ${r.stderr}`);
  return r.stdout.toString('utf8');
};
const show = (repo, rev, path) => git(repo, ['show', `${rev}:${path}`]);
const L = (s) => s.split('\n').map((x) => x.replace(/\r$/, ''));
const w = (s) => s.trim().split(/\s+/).filter(Boolean);
const fold = (s) => s.normalize('NFKC').toLowerCase();

// frozen candidate universe
const frozen = new Map();
for (const row of L(readFileSync(FROZEN_CANDS, 'utf8'))) {
  if (!row) continue;
  const [key, set, text] = row.split('\t');
  frozen.set(key, { set, text: text.trim() });
}

const parseMap = (buf) => L(buf).slice(1).filter(Boolean).map((row, i) => {
  const f = row.split('\t');
  return { line: i + 2, surface: f[0], sibling: f[1], sibling_ref: f[2], sibling_quote: f[3], tabi_ref: f[4], tabi_quote: f[5], disposition: f[6], ruling_ref: f[7], ruling_quote: f[8], cols: f.length };
});

const mapRev = parseMap(show(CLONE, REV, 'corpus/adjacency.tsv'));
const mapBase = parseMap(show(CLONE, BASE, 'corpus/adjacency.tsv'));
const baseKeys = new Set(mapBase.map((r) => `${fold(r.surface)} ${r.sibling}`));

const refRe = /^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;
const citedText = (ref) => {
  const m = refRe.exec(ref);
  if (!m) return null;
  const repo = `${FLEET}/${m[1]}-shokunin`;
  const ls = L(show(repo, m[2], m[3]));
  return { lane: m[1], pin: m[2], path: m[3], line: Number(m[4]), text: ls[Number(m[4]) - 1] };
};

const NEW_ROWS = [15, 16, 17, 18];
const rowChecks = [];
for (const n of NEW_ROWS) {
  const r = mapRev.find((x) => x.line === n);
  const c = { row: n, cols: r.cols, surface: r.surface, sibling: r.sibling, disposition: r.disposition };
  c.keyAbsentAtBaseline = !baseKeys.has(`${fold(r.surface)} ${r.sibling}`);
  const cited = citedText(r.sibling_ref);
  c.siblingRefParses = !!cited;
  if (cited) {
    c.siblingLaneMatches = cited.lane === r.sibling;
    const k = `${cited.lane}-shokunin@${cited.pin}:${cited.path}:${cited.line}`;
    c.keyIsFrozenCandidate = frozen.has(k);
    c.citedTextEqualsCandidateText = frozen.has(k) && frozen.get(k).text === cited.text.trim();
    c.citedText = cited.text;
  }
  // tabi side
  const tm = /^([A-Za-z0-9_./-]+):([1-9][0-9]*)$/.exec(r.tabi_ref || '');
  c.tabiRefParses = !!tm;
  if (tm) {
    const nowLine = L(show(CLONE, REV, tm[1]))[Number(tm[2]) - 1];
    const baseSet = new Set(L(show(CLONE, BASE, tm[1])).map((x) => x.trim()));
    c.tabiLineText = nowLine;
    c.tabiLineIsNew = nowLine !== undefined && !baseSet.has(nowLine.trim());
    c.tabiLineContainsQuote = nowLine !== undefined && nowLine.includes(r.tabi_quote);
    c.tabiQuoteNamesSibling = new RegExp(`\\b${r.sibling}\\b`, 'i').test(r.tabi_quote);
  }
  c.siblingQuoteNamesTabi = /\btabi\b/i.test(r.sibling_quote || '');
  c.dispositionOk = ['ruled', 'contested-open', 'refused-route'].includes(r.disposition) ? 'tabi-side-only'
    : r.disposition === 'split-declared' ? (c.siblingQuoteNamesTabi ? 'split-both-sides' : 'split-MISSING-tabi') : 'unknown';
  rowChecks.push(c);
}

// screen ledger
const screenBuf = show(CLONE, REV, 'corpus/adjacency-screen-skill.tsv');
const screenLines = L(screenBuf).filter((x, i, a) => !(i === a.length - 1 && x === ''));
const header = screenLines[0];
const HEADER = 'sibling_ref\treason\tsurface\tquote\tnote';
const REASONS = ['not-browser-sense', 'same-surface', 'third-lane-report', 'no-claim-declared'];
const goodQuote = (q) => { const n = w(q).length; return n >= 4 && n <= 25 && q.replace(/\s/g, '').length >= 20; };
const verifiedSurfaceKeys = new Set(mapRev.map((r) => `${fold(r.surface)} ${r.sibling}`));
const screenFindings = [];
const reasonCount = {};
const screenedKeys = [];
screenLines.slice(1).forEach((row, i) => {
  const n = i + 2;
  const f = row.split('\t');
  if (f.length !== 5) { screenFindings.push(`${n}: columns ${f.length}`); return; }
  const [ref, reason, surface, quote] = f;
  const fr = frozen.get(ref);
  if (!fr) { screenFindings.push(`${n}: not-a-frozen-candidate ${ref}`); return; }
  if (!REASONS.includes(reason)) { screenFindings.push(`${n}: reason ${reason}`); return; }
  if (!goodQuote(quote)) { screenFindings.push(`${n}: bad quote length/shape`); return; }
  if (!fr.text.includes(quote)) { screenFindings.push(`${n}: quote not substring`); return; }
  if (reason === 'same-surface') {
    const lane = /^(.+?)-shokunin@/.exec(ref)[1];
    if (!verifiedSurfaceKeys.has(`${fold(surface)} ${lane}`)) { screenFindings.push(`${n}: surface ${surface}/${lane} not a verified row`); return; }
  } else if (surface !== '-') { screenFindings.push(`${n}: surface not dash`); return; }
  if (screenedKeys.includes(ref)) { screenFindings.push(`${n}: duplicate ${ref}`); return; }
  screenedKeys.push(ref);
  reasonCount[reason] = (reasonCount[reason] || 0) + 1;
});

// mapped candidates (independent): verified row cites a frozen candidate line with same path+trimmed text
const mappedKeys = new Map();
for (const r of mapRev) {
  const m = refRe.exec(r.sibling_ref);
  if (!m) continue;
  const c = citedText(r.sibling_ref);
  if (!c || c.path === 'PROVINCE.md' || c.lane !== r.sibling || c.text === null) continue;
  const k = `${c.lane}-shokunin@${c.pin}:${c.path}:${c.line}`;
  if (frozen.has(k) && frozen.get(k).text === c.text.trim()) mappedKeys.set(k, r.line);
}

const byText = new Map();
for (const [key, v] of frozen) {
  const m = /^(.+?)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/.exec(key);
  byText.set(`${m[1]}\u0000${m[3]}\u0000${v.text}`, key);
}
const mappedKeys2 = new Map();
for (const r of mapRev) {
  const c = citedText(r.sibling_ref);
  if (!c || c.path === 'PROVINCE.md' || c.text === null) continue;
  const key = byText.get(`${c.lane}\u0000${c.path}\u0000${c.text.trim()}`);
  if (key) mappedKeys2.set(key, r.line);
}
const allKeys = [...frozen.keys()];
const overlap = allKeys.filter((k) => mappedKeys2.has(k) && screenedKeys.includes(k));
const unaccounted = allKeys.filter((k) => !mappedKeys2.has(k) && !screenedKeys.includes(k));
const newMappedVerified = rowChecks.filter((c) =>
  c.keyAbsentAtBaseline && c.keyIsFrozenCandidate && c.citedTextEqualsCandidateText &&
  c.tabiLineIsNew && c.tabiLineContainsQuote && c.tabiQuoteNamesSibling &&
  (c.disposition === 'refused-route' || c.disposition === 'ruled' || c.disposition === 'contested-open' ||
   (c.disposition === 'split-declared' && c.siblingQuoteNamesTabi)));

console.log(JSON.stringify({
  mapRowsAtRev: mapRev.length,
  mapRowsAtBaseline: mapBase.length,
  rowChecks,
  screen: { headerExact: header === HEADER, dataRows: screenLines.length - 1, reasons: reasonCount, findings: screenFindings, unique: new Set(screenedKeys).size },
  mappedCandidateKeys: [...mappedKeys2.keys()],
  mappedRowNumbers: [...new Set(mappedKeys2.values())],
  mapped: mappedKeys2.size,
  overlapMappedAndScreened: overlap,
  unaccountedCount: unaccounted.length,
  unaccounted,
  newMappedVerifiedCount: newMappedVerified.length,
  newMappedVerifiedRows: newMappedVerified.map((c) => c.row),
}, null, 2));

#!/usr/bin/env node
// RevScreenQuotes (tabi round-34 w2) — mechanical integrity of the C1 integration
// at 04f9623dde8ad35d470cecf766e421eafbcb47fa. Findings only; no repair.
//
// Checks, independent of the frozen counter's verdicts:
//  A. frozen candidate list (.ufo/waves/round-34/baseline/c1-candidates.tsv):
//     every key parses, is unique, pins of set-A keys equal c1-pins.json, and the
//     text column equals the line read from the sibling repo at the key's commit.
//  B. screen ledger corpus/adjacency-screen-skill.tsv at REV (62 rows): header
//     exact, 5 columns, key is a frozen candidate key, no duplicate key, reason
//     in vocabulary, quote is a verbatim substring of the candidate line at the
//     key's pinned commit with 4..25 words and >= 20 non-space chars, same-
//     surface rows name a surface verified by check-adjacency for the same
//     sibling, other reasons carry surface `-`.
//  C. map corpus/adjacency.tsv at REV (18 rows): NEW rows (folded surface+sibling
//     absent at baseline 15dfacc) — expect exactly 4 — get full quote checks:
//     sibling_quote vs the sibling line at its own pin, tabi_quote vs the tabi
//     line at REV, tabi declaration line absent (trimmed) from that file at
//     baseline, tabi_quote names the sibling, disposition clause (ruled /
//     contested-open / refused-route, or split-declared with \btabi\b in
//     sibling_quote), ruling_ref `-` for split/refused, ruling_quote containment
//     (ruled/contested: the cited ruling line; split/refused: the tabi file).
//  D. coverage: every candidate appears exactly once — mapped by exactly one
//     verified map row (lane + path + trimmed line text at the row's own pin)
//     XOR screened by exactly one screen row.
// It then runs check-adjacency.mjs and the frozen counter at REV in this clean
// clone, records exit codes, and prints one JSON object.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/fast/scratch/hyaku/tabi-r34/RevScreenQuotes/clone';
const REV = '04f9623dde8ad35d470cecf766e421eafbcb47fa';
const BASE = '15dfaccb34601c2d221c78501e2befd8998d600c';
const FLEET = '/home/vgpnk/Projects/shokunin';
const FROZEN = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/baseline';
const MAP = 'corpus/adjacency.tsv';
const SCREEN = 'corpus/adjacency-screen-skill.tsv';
const COUNTER = join(LANE, '.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs');
const ADJGATE = join(LANE, 'scripts/check-adjacency.mjs');
const COUNTER_SHA = '0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e';
const ADJGATE_SHA = '4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac';
const REASONS = ['not-browser-sense', 'same-surface', 'third-lane-report', 'no-claim-declared'];
const SCREEN_HEADER = ['sibling_ref', 'reason', 'surface', 'quote', 'note'];
const MAP_HEADER = ['surface', 'sibling', 'sibling_ref', 'sibling_quote', 'tabi_ref', 'tabi_quote', 'disposition', 'ruling_ref', 'ruling_quote'];
const refRe = /^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;
const fold = (s) => s.normalize('NFKC').toLowerCase();
const linesOf = (buf) => buf.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));
const words = (s) => s.trim().split(/\s+/).filter(Boolean);
const qStats = (q) => ({ words: words(q).length, nspace: q.replace(/\s/g, '').length });
const goodQuote = (q) => qStats(q).words >= 4 && qStats(q).words <= 25 && qStats(q).nspace >= 20;

const F = [];
const bad = (sev, where, msg) => { F.push({ sev, where, msg }); return null; };

function git(repo, args) {
  const r = spawnSync('git', ['-C', repo, '-c', 'core.commitGraph=false', ...args], {
    encoding: 'buffer', maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C' },
  });
  if (r.status !== 0) throw new Error(`git -C ${repo} ${args.join(' ')} rc=${r.status}: ${r.stderr.toString('utf8').trim()}`);
  return r.stdout;
}
const blob = (repo, rev, path) => git(repo, ['show', `${rev}:${path}`]);
const sha = (b) => createHash('sha256').update(b).digest('hex');

// ---- 0. byte identity of the tools this run executes -------------------------
const counterBuf = readFileSync(COUNTER);
const gateBuf = readFileSync(ADJGATE);
if (sha(counterBuf) !== COUNTER_SHA) bad('fatal', 'counter', `worktree counter sha ${sha(counterBuf)} != frozen ${COUNTER_SHA}`);
if (sha(gateBuf) !== ADJGATE_SHA) bad('fatal', 'adjgate', `worktree check-adjacency sha ${sha(gateBuf)} != pinned ${ADJGATE_SHA}`);
if (blob(LANE, REV, 'corpus/adjacency.tsv').toString('utf8') !== readFileSync(join(LANE, MAP), 'utf8')) bad('fatal', 'worktree', 'worktree map != REV blob');
if (blob(LANE, REV, SCREEN).toString('utf8') !== readFileSync(join(LANE, SCREEN), 'utf8')) bad('fatal', 'worktree', 'worktree screen != REV blob');

// ---- A. frozen candidate list ------------------------------------------------
const pins = JSON.parse(readFileSync(join(FROZEN, 'c1-pins.json'), 'utf8'));
const candLines = linesOf(readFileSync(join(FROZEN, 'c1-candidates.tsv')));
if (candLines[candLines.length - 1] === '') candLines.pop();
const cands = new Map();
for (let i = 0; i < candLines.length; i += 1) {
  const f = candLines[i].split('\t');
  if (f.length !== 3) { bad('fatal', `cand:${i + 1}`, `expected 3 TSV columns, got ${f.length}`); continue; }
  const [key, set, text] = f;
  if (cands.has(key)) { bad('fatal', `cand:${i + 1}`, `duplicate candidate key ${key}`); continue; }
  const m = refRe.exec(key);
  if (!m) { bad('fatal', `cand:${i + 1}`, `key not <lane>-shokunin@40hex:path:line: ${key}`); continue; }
  const [, lane, pin, path, lineStr] = m;
  const lineNo = Number(lineStr);
  if (!['A', 'B'].includes(set)) bad('fatal', `cand:${i + 1}`, `set not A|B: ${set}`);
  if (set === 'A' && pins[lane] !== pin) bad('fatal', `cand:${i + 1}`, `set-A pin ${pin} != c1-pins.json ${pins[lane]} for ${lane}`);
  let repoLine = null;
  try {
    const ls = linesOf(blob(join(FLEET, `${lane}-shokunin`), pin, path));
    repoLine = ls[lineNo - 1] ?? null;
  } catch (e) { bad('fatal', `cand:${i + 1}`, `sibling blob unreadable: ${e.message}`); }
  if (repoLine !== null && repoLine !== undefined) {
    if (repoLine.trim() !== text.trim()) bad('fatal', `cand:${i + 1}`, `frozen text differs from repo line at pin: frozen=${JSON.stringify(text.trim())} repo=${JSON.stringify(repoLine.trim())}`);
  }
  cands.set(key, { key, lane, pin, path, line: lineNo, text: repoLine !== null && repoLine !== undefined ? repoLine : text, set, frozenText: text });
}
// the counter's own --list-candidates must equal the frozen list byte-for-byte
const listed = spawnSync(process.execPath, [COUNTER, '--list-candidates', '--repo', LANE, '--fleet', FLEET], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (listed.status !== 0) bad('fatal', 'list-candidates', `rc=${listed.status} ${listed.stderr.trim().slice(0, 300)}`);
else {
  const a = listed.stdout.replace(/\n$/, '').split('\n');
  const b = candLines;
  if (a.length !== b.length) bad('fatal', 'list-candidates', `counter derives ${a.length} candidates, frozen list has ${b.length}`);
  else for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) bad('fatal', `list-candidates:${i + 1}`, `derivation differs from frozen list:\n  counter=${a[i]}\n  frozen =${b[i]}`);
}

// ---- run the gate + frozen counter (receipts + verified-row set) --------------
function run(bin, args) {
  const r = spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, TMPDIR: '/fast/scratch/hyaku/tabi-r34/RevScreenQuotes/tmp' } });
  return { rc: r.status, stdout: r.stdout, stderr: r.stderr };
}
const gateRun = run(ADJGATE, ['--at', REV, '--repo', LANE, '--fleet', FLEET, '--json']);
let gate = null;
try { gate = JSON.parse(gateRun.stdout.trim().split('\n').pop()); } catch { bad('fatal', 'adjgate', `no JSON (rc=${gateRun.rc}): ${gateRun.stderr.trim().slice(0, 300)}`); }
const counterRun = run(COUNTER, ['--rev', REV, '--repo', LANE, '--fleet', FLEET, '--json']);
let counter = null;
try { counter = JSON.parse(counterRun.stdout.trim().split('\n').pop()); } catch { bad('fatal', 'counter', `no JSON (rc=${counterRun.rc}): ${counterRun.stderr.trim().slice(0, 300)}`); }
const gateText = run(ADJGATE, ['--at', REV, '--repo', LANE, '--fleet', FLEET]);
const counterText = run(COUNTER, ['--rev', REV, '--repo', LANE, '--fleet', FLEET]);
const flagged = new Set((gate?.findings || []).map((f) => f.row));

// ---- map at REV + baseline ----------------------------------------------------
const parseMap = (buf) => {
  const ls = linesOf(buf);
  const rows = [];
  for (let i = 1; i < ls.length; i += 1) {
    if (ls[i] === '') continue;
    const f = ls[i].split('\t');
    rows.push({ rowNo: i + 1, fields: f, surface: (f[0] || '').trim(), sibling: (f[1] || '').trim(), siblingRef: (f[2] || '').trim(), siblingQuote: (f[3] || '').trim(), tabiRef: (f[4] || '').trim(), tabiQuote: (f[5] || '').trim(), disposition: (f[6] || '').trim(), rulingRef: (f[7] || '').trim(), rulingQuote: (f[8] || '').trim() });
  }
  return { header: ls[0], rows };
};
const mapNow = parseMap(blob(LANE, REV, MAP));
const mapBase = parseMap(blob(LANE, BASE, MAP));
if (mapNow.header !== MAP_HEADER.join('\t')) bad('fatal', 'map:1', `map header mismatch`);
if (mapNow.rows.length !== 17) bad('major', 'map', `expected 17 data rows (13 baseline + 4 new), found ${mapNow.rows.length}`);
const baseKeys = new Set(mapBase.rows.map((r) => `${fold(r.surface)} ${r.sibling}`));
const verifiedRows = mapNow.rows.filter((r) => !flagged.has(r.rowNo));

const citedSibling = (ref) => {
  const m = refRe.exec(ref);
  if (!m) return bad('fatal', 'ref', `malformed sibling_ref ${ref}`);
  const ls = linesOf(blob(join(FLEET, `${m[1]}-shokunin`), m[2], m[3]));
  return { lane: m[1], path: m[3], line: Number(m[4]), text: ls[m[4] - 1] ?? null };
};
const trimLine = (s) => s.trim();

// ---- B. screen ledger ----------------------------------------------------------
const screenBuf = blob(LANE, REV, SCREEN);
const sLs = linesOf(screenBuf);
if (sLs[sLs.length - 1] === '') sLs.pop();
if (sLs[0] !== SCREEN_HEADER.join('\t')) bad('fatal', 'screen:1', 'header mismatch');
const screenRows = [];
for (let i = 1; i < sLs.length; i += 1) {
  if (sLs[i] === '') continue;
  const f = sLs[i].split('\t').map((x) => x.trim());
  const rowNo = i + 1;
  if (f.length !== 5) { bad('fatal', `screen:${rowNo}`, `${f.length} columns`); continue; }
  screenRows.push({ rowNo, ref: f[0], reason: f[1], surface: f[2], quote: f[3], note: f[4] });
}
if (screenRows.length !== 62) bad('major', 'screen', `expected 62 data rows, found ${screenRows.length}`);
const seenScreen = new Map();
const verifiedSurfaces = new Set(verifiedRows.map((r) => `${fold(r.surface)} ${r.sibling}`));
for (const r of screenRows) {
  const w = `screen:${r.rowNo}`;
  const c = cands.get(r.ref);
  if (!c) { bad('fatal', w, `sibling_ref is not a frozen candidate key: ${r.ref}`); continue; }
  if (!REASONS.includes(r.reason)) bad('fatal', w, `reason not in vocabulary: ${r.reason}`);
  if (seenScreen.has(r.ref)) bad('fatal', w, `duplicate screen key ${r.ref} (first at row ${seenScreen.get(r.ref)})`);
  seenScreen.set(r.ref, r.rowNo);
  const st = qStats(r.quote);
  if (st.words < 4 || st.words > 25 || st.nspace < 20) bad('major', w, `quote limits: words=${st.words} nonspace=${st.nspace} quote=${JSON.stringify(r.quote)}`);
  if (c.text === null || !c.text.includes(r.quote)) bad('fatal', w, `quote is NOT a verbatim substring of the candidate line at ${r.ref}`);
  if (r.reason === 'same-surface') {
    if (!verifiedSurfaces.has(`${fold(r.surface)} ${c.lane}`)) bad('major', w, `same-surface surface "${r.surface}" is not a verified map row of ${c.lane}`);
  } else if (r.surface !== '-') bad('major', w, `reason ${r.reason} must carry surface "-", got "${r.surface}"`);
}

// ---- C. NEW map rows ------------------------------------------------------------
const newRows = mapNow.rows.filter((r) => !baseKeys.has(`${fold(r.surface)} ${r.sibling}`));
if (newRows.length !== 4) bad('major', 'map', `expected 4 NEW (surface,sibling) rows, found ${newRows.length}: ${newRows.map((r) => `${r.rowNo}:${r.surface}/${r.sibling}`).join(', ')}`);
const tabiBaseCache = new Map();
const tabiFileAtBase = (path) => {
  if (!tabiBaseCache.has(path)) {
    try { tabiBaseCache.set(path, new Set(linesOf(blob(LANE, BASE, path)).map(trimLine))); } catch { tabiBaseCache.set(path, null); }
  }
  return tabiBaseCache.get(path);
};
for (const r of newRows) {
  const w = `map:${r.rowNo}(${r.surface}/${r.sibling})`;
  const c = citedSibling(r.siblingRef);
  if (c) {
    if (c.lane !== r.sibling) bad('fatal', w, `sibling column ${r.sibling} != ref lane ${c.lane}`);
    const st = qStats(r.siblingQuote);
    if (st.words < 4 || st.words > 25 || st.nspace < 20) bad('major', w, `sibling_quote limits: words=${st.words} nonspace=${st.nspace}`);
    if (c.text === null || !c.text.includes(r.siblingQuote)) bad('fatal', w, `sibling_quote NOT verbatim at ${r.siblingRef}`);
  }
  const tm = /^([A-Za-z0-9_./-]+):([1-9][0-9]*)$/.exec(r.tabiRef);
  if (!tm) { bad('fatal', w, `tabi_ref malformed: ${r.tabiRef}`); continue; }
  const tLs = linesOf(blob(LANE, REV, tm[1]));
  const tLine = tLs[Number(tm[2]) - 1];
  if (tLine === undefined) { bad('fatal', w, `tabi line absent at REV: ${r.tabiRef}`); continue; }
  if (!tLine.includes(r.tabiQuote)) bad('fatal', w, `tabi_quote NOT verbatim at ${r.tabiRef} at REV`);
  const stT = qStats(r.tabiQuote);
  if (stT.words < 4 || stT.words > 25 || stT.nspace < 20) bad('major', w, `tabi_quote limits: words=${stT.words} nonspace=${stT.nspace}`);
  const baseSet = tabiFileAtBase(tm[1]);
  if (baseSet === null) bad('fatal', w, `tabi file ${tm[1]} absent at baseline`);
  else if (!baseSet.has(trimLine(tLine))) { /* NEW declaration — required */ }
  else bad('major', w, `tabi declaration line is NOT new: present (trimmed) at baseline in ${tm[1]}`);
  if (!new RegExp(`\\b${r.sibling.replace(/[^a-z0-9-]/g, '')}\\b`, 'i').test(r.tabiQuote)) bad('major', w, `tabi_quote does not name the sibling ${r.sibling}`);
  const dispOK = ['ruled', 'contested-open', 'refused-route'].includes(r.disposition) || (r.disposition === 'split-declared' && /\btabi\b/i.test(r.siblingQuote));
  if (!dispOK) bad('major', w, `disposition clause unmet: ${r.disposition}${r.disposition === 'split-declared' ? ' without \\btabi\\b in sibling_quote' : ''}`);
  if (['split-declared', 'refused-route'].includes(r.disposition)) {
    if (r.rulingRef !== '-') bad('major', w, `${r.disposition} must carry ruling_ref "-", got ${r.rulingRef}`);
    const whole = blob(LANE, REV, tm[1]).toString('utf8');
    const stR = qStats(r.rulingQuote);
    if (stR.words < 4 || stR.words > 25 || stR.nspace < 20) bad('major', w, `ruling_quote limits: words=${stR.words} nonspace=${stR.nspace}`);
    if (!whole.includes(r.rulingQuote)) bad('fatal', w, `ruling_quote NOT verbatim in tabi file ${tm[1]}`);
  } else {
    const rm = /^(fleet|[a-z0-9-]+-shokunin)@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/.exec(r.rulingRef);
    if (!rm) bad('major', w, `${r.disposition} ruling_ref malformed: ${r.rulingRef}`);
    else {
      const rRepo = rm[1] === 'fleet' ? FLEET : join(FLEET, rm[1]);
      const rLs = linesOf(blob(rRepo, rm[2], rm[3]));
      const rLine = rLs[Number(rm[4]) - 1];
      if (rLine === undefined) bad('fatal', w, `ruling line absent: ${r.rulingRef}`);
      else if (!rLine.includes(r.rulingQuote)) bad('fatal', w, `ruling_quote NOT verbatim at ${r.rulingRef}`);
      const stR = qStats(r.rulingQuote);
      if (stR.words < 4 || stR.words > 25 || stR.nspace < 20) bad('major', w, `ruling_quote limits: words=${stR.words} nonspace=${stR.nspace}`);
    }
  }
}

// ---- D. exactly-once coverage ----------------------------------------------------
const byText = new Map();
for (const r of verifiedRows) {
  const c = citedSibling(r.siblingRef);
  if (!c || c.path === 'PROVINCE.md' || c.text === null) continue;
  const k = `${c.lane}\u0000${c.path}\u0000${trimLine(c.text)}`;
  if (!byText.has(k)) byText.set(k, []);
  byText.get(k).push(r.rowNo);
}
const coverage = [];
const perCand = [];
for (const c of cands.values()) {
  const mappedBy = byText.get(`${c.lane}\u0000${c.path}\u0000${c.text.trim()}`) || [];
  const screenAt = seenScreen.get(c.key) || null;
  const accounts = mappedBy.length + (screenAt ? 1 : 0);
  perCand.push({ key: c.key, set: c.set, mappedBy, screenRow: screenAt, accounted: accounts > 0 });
  if (accounts === 0) coverage.push({ key: c.key, problem: 'unaccounted' });
  else if (accounts > 1 || (mappedBy.length > 1)) coverage.push({ key: c.key, problem: `appears ${accounts}x (map rows ${mappedBy.join(',')}, screen row ${screenAt})` });
}
const screenOrphans = [...seenScreen.keys()].filter((k) => !cands.has(k));
for (const k of screenOrphans) bad('fatal', 'screen', `screen key not in frozen list: ${k}`);

const out = {
  rev: REV, baseline: BASE,
  frozenCandidates: cands.size,
  setA: [...cands.values()].filter((c) => c.set === 'A').length,
  setB: [...cands.values()].filter((c) => c.set === 'B').length,
  listMatchesFrozen: !F.some((f) => f.where.startsWith('list-candidates')),
  map: { rows: mapNow.rows.length, verified: verifiedRows.length, flaggedRows: [...flagged].sort((a, b) => a - b), newRows: newRows.map((r) => ({ row: r.rowNo, surface: r.surface, sibling: r.sibling, disposition: r.disposition })) },
  screen: { rows: screenRows.length, byReason: Object.fromEntries(REASONS.map((x) => [x, screenRows.filter((r) => r.reason === x).length])) },
  coverage: { unaccounted: coverage.filter((x) => x.problem === 'unaccounted').length, multiAccounted: coverage.filter((x) => x.problem !== 'unaccounted'), perCandidateExactOnce: coverage.length === 0 },
  gate: { rc: gateRun.rc, verdict: gate?.verdict, rows: gate?.rows, verified: gate?.verified, findings: gate?.findings },
  gateText: { rc: gateText.rc, firstLine: gateText.stdout.trim().split('\n')[0] },
  counter: { rc: counterRun.rc, predicate: counter?.predicate, mapped: counter?.mapped, screened: counter?.screened, unaccounted: counter?.unaccounted, newMapped: counter?.newMapped, newMappedRows: counter?.newMappedRows, candidates: counter?.candidates, screenFindings: counter?.screenFindings, adjacency: counter?.adjacency, leadsReanchored: counter?.leadsReanchored, leadsUnresolved: counter?.leadsUnresolved },
  counterText: { rc: counterText.rc, firstLine: counterText.stdout.trim().split('\n')[0] },
  findings: F,
  verdict: F.some((f) => f.sev === 'fatal' || f.sev === 'major') ? 'DEFECT' : 'HOLDS',
};
console.log(JSON.stringify(out, null, 2));
process.exit(F.some((f) => f.sev === 'fatal') ? 3 : F.length ? 1 : 0);

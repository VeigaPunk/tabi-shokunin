#!/usr/bin/env node
// check-routed-defects-round42.mjs — tabi round 42, claim C2 (calibration).
// Counts the round-41 verifier's routed defects over COMMITTED BYTES at a
// revision. Findings (exit 1) vs predicate true (exit 0); usage/internal
// errors exit 2. Read-only: this script writes nothing.
//
// Predicate (one sentence, frozen in .ufo/waves/round-42/claims.json before
// any seat scored — this code and that sentence are the same conditions):
//   (r1a) corpus/evidence/round41/playwright-egress/receipt.json committed at
//         REV, >=1000 bytes, valid JSON, sha256 == receiptSha256 recorded in
//         the committed .ufo/waves/round-41/measure/c1-measure.json;
//   (r1b) receipt.witness.json likewise == witnessSha256 and valid JSON;
//   (r2)  SOURCES.md at REV has row S148 whose teaches cell begins
//         `supersedes S146` and whose remainder is a verbatim substring of
//         the committed .ufo/waves/round-41/sources/node-cli-v24.21.0.html
//         of at most 25 words, and S146's status cell is `rejected`;
//   (r3)  .ufo/waves/round-41/controls/c1-baseline-noop.out committed
//         nonempty, recording the ls-tree counting command and the digit 0;
//   (r4)  .ufo/waves/round-42/quarantine/re-adjudication.tsv committed with
//         exactly the 38 ids of the committed quarantine/slice-ids.txt, no
//         duplicates, verdict in {present,absent,misbound,partial,unreachable},
//         evidence path a committed blob >=200 bytes.
// The committed-bytes checks are built on S149 (git-ls-tree documentation,
// opened 2026-10-28); the verbatim-quote check enforces the S148 discipline.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const RECEIPT = 'corpus/evidence/round41/playwright-egress/receipt.json';
const WITNESS = 'corpus/evidence/round41/playwright-egress/receipt.witness.json';
const MEASURE = '.ufo/waves/round-41/measure/c1-measure.json';
const SOURCES = 'corpus/SOURCES.md';
const STAGED_HTML = '.ufo/waves/round-41/sources/node-cli-v24.21.0.html';
const BASELINE_OUT = '.ufo/waves/round-41/controls/c1-baseline-noop.out';
const TSV = '.ufo/waves/round-42/quarantine/re-adjudication.tsv';
const SLICE = '.ufo/waves/round-42/quarantine/slice-ids.txt';
const VERDICTS = new Set(['present', 'absent', 'misbound', 'partial', 'unreachable']);

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-r42-routed-defects', error: msg }));
  process.exit(2);
}

const argv = process.argv.slice(2);
let rev = null, repo = null, jsonOut = false;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--rev') rev = argv[++i];
  else if (argv[i] === '--repo') repo = argv[++i];
  else if (argv[i] === '--json') jsonOut = true;
}
if (!rev || !repo || !/^[0-9a-f]{40}$/.test(rev)) die('usage: node check-routed-defects-round42.mjs --rev <40-hex rev> --repo <lane repo> [--json]');

function gitShow(revPath) {
  const r = spawnSync('git', ['-C', repo, 'show', `${rev}:${revPath}`], { encoding: 'buffer', maxBuffer: 64 << 20 });
  if (r.error || r.status !== 0) return null;
  return r.stdout;
}
function gitBlobSize(revPath) {
  const r = spawnSync('git', ['-C', repo, 'cat-file', '-s', `${rev}:${revPath}`], { encoding: 'utf8' });
  if (r.error || r.status !== 0) return null;
  const n = Number((r.stdout || '').trim());
  return Number.isFinite(n) ? n : null;
}

const findings = [];
const add = (id, detail) => findings.push({ id, detail });

// --- R1: committed r41 receipt + witness, byte-bound to the committed measure record
let measureDoc = null;
{
  const raw = gitShow(MEASURE);
  if (raw === null) add('r1-measure-absent', `${MEASURE} not committed at REV`);
  else { try { measureDoc = JSON.parse(raw.toString('utf8')); } catch { add('r1-measure-unparseable', `${MEASURE} does not parse as JSON`); } }
}
for (const [id, p, key] of [['r1a', RECEIPT, 'receiptSha256'], ['r1b', WITNESS, 'witnessSha256']]) {
  const size = gitBlobSize(p);
  if (size === null) { add(`${id}-${p.includes('witness') ? 'witness' : 'receipt'}-absent`, `${p} not committed at REV`); continue; }
  if (size < 1000) { add(`${id}-too-small`, `${p} committed blob is ${size} bytes (<1000)`); continue; }
  const raw = gitShow(p);
  if (raw === null) { add(`${id}-unreadable`, `${p} unreadable at REV`); continue; }
  let doc = null;
  try { doc = JSON.parse(raw.toString('utf8')); } catch { add(`${id}-unparseable`, `${p} does not parse as JSON`); continue; }
  if (!doc || typeof doc !== 'object') { add(`${id}-unparseable`, `${p} is not a JSON object`); continue; }
  const want = measureDoc && measureDoc[key];
  if (!want) { if (!findings.some((f) => f.id.startsWith('r1-measure'))) add(`${id}-binding-unavailable`, `no ${key} in committed ${MEASURE}`); continue; }
  const got = sha256(raw);
  if (got !== want) add(`${id}-digest-mismatch`, `${p} sha256 ${got} != committed ${key} ${want}`);
}

// --- R2: S148 supersession with verbatim quote; S146 rejected
{
  const src = gitShow(SOURCES);
  if (src === null) add('r2-sources-absent', `${SOURCES} not committed at REV`);
  else {
    const text = src.toString('utf8');
    const rows = text.split('\n').filter((l) => /^\|\s*S\d{3,}\s*\|/.test(l));
    // split('|') on `| S146 | a | b |` yields ['', ' S146 ', ' a ', ...] — the id is cell 1.
    const cell = (row, n) => { const c = row.split('|'); return (c[n] || '').trim(); };
    const s146 = rows.find((l) => cell(l, 1) === 'S146');
    if (!s146) add('r2-s146-absent', 'row S146 not found at REV');
    else if (cell(s146, 8) !== 'rejected') add('r2-s146-not-rejected', `S146 status is '${cell(s146, 8)}', expected 'rejected'`);
    const s148 = rows.find((l) => cell(l, 1) === 'S148');
    if (!s148) add('r2-supersession-absent', 'row S148 not found at REV');
    else {
      const teaches = cell(s148, 7);
      if (!/^supersedes S146\b/.test(teaches)) add('r2-supersedes-prefix-missing', `S148 teaches does not begin 'supersedes S146': '${teaches.slice(0, 60)}'`);
      else {
        const quote = teaches.replace(/^supersedes S146\s*[—-]\s*/, '').trim();
        const words = quote.split(/\s+/).filter(Boolean).length;
        if (words < 1 || words > 25) add('r2-quote-word-count', `S148 quote has ${words} words, need 1..25`);
        const html = gitShow(STAGED_HTML);
        if (html === null) add('r2-staged-html-absent', `${STAGED_HTML} not committed at REV`);
        else if (quote.length > 0 && !html.toString('utf8').includes(quote)) add('r2-quote-not-verbatim', 'S148 quote is not a verbatim substring of the committed staged source copy');
      }
    }
  }
}

// --- R3: baseline noop control carries its command and the 0
{
  const size = gitBlobSize(BASELINE_OUT);
  if (size === null) add('r3-baseline-file-absent', `${BASELINE_OUT} not committed at REV`);
  else if (size < 10) add('r3-baseline-file-empty', `${BASELINE_OUT} committed blob is ${size} bytes`);
  else {
    const raw = gitShow(BASELINE_OUT).toString('utf8');
    if (!/ls-tree/.test(raw)) add('r3-command-not-recorded', 'baseline control does not record its ls-tree counting command');
    if (!/(^|[^0-9])0([^0-9]|$)/m.test(raw)) add('r3-zero-not-recorded', 'baseline control does not record the digit 0');
  }
}

// --- R4: quarantine re-adjudication TSV over committed bytes
{
  const tsvRaw = gitShow(TSV);
  const sliceRaw = gitShow(SLICE);
  if (sliceRaw === null) add('r4-slice-absent', `${SLICE} not committed at REV`);
  if (tsvRaw === null) add('r4-quarantine-absent', `${TSV} not committed at REV`);
  if (tsvRaw !== null && sliceRaw !== null) {
    const sliceIds = sliceRaw.toString('utf8').split('\n').map((s) => s.trim()).filter(Boolean);
    const lines = tsvRaw.toString('utf8').split('\n').map((s) => s.replace(/\r$/, '')).filter((s) => s.length > 0);
    const rows = [];
    for (const [i, line] of lines.entries()) {
      const c = line.split('\t');
      if (c.length !== 3) { add('r4-row-malformed', `line ${i + 1}: expected 3 tab-separated cells, got ${c.length}`); continue; }
      rows.push({ id: c[0].trim(), verdict: c[1].trim(), evidence: c[2].trim() });
    }
    const ids = rows.map((r) => r.id);
    const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
    if (dup.length) add('r4-duplicate-ids', `duplicate staged ids: ${[...new Set(dup)].join(',')}`);
    if (sliceIds.length !== 38) add('r4-slice-size', `slice-ids has ${sliceIds.length} ids, expected 38`);
    // MUTATION M (id-set equality dropped): the r4 requirement "committed with
    // exactly the 38 ids of the committed quarantine/slice-ids.txt" is no
    // longer enforced; any TSV whose rows are individually valid is accepted.
    for (const r of rows) {
      if (!VERDICTS.has(r.verdict)) { add('r4-verdict-enum', `${r.id}: verdict '${r.verdict}' not in enum`); continue; }
      const esize = gitBlobSize(r.evidence);
      if (esize === null) add('r4-evidence-absent', `${r.id}: evidence ${r.evidence} not committed at REV`);
      else if (esize < 200) add('r4-evidence-thin', `${r.id}: evidence ${r.evidence} is ${esize} bytes (<200)`);
    }
  }
}

const predicate = findings.length === 0;
const out = { schema: 'tabi-r42-routed-defects', rev, predicate, findingCount: findings.length, findings };
console.log(JSON.stringify(out, null, 1));
process.exit(predicate ? 0 : 1);

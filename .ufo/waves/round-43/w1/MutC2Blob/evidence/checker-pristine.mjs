#!/usr/bin/env node
// check-routed-defects-round43.mjs — tabi round 43, claim C2 (calibration).
// Closes the round-42 closure routed defects on the routed-defect checker:
//   (a) `git cat-file -t` must return `blob` before any size floor (r42 wave
//       CritPredicateSentence P-A accepted tree objects where the frozen
//       sentence said "committed blob"; S151 documents the type discipline);
//   (b) the round-41 measure record is pinned by its immutable git blob id
//       (r42 wave CritC2Ledger: `8ff64d691f5c09569a50f2a5a038bb23774c3d35`
//       is stable across the r41 closure, the r42 freeze and HEAD — a
//       self-authored replacement measure record cannot reproduce it);
//   (c) the committed V0-fabrication probe receipt must record the refusal of
//       the self-consistent fabrication (r42 wave CritC2Ledger V0);
//   (d) the round-43 claims freeze must bind every control it names by sha256
//       plus a verbatim quote line from the control bytes (r42 closure
//       conformance defect 1: the freeze enumerated five finding ids while
//       the committed control carried seven).
// Read-only: this script writes nothing.
//
// PREDICATE-SENTENCE: check-routed-defects-round43 counts zero findings at the measured revision where (r1a) corpus/evidence/round41/playwright-egress/receipt.json is committed as a blob at REV, >=1000 bytes, valid JSON, sha256 equal to the receiptSha256 recorded in the committed .ufo/waves/round-41/measure/c1-measure.json whose object id at REV equals the pinned measure blob id 8ff64d691f5c09569a50f2a5a038bb23774c3d35 AND (r1b) receipt.witness.json likewise as a blob with sha256 equal to the recorded witnessSha256 AND (r2) SOURCES.md at REV has row S148 whose teaches cell begins supersedes S146 with a verbatim remainder of at most 25 words inside the committed staged node CLI copy and row S146 status cell rejected AND (r3) the baseline control is committed nonempty recording its ls-tree command and the digit 0 AND (r4) the 38-row re-adjudication TSV is committed with exactly the committed slice ids, no duplicates, verdicts inside the frozen enum, and every evidence path a committed blob of >=200 bytes AND (r5) the round-43 claims freeze binds every control it names with the control sha256 and a verbatim quote line present in the committed control bytes AND (r6) the committed V0-fabrication probe receipt refuses the self-consistent fabrication with the measure-blob-pin finding and names the frozen generator digest.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const RECEIPT = 'corpus/evidence/round41/playwright-egress/receipt.json';
const WITNESS = 'corpus/evidence/round41/playwright-egress/receipt.witness.json';
const MEASURE = '.ufo/waves/round-41/measure/c1-measure.json';
const MEASURE_BLOB_PIN = '8ff64d691f5c09569a50f2a5a038bb23774c3d35';
const SOURCES = 'corpus/SOURCES.md';
const STAGED_HTML = '.ufo/waves/round-41/sources/node-cli-v24.21.0.html';
const BASELINE_OUT = '.ufo/waves/round-41/controls/c1-baseline-noop.out';
const TSV = '.ufo/waves/round-42/quarantine/re-adjudication.tsv';
const SLICE = '.ufo/waves/round-42/quarantine/slice-ids.txt';
const PROBE = '.ufo/waves/round-43/controls/c2-v0-probe.json';
const VERDICTS = new Set(['present', 'absent', 'misbound', 'partial', 'unreachable']);
const PREDICATE = 'check-routed-defects-round43 counts zero findings at the measured revision where (r1a) corpus/evidence/round41/playwright-egress/receipt.json is committed as a blob at REV, >=1000 bytes, valid JSON, sha256 equal to the receiptSha256 recorded in the committed .ufo/waves/round-41/measure/c1-measure.json whose object id at REV equals the pinned measure blob id 8ff64d691f5c09569a50f2a5a038bb23774c3d35 AND (r1b) receipt.witness.json likewise as a blob with sha256 equal to the recorded witnessSha256 AND (r2) SOURCES.md at REV has row S148 whose teaches cell begins supersedes S146 with a verbatim remainder of at most 25 words inside the committed staged node CLI copy and row S146 status cell rejected AND (r3) the baseline control is committed nonempty recording its ls-tree command and the digit 0 AND (r4) the 38-row re-adjudication TSV is committed with exactly the committed slice ids, no duplicates, verdicts inside the frozen enum, and every evidence path a committed blob of >=200 bytes AND (r5) the round-43 claims freeze binds every control it names with the control sha256 and a verbatim quote line present in the committed control bytes AND (r6) the committed V0-fabrication probe receipt refuses the self-consistent fabrication with the measure-blob-pin finding and names the frozen generator digest.';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-r43-routed-defects', error: msg }));
  process.exit(2);
}

const argv = process.argv.slice(2);
let rev = null, repo = null, jsonOut = false;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--rev') rev = argv[++i];
  else if (argv[i] === '--repo') repo = argv[++i];
  else if (argv[i] === '--json') jsonOut = true;
}
if (!rev || !repo || !/^[0-9a-f]{40}$/.test(rev)) die('usage: node check-routed-defects-round43.mjs --rev <40-hex rev> --repo <lane repo> [--json]');

function gitShow(revPath) {
  const r = spawnSync('git', ['-C', repo, 'show', `${rev}:${revPath}`], { encoding: 'buffer', maxBuffer: 64 << 20 });
  if (r.error || r.status !== 0) return null;
  return r.stdout;
}
function gitObjectType(revPath) {
  const r = spawnSync('git', ['-C', repo, 'cat-file', '-t', `${rev}:${revPath}`], { encoding: 'utf8' });
  if (r.error || r.status !== 0) return null;
  return (r.stdout || '').trim();
}
function gitBlobSize(revPath) {
  const r = spawnSync('git', ['-C', repo, 'cat-file', '-s', `${rev}:${revPath}`], { encoding: 'utf8' });
  if (r.error || r.status !== 0) return null;
  const n = Number((r.stdout || '').trim());
  return Number.isFinite(n) ? n : null;
}
function gitBlobId(revPath) {
  const r = spawnSync('git', ['-C', repo, 'rev-parse', `${rev}:${revPath}`], { encoding: 'utf8' });
  if (r.error || r.status !== 0) return null;
  return (r.stdout || '').trim() || null;
}
// Type gate (S151): every checked path must be a BLOB before any size floor —
// a tree at a checked path is a finding in its own right, not a size surprise.
function requireBlob(id, p) {
  const t = gitObjectType(p);
  if (t === null) { add(`${id}-absent`, `${p} not committed at REV`); return false; }
  if (t !== 'blob') { add(`${id}-not-a-blob`, `${p} resolves to object type '${t}', frozen sentence requires blob`); return false; }
  return true;
}

const findings = [];
const add = (id, detail) => findings.push({ id, detail });

// --- R1: committed r41 receipt + witness, byte-bound to the committed AND
// --- blob-id-pinned measure record
let measureDoc = null;
{
  if (requireBlob('r1-measure', MEASURE)) {
    const id = gitBlobId(MEASURE);
    if (id !== MEASURE_BLOB_PIN) add('r1-measure-blob-pin-mismatch', `${MEASURE} object id ${id} != pinned ${MEASURE_BLOB_PIN}`);
    const raw = gitShow(MEASURE);
    try { measureDoc = JSON.parse(raw.toString('utf8')); } catch { add('r1-measure-unparseable', `${MEASURE} does not parse as JSON`); }
  }
}
for (const [id, p, key] of [['r1a', RECEIPT, 'receiptSha256'], ['r1b', WITNESS, 'witnessSha256']]) {
  if (!requireBlob(id, p)) continue;
  const size = gitBlobSize(p);
  if (size === null) { add(`${id}-size-unavailable`, `${p} size unavailable at REV`); continue; }
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
  if (requireBlob('r2-sources', SOURCES)) {
    const src = gitShow(SOURCES);
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
        if (!requireBlob('r2-staged-html', STAGED_HTML)) { }
        else {
          const html = gitShow(STAGED_HTML);
          if (quote.length > 0 && !html.toString('utf8').includes(quote)) add('r2-quote-not-verbatim', 'S148 quote is not a verbatim substring of the committed staged source copy');
        }
      }
    }
  }
}

// --- R3: baseline noop control carries its command and the 0
{
  if (requireBlob('r3-baseline', BASELINE_OUT)) {
    const size = gitBlobSize(BASELINE_OUT);
    if (size < 10) add('r3-baseline-file-empty', `${BASELINE_OUT} committed blob is ${size} bytes`);
    else {
      const raw = gitShow(BASELINE_OUT).toString('utf8');
      if (!/ls-tree/.test(raw)) add('r3-command-not-recorded', 'baseline control does not record its ls-tree counting command');
      if (!/(^|[^0-9])0([^0-9]|$)/m.test(raw)) add('r3-zero-not-recorded', 'baseline control does not record the digit 0');
    }
  }
}

// --- R4: quarantine re-adjudication TSV over committed bytes; every evidence
// --- path must itself be a committed BLOB of >=200 bytes
{
  if (requireBlob('r4-slice', SLICE) && requireBlob('r4-tsv', TSV)) {
    const sliceRaw = gitShow(SLICE).toString('utf8');
    const tsvRaw = gitShow(TSV).toString('utf8');
    const sliceIds = sliceRaw.split('\n').map((s) => s.trim()).filter(Boolean).sort();
    const rows = tsvRaw.split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
    const tsvIds = [];
    const badVerdicts = [];
    const evidence = [];
    for (const row of rows) {
      const cols = row.split('\t');
      if (cols.length < 3) { add('r4-row-malformed', row.slice(0, 80)); continue; }
      tsvIds.push(cols[0]);
      if (!VERDICTS.has(cols[1])) badVerdicts.push(`${cols[0]}:${cols[1]}`);
      if (cols[2]) evidence.push([cols[0], cols[2]]);
    }
    const idSort = [...tsvIds].sort();
    if (JSON.stringify(idSort) !== JSON.stringify(sliceIds)) add('r4-id-set-mismatch', `TSV ids ${idSort.length} vs slice ids ${sliceIds.length} or set drift`);
    if (new Set(tsvIds).size !== tsvIds.length) add('r4-duplicate-ids', 'TSV carries duplicate row ids');
    if (badVerdicts.length) add('r4-verdict-enum', `verdicts outside enum: ${badVerdicts.slice(0, 5).join(', ')}`);
    for (const [rid, p] of evidence) {
      if (!requireBlob(`r4-ev-${rid}`, p)) continue;
      const size = gitBlobSize(p);
      if (size === null || size < 200) add(`r4-ev-${rid}-too-small`, `${p} is ${size} bytes (<200)`);
    }
  }
}

// --- R5: the round-43 claims freeze binds every named control by sha256 plus
// --- a verbatim quote line from the control bytes
{
  if (requireBlob('r5-claims', '.ufo/waves/round-43/claims.json')) {
    let claims = null;
    try { claims = JSON.parse(gitShow('.ufo/waves/round-43/claims.json').toString('utf8')); } catch { add('r5-claims-unparseable', 'round-43 claims.json does not parse'); }
    const binds = claims && Array.isArray(claims.controlBindings) ? claims.controlBindings : null;
    if (!binds) add('r5-freeze-bindings-absent', 'claims.json carries no controlBindings array');
    else if (binds.length < 5) add('r5-freeze-bindings-thin', `only ${binds.length} controls bound, need >=5`);
    else for (const b of binds) {
      const tag = b.path ? b.path.replace(/[^A-Za-z0-9./_-]/g, '').slice(-40) : 'unnamed';
      if (!b.path || !/^[0-9a-f]{64}$/.test(b.sha256 || '')) { add('r5-binding-malformed', tag); continue; }
      if (!requireBlob(`r5-ctl-${tag}`, b.path)) continue;
      const raw = gitShow(b.path);
      if (sha256(raw) !== b.sha256) add('r5-binding-sha-mismatch', `${b.path} sha256 ${sha256(raw)} != frozen ${b.sha256}`);
      if (typeof b.quote !== 'string' || b.quote.length < 8 || !raw.toString('utf8').includes(b.quote)) add('r5-binding-quote-absent', `${b.path} quote line not found verbatim in committed control bytes`);
    }
  }
}

// --- R6: the committed V0-fabrication probe receipt refuses the fabrication
{
  if (requireBlob('r6-probe', PROBE)) {
    let probe = null;
    try { probe = JSON.parse(gitShow(PROBE).toString('utf8')); } catch { add('r6-probe-unparseable', `${PROBE} does not parse as JSON`); }
    if (probe) {
      if (probe.refused !== true) add('r6-probe-not-refused', 'V0 probe receipt does not record refused=true');
      const ids = Array.isArray(probe.findingIds) ? probe.findingIds : [];
      if (!ids.includes('r1-measure-blob-pin-mismatch')) add('r6-probe-pin-finding-absent', 'probe receipt does not record the measure-blob-pin finding');
      if (!/^[0-9a-f]{40}$/.test(probe.fixtureRev || '')) add('r6-probe-fixture-rev', 'probe receipt names no fixture revision');
      if (!/^[0-9a-f]{64}$/.test(probe.generatorDigest || '')) add('r6-probe-generator-digest', 'probe receipt names no generator digest');
    }
  }
}

const predicate = findings.length === 0;
const out = { schema: 'tabi-r43-routed-defects', predicateSentence: PREDICATE, rev, predicate, findingCount: findings.length, findings };
console.log(JSON.stringify(out, null, 1));
process.exit(predicate ? 0 : 1);

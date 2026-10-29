#!/usr/bin/env node
// Independent re-derivation of the six C2 branches at a given REV.
// Deliberately does NOT import or reuse check-routed-defects-round43.mjs logic;
// every branch is re-derived with direct git plumbing + sha256, so a "0 findings"
// result at the freeze rev can be checked for vacuity.
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
let rev = null, repo = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--rev') rev = argv[++i];
  else if (argv[i] === '--repo') repo = argv[++i];
}
if (!rev || !repo) { console.error('usage: --rev <hex> --repo <path>'); process.exit(2); }

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const git = (args, enc = 'buffer') => {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: enc, maxBuffer: 256 << 20 });
  return r.status === 0 ? r.stdout : null;
};
const typeOf = (p) => { const t = git(['cat-file', '-t', `${rev}:${p}`], 'utf8'); return t === null ? null : t.trim(); };
const blobOf = (p) => { const t = typeOf(p); if (t !== 'blob') return null; return git(['show', `${rev}:${p}`]); };
const sizeOf = (p) => Number(String(git(['cat-file', '-s', `${rev}:${p}`], 'utf8') || '').trim());
const idOf = (p) => String(git(['rev-parse', `${rev}:${p}`], 'utf8') || '').trim();

const out = { rev, repo, branches: {} };
const note = (b, kv) => { out.branches[b] = Object.assign(out.branches[b] || {}, kv); };

// R1a/R1b + measure blob pin
const MEASURE = '.ufo/waves/round-41/measure/c1-measure.json';
const MEASURE_PIN = '8ff64d691f5c09569a50f2a5a038bb23774c3d35';
const measureRaw = blobOf(MEASURE);
let measure = null;
if (measureRaw) { try { measure = JSON.parse(measureRaw.toString('utf8')); } catch { /* unparseable */ } }
note('r1-measure', { type: typeOf(MEASURE), blobId: idOf(MEASURE), pin: MEASURE_PIN, pinMatches: idOf(MEASURE) === MEASURE_PIN });
for (const [k, p, key] of [['r1a', 'corpus/evidence/round41/playwright-egress/receipt.json', 'receiptSha256'], ['r1b', 'corpus/evidence/round41/playwright-egress/receipt.witness.json', 'witnessSha256']]) {
  const raw = blobOf(p);
  let parsed = null, parseOk = false;
  if (raw) { try { parsed = JSON.parse(raw.toString('utf8')); parseOk = true; } catch { parseOk = false; } }
  note(k, {
    type: typeOf(p), size: sizeOf(p), sizeOk: sizeOf(p) >= 1000, jsonOk: parseOk,
    sha256: raw ? sha(raw) : null,
    recorded: measure ? measure[key] : null,
    digestMatches: raw && measure ? sha(raw) === measure[key] : false,
  });
}

// R2 S148 / S146
const src = blobOf('corpus/SOURCES.md');
if (src) {
  const rows = src.toString('utf8').split('\n').filter((l) => /^\|\s*S\d{3,}\s*\|/.test(l));
  const cell = (row, n) => (row.split('|')[n] || '').trim();
  const s146 = rows.find((l) => cell(l, 1) === 'S146');
  const s148 = rows.find((l) => cell(l, 1) === 'S148');
  const teaches = s148 ? cell(s148, 7) : null;
  const quote = teaches ? teaches.replace(/^supersedes S146\s*[—-]\s*/, '').trim() : null;
  const words = quote ? quote.split(/\s+/).filter(Boolean).length : null;
  const html = blobOf('.ufo/waves/round-41/sources/node-cli-v24.21.0.html');
  note('r2', {
    s146Present: !!s146, s146Status: s146 ? cell(s146, 8) : null,
    s148Present: !!s148, teaches: teaches,
    prefixOk: !!teaches && /^supersedes S146\b/.test(teaches),
    quote, quoteWords: words, quoteWordCountOk: words !== null && words >= 1 && words <= 25,
    stagedHtmlType: typeOf('.ufo/waves/round-41/sources/node-cli-v24.21.0.html'),
    quoteVerbatim: !!quote && !!html && html.toString('utf8').includes(quote),
  });
}

// R3 baseline noop control
const B = '.ufo/waves/round-41/controls/c1-baseline-noop.out';
const braw = blobOf(B);
note('r3', {
  type: typeOf(B), size: sizeOf(B), sizeOk: sizeOf(B) >= 10,
  recordsLsTree: braw ? /ls-tree/.test(braw.toString('utf8')) : false,
  recordsZero: braw ? /(^|[^0-9])0([^0-9]|$)/m.test(braw.toString('utf8')) : false,
});

// R4 quarantine TSV
const SLICE = '.ufo/waves/round-42/quarantine/slice-ids.txt';
const TSV = '.ufo/waves/round-42/quarantine/re-adjudication.tsv';
const VERDICTS = new Set(['present', 'absent', 'misbound', 'partial', 'unreachable']);
const sliceRaw = blobOf(SLICE), tsvRaw = blobOf(TSV);
if (sliceRaw && tsvRaw) {
  const sliceIds = sliceRaw.toString('utf8').split('\n').map((s) => s.trim()).filter(Boolean).sort();
  const rows = tsvRaw.toString('utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
  const ids = [], badV = [], ev = [];
  for (const row of rows) {
    const c = row.split('\t');
    if (c.length < 3) { badV.push(`malformed:${row.slice(0, 40)}`); continue; }
    ids.push(c[0]);
    if (!VERDICTS.has(c[1])) badV.push(`${c[0]}:${c[1]}`);
    if (c[2]) ev.push([c[0], c[2]]);
  }
  const idSort = [...ids].sort();
  const evBad = [];
  for (const [rid, p] of ev) {
    const t = typeOf(p);
    const sz = sizeOf(p);
    if (t !== 'blob' || !(sz >= 200)) evBad.push(`${rid}:${p} type=${t} size=${sz}`);
  }
  note('r4', {
    sliceType: typeOf(SLICE), tsvType: typeOf(TSV),
    sliceIdCount: sliceIds.length, tsvRowCount: rows.length,
    idSetMatches: JSON.stringify(idSort) === JSON.stringify(sliceIds),
    duplicateIds: new Set(ids).size !== ids.length,
    badVerdicts: badV, evidencePathCount: ev.length, evidencePathsNotBlobOrTooSmall: evBad,
  });
}

// R5 claims freeze binds controls by sha256 + verbatim quote
const CLAIMS = '.ufo/waves/round-43/claims.json';
const claimsRaw = blobOf(CLAIMS);
if (claimsRaw) {
  const claims = JSON.parse(claimsRaw.toString('utf8'));
  const binds = Array.isArray(claims.controlBindings) ? claims.controlBindings : [];
  const rows = binds.map((b) => {
    const raw = blobOf(b.path);
    return {
      path: b.path,
      committedType: typeOf(b.path),
      committed: raw !== null,
      sha256Matches: raw ? sha(raw) === b.sha256 : false,
      quoteVerbatim: raw && typeof b.quote === 'string' && b.quote.length >= 8 ? raw.toString('utf8').includes(b.quote) : false,
      quote: b.quote,
      sha256Frozen: b.sha256,
      sha256Committed: raw ? sha(raw) : null,
    };
  });
  note('r5', {
    claimsType: typeOf(CLAIMS), bindingCount: binds.length, atLeast5: binds.length >= 5,
    allShaMatch: rows.every((r) => r.sha256Matches),
    allQuotesVerbatim: rows.every((r) => r.quoteVerbatim),
    rows,
  });
}

// R6 V0 probe receipt
const PROBE = '.ufo/waves/round-43/controls/c2-v0-probe.json';
const praw = blobOf(PROBE);
if (praw) {
  const probe = JSON.parse(praw.toString('utf8'));
  note('r6', {
    probeType: typeOf(PROBE),
    refused: probe.refused === true,
    findingIds: probe.findingIds,
    hasPinFinding: Array.isArray(probe.findingIds) && probe.findingIds.includes('r1-measure-blob-pin-mismatch'),
    fixtureRev: probe.fixtureRev, fixtureRevHex40: /^[0-9a-f]{40}$/.test(probe.fixtureRev || ''),
    generatorDigest: probe.generatorDigest, generatorDigestHex64: /^[0-9a-f]{64}$/.test(probe.generatorDigest || ''),
  });
} else {
  note('r6', { probeType: typeOf(PROBE), committed: false });
}

console.log(JSON.stringify(out, null, 1));

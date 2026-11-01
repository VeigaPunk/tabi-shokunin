#!/usr/bin/env node
// check-r44-freeze-round45.mjs — tabi round 45, claim C1 checker (calibration:
// the r5 hardening applied to the round-44 freeze itself, closing routed defect
// D1 from the r44 non-author closure). Scores the round-44 freeze on
// committed-byte grounds:
//   PREDICATE-SENTENCE: check-r44-freeze-round45 admits the lane state at REV where the round-44 claims freeze blob id at REV equals the pinned id a38b24ee66108fb8c55e7f08463732c378bc28f6 AND every frozenDigests entry hashes equal to the committed bytes of its path at REV, except an entry whose committed bytes differ, which is admitted only when the append-only amendment file .ufo/waves/round-44/claims-amendments.json exists at REV and carries exactly one entry for that path whose oldDigest equals the freeze's pinned digest, whose newDigest equals the sha256 of the actual committed bytes at REV (a relabel of the stale digest is refused), and whose round, defect and reason fields name round 45, defect D1 and a nonempty reason AND every amendment entry corresponds to exactly one such stale freeze entry (an invented repin is refused) AND every controlBindings entry of the freeze has a string path committed at REV whose bytes hash to the binding sha256 and carries a quote equal to one complete committed line of those bytes, with no path bound more than once AND every controls path named in the freeze text outside its controlBindings array — as a full path or as a bare basename resolved against the freeze's own controls directory — is bound at least once.
// The before-state this checker closes (r44 closure D1): the freeze's entry for
// .ufo/waves/round-44/counters/chrome-cdp-receipt-r44.mjs pins the pre-amendment
// digest d994ab716df4cb97ab007f7f955b000df1091265e77993e7f06331de4b3feb72 while
// the committed bytes hash to f796ae84085087b6acde10a7d32787e95589f3202386f33bce7d8dfaaf101cc5.
// At a rev without the amendment file this checker exits 1 with
// frozen-digest-stale — the honest red the repin answers.
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import path from 'node:path';

const FREEZE_REL = '.ufo/waves/round-44/claims.json';
const FREEZE_BLOB_PIN = 'a38b24ee66108fb8c55e7f08463732c378bc28f6';
const AMENDMENT_REL = '.ufo/waves/round-44/claims-amendments.json';
const CONTROLS_DIR = '.ufo/waves/round-44/controls/';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-r44-freeze-check-r45', error: msg }));
  process.exit(2);
}

// --- pure core: verification over supplied readers (selftest reuses it) ------
// inputs: freezeRaw (string), blobId (string|null), amendmentRaw (string|null),
// fileAt(path) -> { bytes: Buffer, blobId: string } | null
export function verify(inputs) {
  const findings = [];
  const add = (id, detail) => findings.push({ id, detail });

  if (inputs.blobId !== FREEZE_BLOB_PIN) add('freeze-blob-mismatch', `${inputs.blobId} != pinned ${FREEZE_BLOB_PIN}`);
  let freeze = null;
  try { freeze = JSON.parse(inputs.freezeRaw); } catch { add('freeze-unparseable', 'claims.json'); }
  if (!freeze) return { findings };

  let amendment = null;
  if (inputs.amendmentRaw === null) add('amendment-missing', AMENDMENT_REL);
  else {
    try { amendment = JSON.parse(inputs.amendmentRaw); } catch { add('amendment-unparseable', AMENDMENT_REL); }
    if (amendment && !Array.isArray(amendment.entries)) add('amendment-shape', 'entries array missing');
  }

  // R1 — frozenDigests byte-binding with amendment-gated repins
  const stalePaths = new Set();
  if (freeze.frozenDigests && typeof freeze.frozenDigests === 'object') {
    for (const [p, digest] of Object.entries(freeze.frozenDigests)) {
      const f = inputs.fileAt(p);
      if (!f) { add('frozen-path-missing', p); continue; }
      const actual = sha256(f.bytes);
      if (actual === digest) continue;
      stalePaths.add(p);
      const entries = amendment && Array.isArray(amendment.entries)
        ? amendment.entries.filter((e) => e && e.path === p) : [];
      if (entries.length === 0) { add('frozen-digest-stale', `${p}: pinned ${digest.slice(0, 12)} != committed ${actual.slice(0, 12)}`); continue; }
      if (entries.length > 1) { add('amendment-duplicate', p); continue; }
      const e = entries[0];
      if (e.oldDigest !== digest) add('amendment-old-mismatch', `${p}: oldDigest ${String(e.oldDigest).slice(0, 12)} != freeze pin ${digest.slice(0, 12)}`);
      if (e.newDigest !== actual) add('amendment-new-mismatch', `${p}: newDigest ${String(e.newDigest).slice(0, 12)} != committed ${actual.slice(0, 12)}`);
      if (e.round !== 45) add('amendment-round', `${p}: ${JSON.stringify(e.round)}`);
      if (e.defect !== 'D1') add('amendment-defect', `${p}: ${JSON.stringify(e.defect)}`);
      if (typeof e.reason !== 'string' || e.reason.length === 0) add('amendment-reason', p);
    }
  } else add('frozen-digests-missing', 'frozenDigests object missing');

  // every amendment entry must answer exactly one stale freeze entry
  if (amendment && Array.isArray(amendment.entries)) {
    for (const e of amendment.entries) {
      if (!e || typeof e.path !== 'string' || !stalePaths.has(e.path)) add('amendment-unbound', e && e.path);
    }
  }

  // R2 — controlBindings clauses (v2 semantics on the r44 freeze)
  const bindings = Array.isArray(freeze.controlBindings) ? freeze.controlBindings : [];
  const bound = new Map();
  for (const b of bindings) {
    if (typeof b?.path !== 'string') { add('r45-binding-path-type', JSON.stringify(b?.path)); continue; }
    if (bound.has(b.path)) { add('r45-binding-duplicate', b.path); continue; }
    bound.set(b.path, b);
    const f = inputs.fileAt(b.path);
    if (!f) { add('r45-binding-path-missing', b.path); continue; }
    if (b.sha256 !== sha256(f.bytes)) add('r45-binding-sha256', b.path);
    const lines = f.bytes.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));
    if (typeof b.quote !== 'string' || !lines.includes(b.quote)) add('r45-binding-quote-not-whole-line', b.path);
  }

  // R3 — named-control coverage: every controls path named in the freeze text
  // outside its controlBindings array is bound at least once. A bare basename
  // names the candidate resolved against the freeze's own controls directory
  // when that candidate is a committed control file at REV (or is bound).
  const outside = JSON.stringify({ ...freeze, controlBindings: undefined });
  const named = new Set();
  for (const m of outside.matchAll(/\.ufo\/waves\/round-44\/controls\/[A-Za-z0-9._-]+/g)) named.add(m[0]);
  for (const m of outside.matchAll(/[A-Za-z0-9._-]+\.json/g)) {
    const candidate = CONTROLS_DIR + m[0];
    if (bound.has(candidate) || inputs.fileAt(candidate) !== null) named.add(candidate);
  }
  for (const n of named) if (!bound.has(n)) add('r45-named-control-unbound', n);

  return { findings };
}

// --- git layer ----------------------------------------------------------------
function gitBytes(repo, rev, rel) {
  const r = spawnSync('git', ['-C', repo, 'cat-file', '-p', `${rev}:${rel}`], { maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) return null;
  return r.stdout;
}
function gitBlobId(repo, rev, rel) {
  const r = spawnSync('git', ['-C', repo, 'ls-tree', rev, '--', rel], { maxBuffer: 1024 * 1024 });
  if (r.status !== 0) return null;
  const m = r.stdout.toString('utf8').match(/^100644 blob ([0-9a-f]{40})\t/);
  return m ? m[1] : null;
}

function runAt(repo, rev) {
  const freezeRaw = gitBytes(repo, rev, FREEZE_REL);
  if (freezeRaw === null) die(`cannot read ${FREEZE_REL} at ${rev}`);
  return verify({
    freezeRaw: freezeRaw.toString('utf8'),
    blobId: gitBlobId(repo, rev, FREEZE_REL),
    amendmentRaw: gitBytes(repo, rev, AMENDMENT_REL)?.toString('utf8') ?? null,
    fileAt: (p) => {
      const bytes = gitBytes(repo, rev, p);
      if (bytes === null) return null;
      return { bytes, blobId: gitBlobId(repo, rev, p) };
    },
  });
}

// --- selftest -------------------------------------------------------------------
function selftest() {
  const line = ' "fixture": "honest",';
  const other = '{"k": "v"}';
  const FP_A = CONTROLS_DIR + 'a.json';
  const FP_B = '.ufo/waves/round-44/counters/b.mjs'; // the stale instrument path (mirrors the real D1: a counter, not a control)
  const FP_C = CONTROLS_DIR + 'c.json';
  const freezeBytes = (o) => Buffer.from(JSON.stringify(o, null, 1) + '\n', 'utf8');
  const baseFreeze = () => ({
    frozenDigests: { [FP_A]: sha256(Buffer.from(line)) },
    controlBindings: [{ path: FP_A, sha256: sha256(Buffer.from(line)), quote: line }],
    beforeState: `mentions ${FP_A} in prose`,
  });
  const amend = (p, oldD, newD, extra = {}) => ({ entries: [{ path: p, oldDigest: oldD, newDigest: newD, round: 45, defect: 'D1', reason: 'r44 D1 stale instrument pin', ...extra }] });
  const files = (o) => (p) => (p in o ? { bytes: o[p], blobId: FREEZE_BLOB_PIN } : null);

  const honestFreeze = freezeBytes(baseFreeze());
  const stalePin = sha256(Buffer.from('old-bytes'));
  const staleFreezeObj = baseFreeze();
  staleFreezeObj.frozenDigests[FP_B] = stalePin; // the stale entry: an instrument path, not a controls/ binding
  const staleFreeze = freezeBytes(staleFreezeObj);
  const bNew = Buffer.from('new committed bytes for b\n');
  const staleFiles = { [FP_A]: Buffer.from(line), [FP_B]: bNew };

  const cases = [
    { name: 'honest-green', expect: 0, run: () => verify({ freezeRaw: honestFreeze.toString('utf8'), blobId: FREEZE_BLOB_PIN, amendmentRaw: JSON.stringify({ entries: [] }), fileAt: files({ [FP_A]: Buffer.from(line) }) }) },
    { name: 'blob-mismatch', expect: 1, ids: ['freeze-blob-mismatch'], run: () => verify({ freezeRaw: honestFreeze.toString('utf8'), blobId: '0'.repeat(40), amendmentRaw: '{"entries":[]}', fileAt: files({ [FP_A]: Buffer.from(line) }) }) },
    { name: 'stale-uncovered', expect: 1, ids: ['frozen-digest-stale'], run: () => verify({ freezeRaw: staleFreeze.toString('utf8'), blobId: FREEZE_BLOB_PIN, amendmentRaw: null, fileAt: files(staleFiles) }) },
    { name: 'stale-amendment-green', expect: 0, run: () => verify({ freezeRaw: staleFreeze.toString('utf8'), blobId: FREEZE_BLOB_PIN, amendmentRaw: JSON.stringify(amend(FP_B, stalePin, sha256(bNew))), fileAt: files(staleFiles) }) },
    { name: 'relabel-refused', expect: 1, ids: ['amendment-new-mismatch'], run: () => verify({ freezeRaw: staleFreeze.toString('utf8'), blobId: FREEZE_BLOB_PIN, amendmentRaw: JSON.stringify(amend(FP_B, stalePin, stalePin)), fileAt: files(staleFiles) }) },
    { name: 'invented-repin-refused', expect: 1, ids: ['amendment-unbound'], run: () => verify({ freezeRaw: honestFreeze.toString('utf8'), blobId: FREEZE_BLOB_PIN, amendmentRaw: JSON.stringify(amend(FP_A, stalePin, sha256(Buffer.from(line)))), fileAt: files({ [FP_A]: Buffer.from(line) }) }) },
    { name: 'duplicate-binding', expect: 1, ids: ['r45-binding-duplicate'], run: () => { const o = baseFreeze(); o.controlBindings.push({ path: FP_A, sha256: sha256(Buffer.from(line)), quote: line }); return verify({ freezeRaw: freezeBytes(o).toString('utf8'), blobId: FREEZE_BLOB_PIN, amendmentRaw: '{"entries":[]}', fileAt: files({ [FP_A]: Buffer.from(line) }) }); } },
    { name: 'fragment-quote-refused', expect: 1, ids: ['r45-binding-quote-not-whole-line'], run: () => { const o = baseFreeze(); o.controlBindings[0].quote = '"fixture"'; return verify({ freezeRaw: freezeBytes(o).toString('utf8'), blobId: FREEZE_BLOB_PIN, amendmentRaw: '{"entries":[]}', fileAt: files({ [FP_A]: Buffer.from(line) }) }); } },
    { name: 'untyped-path-refused', expect: 1, ids: ['r45-binding-path-type'], run: () => { const o = baseFreeze(); o.controlBindings[0].path = 7; return verify({ freezeRaw: freezeBytes(o).toString('utf8'), blobId: FREEZE_BLOB_PIN, amendmentRaw: '{"entries":[]}', fileAt: files({ [FP_A]: Buffer.from(line) }) }); } },
    { name: 'named-control-unbound', expect: 1, ids: ['r45-named-control-unbound'], run: () => { const o = baseFreeze(); o.beforeState += ` and ${FP_C}`; return verify({ freezeRaw: freezeBytes(o).toString('utf8'), blobId: FREEZE_BLOB_PIN, amendmentRaw: '{"entries":[]}', fileAt: files({ [FP_A]: Buffer.from(line), [FP_C]: Buffer.from(other) }) }); } },
    { name: 'sha-mismatch-refused', expect: 1, ids: ['r45-binding-sha256'], run: () => { const o = baseFreeze(); o.controlBindings[0].sha256 = sha256(Buffer.from(other)); return verify({ freezeRaw: freezeBytes(o).toString('utf8'), blobId: FREEZE_BLOB_PIN, amendmentRaw: '{"entries":[]}', fileAt: files({ [FP_A]: Buffer.from(line) }) }); } },
  ];
  let pass = 0;
  const results = cases.map((c) => {
    const { findings } = c.run();
    // red cases: every named finding id present (extra findings allowed);
    // green cases (expect 0): no findings at all.
    const ok = c.expect === 0
      ? findings.length === 0
      : (c.ids || []).every((id) => findings.some((f) => f.id === id));
    if (ok) pass++;
    return { name: c.name, ok, findings: findings.map((f) => f.id) };
  });
  return { allPass: pass === cases.length, cases: cases.length, pass, results };
}

// --- cli -----------------------------------------------------------------------
const args = process.argv.slice(2);
if (args[0] === '--selftest') {
  const st = selftest();
  console.log(JSON.stringify({ schema: 'tabi-r44-freeze-check-r45-selftest', ...st }, null, 1));
  process.exit(st.allPass ? 0 : 1);
}
let repo = null, rev = null, json = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--repo') repo = args[++i];
  else if (args[i] === '--rev') rev = args[++i];
  else if (args[i] === '--json') json = true;
}
if (!repo || !rev) die('usage: node check-r44-freeze-round45.mjs --rev <REV> --repo <lane> [--json] | --selftest');
const { findings } = runAt(repo, rev);
const out = {
  schema: 'tabi-r44-freeze-check-r45',
  predicateSentence: 'check-r44-freeze-round45 admits the lane state at REV where the round-44 claims freeze blob id at REV equals the pinned id a38b24ee66108fb8c55e7f08463732c378bc28f6 AND every frozenDigests entry hashes equal to the committed bytes of its path at REV, except an entry whose committed bytes differ, which is admitted only when the append-only amendment file .ufo/waves/round-44/claims-amendments.json exists at REV and carries exactly one entry for that path whose oldDigest equals the freeze\'s pinned digest, whose newDigest equals the sha256 of the actual committed bytes at REV (a relabel of the stale digest is refused), and whose round, defect and reason fields name round 45, defect D1 and a nonempty reason AND every amendment entry corresponds to exactly one such stale freeze entry (an invented repin is refused) AND every controlBindings entry of the freeze has a string path committed at REV whose bytes hash to the binding sha256 and carries a quote equal to one complete committed line of those bytes, with no path bound more than once AND every controls path named in the freeze text outside its controlBindings array — as a full path or as a bare basename resolved against the freeze\'s own controls directory — is bound at least once.',
  rev, repo: path.resolve(repo),
  predicate: findings.length === 0, findingCount: findings.length, findings,
};
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);

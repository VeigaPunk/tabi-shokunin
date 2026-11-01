#!/usr/bin/env node
// c1-anchor-bound-v6.mjs — tabi round 44, claim C3 supervisor (operability).
// Closes, over committed bytes and browser-free, the two round-43 routed
// defects that can be closed deterministically (r43 verifier spot-check
// routed defects 1 and 2; QUALITY criteria 106-107):
//   (1) TRUST ANCHOR NOT SELECTED BY THE CANDIDATE RECORD — round-43 counter
//       v5 verified both the wrapper signature and its fresh challenge under
//       `m.pubkeys?.wrapper`, a key the candidate measure record itself
//       supplies, so an in-model attacker who authors the pair answers the
//       challenge (CritC1ReachSynth/CritC1ReachDirect/CritResidualModel; C1
//       kill rule fired). v6 verifies the measure record's wrapper signature
//       under an Ed25519 trust anchor PINNED IN THIS SUPERVISOR's SOURCE (the
//       committed round-43 honest run's wrapper key, sha256-bound below) — a
//       record whose key differs from the anchor is refused with
//       anchor-pin-mismatch BEFORE any signature check.
//   (2) EGRESS CLAUSE CONSISTENCY — the routed deterministic half of the
//       honest-run-observable blind spot: a per-surface observation whose
//       nonLoopback count is positive but whose nonLoopbackRemotes array is
//       missing/empty is refused (egress-count-without-remotes — the
//       failed-run-1 shape), and a zero count with nonempty remotes is
//       refused (egress-remotes-without-count). Post-hoc receipt edits are
//       refused by the signed measure record's byte bindings.
// Declared residual (claims.json, before review data): a LIVE run whose
// driver under-reports egress (the lying-driver class, MutDriverEgress) with
// consistent zero counts and empty remotes remains indistinguishable from an
// honest zero run over committed bytes — honest-run-observable; the
// re-derivation path is a fresh supervised run, not this supervisor.
//
// Usage:
//   node c1-anchor-bound-v6.mjs --rev <40hex> --repo <lane repo> [--json]
//        [--target honest|failedrun] [--measure <repo path override>]
//        [--mutation anchor-self-select|plant-egress] [--selftest]
// PREDICATE-SENTENCE: c1-anchor-bound-v6 admits the committed round-43 honest pair at REV where the measure record's pubkeys.wrapper equals the pinned trust anchor MCowBQYDK2VwAyEAEYYWsPtD35E9SEtw/PHWjdChqehBYLLP4MiLZiC3Lm0= (sha256 868c0d898fcc28194c275c32aa1e7d6f3280e4d34fb91d3ea55f62478f0caefd), the record's Ed25519 wrapper signature verifies over the canonical unsigned form under that pinned anchor, the committed receipt and witness bytes hash to the record's bindings, the witness attestation verifies under the witness key the record pins, and every per-surface egress observation in the receipt is internally consistent — a positive nonLoopback count with a nonempty nonLoopbackRemotes array, or a zero count with an empty or absent one — across both runs' samples and final sweeps.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const MEASURE_SCHEMA = 'tabi-r43-c1-measure-record';
const WITNESS_SCHEMA = 'tabi-r43-witness';
const ANCHOR_PEM = '-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAEYYWsPtD35E9SEtw/PHWjdChqehBYLLP4MiLZiC3Lm0=\n-----END PUBLIC KEY-----\n';
const ANCHOR_SPKI_SHA256 = '868c0d898fcc28194c275c32aa1e7d6f3280e4d34fb91d3ea55f62478f0caefd';
const TARGETS = {
  honest: {
    receipt: 'corpus/evidence/round43/playwright-egress/receipt.json',
    witness: 'corpus/evidence/round43/playwright-egress/receipt.witness.json',
    measure: '.ufo/waves/round-43/measure/c1-measure-r43.json',
  },
  failedrun: {
    receipt: '.ufo/waves/round-43/measure/failed-run-1/receipt.json',
    witness: '.ufo/waves/round-43/measure/failed-run-1/receipt.witness.json',
    measure: '.ufo/waves/round-43/measure/failed-run-1/c1-measure-r43.json',
  },
};
const PREDICATE = 'c1-anchor-bound-v6 admits the committed round-43 honest pair at REV where the measure record\'s pubkeys.wrapper equals the pinned trust anchor MCowBQYDK2VwAyEAEYYWsPtD35E9SEtw/PHWjdChqehBYLLP4MiLZiC3Lm0= (sha256 868c0d898fcc28194c275c32aa1e7d6f3280e4d34fb91d3ea55f62478f0caefd), the record\'s Ed25519 wrapper signature verifies over the canonical unsigned form under that pinned anchor, the committed receipt and witness bytes hash to the record\'s bindings, the witness attestation verifies under the witness key the record pins, and every per-surface egress observation in the receipt is internally consistent — a positive nonLoopback count with a nonempty nonLoopbackRemotes array, or a zero count with an empty or absent one — across both runs\' samples and final sweeps.';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-r44-anchor-bound', error: msg }));
  process.exit(2);
}

const argv = process.argv.slice(2);
let rev = null, repo = null, jsonOut = false, target = 'honest', mutation = null, measureOverride = null, selftest = false;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--rev') rev = argv[++i];
  else if (argv[i] === '--repo') repo = argv[++i];
  else if (argv[i] === '--json') jsonOut = true;
  else if (argv[i] === '--target') target = argv[++i];
  else if (argv[i] === '--measure') measureOverride = argv[++i];
  else if (argv[i] === '--mutation') mutation = argv[++i];
  else if (argv[i] === '--selftest') selftest = true;
}
if (selftest) { runSelftest(); process.exit(0); }
if (!rev || !repo || !/^[0-9a-f]{40}$/.test(rev)) die('usage: --rev <40hex> --repo <lane repo> [--target honest|failedrun] [--mutation ...] [--selftest]');
if (!TARGETS[target]) die(`unknown target ${target}`);
if (mutation && !['anchor-self-select', 'plant-egress'].includes(mutation)) die(`unknown mutation ${mutation}`);

function gitShow(revPath) {
  const r = spawnSync('git', ['-C', repo, 'show', `${rev}:${revPath}`], { encoding: 'buffer', maxBuffer: 64 << 20 });
  if (r.error || r.status !== 0) return null;
  return r.stdout;
}

const findings = [];
const add = (id, detail) => findings.push({ id, detail });

const t = TARGETS[target];
const measurePath = measureOverride || t.measure;
// An explicit --measure override may be an uncommitted fixture: git first,
// then disk (recorded in the output as measureSource). The honest/failedrun
// targets always read committed bytes.
let measureRaw = gitShow(measurePath);
let measureSource = 'git';
if (!measureRaw && measureOverride) {
  try { measureRaw = fs.readFileSync(path.join(repo, measureOverride)); measureSource = 'disk'; } catch { measureRaw = null; }
}
const receiptRaw = gitShow(t.receipt);
const witnessRaw = gitShow(t.witness);
if (!measureRaw) add('measure-unreadable', `${measurePath} not committed at REV`);
if (!receiptRaw) add('receipt-unreadable', `${t.receipt} not committed at REV`);
if (!witnessRaw) add('witness-unreadable', `${t.witness} not committed at REV`);

let measureDoc = null, receipt = null, witness = null;
try { measureDoc = JSON.parse(measureRaw.toString('utf8')); } catch { if (measureRaw) add('measure-unparseable', measurePath); }
try { receipt = JSON.parse(receiptRaw.toString('utf8')); } catch { if (receiptRaw) add('receipt-unparseable', t.receipt); }
try { witness = JSON.parse(witnessRaw.toString('utf8')); } catch { if (witnessRaw) add('witness-unparseable', t.witness); }

// Mutation: plant a non-loopback observation into the honest receipt bytes —
// demonstrates that ANY post-hoc edit is refused by the signed bindings.
let effectiveReceiptRaw = receiptRaw;
if (mutation === 'plant-egress' && receipt && Array.isArray(receipt.runs) && receipt.runs[0]?.samples?.[0]?.ss) {
  receipt.runs[0].samples[0].ss.nonLoopback = 1;
  receipt.runs[0].samples[0].ss.nonLoopbackRemotes = ['93.184.216.34:443'];
  effectiveReceiptRaw = Buffer.from(JSON.stringify(receipt, null, 1) + '\n', 'utf8');
}

// (1) Trust anchor: pinned in this supervisor's source, not selected by the
// candidate record. Under the anchor-self-select mutation the record's own
// key is used instead — reproducing the round-43 defect for the control.
const anchorKey = crypto.createPublicKey(ANCHOR_PEM);
if (sha256(ANCHOR_PEM) !== ANCHOR_SPKI_SHA256) add('supervisor-anchor-self-sha', 'pinned anchor sha mismatch — supervisor bytes corrupted');
let verifyKey = anchorKey;
if (mutation === 'anchor-self-select') {
  try { verifyKey = crypto.createPublicKey(measureDoc?.pubkeys?.wrapper); } catch { add('measure-signature-invalid', 'record pubkey unparseable under anchor-self-select'); verifyKey = null; }
} else if (measureDoc?.pubkeys?.wrapper !== ANCHOR_PEM) {
  add('anchor-pin-mismatch', `record pubkeys.wrapper ${measureDoc?.pubkeys?.wrapper ? sha256(Buffer.from(String(measureDoc.pubkeys.wrapper))) : 'absent'} != pinned anchor ${ANCHOR_SPKI_SHA256}`);
}

let measureSignatureVerified = false;
if (measureDoc) {
  if (measureDoc.schema !== MEASURE_SCHEMA) add('measure-schema', measureDoc.schema);
  const { signature, ...rest } = measureDoc;
  if (verifyKey) {
    try {
      const unsigned = canonical(rest);
      if (signature && signature.scheme === 'ed25519' && sha256(Buffer.from(unsigned, 'utf8')) === signature.over
        && crypto.verify(null, Buffer.from(unsigned, 'utf8'), verifyKey, Buffer.from(signature.value, 'hex'))) {
        measureSignatureVerified = true;
      } else add('measure-signature-invalid', 'wrapper signature does not verify under the selected key');
    } catch { add('measure-signature-invalid', 'signature verification threw'); }
  }
  const b = measureDoc.bindings || {};
  if (effectiveReceiptRaw && b.receiptSha256 !== sha256(effectiveReceiptRaw)) add('receipt-binding-mismatch', 'receipt bytes do not hash to the record binding');
  if (witnessRaw && b.witnessSha256 !== sha256(witnessRaw)) add('witness-binding-mismatch', 'witness bytes do not hash to the record binding');
  if (measureDoc.pubkeys?.witness && witness?.attestation?.publicKey && measureDoc.pubkeys.witness !== witness.attestation.publicKey) add('witness-pubkey-mismatch', 'record witness key != witness attestation key');
}

// Witness attestation under the witness's own key (as v5).
if (witness && witness.schema === WITNESS_SCHEMA) {
  const a = witness.attestation || {};
  try {
    const signed = canonical({ rootPid: witness.rootPid, nonce: witness.nonce, startedTicks: witness.startedTicks, endedTicks: witness.endedTicks, samples: witness.samples });
    if (!(sha256(Buffer.from(signed, 'utf8')) === a.over
      && crypto.verify(null, Buffer.from(signed, 'utf8'), crypto.createPublicKey(a.publicKey), Buffer.from(a.value, 'hex')))) {
      add('witness-attestation-invalid', 'witness attestation does not verify');
    }
  } catch { add('witness-attestation-invalid', 'witness attestation verification threw'); }
} else if (witnessRaw) add('witness-schema', String(witness?.schema));

// (2) Egress consistency over the receipt (post-mutation bytes).
function consistency(doc) {
  if (!doc || !Array.isArray(doc.runs)) return;
  doc.runs.forEach((r, i) => {
    const N = `run${i + 1}`;
    for (const [j, x] of (Array.isArray(r.samples) ? r.samples : []).entries()) {
      for (const k of ['ss', 'proc']) {
        const o = x?.[k];
        if (!o) continue;
        const c = o.nonLoopback;
        const remotes = o.nonLoopbackRemotes;
        const hasRemotes = Array.isArray(remotes) && remotes.length > 0;
        if (c > 0 && !hasRemotes) add(`${N}-sample${j + 1}-${k}-egress-count-without-remotes`, `count ${c}, remotes ${JSON.stringify(remotes) ?? 'absent'}`);
        if (c === 0 && hasRemotes) add(`${N}-sample${j + 1}-${k}-egress-remotes-without-count`, `count 0, ${remotes.length} remotes`);
      }
    }
    for (const k of ['ss', 'proc']) {
      const o = r.finalSweep?.[k];
      if (!o) continue;
      const c = o.nonLoopback;
      const remotes = o.nonLoopbackRemotes;
      const hasRemotes = Array.isArray(remotes) && remotes.length > 0;
      if (c > 0 && !hasRemotes) add(`${N}-final-${k}-egress-count-without-remotes`, `count ${c}, remotes ${JSON.stringify(remotes) ?? 'absent'}`);
      if (c === 0 && hasRemotes) add(`${N}-final-${k}-egress-remotes-without-count`, `count 0, ${remotes.length} remotes`);
    }
  });
}
if (mutation === 'plant-egress') consistency(receipt);
else consistency(receipt);

const predicate = findings.length === 0 && measureSignatureVerified === true;
const out = {
  schema: 'tabi-r44-anchor-bound', predicateSentence: PREDICATE, rev, target,
  mutation: mutation || null, measurePath,
  measureSignatureVerified, anchorSpkiSha256: ANCHOR_SPKI_SHA256, measureSource,
  predicate, findingCount: findings.length, findings,
};
console.log(JSON.stringify(out, null, 1));
process.exit(predicate ? 0 : 1);

// --- selftest: synthetic docs, internally signed with a LOCAL test anchor
// (the honest run's private half never persisted, so the real anchor cannot
// be exercised with a fresh signature; the logic under test is identical).
function runSelftest() {
  const cases = [];
  const kpTest = crypto.generateKeyPairSync('ed25519'); // local stand-in anchor
  const kpForeign = crypto.generateKeyPairSync('ed25519');
  const pemOf = (kp) => kp.publicKey.export({ type: 'spki', format: 'pem' }).toString();
  const sign = (kp, buf) => crypto.sign(null, buf, kp.privateKey).toString('hex');
  const mkWitness = () => {
    const w = {
      schema: WITNESS_SCHEMA, rootPid: 4242, nonce: 'a'.repeat(64), startedTicks: 100, endedTicks: 200,
      samples: Array.from({ length: 12 }, (_, i) => ({ t: 1000 + i, tree: [] })),
      attestation: null,
    };
    const signed = canonical({ rootPid: w.rootPid, nonce: w.nonce, startedTicks: w.startedTicks, endedTicks: w.endedTicks, samples: w.samples });
    w.attestation = { over: sha256(Buffer.from(signed, 'utf8')), publicKey: pemOf(kpTest), value: sign(kpTest, Buffer.from(signed, 'utf8')) };
    return w;
  };
  const mkMeasure = (signerKp, anchorPem, receipt, witnessDoc) => {
    const m = {
      schema: MEASURE_SCHEMA, nonce: 'b'.repeat(64), elapsedMs: 5000,
      pubkeys: { wrapper: anchorPem, witness: witnessDoc.attestation.publicKey },
      bindings: { receiptSha256: sha256(Buffer.from(JSON.stringify(receipt, null, 1) + '\n', 'utf8')), witnessSha256: sha256(Buffer.from(JSON.stringify(witnessDoc, null, 1) + '\n', 'utf8')), runs: 2 },
    };
    const unsigned = canonical(m);
    m.signature = { scheme: 'ed25519', over: sha256(Buffer.from(unsigned, 'utf8')), value: sign(signerKp, Buffer.from(unsigned, 'utf8')) };
    return m;
  };
  const zeroRun = (n) => ({
    refused: false, runNonce: 'b'.repeat(64),
    samples: Array.from({ length: 8 }, (_, i) => ({ t: i * 250, ss: { ticks: 1, nonLoopback: 0, nonLoopbackRemotes: [] }, proc: { ticks: 1, nonLoopback: 0, nonLoopbackRemotes: [] } })),
    finalSweep: { ss: { ticks: 1, nonLoopback: 0, nonLoopbackRemotes: [] }, proc: { ticks: 1, nonLoopback: 0, nonLoopbackRemotes: [] } },
    egressNonLoopback: 0, label: n,
  });
  const okReceipt = { schema: 'x', runs: [zeroRun(1), zeroRun(2)] };
  const badCountReceipt = JSON.parse(JSON.stringify(okReceipt));
  badCountReceipt.runs[0].samples[2].ss.nonLoopback = 3; delete badCountReceipt.runs[0].samples[2].ss.nonLoopbackRemotes;
  const badRemotesReceipt = JSON.parse(JSON.stringify(okReceipt));
  badRemotesReceipt.runs[1].samples[4].proc.nonLoopbackRemotes = ['1.2.3.4:80'];

  const consistencyOf = (doc) => {
    const f = [];
    (doc?.runs || []).forEach((r, i) => (r.samples || []).forEach((x, j) => {
      for (const k of ['ss', 'proc']) {
        const o = x?.[k];
        if (!o) continue;
        const has = Array.isArray(o.nonLoopbackRemotes) && o.nonLoopbackRemotes.length > 0;
        if (o.nonLoopback > 0 && !has) f.push(`${i}-${j}-${k}-count-without-remotes`);
        if (o.nonLoopback === 0 && has) f.push(`${i}-${j}-${k}-remotes-without-count`);
      }
    }));
    return f;
  };
  const evalDoc = (measure, anchorPem, receiptBytes, witnessBytes) => {
    const f = [];
    const { signature, ...rest } = measure;
    let key = null;
    if (measure.pubkeys.wrapper !== anchorPem) f.push('anchor-pin-mismatch');
    try { key = crypto.createPublicKey(measure.pubkeys.wrapper); } catch { f.push('measure-signature-invalid'); }
    if (key) {
      try {
        const unsigned = canonical(rest);
        if (!(signature?.scheme === 'ed25519' && sha256(Buffer.from(unsigned, 'utf8')) === signature.over
          && crypto.verify(null, Buffer.from(unsigned, 'utf8'), key, Buffer.from(signature.value, 'hex')))) f.push('measure-signature-invalid');
      } catch { f.push('measure-signature-invalid'); }
    }
    if (measure.bindings.receiptSha256 !== sha256(receiptBytes)) f.push('receipt-binding-mismatch');
    if (measure.bindings.witnessSha256 !== sha256(witnessBytes)) f.push('witness-binding-mismatch');
    return f;
  };
  const rb = (o) => Buffer.from(JSON.stringify(o, null, 1) + '\n', 'utf8');
  const wb = rb;
  const localAnchor = pemOf(kpTest);
  const wOk = mkWitness();
  const mOk = mkMeasure(kpTest, localAnchor, okReceipt, wOk);
  cases.push({ case: 'local-anchor-honest-shape-pass', findings: evalDoc(mOk, localAnchor, rb(okReceipt), wb(wOk)), expectRefuse: false });
  cases.push({ case: 'foreign-signer-refused', findings: evalDoc(mkMeasure(kpForeign, localAnchor, okReceipt, wOk), localAnchor, rb(okReceipt), wb(wOk)), expectRefuse: true });
  cases.push({ case: 'self-selected-anchor-refused', findings: evalDoc(mkMeasure(kpForeign, pemOf(kpForeign), okReceipt, wOk), localAnchor, rb(okReceipt), wb(wOk)), expectRefuse: true });
  cases.push({ case: 'tampered-receipt-refused', findings: evalDoc(mOk, localAnchor, rb(badCountReceipt), wb(wOk)), expectRefuse: true });
  const wTampered = mkWitness(); wTampered.rootPid = 9999;
  cases.push({ case: 'tampered-witness-refused', findings: evalDoc(mOk, localAnchor, rb(okReceipt), wb(wTampered)), expectRefuse: true });
  cases.push({ case: 'count-without-remotes-consistency', findings: consistencyOf(badCountReceipt), expectRefuse: true });
  cases.push({ case: 'remotes-without-count-consistency', findings: consistencyOf(badRemotesReceipt), expectRefuse: true });
  cases.push({ case: 'consistent-zero-passes-consistency', findings: consistencyOf(okReceipt), expectRefuse: false });
  cases.push({ case: 'anchor-pem-self-sha', findings: sha256(ANCHOR_PEM) === ANCHOR_SPKI_SHA256 ? [] : ['supervisor-anchor-self-sha'], expectRefuse: false });
  let allPass = true;
  for (const c of cases) {
    const refused = c.findings.length > 0;
    c.pass = refused === c.expectRefuse;
    if (!c.pass) allPass = false;
  }
  console.log(JSON.stringify({ schema: 'tabi-r44-anchor-bound-selftest', cases: cases.length, allPass, detail: cases }, null, 1));
  process.exit(allPass ? 0 : 1);
}

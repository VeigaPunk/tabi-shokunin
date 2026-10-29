#!/usr/bin/env node
// ScribeErrata42 — INDEPENDENT re-derivation of the round-43 signing chain from
// COMMITTED bytes only (git show HEAD:<path>), without invoking the frozen
// counter, without a browser run, and without any private key.
//
// Purpose: establish which of the r43 chain's properties are re-derivable from
// committed bytes by a third party (and therefore can carry an erratum that
// supersedes the r42 note's "sha256 binding is the weakest binding" limitation)
// and which are not (challenge-response needs the live wrapper).
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

const REPO = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const REV = process.argv[2] || 'HEAD';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function gitShow(path) {
  return execFileSync('git', ['-C', REPO, 'show', `${REV}:${path}`], { encoding: 'buffer', maxBuffer: 256 * 1024 * 1024 });
}
function gitOut(args) {
  return execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8' }).trim();
}
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

const out = { rev: REV, revResolved: gitOut(['rev-parse', REV]) };

// ---- 1. measure record: Ed25519 wrapper signature over canonical unsigned form
const measureBytes = gitShow('.ufo/waves/round-43/measure/c1-measure-r43.json');
const m = JSON.parse(measureBytes.toString('utf8'));
const { signature, ...rest } = m;
const unsigned = canonical(rest);
out.measure = {
  schema: m.schema,
  digestOverUnsigned: sha256(Buffer.from(unsigned, 'utf8')),
  frozenOver: signature.over,
  overMatches: sha256(Buffer.from(unsigned, 'utf8')) === signature.over,
  scheme: signature.scheme,
  signatureVerifies:
    signature.scheme === 'ed25519' &&
    crypto.verify(null, Buffer.from(unsigned, 'utf8'), crypto.createPublicKey(m.pubkeys.wrapper), Buffer.from(signature.value, 'hex')),
};

// ---- 2. witness attestation: independent Ed25519 key over its own canonical form
const witnessBytes = gitShow('corpus/evidence/round43/playwright-egress/receipt.witness.json');
const w = JSON.parse(witnessBytes.toString('utf8'));
const a = w.attestation || {};
const wsigned = canonical({ rootPid: w.rootPid, nonce: w.nonce, startedTicks: w.startedTicks, endedTicks: w.endedTicks, samples: w.samples });
out.witness = {
  schema: w.schema,
  digestOverSigned: sha256(Buffer.from(wsigned, 'utf8')),
  frozenOver: a.over,
  overMatches: sha256(Buffer.from(wsigned, 'utf8')) === a.over,
  attestationVerifies: crypto.verify(null, Buffer.from(wsigned, 'utf8'), crypto.createPublicKey(a.publicKey), Buffer.from(a.value, 'hex')),
  measurePubkeyMatchesAttestationPubkey: m.pubkeys.witness === a.publicKey,
  witnessNonceEqualsMeasureNonce: w.nonce === m.nonce,
  witnessSampleCount: Array.isArray(w.samples) ? w.samples.length : null,
};

// ---- 3. bindings: committed receipt/witness bytes -> signed measure record
const receiptBytes = gitShow('corpus/evidence/round43/playwright-egress/receipt.json');
out.bindings = {
  receiptSha256Committed: sha256(receiptBytes),
  receiptSha256Signed: m.bindings.receiptSha256,
  receiptBindingHolds: sha256(receiptBytes) === m.bindings.receiptSha256,
  witnessSha256Committed: sha256(witnessBytes),
  witnessSha256Signed: m.bindings.witnessSha256,
  witnessBindingHolds: sha256(witnessBytes) === m.bindings.witnessSha256,
  receiptBytes: receiptBytes.length,
  witnessBytes: witnessBytes.length,
};

// ---- 4. producer digests: signed measure record vs committed blobs vs claims.json pins
const claims = JSON.parse(gitShow('.ufo/waves/round-43/claims.json').toString('utf8'));
out.digests = { claimsFrozenDigestsVsSignedDigests: {}, blobsAtRev: {} };
for (const [k, v] of Object.entries(m.digests || {})) {
  const blob = sha256(gitShow(k));
  out.digests.blobsAtRev[k] = blob;
  out.digests.claimsFrozenDigestsVsSignedDigests[k] = {
    signed: v, blobAtRev: blob, claimsPin: claims.frozenDigests[k],
    allEqual: v === blob && blob === claims.frozenDigests[k],
  };
}

// ---- 5. C2 rule r1a anchor: the pinned r41 measure blob id at this revision
const MEASURE_PIN = '8ff64d691f5c09569a50f2a5a038bb23774c3d35';
const r41MeasureId = gitOut(['rev-parse', `${REV}:.ufo/waves/round-41/measure/c1-measure.json`]);
const r41ReceiptId = gitOut(['rev-parse', `${REV}:corpus/evidence/round41/playwright-egress/receipt.json`]);
out.c2Anchor = {
  pinnedMeasureBlobId: MEASURE_PIN,
  measureBlobIdAtRev: r41MeasureId,
  measureBlobIdHolds: r41MeasureId === MEASURE_PIN,
  measureBlobType: gitOut(['cat-file', '-t', `${REV}:.ufo/waves/round-41/measure/c1-measure.json`]),
  receiptBlobType: gitOut(['cat-file', '-t', `${REV}:corpus/evidence/round41/playwright-egress/receipt.json`]),
  receiptBlobIdAtRev: r41ReceiptId,
};

// ---- 6. the r42 note's own cited surface still resolves at this revision
out.r42Note = {
  path: 'corpus/knowledge/committed-bytes-verification-round-42.md',
  blobIdAtRev: gitOut(['rev-parse', `${REV}:corpus/knowledge/committed-bytes-verification-round-42.md`]),
  sha256AtRev: sha256(gitShow('corpus/knowledge/committed-bytes-verification-round-42.md')),
};
out.r43Note = {
  path: 'corpus/knowledge/receipt-authenticity-signing-round-43.md',
  blobIdAtRev: (() => { try { return gitOut(['rev-parse', `${REV}:corpus/knowledge/receipt-authenticity-signing-round-43.md`]); } catch { return 'NOT-COMMITTED-AT-REV'; } })(),
};

console.log(JSON.stringify(out, null, 2));

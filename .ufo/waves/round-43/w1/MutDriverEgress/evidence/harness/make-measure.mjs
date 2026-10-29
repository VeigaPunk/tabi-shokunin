#!/usr/bin/env node
// make-measure.mjs — build a SELF-SIGNED measure record bound to an arbitrary
// receipt, used ONLY as an isolation harness: it lets the counter evaluate the
// receipt-content clauses of the frozen counter in isolation (no wrapper
// invocation is available to answer the fd3/fd4 challenge, and the committed
// measure record binds only the committed receipt bytes).
//
// NOTE ON SCOPE: this harness exists to observe which counter clauses fire on
// a given receipt. Whether a self-signed measure record is itself acceptable
// to the counter is a separate observation, recorded verbatim in the report.
import fs from 'node:fs';
import crypto from 'node:crypto';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',') + '}';
}

const receiptPath = process.argv[2];
const witnessPath = process.argv[3];
const outPath = process.argv[4];
const templatePath = process.argv[5]; // committed measure record, for gate/digests

const raw = fs.readFileSync(receiptPath, 'utf8');
const receipt = JSON.parse(raw);
const wRaw = fs.readFileSync(witnessPath, 'utf8');
const witness = JSON.parse(wRaw);
const tmpl = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
const runPubPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();

const spanSum = (receipt.runs || []).reduce((a, r) => {
  const ss = r.samples || [];
  return a + (ss.length >= 2 ? ss.at(-1).t - ss[0].t : 0);
}, 0);

const rec = {
  schema: 'tabi-r43-c1-measure-record',
  nonce: receipt.runNonce,
  createdAt: new Date().toISOString(),
  pubkeys: { wrapper: runPubPem, witness: witness.attestation.publicKey },
  bindings: {
    receiptSha256: sha256(raw),
    witnessSha256: sha256(wRaw),
    runs: (receipt.runs || []).length,
  },
  digests: tmpl.digests,
  gate: tmpl.gate,
  elapsedMs: Math.max(tmpl.elapsedMs || 0, spanSum + 500),
  driverExit: 0,
};
const unsigned = canonical(rec);
rec.signature = {
  scheme: 'ed25519',
  over: sha256(unsigned),
  value: crypto.sign(null, Buffer.from(unsigned, 'utf8'), privateKey).toString('hex'),
};
fs.writeFileSync(outPath, JSON.stringify(rec, null, 1) + '\n');
// the private half must be available to the challenge responder in the same
// process; write it to a scratch-only side file (never to the repo).
fs.writeFileSync(outPath + '.privkey', privateKey.export({ type: 'pkcs8', format: 'pem' }).toString());
console.log(JSON.stringify({ out: outPath, receiptSha256: rec.bindings.receiptSha256, nonce: rec.nonce, elapsedMs: rec.elapsedMs }, null, 1));

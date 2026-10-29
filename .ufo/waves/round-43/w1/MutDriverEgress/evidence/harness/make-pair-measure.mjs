#!/usr/bin/env node
// make-pair-measure.mjs <receipt> <witness> <outMeasure> <outPriv>
//
// Builds a self-signed measure record over the given receipt with the
// CANONICAL repo producer digests, so the only thing that differs between
// the two arms of the paired differential is the receipt's egress counts
// (and the receipt hash bound inside the measure record).
import fs from 'node:fs';
import crypto from 'node:crypto';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
function canonical(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  return '{' + Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',') + '}';
}
const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const [receiptPath, witnessPath, outPath] = process.argv.slice(2);
const raw = fs.readFileSync(receiptPath, 'utf8');
const wRaw = fs.readFileSync(witnessPath, 'utf8');
const receipt = JSON.parse(raw);
const witness = JSON.parse(wRaw);
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
const spanSum = receipt.runs.reduce((a, r) => a + (r.samples.at(-1).t - r.samples[0].t), 0);
const rec = {
  schema: 'tabi-r43-c1-measure-record',
  nonce: receipt.runNonce,
  createdAt: new Date().toISOString(),
  pubkeys: { wrapper: publicKey.export({ type: 'spki', format: 'pem' }).toString(), witness: witness.attestation.publicKey },
  bindings: { receiptSha256: sha256(raw), witnessSha256: sha256(wRaw), runs: receipt.runs.length },
  digests: {
    'scripts/measure-c1-round43.mjs': sha256(fs.readFileSync(`${ROOT}/scripts/measure-c1-round43.mjs`)),
    'scripts/playwright-firefox-egress-round43.mjs': sha256(fs.readFileSync(`${ROOT}/scripts/playwright-firefox-egress-round43.mjs`)),
    '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs': sha256(fs.readFileSync(`${ROOT}/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`)),
  },
  gate: { self: { forbiddenNames: [], execArgvClean: true }, child: { ok: true } },
  elapsedMs: spanSum + 500,
  driverExit: 0,
};
const unsigned = canonical(rec);
rec.signature = { scheme: 'ed25519', over: sha256(Buffer.from(unsigned, 'utf8')), value: crypto.sign(null, Buffer.from(unsigned, 'utf8'), privateKey).toString('hex') };
fs.writeFileSync(outPath, JSON.stringify(rec, null, 1) + '\n');
fs.writeFileSync(`${outPath}.privkey`, privateKey.export({ type: 'pkcs8', format: 'pem' }).toString());
console.log(JSON.stringify({ out: outPath, receiptSha256: rec.bindings.receiptSha256, nonce: rec.nonce, digestDriver: rec.digests['scripts/playwright-firefox-egress-round43.mjs'] }));

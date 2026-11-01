#!/usr/bin/env node
// gen-selfauth-record.mjs — tabi round 44, claim C3 fixture generator.
// Produces a SELF-AUTHORED round-43-shaped measure record: a fresh Ed25519
// keypair (fresh each run, by design — the attack class is "author your own
// key", not a specific key), a record whose schema, bindings and witness-key
// pin are internally consistent with the COMMITTED honest receipt and witness
// bytes, signed under the fresh key. Under round-43 counter v5's trust model
// (trust anchor selected by the candidate record) this class reached exit 0;
// under c1-anchor-bound-v6's pinned anchor it must refuse.
//
// Nondeterministic by design; stability across regenerations is at the
// finding-id level, which is what the controls record.
//
// Usage:
//   node gen-selfauth-record.mjs --repo <lane repo> --out <record.json>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
function die(msg) { console.error(JSON.stringify({ error: msg })); process.exit(2); }

const argv = process.argv.slice(2);
let repo = null, out = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--repo') repo = argv[++i];
  else if (argv[i] === '--out') out = argv[++i];
}
if (!repo || !out) die('usage: --repo <lane repo> --out <record.json>');

const read = (p) => {
  const r = spawnSync('git', ['-C', repo, 'show', `HEAD:${p}`], { encoding: 'buffer', maxBuffer: 64 << 20 });
  if (r.error || r.status !== 0) die(`cannot read HEAD:${p}`);
  return r.stdout;
};
const receiptRaw = read('corpus/evidence/round43/playwright-egress/receipt.json');
const witnessRaw = read('corpus/evidence/round43/playwright-egress/receipt.witness.json');
const witness = JSON.parse(witnessRaw.toString('utf8'));

function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

const kp = crypto.generateKeyPairSync('ed25519');
const pem = kp.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const m = {
  schema: 'tabi-r43-c1-measure-record',
  nonce: crypto.randomBytes(32).toString('hex'),
  elapsedMs: 44123,
  pubkeys: {
    wrapper: pem,
    witness: witness.attestation.publicKey, // keep the honest witness pin so the witness clauses pass
  },
  bindings: {
    receiptSha256: sha256(receiptRaw),
    witnessSha256: sha256(witnessRaw),
    runs: 2,
  },
};
const unsigned = canonical(m);
m.signature = {
  scheme: 'ed25519',
  over: sha256(Buffer.from(unsigned, 'utf8')),
  value: crypto.sign(null, Buffer.from(unsigned, 'utf8'), kp.privateKey).toString('hex'),
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(m, null, 1) + '\n');
console.log(JSON.stringify({ out, selfPubkeySha256: sha256(Buffer.from(pem)), bindingsMatchCommittedBytes: true }));

#!/usr/bin/env node
// Re-signs a REAL wrapper-generated witness document's attestation with a
// different Ed25519 key, leaving the declared publicKey and the `over` hash
// untouched. This isolates the crypto.verify() step of the witness clause on
// genuine bytes (as opposed to the fully synthetic fixtures).
import fs from 'node:fs';
import crypto from 'node:crypto';

function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

const src = process.argv[2];
const dst = process.argv[3];
const w = JSON.parse(fs.readFileSync(src, 'utf8'));
const signed = canonical({ rootPid: w.rootPid, nonce: w.nonce, startedTicks: w.startedTicks, endedTicks: w.endedTicks, samples: w.samples });
const { publicKey: attackPub, privateKey: attackPriv } = crypto.generateKeyPairSync('ed25519');
const oldValue = w.attestation.value;
w.attestation.value = crypto.sign(null, Buffer.from(signed, 'utf8'), attackPriv).toString('hex');
fs.writeFileSync(dst, JSON.stringify(w, null, 0) + '\n');
console.log(JSON.stringify({
  src, dst,
  declaredPublicKeyUnchanged: true,
  overUnchanged: true,
  oldValueSha256: crypto.createHash('sha256').update(oldValue).digest('hex'),
  newValueSha256: crypto.createHash('sha256').update(w.attestation.value).digest('hex'),
  attackPubSha256: crypto.createHash('sha256').update(attackPub.export({ type: 'spki', format: 'pem' })).digest('hex'),
  witnessBytesSha256: crypto.createHash('sha256').update(fs.readFileSync(dst)).digest('hex'),
}, null, 1));

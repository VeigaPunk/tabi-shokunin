#!/usr/bin/env node
// C1 reachability attack, vector (a): succeed the counter with bytes that are
// not a fresh run. Two tiers:
//   T1  committed round-41 receipt + witness, ONLY the nonce fields relabeled
//   T2  round-42 working-tree receipt + witness, ONLY the nonce fields relabeled
// Nothing is launched: no Firefox, no Playwright, no driver. Lane bytes are
// read-only; every output goes to the scratch dir passed as argv[2].
import fs from 'node:fs';
import crypto from 'node:crypto';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const S = process.argv[2];
if (!S) { console.error('usage: gen-a1.mjs <scratch-dir>'); process.exit(64); }

function relabel(receiptPath, witnessPath, prefix) {
  const nonce = crypto.randomBytes(32).toString('hex');
  const r = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  const originalNonce = r.runNonce;
  r.runNonce = nonce;
  for (const run of r.runs) run.runNonce = nonce;
  fs.writeFileSync(`${S}/${prefix}-receipt.json`, JSON.stringify(r));
  const w = JSON.parse(fs.readFileSync(witnessPath, 'utf8'));
  w.nonce = nonce;
  fs.writeFileSync(`${S}/${prefix}-witness.json`, JSON.stringify(w));
  fs.writeFileSync(`${S}/${prefix}-nonce.txt`, nonce + '\n');
  return { prefix, originalNonce, newNonce: nonce, runs: r.runs.length };
}

const out = [
  relabel(`${ROOT}/corpus/evidence/round41/playwright-egress/receipt.json`,
          `${ROOT}/corpus/evidence/round41/playwright-egress/receipt.witness.json`, 'a1'),
  relabel(`${ROOT}/corpus/evidence/round42/playwright-egress/receipt.json`,
          `${ROOT}/corpus/evidence/round42/playwright-egress/receipt.witness.json`, 'a1b'),
];
// A1c: no relabel at all - the nonce is read out of the receipt itself.
const r42 = JSON.parse(fs.readFileSync(`${ROOT}/corpus/evidence/round42/playwright-egress/receipt.json`, 'utf8'));
fs.writeFileSync(`${S}/a1c-nonce.txt`, r42.runNonce + '\n');
console.log(JSON.stringify(out));

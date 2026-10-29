#!/usr/bin/env node
// Scratch fixture builder for seat MutC1Nonce — builds the probe matrix:
//   base          : committed r43 receipt + witness + measure, byte-identical
//   relabel-receipt : receipt.runNonce + both runs[].runNonce replaced (bytes change)
//   relabel-measure : measure record's nonce replaced (receipt bytes untouched)
//   relabel-witness : witness.nonce replaced (attestation no longer covers it)
// Each variant is a self-contained dir so the counter's
// receipt.witness.json sibling lookup resolves inside the variant.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const S = '/fast/scratch/hyaku/tabi-r43/MutC1Nonce';
const BASE_NONCE = 'd2c85f6eebbdd8ed1991e3eb457499f6f002dbda6334422876287e80aa266e5c';
const RELABEL = 'b'.repeat(64);

const receipt = fs.readFileSync(`${S}/base/receipt.json`, 'utf8');
const witness = fs.readFileSync(`${S}/base/receipt.witness.json`, 'utf8');
const measure = fs.readFileSync(`${S}/base/measure.json`, 'utf8');

function sub(text, from, to, expect) {
  const n = text.split(from).length - 1;
  if (n !== expect) throw new Error(`expected ${expect} occurrences of ${from}, got ${n}`);
  return text.split(from).join(to);
}

const variants = {
  base: { receipt, witness, measure },
  'relabel-receipt': {
    receipt: sub(receipt, BASE_NONCE, RELABEL, 3),
    witness, measure,
  },
  'relabel-measure': {
    receipt,
    witness,
    measure: sub(measure, BASE_NONCE, RELABEL, 1),
  },
  'relabel-witness': {
    receipt,
    witness: sub(witness, BASE_NONCE, RELABEL, 1),
    measure,
  },
};

const manifest = [];
for (const [name, v] of Object.entries(variants)) {
  const dir = `${S}/fixtures/${name}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/receipt.json`, v.receipt);
  fs.writeFileSync(`${dir}/receipt.witness.json`, v.witness);
  fs.writeFileSync(`${dir}/measure.json`, v.measure);
  manifest.push({
    variant: name,
    dir,
    receiptSha256: crypto.createHash('sha256').update(v.receipt).digest('hex'),
    witnessSha256: crypto.createHash('sha256').update(v.witness).digest('hex'),
    measureSha256: crypto.createHash('sha256').update(v.measure).digest('hex'),
    receiptBytes: v.receipt.length,
  });
}
console.log(JSON.stringify({ relabelNonce: RELABEL, baseNonce: BASE_NONCE, manifest }, null, 2));

#!/usr/bin/env node
// R63Critic: is "two independent cold runs" evidenced? Build a field-edited
// CLONE of the scored run-1 receipt (new nonce, recomputed fixture sha, copied
// PNGs) and let the committed comparator judge it. If the clone reports STABLE,
// the comparator's STABLE verdict does not establish independence.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const src = opt('receipt'), driver = opt('driver'), out = opt('out'), nonce = opt('nonce') || 'tabi-r63-clone-of-run1';
const r = JSON.parse(fs.readFileSync(src, 'utf8'));
const dsrc = fs.readFileSync(driver, 'utf8');
const block = dsrc.slice(dsrc.indexOf('/*WHEEL-FIXTURE-BEGIN*/'), dsrc.indexOf('/*WHEEL-FIXTURE-END*/'));
const match = /const WHEEL_HTML = `([\s\S]*?)`;/.exec(block);
const fixtureSha = sha(match[1].replace('${nonce}', nonce));
fs.mkdirSync(out, { recursive: true });
const shots = path.join(out, 'shots');
fs.mkdirSync(shots, { recursive: true });
for (const s of r.steps) fs.copyFileSync(path.join(path.dirname(src), s.png), path.join(shots, s.png));
r.nonce = nonce;
r.nonceOnPage = nonce;
r.fixture.sha256 = fixtureSha;
// timestamps untouched on purpose: the comparator zeroes them.
fs.writeFileSync(path.join(out, 'receipt-clone.json'), JSON.stringify(r, null, 1));
console.log(JSON.stringify({ schema: 'tabi-r63-critic-clone-v1', src, out: path.join(out, 'receipt-clone.json'), shots, nonce, fixtureSha, steps: r.steps.length }));

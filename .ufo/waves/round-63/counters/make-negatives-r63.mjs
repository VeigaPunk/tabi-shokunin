#!/usr/bin/env node
// Round-63 negative-control generator. Copies a measured live receipt and applies
// exactly one falsification per control, so the counter's refusal of each is
// attributable to that field. Writes <out>/<name>.json plus an index.
// Node stdlib only; no /tmp; the output dir is the caller's --out.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const live = opt('live'), outDir = opt('out');
if (!live || !outDir) { console.error('usage: make-negatives --live receipt.json --out dir'); process.exit(2); }
const base = JSON.parse(fs.readFileSync(live, 'utf8'));
const clone = () => JSON.parse(JSON.stringify(base));

const controls = {
  // Producer-verdict polarity, BOTH directions (the r62 M5 survivor class).
  'n1-lying-producer-true-refuted': (r) => { r.wheelHypothesis = 'REFUTED'; },
  'n2-lying-producer-false-confirmed': (r) => { r.predicate = false; },
  'n3-scroll-arithmetic': (r) => { r.legs[2].scrollY = 180; },
  'n4-duplicate-seq': (r) => { r.wheellog[3].seq = 3; },
  'n5-delta-y': (r) => { r.wheellog[1].deltaY = 60; },
  'n6-swallow-not-canceled': (r) => { r.wheellog[3].defaultPrevented = false; },
  'n7-fabricated-step-label': (r) => { r.steps[0].sha256 = 'd'.repeat(64); },
  'n8-teardown-survivor': (r) => { r.teardown.survivors = [99999]; },
  'n9-nonce-mismatch': (r) => { r.nonceOnPage = 'tabi-r63-wrong'; },
  'n10-launch-guard': (r) => { r.host.argv = r.host.argv.filter((a) => a !== '--disable-smooth-scrolling'); },
};
fs.mkdirSync(outDir, { recursive: true });
const index = [];
for (const [name, mutate] of Object.entries(controls)) {
  const r = clone();
  mutate(r);
  const file = path.join(outDir, name + '.json');
  fs.writeFileSync(file, JSON.stringify(r, null, 1));
  index.push({ name, file });
}
fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify({ schema: 'tabi-r63-negatives-v1', live, count: index.length, controls: index }, null, 1));
console.log(JSON.stringify({ schema: 'tabi-r63-negatives-v1', count: index.length, out: outDir }));

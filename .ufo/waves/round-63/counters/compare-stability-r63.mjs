#!/usr/bin/env node
// Round-63 cold-run stability comparison over two receipts from the frozen r63
// driver. Compares the measured shape (legs, wheellog with timestamps zeroed,
// pageState) and every step PNG's sha256 between runs, and reports the exact
// differing field paths when they differ. Exit 0 only when all shapes and all
// PNG bytes agree.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const a = opt('a'), b = opt('b'), aShots = opt('a-shots'), bShots = opt('b-shots'), out = opt('out');
if (!a || !b || !aShots || !bShots || !out) { console.error('usage: --a receipt --b receipt --a-shots dir --b-shots dir --out file'); process.exit(2); }
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const ra = JSON.parse(fs.readFileSync(a, 'utf8')), rb = JSON.parse(fs.readFileSync(b, 'utf8'));
const shape = (r) => ({ legs: r.legs, wheellog: (r.wheellog || []).map((e) => ({ ...e, ts: 0 })), pageState: r.pageState });
const sa = shape(ra), sb = shape(rb);
const diffs = [];
const walk = (x, y, at) => {
  if (JSON.stringify(x) === JSON.stringify(y)) return;
  if (x && y && typeof x === 'object' && typeof y === 'object') {
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) walk(x[k], y[k], at + '.' + k);
    return;
  }
  diffs.push({ at, a: x, b: y });
};
walk(sa, sb, 'shape');
const png = (r, dir) => (r.steps || []).map((s) => ({ name: s.name, sha: sha(path.join(dir, s.png)), recorded: s.sha256 }));
const pa = png(ra, aShots), pb = png(rb, bShots);
const perPng = pa.map((x, i) => ({ name: x.name, aSha: x.sha, bSha: pb[i] ? pb[i].sha : null, equal: !!pb[i] && x.sha === pb[i].sha, recordedMatches: x.sha === x.recorded }));
const result = {
  schema: 'tabi-r63-stability-v1',
  a: { file: a, sha256: sha(a), nonce: ra.nonce, predicate: ra.predicate, driverSha256: ra.driverSha256 },
  b: { file: b, sha256: sha(b), nonce: rb.nonce, predicate: rb.predicate, driverSha256: rb.driverSha256 },
  shapeEqual: diffs.length === 0,
  shapeDiffs: diffs,
  pngs: perPng,
  pngsIdentical: perPng.length === 4 && perPng.every((p) => p.equal && p.recordedMatches),
  sameDriver: ra.driverSha256 === rb.driverSha256,
  sameFixture: ra.fixture?.sha256 === rb.fixture?.sha256,
  verdict: diffs.length === 0 && perPng.length === 4 && perPng.every((p) => p.equal && p.recordedMatches) && ra.driverSha256 === rb.driverSha256 ? 'STABLE' : 'DIVERGENT',
};
fs.writeFileSync(out, JSON.stringify(result, null, 1));
console.log(JSON.stringify({ schema: result.schema, verdict: result.verdict, shapeEqual: result.shapeEqual, pngsIdentical: result.pngsIdentical, sameDriver: result.sameDriver, shapeDiffs: result.shapeDiffs.slice(0, 5) }, null, 1));
process.exitCode = result.verdict === 'STABLE' ? 0 : 1;

#!/usr/bin/env node
// R63ExecNeg leaf-level fuzz over the committed smoke receipt. Independent of
// make-negatives-r63.mjs: every perturbation is generated here from the receipt
// itself. Purpose: enumerate the receipt surface the frozen r63 counter does
// not constrain, so the negative set above can be read against a complete map
// instead of a hand-picked list.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const WAVE = path.join(LANE, '.ufo/waves/round-63/w1/R63ExecNeg');
const COUNTER = path.join(LANE, '.ufo/waves/round-63/counters/chromium-wheel-r63.mjs');
const DRIVER = path.join(LANE, 'scripts/chrome-cdp-loopback-round63.mjs');
const PIN = 'b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040';
const SMOKE = path.join(LANE, '.ufo/waves/round-63/controls/smoke');
const BASE = path.join(SMOKE, 'receipt-run1.json');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const clone = (o) => JSON.parse(JSON.stringify(o));

const fmt = (p) => p.reduce((acc, k) => (typeof k === 'number' ? `${acc}[${k}]` : acc ? `${acc}.${k}` : k), '');

function leaves(o, prefix = [], out = []) {
  if (Array.isArray(o)) { o.forEach((v, i) => leaves(v, [...prefix, i], out)); }
  else if (o && typeof o === 'object') { for (const k of Object.keys(o)) leaves(o[k], [...prefix, k], out); }
  else out.push(prefix);
  return out;
}
const getAt = (o, p) => p.reduce((a, k) => a[k], o);
const setAt = (o, p, v) => { const last = p[p.length - 1]; const parent = p.slice(0, -1).reduce((a, k) => a[k], o); parent[last] = v; };
function perturb(v) {
  if (typeof v === 'number') return v + 7;
  if (typeof v === 'boolean') return !v;
  if (typeof v === 'string') return v + '-x';
  return 'x';
}

function invoke(receiptFile) {
  const argv = ['node', COUNTER, receiptFile, '--driver', DRIVER, '--expect-driver-sha256', PIN, '--shot', SMOKE, '--json'];
  const p = spawnSync(argv[0], argv.slice(1), { cwd: LANE, encoding: 'utf8', maxBuffer: 4 << 20 });
  let parsed = null; try { parsed = JSON.parse(p.stdout); } catch { /* exit-2 writes stderr only */ }
  return { argv, exit: p.status, predicate: parsed?.predicate ?? null, findings: parsed?.findings ?? null,
    error: (() => { try { return JSON.parse(p.stderr)?.error ?? null; } catch { return null; } })() };
}

const baseBytes = fs.readFileSync(BASE);
const base = JSON.parse(baseBytes.toString('utf8'));
const outDir = path.join(WAVE, 'fuzz');
fs.mkdirSync(outDir, { recursive: true });

const leafPaths = leaves(base);
const cases = [];
for (const lp of leafPaths) {
  const from = getAt(base, lp);
  cases.push({ kind: 'leaf', path: lp, from, to: perturb(from) });
}
// structural: empty each non-empty array, then duplicate its first element
(function walk(o, prefix = []) {
  if (Array.isArray(o)) {
    if (o.length) {
      cases.push({ kind: 'array-empty', path: prefix, from: `len=${o.length}`, to: 'len=0' });
      cases.push({ kind: 'array-dup-first', path: prefix, from: `len=${o.length}`, to: `len=${o.length + 1}` });
    }
    o.forEach((v, i) => walk(v, [...prefix, i]));
  } else if (o && typeof o === 'object') { for (const k of Object.keys(o)) walk(o[k], [...prefix, k]); }
})(base);

const results = [];
for (const c of cases) {
  const r = clone(base);
  if (c.kind === 'leaf') setAt(r, c.path, c.to);
  else {
    const arr = getAt(r, c.path);
    if (c.kind === 'array-empty') setAt(r, c.path, []);
    else setAt(r, c.path, [...arr, arr[0]]);
  }
  const file = path.join(outDir, 'fz-' + results.length + '.json');
  fs.writeFileSync(file, JSON.stringify(r, null, 1) + '\n');
  const inv = invoke(file);
  results.push({ n: results.length, kind: c.kind, path: fmt(c.path) || '(root)', from: c.from, to: c.to,
    exit: inv.exit, predicate: inv.predicate, findings: inv.findings, error: inv.error, receipt: path.relative(LANE, file) });
  if (inv.exit === 0) {
    // accepted perturbations are kept; rejected intermediates are deleted so the
    // wave dir only holds receipts that matter.
    fs.renameSync(file, path.join(outDir, 'accepted-' + results.length + '.json'));
    results[results.length - 1].receipt = path.relative(LANE, path.join(outDir, 'accepted-' + results.length + '.json'));
  } else {
    fs.unlinkSync(file);
  }
}

const accepted = results.filter((r) => r.exit === 0);
const summary = {
  schema: 'tabi-r63-execneg-fuzz-v1',
  base: { path: BASE, sha256: sha(baseBytes) },
  counterSha256: sha(fs.readFileSync(COUNTER)), driverSha256: sha(fs.readFileSync(DRIVER)), pin: PIN,
  cases: results.length,
  refused: results.filter((r) => r.exit === 1).length,
  crashed: results.filter((r) => r.exit !== 0 && r.exit !== 1).length,
  acceptedCount: accepted.length,
  acceptedByPathPrefix: accepted.reduce((a, r) => { const k = r.path.replace(/\[\d+\]/g, '[]').split('.').slice(0, 2).join('.'); a[k] = (a[k] || 0) + 1; return a; }, {}),
  accepted, results,
};
fs.writeFileSync(path.join(WAVE, 'fuzz.json'), JSON.stringify(summary, null, 1) + '\n');
console.log(JSON.stringify({ cases: summary.cases, refused: summary.refused, crashed: summary.crashed,
  acceptedCount: summary.acceptedCount, acceptedByPathPrefix: summary.acceptedByPathPrefix }, null, 1));
console.log(accepted.map((r) => `${r.kind} ${r.path}: ${JSON.stringify(r.from)} -> ${JSON.stringify(r.to)}`).join('\n'));

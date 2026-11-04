#!/usr/bin/env node
// Exact-line mutation matrix for the round-64 counter. Every mutant loosens one
// named check (the dangerous direction: a check that stops refusing); a mutant
// is "distinguished" when it still accepts the live receipt (no blanket refusal)
// and accepts at least one declared negative the pristine bytes refuse. Mutants
// are pinned to the final counter bytes by the round's freeze.
//
// Usage: node mutate-r64.mjs run --counter <path> --negatives <dir> --receipt <live.json>
//   --shot <dir> --driver <path> --out <dir> [--json]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
if (argv[0] !== 'run') { console.log(JSON.stringify({ error: 'usage', detail: 'mutate-r64.mjs run --counter ... --negatives ...' })); process.exit(2); }
const flags = new Map();
for (let i = 1; i < argv.length; i++) {
  if (argv[i].startsWith('--')) { const n = argv[i + 1]; if (n && !n.startsWith('--')) { flags.set(argv[i].slice(2), n); i++; } else flags.set(argv[i].slice(2), true); }
}
const opt = (n) => (flags.get(n) === true ? null : flags.get(n) || null);
const counterPath = path.resolve(opt('counter') || '');
const negDir = path.resolve(opt('negatives') || '');
const receiptPath = path.resolve(opt('receipt') || '');
const shotDir = path.resolve(opt('shot') || '');
const driverPath = path.resolve(opt('driver') || '');
const outDir = path.resolve(opt('out') || '');
fs.mkdirSync(outDir, { recursive: true });
const driverSha = sha(fs.readFileSync(driverPath));

const MUTANTS = [
  { id: 'M1-cancelation-drop', check: 'cancelation', find: `wl.every((e, i) => e.defaultPrevented === (i === 3))`, replace: `wl.every(() => true)` },
  { id: 'M2-nonce-pixels-brightness-only', check: 'nonce-pixels', find: `if (!p || p[0] !== want || p[1] !== want || p[2] !== want) return false;`, replace: `if (!p) return false;` },
  { id: 'M3-scroll-pixels-drop', check: 'scroll-pixels', find: `return BAND_SAMPLE_Y.every((y, k) => rgbEq(at(s, BAND_SAMPLE_X, y), expectedBandColor(l.scrollY, k)));`, replace: `return BAND_SAMPLE_Y.every(() => true);` },
  { id: 'M4-leg-witness-pixel-drop', check: 'leg-witness', find: `&& rgbEq(at(s, WITNESS_POINT.x, WITNESS_POINT.y), want)`, replace: `` },
  { id: 'M5-shot-bytes-dimension-drop', check: 'shot-bytes', find: `return s && s.width === VIEWPORT.width && s.height === VIEWPORT.height && s.sha256 === l.shotSha256 && s.bytes === l.shotBytes;`, replace: `return !!s;` },
  { id: 'M6-producer-verdict-polarity', check: 'producer-verdict', find: `r?.predicate === true && r?.wheelHypothesis === 'CONFIRMED'`, replace: `r?.predicate === true || r?.wheelHypothesis === 'CONFIRMED'` },
  { id: 'M7-delta-mode-drop', check: 'delta-mode-pixels', find: `e.deltaX === 0 && e.deltaZ === 0 && e.deltaMode === 0`, replace: `e.deltaX === 0 && e.deltaZ === 0` },
  { id: 'M8-scroll-witness-loose', check: 'scroll-event-witness', find: `r?.pageState?.scrollEvents === wl.filter((e) => !e.defaultPrevented).length`, replace: `r?.pageState?.scrollEvents >= 1` },
  { id: 'M9-server-run-drop', check: 'server-witness', find: `e.run === r?.nonce`, replace: `true` },
  { id: 'M10-host-identity-drop', check: 'host-identity',
    find: `check(/^Chrome\\/1[0-9]{2}\\./.test(r?.host?.cdpProduct || '') && /^Chromium 1[0-9]{2}\\./.test(r?.host?.chromium || '')\n    && r.host.chromium.split(' ')[1]?.split('.')[0] === r.host.cdpProduct.split('/')[1]?.split('.')[0], 'host-identity');`,
    replace: `check(true, 'host-identity');` },
  { id: 'M11-fixture-binding-drop', check: 'fixture-binding', find: `r.fixture.sha256 === external.fixtureSha256`, replace: `true` },
  { id: 'M12-target-scrolly-drop', check: 'target-binding', find: `e.targetId === 'tall' && e.scrollYAtDispatch === EXPECTED_AT_DISPATCH[i]`, replace: `e.targetId === 'tall'` },
  { id: 'M13-trusted-drop', check: 'trusted-fields', find: `e.isTrusted === true && Number.isFinite(e.ts)`, replace: `Number.isFinite(e.ts)` },
  { id: 'M14-sweep-error-drop', check: 'survivors', find: `r.teardown.sweepError === null`, replace: `true` },
  { id: 'M15-launch-guards-drop', check: 'launch-guards', find: `REQUIRED_ARGV.every((a) => r.host.argv.includes(a))`, replace: `true` },
  { id: 'M16-scroll-arithmetic-drop', check: 'scroll-arithmetic', find: `check(LEG_NAMES.every((k) => legMap[k]?.scrollY === EXPECTED_SCROLL[k]), 'scroll-arithmetic');`, replace: `check(true, 'scroll-arithmetic');` },
];

const pristine = sha(fs.readFileSync(counterPath));
const negatives = fs.readdirSync(negDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
function runCounter(counterFile, receipt, shot) {
  return new Promise((resolve) => {
    const child = spawn('node', [counterFile, receipt, '--driver', driverPath, '--expect-driver-sha256', driverSha, '--shot', shot, '--json'], { stdio: ['ignore', 'pipe', 'ignore'] });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.on('close', (code) => { let parsed = null; try { parsed = JSON.parse(out); } catch {} resolve({ exit: code, findings: parsed?.findings ?? null }); });
  });
}
async function pool(items, limit, fn) {
  const ret = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; ret[i] = await fn(items[i], i); }
  });
  await Promise.all(workers);
  return ret;
}
const pristineLive = await runCounter(counterPath, receiptPath, shotDir);
const pristineNegatives = {};
const pristineRows = await pool(negatives, 8, async (n) => [n, await runCounter(counterPath, path.join(negDir, n, 'receipt.json'), path.join(negDir, n))]);
for (const [n, res] of pristineRows) pristineNegatives[n] = res;

const rows = [];
for (const m of MUTANTS) {
  const src = fs.readFileSync(counterPath, 'utf8');
  const hits = src.split(m.find).length - 1;
  if (hits !== 1) { rows.push({ id: m.id, applied: false, hits, note: 'find string occurs ' + hits + ' times' }); continue; }
  const dir = path.join(outDir, m.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'counter.mjs'), src.replace(m.find, m.replace));
  fs.copyFileSync(path.join(path.dirname(counterPath), 'png-r64.mjs'), path.join(dir, 'png-r64.mjs'));
  const mutantFile = path.join(dir, 'counter.mjs');
  const live = await runCounter(mutantFile, receiptPath, shotDir);
  const negRows = await pool(negatives, 8, async (n) => [n, await runCounter(mutantFile, path.join(negDir, n, 'receipt.json'), path.join(negDir, n))]);
  const accepted = negRows.filter(([n, res]) => res.exit === 0 && pristineNegatives[n].exit !== 0).map(([n]) => n);
  const matching = negRows.find(([n]) => n === m.check);
  rows.push({
    id: m.id, check: m.check, applied: true, mutantSha256: sha(fs.readFileSync(mutantFile)),
    liveExit: live.exit,
    // A declared negative the mutant now ACCEPTS is the negative that kills it:
    // the suite noticed the weakening. A mutant that no negative notices, while
    // still accepting the live receipt, is a survivor.
    negativesAccepted: accepted,
    killed: accepted.length > 0,
    // The matching declared negative is the one that pins this check: the
    // mutation is load-bearing when that id no longer appears there.
    checkStillReported: matching ? Array.isArray(matching[1].findings) && matching[1].findings.includes(m.check) : null,
    survived: live.exit === 0 && accepted.length === 0,
  });
}
const matrix = {
  schema: 'tabi-r64-mutants-v1',
  counterSha256: pristine,
  input: { path: receiptPath, sha256: sha(fs.readFileSync(receiptPath)) },
  shotDir, driverSha256: driverSha,
  pristine: { liveExit: pristineLive.exit, negatives: Object.fromEntries(Object.entries(pristineNegatives).map(([k, v]) => [k, v.exit])) },
  mutants: rows.length, applied: rows.filter((r) => r.applied).length,
  liveAccepted: rows.filter((r) => r.liveExit === 0).length,
  killed: rows.filter((r) => r.killed).length,
  loadBearing: rows.filter((r) => r.checkStillReported === false).length,
  redundant: rows.filter((r) => r.checkStillReported === true).map((r) => r.id),
  surviving: rows.filter((r) => r.survived).map((r) => r.id),
  rows,
};
fs.writeFileSync(path.join(outDir, 'matrix.json'), JSON.stringify(matrix, null, 1));
if (flags.has('json')) console.log(JSON.stringify(matrix, null, 1));
else console.log('TABI_R64_MUTANTS mutants=' + matrix.mutants + ' applied=' + matrix.applied + ' liveAccepted=' + matrix.liveAccepted + ' killed=' + matrix.killed + ' loadBearing=' + matrix.loadBearing + ' redundant=' + matrix.redundant.length + ' survived=' + matrix.surviving.length);
process.exitCode = matrix.surviving.length === 0 && matrix.applied === matrix.mutants && matrix.liveAccepted === matrix.mutants && pristineLive.exit === 0 ? 0 : 1;

#!/usr/bin/env node
// Exact-line mutation matrix for the round-67 counter. Every mutant loosens one
// named check (the dangerous direction: a check that stops refusing). The
// harness requires each find string to occur EXACTLY ONCE in the pristine counter
// source (applied), then runs the mutant on the live receipt (liveAccepted when
// it exits 0) and on every declared negative. A mutant is killed when at least one
// declared negative that the pristine counter refuses is now accepted. A mutant
// that still accepts the live receipt and that no negative kills is a survivor.
//
// Usage: node mutate-r67.mjs run --counter <path> --negatives <dir> --receipt <live.json>
//   --shot <dir> --driver <path> --out <dir> [--json]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
if (argv[0] !== 'run') { console.log(JSON.stringify({ error: 'usage', detail: 'mutate-r67.mjs run --counter ... --negatives ...' })); process.exit(2); }
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

// Each find occurs exactly once in counters/chromium-hscroll-r67.mjs; replace is
// the loosened form. All are single-line except none (kept single-line on purpose).
const MUTANTS = [
  { id: 'M1-cancelation-drop', check: 'cancelation',
    find: `check(wlOk && wl.every((e) => e.defaultPrevented === false), 'cancelation');`,
    replace: `check(wlOk, 'cancelation');` },
  { id: 'M2-nonce-pixels-brightness-only', check: 'nonce-pixels',
    find: `if (!p || p[0] !== want || p[1] !== want || p[2] !== want) return false;`,
    replace: `if (!p) return false;` },
  { id: 'M3-band-pixels-sample-drop', check: 'band-pixels',
    find: `return !!s && !!want && BAND_SAMPLE_Y.every((y) => rgbEq(at(s, BAND_SAMPLE_X, y), want));`,
    replace: `return !!s && !!want && BAND_SAMPLE_Y.every(() => true);` },
  { id: 'M4-scrollend-count-boundary-drop', check: 'scrollend-count',
    find: `&& legMap.boundary?.scrollendsInLeg === 0, 'scrollend-count');`,
    replace: `, 'scrollend-count');` },
  { id: 'M5-scroll-arithmetic-drop', check: 'scroll-arithmetic',
    find: `check(LEG_NAMES.every((k) => legMap[k]?.scrollLeft === EXPECTED_SCROLL[k]), 'scroll-arithmetic');`,
    replace: `check(true, 'scroll-arithmetic');` },
  { id: 'M6-producer-verdict-polarity', check: 'producer-verdict',
    find: `check(r?.predicate === true && r?.hscrollHypothesis === 'CONFIRMED', 'producer-verdict');`,
    replace: `check(r?.predicate === true || r?.hscrollHypothesis === 'CONFIRMED', 'producer-verdict');` },
  { id: 'M7-scrollY-orthogonality-drop', check: 'scrollY-orthogonality',
    find: `check(legs.length === 6 && legs.every((l) => l.scrollY === 0), 'scrollY-orthogonality');`,
    replace: `check(true, 'scrollY-orthogonality');` },
  { id: 'M8-host-identity-major-drop', check: 'host-identity',
    find: `&& r.host.chromium.split(' ')[1]?.split('.')[0] === r.host.cdpProduct.split('/')[1]?.split('.')[0], 'host-identity');`,
    replace: `, 'host-identity');` },
  { id: 'M9-delta-mode-drop', check: 'delta-mode-pixels',
    find: `check(wlOk && wl.every((e) => e.deltaMode === 0 && e.deltaZ === 0), 'delta-mode-pixels');`,
    replace: `check(wlOk && wl.every((e) => e.deltaZ === 0), 'delta-mode-pixels');` },
  { id: 'M10-scrollend-log-witness-leg-drop', check: 'scrollend-log-witness',
    find: `&& legWindow(e.seq)?.scrollLeft === e.scrollLeft)`,
    replace: `)` },
  { id: 'M11-shot-bytes-dimension-drop', check: 'shot-bytes',
    find: `return !!s && s.width === VIEWPORT.width && s.height === VIEWPORT.height && s.sha256`,
    replace: `return !!s && s.sha256` },
  { id: 'M12-leg-witness-pixel-drop', check: 'leg-witness',
    find: `&& rgbEq(at(s, WITNESS_POINT.x, WITNESS_POINT.y), want);`,
    replace: `;` },
  { id: 'M13-host-identity-prefix-drop', check: 'host-identity',
    find: `check(/^Chrome\\/1[0-9]{2}\\./.test(r?.host?.cdpProduct || '') && `,
    replace: `check(` },
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
  fs.writeFileSync(path.join(dir, 'chromium-hscroll-r67.mjs'), src.replace(m.find, m.replace));
  fs.copyFileSync(path.join(path.dirname(counterPath), 'png-r67.mjs'), path.join(dir, 'png-r67.mjs'));
  const mutantFile = path.join(dir, 'chromium-hscroll-r67.mjs');
  const live = await runCounter(mutantFile, receiptPath, shotDir);
  const negRows = await pool(negatives, 8, async (n) => [n, await runCounter(mutantFile, path.join(negDir, n, 'receipt.json'), path.join(negDir, n))]);
  const accepted = negRows.filter(([n, res]) => res.exit === 0 && pristineNegatives[n].exit !== 0).map(([n]) => n);
  const matching = negRows.find(([n]) => n === m.check);
  rows.push({
    id: m.id, check: m.check, applied: true, mutantSha256: sha(fs.readFileSync(mutantFile)),
    liveExit: live.exit,
    // A declared negative the mutant now ACCEPTS is the negative that kills it.
    negativesAccepted: accepted,
    killed: accepted.length > 0,
    // The matching declared negative still reports this check: mutation load-bearing when it does not.
    checkStillReported: matching ? Array.isArray(matching[1].findings) && matching[1].findings.includes(m.check) : null,
    survived: live.exit === 0 && accepted.length === 0,
  });
}
const matrix = {
  schema: 'tabi-r67-mutants-v1',
  counterSha256: pristine,
  input: { path: receiptPath, sha256: sha(fs.readFileSync(receiptPath)) },
  shotDir, driverSha256: driverSha,
  pristine: { liveExit: pristineLive.exit, liveFindings: pristineLive.findings, negatives: Object.fromEntries(Object.entries(pristineNegatives).map(([k, v]) => [k, v.exit])) },
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
else console.log('TABI_R67_MUTANTS mutants=' + matrix.mutants + ' applied=' + matrix.applied + ' liveAccepted=' + matrix.liveAccepted + ' killed=' + matrix.killed + ' loadBearing=' + matrix.loadBearing + ' redundant=' + matrix.redundant.length + ' survived=' + matrix.surviving.length);
process.exitCode = matrix.surviving.length === 0 && matrix.applied === matrix.mutants && matrix.liveAccepted === matrix.mutants && pristineLive.exit === 0 ? 0 : 1;

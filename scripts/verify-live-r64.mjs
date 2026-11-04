#!/usr/bin/env node
// Live verifier for the round-64 wheel/scroll capability. This is the round's
// demonstration instrument: it does not read a receipt and agree with it, it
// RUNS the frozen driver twice cold in its own scratch, requires both receipts
// to pass the frozen counter, requires the measured fields to agree across the
// two runs, and requires the committed evidence receipt to agree with its own
// live run. `--no-run` is the round's no-work control: without executing the
// browser the target is unreachable, so the verifier refuses.
//
// Usage: node verify-live-r64.mjs --scratch <ABS> --driver <path> --counter <path>
//   --evidence <receipt.json> --evidence-shots <dir> [--no-run] [--json]
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
const flags = new Map();
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) { const n = argv[i + 1]; if (n && !n.startsWith('--')) { flags.set(argv[i].slice(2), n); i++; } else flags.set(argv[i].slice(2), true); }
}
const opt = (n) => (flags.get(n) === true ? null : flags.get(n) || null);
const out = { schema: 'tabi-r64-live-verifier', predicate: false, findings: [], runs: [], agreement: null };
const finish = (code) => {
  if (flags.has('json')) console.log(JSON.stringify(out, null, 1));
  else console.log('TABI_R64_LIVE predicate=' + out.predicate + ' findings=' + (out.findings.join(',') || 'none') + ' runs=' + out.runs.map((r) => r.name + ':' + r.exit + '/' + r.counterExit).join(','));
  process.exitCode = code;
};

async function main() {
const need = ['scratch', 'driver', 'counter', 'evidence', 'evidence-shots'];
for (const k of need) if (!opt(k)) { out.findings.push('usage'); console.error('missing --' + k); return finish(2); }
const scratch = path.resolve(opt('scratch'));
const driver = path.resolve(opt('driver'));
const counter = path.resolve(opt('counter'));
const evidence = path.resolve(opt('evidence'));
const evidenceShots = path.resolve(opt('evidence-shots'));
const driverSha = sha(fs.readFileSync(driver));
out.driverSha256 = driverSha;
out.counterSha256 = sha(fs.readFileSync(counter));
function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); });
  });
}
function runCounter(receipt, shotDir) {
  const r = spawnSync('node', [counter, receipt, '--driver', driver, '--expect-driver-sha256', driverSha, '--shot', shotDir, '--json'], { encoding: 'utf8', timeout: 180000 });
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch {}
  return { exit: r.status, findings: parsed?.findings ?? null, stdout: (r.stdout || '').slice(0, 800), stderr: (r.stderr || '').slice(0, 800) };
}
const pick = (legs) => (legs || []).map((l) => [l.name, l.scrollY, l.wheellogLen, JSON.stringify(l.witnessRgb)]);
const wlShape = (wl) => (wl || []).map((e) => [e.seq, e.type, e.deltaX, e.deltaY, e.deltaZ, e.deltaMode, e.isTrusted, e.cancelable, e.defaultPrevented, e.targetId, e.scrollYAtDispatch]);
const pageShape = (p) => p && [p.scrollY, p.scrollEvents, p.wheellogLen];

if (flags.has('no-run')) {
  out.findings.push('live-run-required');
  out.note = 'no-run control: the claim target is unreachable without executing the frozen driver';
  return finish(1);
}
if (!fs.existsSync(scratch)) fs.mkdirSync(scratch, { recursive: true });

const evCounter = runCounter(evidence, evidenceShots);
out.evidence = { path: evidence, counterExit: evCounter.exit, findings: evCounter.findings };
if (evCounter.exit !== 0) out.findings.push('evidence-counter');

// Two attempts per run: a launch that fails under fleet load is re-attempted
// with a fresh scratch dir and fresh ports; the attempt list is reported.
for (const name of ['a', 'b']) {
  const attempts = [];
  let entry = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const dir = path.join(scratch, 'run-' + name + (attempt > 1 ? '-retry' : ''));
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const httpPort = await freePort();
    let cdpPort = await freePort();
    while (cdpPort === httpPort) cdpPort = await freePort();
    const nonce = 'tabi-r64-live-' + name;
    const run = spawnSync('node', [driver, '--scratch', path.join(dir, 'work'), '--out', path.join(dir, 'receipt.json'),
      '--nonce', nonce, '--http-port', String(httpPort), '--cdp-port', String(cdpPort)], { encoding: 'utf8', timeout: 900000 });
    attempts.push(run.status);
    const candidate = { name, nonce, exit: run.status, httpPort, cdpPort, counterExit: null, findings: null, attempts: attempts.slice(), stderr: (run.stderr || '').slice(0, 800), dir };
    if (run.status !== 0) { entry = candidate; continue; }
    const c = runCounter(path.join(dir, 'receipt.json'), dir);
    candidate.counterExit = c.exit;
    candidate.findings = c.findings;
    entry = candidate;
    if (c.exit !== 0) out.findings.push('counter-' + name);
    break;
  }
  if (entry.exit !== 0) out.findings.push('run-' + name + '-failed');
  out.runs.push(entry);
}
const [runA, runB] = out.runs;
const load = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
const a = runA && runA.exit === 0 ? load(path.join(runA.dir, 'receipt.json')) : null;
const b = runB && runB.exit === 0 ? load(path.join(runB.dir, 'receipt.json')) : null;
const ev = load(evidence);
out.agreement = { crossRun: null, evidence: null };
if (a && b) {
  const same = JSON.stringify(pick(a.legs)) === JSON.stringify(pick(b.legs))
    && JSON.stringify(wlShape(a.wheellog)) === JSON.stringify(wlShape(b.wheellog))
    && JSON.stringify(pageShape(a.pageState)) === JSON.stringify(pageShape(b.pageState));
  out.agreement.crossRun = same;
  if (!same) out.findings.push('cross-run-mismatch');
} else out.findings.push('cross-run-unmeasurable');
if (a && ev) {
  const same = JSON.stringify(pick(ev.legs)) === JSON.stringify(pick(a.legs))
    && JSON.stringify(wlShape(ev.wheellog)) === JSON.stringify(wlShape(a.wheellog))
    && JSON.stringify(pageShape(ev.pageState)) === JSON.stringify(pageShape(a.pageState));
  out.agreement.evidence = same;
  if (!same) out.findings.push('evidence-mismatch');
} else out.findings.push('evidence-unmeasurable');
out.predicate = out.findings.length === 0;
return finish(out.predicate ? 0 : 1);
}
await main();

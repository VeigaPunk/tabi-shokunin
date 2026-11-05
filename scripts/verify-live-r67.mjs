#!/usr/bin/env node
// Live verifier for the round-67 horizontal-wheel capability (chromium-hscroll-domain-linux).
// Demonstration instrument: it RUNS the pinned driver twice, cold, each run in its own
// scratch subdirectory on fresh ports, and requires: (a) each live receipt to pass the
// counter, run by path; (b) the measured fields to agree across the two live runs;
// (c) the committed evidence receipt to pass the counter and to agree with one live run.
// The verifier never imports the counter. The driver pin is checked before any browser
// is launched. `--no-run` is the no-work control: without executing the pinned driver the
// target is unreachable, so the verifier refuses with finding `no-run`.
//
// Usage: node verify-live-r67.mjs --scratch <ABS> --driver <path> --expect-driver-sha256 <hex>
//   --counter <path> --evidence <receipt.json> --evidence-shots <dir> [--no-run] [--json]
// Exit: 0 predicate true; 1 evaluated and false (including --no-run); 2 usage or pin refusal.
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const RUN_TIMEOUT_MS = 900000;
const COUNTER_TIMEOUT_MS = 180000;
const LEG_COUNT = 6;
const WHEEL_COUNT = 5;
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const isNum = (v) => Number.isFinite(v);

const argv = process.argv.slice(2);
const flags = new Map();
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith('--')) continue;
  const next = argv[i + 1];
  if (next !== undefined && !next.startsWith('--')) { flags.set(argv[i].slice(2), next); i++; }
  else flags.set(argv[i].slice(2), true);
}
// A flag given without a value is stored as `true`; only string values count.
const str = (name) => (typeof flags.get(name) === 'string' ? flags.get(name) : null);
const statOf = (p) => { try { return fs.statSync(p); } catch { return null; } };
const load = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };

const out = {
  schema: 'tabi-r67-live-verifier',
  predicate: false,
  exit: null,
  findings: [],
  driverSha256: null,
  expectedDriverSha256: null,
  counterSha256: null,
  runs: [],
  agreement: { crossRun: null, evidence: null },
  evidence: null,
};
const finish = (code) => {
  out.exit = code;
  if (flags.has('json')) console.log(JSON.stringify(out, null, 1));
  else {
    console.log('TABI_R67_LIVE predicate=' + out.predicate + ' findings=' + (out.findings.join(',') || 'none')
      + ' runs=' + out.runs.map((r) => r.name + ':' + r.exit + '/' + r.counterExit).join(','));
  }
  process.exitCode = code;
};

function probePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });
}
// Fresh ports: every port handed out in this verifier process is distinct from all others.
async function freshPort(used) {
  for (;;) {
    const port = await probePort();
    if (!used.has(port)) { used.add(port); return port; }
  }
}

// A receipt is measurable only when every compared field is present and typed; otherwise two
// empty receipts would agree by accident.
function measurable(r) {
  return !!r
    && Array.isArray(r.legs) && r.legs.length === LEG_COUNT
    && r.legs.every((l) => l && isNum(l.scrollLeft) && isNum(l.scrollY) && isNum(l.scrollendsInLeg))
    && Array.isArray(r.wheellog) && r.wheellog.length === WHEEL_COUNT
    && r.wheellog.every((e) => e && isNum(e.deltaX))
    && !!r.pageState && isNum(r.pageState.scrollEvents) && isNum(r.pageState.scrollendEvents);
}
const measured = (r) => JSON.stringify({
  legs: r.legs.map((l) => [l.name, l.scrollLeft, l.scrollY, l.scrollendsInLeg]),
  wheelDeltaX: r.wheellog.map((e) => e.deltaX),
  scrollEvents: r.pageState.scrollEvents,
  scrollendEvents: r.pageState.scrollendEvents,
});

async function main() {
  for (const k of ['scratch', 'driver', 'counter', 'evidence', 'evidence-shots']) {
    if (!str(k)) { out.findings.push('usage'); console.error('usage: missing --' + k); return finish(2); }
  }
  if (!path.isAbsolute(str('scratch'))) {
    out.findings.push('usage');
    console.error('usage: --scratch must be an absolute path');
    return finish(2);
  }
  const scratch = path.resolve(str('scratch'));
  const driver = path.resolve(str('driver'));
  const counter = path.resolve(str('counter'));
  const evidence = path.resolve(str('evidence'));
  const evidenceShots = path.resolve(str('evidence-shots'));

  // (1) Driver pin, checked before any browser run. A missing or malformed expectation, an
  // unreadable driver, or a byte mismatch refuses with exit 2 and no process is started.
  const expectRaw = flags.get('expect-driver-sha256');
  const expect = typeof expectRaw === 'string' && /^[0-9a-fA-F]{64}$/.test(expectRaw) ? expectRaw.toLowerCase() : null;
  out.expectedDriverSha256 = expect;
  let driverSha = null;
  try { driverSha = sha256(fs.readFileSync(driver)); } catch (err) { console.error('driver unreadable: ' + err.message); }
  out.driverSha256 = driverSha;
  if (!expect || driverSha !== expect) {
    out.findings.push('driver-pin');
    console.error('driver-pin refusal: expected ' + (expect ?? '<missing or not 64 hex>') + ', driver sha256 ' + (driverSha ?? '<unreadable>'));
    return finish(2);
  }

  // (2) No-run control: the target is reachable only by executing the pinned driver.
  if (flags.has('no-run')) {
    out.findings.push('no-run');
    out.note = 'no-run control: the claim target is unreachable without executing the pinned driver';
    return finish(1);
  }

  // Input files are checked before any browser run; a missing input is a usage refusal.
  let counterBytes = null;
  try { counterBytes = fs.readFileSync(counter); } catch { /* reported below */ }
  if (!counterBytes) { out.findings.push('usage'); console.error('usage: counter unreadable: ' + counter); return finish(2); }
  out.counterSha256 = sha256(counterBytes);
  if (!statOf(evidence)?.isFile()) { out.findings.push('usage'); console.error('usage: evidence receipt missing: ' + evidence); return finish(2); }
  if (!statOf(evidenceShots)?.isDirectory()) { out.findings.push('usage'); console.error('usage: evidence shots dir missing: ' + evidenceShots); return finish(2); }

  fs.mkdirSync(scratch, { recursive: true });
  const used = new Set();
  const runCounter = (receipt, shotDir) => {
    const r = spawnSync(process.execPath, [counter, receipt, '--driver', driver, '--expect-driver-sha256', expect, '--shot', shotDir, '--json'],
      { encoding: 'utf8', timeout: COUNTER_TIMEOUT_MS });
    let parsed = null;
    try { parsed = JSON.parse(r.stdout); } catch { /* counter printed no JSON */ }
    return { exit: r.status, predicate: parsed?.predicate ?? null, findings: parsed?.findings ?? null, stderr: (r.stderr || '').slice(0, 800) };
  };

  // Committed evidence receipt: the counter must accept it against the same pin.
  const evCounter = runCounter(evidence, evidenceShots);
  out.evidence = { path: evidence, counterExit: evCounter.exit, counterPredicate: evCounter.predicate, findings: evCounter.findings };
  if (evCounter.exit !== 0) out.findings.push('evidence-counter');

  // (3) Two cold live runs: fresh subdirectory, fresh ports, one attempt each. A retained red
  // receipt (driver exit 1) is recorded as a failure and never re-run.
  for (const name of ['a', 'b']) {
    const dir = path.join(scratch, 'run-' + name);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const httpPort = await freshPort(used);
    const cdpPort = await freshPort(used);
    const nonce = 'tabi-r67-live-' + name;
    const receipt = path.join(dir, 'receipt.json');
    const run = spawnSync(process.execPath, [driver, '--scratch', path.join(dir, 'work'), '--out', receipt,
      '--nonce', nonce, '--http-port', String(httpPort), '--cdp-port', String(cdpPort)],
      { encoding: 'utf8', timeout: RUN_TIMEOUT_MS });
    const entry = {
      name, dir, nonce, httpPort, cdpPort, exit: run.status, signal: run.signal,
      error: run.error?.message ?? null, counterExit: null, counterPredicate: null, findings: null,
      stderr: (run.stderr || '').slice(0, 800),
    };
    out.runs.push(entry);
    if (run.status !== 0) { out.findings.push('run-' + name + '-failed'); continue; }
    const c = runCounter(receipt, dir);
    entry.counterExit = c.exit;
    entry.counterPredicate = c.predicate;
    entry.findings = c.findings;
    if (c.exit !== 0) out.findings.push('counter-' + name);
  }

  // (4) Cross-run agreement and (5) evidence-to-live agreement on the measured fields.
  const [runA, runB] = out.runs;
  const liveA = runA?.exit === 0 ? load(path.join(runA.dir, 'receipt.json')) : null;
  const liveB = runB?.exit === 0 ? load(path.join(runB.dir, 'receipt.json')) : null;
  const evReceipt = load(evidence);
  if (measurable(liveA) && measurable(liveB)) {
    out.agreement.crossRun = measured(liveA) === measured(liveB);
    if (!out.agreement.crossRun) out.findings.push('cross-run-mismatch');
  } else out.findings.push('cross-run-unmeasurable');
  if (measurable(liveA) && measurable(evReceipt)) {
    out.agreement.evidence = measured(evReceipt) === measured(liveA);
    if (!out.agreement.evidence) out.findings.push('evidence-mismatch');
  } else out.findings.push('evidence-unmeasurable');

  // (6) predicate = no findings.
  out.predicate = out.findings.length === 0;
  return finish(out.predicate ? 0 : 1);
}

try {
  await main();
} catch (err) {
  out.findings.push('internal-error');
  out.error = String(err?.stack || err);
  finish(1);
}

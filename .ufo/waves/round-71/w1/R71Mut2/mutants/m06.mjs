#!/usr/bin/env node
// Live verifier, tabi round 71 (C2): the round-70 verifier (scripts/verify-live-r70.mjs, frozen,
// unchanged) re-derives a held synthetic-gesture capability by running its pinned driver, but
// R70Critic showed it is not an execution oracle against two same-user attacks (r70 closure
// routed defect R1): (A) an inherited NODE_OPTIONS preload rewrites the driver's receipt inside a
// real run; (B) a driver swap after the pin read (:122) and before the spawn (:158) runs a
// do-nothing producer. This generation binds EXECUTION to the pinned bytes:
//   (E) environment: refuse (exit 2, finding env-injection) when the verifier's own environment
//       carries a loader-injection variable (NODE_OPTIONS, NODE_PATH, LD_PRELOAD, LD_AUDIT,
//       LD_LIBRARY_PATH, NODE_REPL_EXTERNAL_MODULE, DYLD_*), or (finding exec-argv) when the
//       verifier itself was started with node execArgv; every child (counter, driver) is spawned
//       with an explicit allow-listed environment, never the inherited one;
//   (S) snapshot: after the pin check the driver and counter BYTES are written into a fresh
//       private directory (mode 0700, files 0500) under --scratch; every counter and driver
//       process executes the snapshot, never the lane path; the snapshot is re-hashed before
//       each run and after the last counter (finding snapshot-mutated);
//   (W) wall floor: a live run that ends faster than the profile's floor is refused
//       (run-<n>-wall-floor; the round-70 swap attack's runs took 24-26 ms, real runs 10-13 s);
//   (O) stdout binding: the driver's own stdout summary must parse and agree with the receipt it
//       wrote on the profile's summary keys (run-<n>-stdout-mismatch).
// Everything else is the round-70 contract, unchanged: pins before any launch, --no-run control,
// committed evidence through the pinned counter, two cold live runs on verifier-drawn nonces and
// ports with run binding, cross-run and evidence-to-live fingerprints.
// Limit (declared): a same-user process can still rewrite the snapshot and restore it between
// two hash reads, or patch the verifier itself; this verifier closes the two demonstrated
// attacks and detects a persistent snapshot swap, it does not make same-user tampering
// impossible.
//
// Usage: node verify-live-r71.mjs --profile <synthscroll-r69|synthtap-r70> --scratch <ABS dir>
//          [--no-run] [--json]
//        Control-only overrides (never a scored run): --driver <path> --driver-sha256 <hex>
// Exit: 0 predicate true; 1 evaluated and false (incl. --no-run); 2 usage, pin or environment
//       refusal; 4 every check held but an override flag was used (a control run is never a pass).
// Write scope: --scratch only. Never touches the lane tree.
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const LANE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RUN_TIMEOUT_MS = 600000;
const INJECT_ENV = /^(NODE_OPTIONS|NODE_PATH|NODE_REPL_EXTERNAL_MODULE|LD_PRELOAD|LD_AUDIT|LD_LIBRARY_PATH|DYLD_[A-Z_]+)$/;
const COUNTER_TIMEOUT_MS = 120000;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const load = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
const arr = (v) => (Array.isArray(v) ? v : []);
const MOVES = new Set(['pointermove', 'mousemove', 'touchmove']);

const PROFILES = {
  'synthscroll-r69': {
    capability: 'chromium-synth-scroll-gesture-linux',
    driver: 'scripts/chrome-cdp-synthscroll-round69.mjs',
    driverSha256: '13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3',
    counter: 'scripts/check-synthscroll-r69.mjs',
    counterSha256: 'c1b3763c9781ad4cebd26d5298de46529258c4fe40b54cd2c6c62080492da795',
    evidence: 'corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json',
    noncePrefix: 'tabi-r69-',
    wallFloorMs: 6000,
    stdoutKeys: ['schema', 'predicate', 'synthScrollHypothesis', 'legs', 'pageState', 'teardown'],
    fingerprint: (r) => {
      if (!r || arr(r.legs).length !== 5 || !Array.isArray(r.events)) return null;
      return arr(r.legs).map((l) => {
        const evs = r.events.filter((e) => e && e.leg === l.name);
        const wheels = evs.filter((e) => e.type === 'wheel');
        const n = (t) => evs.filter((e) => e.type === t).length;
        return [l.name, l.scrollYBefore, l.scrollY, wheels.reduce((a, e) => a + e.deltaY, 0), wheels.length > 0,
          n('pointerdown'), n('pointerup'), n('touchstart'), n('touchend'), n('scrollend') > 0];
      });
    },
  },
  'synthtap-r70': {
    capability: 'chromium-synth-tap-gesture-linux',
    driver: 'scripts/chrome-cdp-synthtap-round70.mjs',
    driverSha256: '704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577',
    counter: 'scripts/check-synthtap-r70.mjs',
    counterSha256: 'a2ed7619ca6ea165a3877308c3d87c41a27f6b2a7f24a7fca4f879073a39756e',
    evidence: 'corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json',
    noncePrefix: 'tabi-r70-',
    wallFloorMs: 6000,
    stdoutKeys: ['schema', 'predicate', 'synthTapHypothesis', 'legShape', 'teardown'],
    fingerprint: (r) => {
      if (!r || arr(r.legs).length !== 8 || !Array.isArray(r.events)) return null;
      return arr(r.legs).map((l) => {
        const evs = r.events.filter((e) => e && e.leg === l.name);
        return [l.name, evs.filter((e) => !MOVES.has(e.type)).map((e) => e.type + (e.pointerType ? '(' + e.pointerType + ')' : '')).join(','),
          evs.filter((e) => e.type === 'click').map((e) => e.detail).join(','), l.cdpError === null ? null : String(l.cdpError).includes('Position out of bounds')];
      });
    },
  },
};

const argv = process.argv.slice(2);
const flags = new Map();
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith('--')) continue;
  const next = argv[i + 1];
  if (next !== undefined && !next.startsWith('--')) { flags.set(argv[i].slice(2), next); i++; } else flags.set(argv[i].slice(2), true);
}
const str = (k) => (typeof flags.get(k) === 'string' ? flags.get(k) : null);
const out = { schema: 'tabi-r71-live-verifier', profile: null, capability: null, predicate: false, exit: null, pinSource: 'frozen', findings: [], driver: null, driverSha256: null, counterSha256: null, evidence: null, runs: [], agreement: { crossRun: null, evidence: null }, snapshot: null, env: null };
const finish = (code) => {
  out.exit = code;
  if (flags.has('json')) console.log(JSON.stringify(out, null, 1));
  else console.log('TABI_R71_LIVE profile=' + out.profile + ' predicate=' + out.predicate + ' pinSource=' + out.pinSource + ' findings=' + (out.findings.join(',') || 'none') + ' runs=' + out.runs.map((r) => r.name + ':' + r.exit + '/' + r.counterExit).join(','));
  process.exitCode = code;
};
const freePort = () => new Promise((resolve, reject) => { const s = net.createServer(); s.once('error', reject); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
async function freshPort(used) { for (;;) { const p = await freePort(); if (!used.has(p)) { used.add(p); return p; } } }

async function main() {
  const prof = PROFILES[str('profile')];
  if (!prof) { out.findings.push('usage'); console.error('usage: --profile ' + Object.keys(PROFILES).join('|')); return finish(2); }
  out.profile = str('profile'); out.capability = prof.capability;
  if (!str('scratch') || !path.isAbsolute(str('scratch'))) { out.findings.push('usage'); console.error('usage: --scratch <ABS dir>'); return finish(2); }
  const scratch = path.resolve(str('scratch'));
  // (E) environment, before anything is read or launched
  const injected = Object.keys(process.env).filter((k) => INJECT_ENV.test(k)).sort();
  out.env = { injected, execArgv: process.execArgv.slice() };
  if (injected.length) { out.findings.push('env-injection'); console.error('refused: loader-injection variables in the environment: ' + injected.join(',')); return finish(2); }
  if (process.execArgv.length) { out.findings.push('exec-argv'); console.error('refused: the verifier was started with node execArgv ' + JSON.stringify(process.execArgv)); return finish(2); }
  let driver = path.join(LANE, prof.driver); let driverPin = prof.driverSha256;
  if (flags.has('driver') || flags.has('driver-sha256')) {
    if (!str('driver') || !/^[0-9a-f]{64}$/.test(str('driver-sha256') || '')) { out.findings.push('usage'); console.error('usage: --driver needs --driver-sha256 <64 hex>'); return finish(2); }
    driver = path.resolve(str('driver')); driverPin = str('driver-sha256'); out.pinSource = 'override';
  }
  out.driver = driver;
  const counter = path.join(LANE, prof.counter);
  // (1) pins before any launch: hash the bytes once; those exact bytes are what will execute
  let dBytes = null, cBytes = null;
  try { dBytes = fs.readFileSync(driver); } catch {}
  try { cBytes = fs.readFileSync(counter); } catch {}
  out.driverSha256 = dBytes ? sha256(dBytes) : null; out.counterSha256 = cBytes ? sha256(cBytes) : null;
  if (!/^[0-9a-f]{64}$/.test(driverPin) || out.driverSha256 !== driverPin) { out.findings.push('driver-pin'); return finish(2); }
  if (!/^[0-9a-f]{64}$/.test(prof.counterSha256) || out.counterSha256 !== prof.counterSha256) { out.findings.push('counter-pin'); return finish(2); }
  // Chromium's singleton socket: <scratch>/run-x/work/org.chromium.Chromium.XXXXXX/SingletonSocket
  // must fit the 107-byte sun_path (r70 R4). Refuse before any launch.
  const sockLen = Buffer.byteLength(path.join(scratch, 'run-a', 'work', 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));
  if (sockLen > 107) { out.findings.push('scratch-path-too-long'); console.error('usage: --scratch too long for Chromium\'s singleton socket (' + sockLen + ' > 107 bytes)'); return finish(2); }
  // (2) no-work control
  if (flags.has('no-run')) { out.findings.push('no-run'); out.note = 'no-run control: the target is unreachable without executing the pinned driver'; return finish(1); }
  // (S) private snapshot of the hashed bytes; nothing below executes a lane path
  fs.mkdirSync(scratch, { recursive: true });
  const snapDir = fs.mkdtempSync(path.join(scratch, 'snap-'));
  fs.chmodSync(snapDir, 0o700);
  const snapDriver = path.join(snapDir, path.basename(prof.driver));
  const snapCounter = path.join(snapDir, path.basename(prof.counter));
  fs.writeFileSync(snapDriver, dBytes, { mode: 0o500, flag: 'wx' });
  fs.writeFileSync(snapCounter, cBytes, { mode: 0o500, flag: 'wx' });
  const snapHash = (f) => { try { return sha256(fs.readFileSync(f)); } catch { return null; } };
  out.snapshot = { dir: snapDir, driver: snapDriver, counter: snapCounter, reads: [] };
  const snapCheck = (when) => {
    const d = snapHash(snapDriver), c = snapHash(snapCounter);
    const ok = d === driverPin && c === prof.counterSha256;
    out.snapshot.reads.push({ when, driver: d, counter: c, ok });
    if (!ok && !out.findings.includes('snapshot-mutated')) out.findings.push('snapshot-mutated');
    return ok;
  };
  snapCheck('after-write');
  const childEnv = (extra = {}) => ({ PATH: '/usr/local/bin:/usr/bin:/bin', LANG: 'C.UTF-8', HOME: scratch, TMPDIR: scratch, ...extra });
  const runCounter = (receipt, expectSha = prof.driverSha256) => {
    const p = spawnSync(process.execPath, [snapCounter, '--receipt', receipt, '--expect-driver-sha256', expectSha, '--json'], { encoding: 'utf8', timeout: COUNTER_TIMEOUT_MS, env: childEnv() });
    let j = null; try { j = JSON.parse(p.stdout); } catch {}
    return { exit: p.status, verdict: j?.verdict ?? null, findings: j ? j.findings.map((f) => f.id) : null };
  };
  // (3) committed evidence -- always against the profile's FROZEN driver pin
  const evPath = path.join(LANE, prof.evidence);
  const ev = runCounter(evPath, prof.driverSha256);
  out.evidence = { path: prof.evidence, sha256: fs.existsSync(evPath) ? sha256(fs.readFileSync(evPath)) : null, counterExit: ev.exit, findings: ev.findings };
  if (ev.exit !== 0) out.findings.push('evidence-counter');
  // (4) two cold live runs with verifier-drawn nonces and ports, each executing the snapshot
  const used = new Set();
  for (const name of ['a', 'b']) {
    const dir = path.join(scratch, 'run-' + name);
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const httpPort = await freshPort(used); const cdpPort = await freshPort(used);
    const nonce = prof.noncePrefix + 'live-' + crypto.randomBytes(5).toString('hex') + '-' + name;
    const receipt = path.join(dir, 'receipt.json');
    const work = path.join(dir, 'work');
    const snapOk = snapCheck('before-run-' + name);
    const spawnedAt = Date.now();
    const run = spawnSync(process.execPath, [snapDriver, '--scratch', work, '--out', receipt, '--nonce', nonce, '--http-port', String(httpPort), '--cdp-port', String(cdpPort)], { encoding: 'utf8', timeout: RUN_TIMEOUT_MS, env: childEnv({ TMPDIR: work }) });
    const e = { name, nonce, httpPort, cdpPort, exit: run.status, signal: run.signal, wallMs: Date.now() - spawnedAt, snapshotOkBefore: snapOk, counterExit: null, counterFindings: null, binding: {}, receiptSha256: null, stdout: null };
    out.runs.push(e);
    if (false) out.findings.push('run-' + name + '-wall-floor');
    if (run.status !== 0) { out.findings.push('run-' + name + '-failed'); continue; }
    const st = (() => { try { return fs.statSync(receipt); } catch { return null; } })();
    const r = load(receipt);
    e.receiptSha256 = st ? sha256(fs.readFileSync(receipt)) : null;
    const argvList = arr(r?.host?.argv);
    e.binding = {
      newFile: !!st && st.mtimeMs >= spawnedAt - 1000,
      nonce: !!r && r.nonce === nonce && r.nonceOnPage === nonce,
      driverDigest: !!r && r.driverSha256 === driverPin,
      cdpPort: argvList.includes('--remote-debugging-port=' + cdpPort),
      httpPort: !!r && typeof r.fixture?.origin === 'string' && r.fixture.origin === 'http://127.0.0.1:' + httpPort,
    };
    for (const [k, ok] of Object.entries(e.binding)) if (!ok) out.findings.push('run-' + name + '-' + k);
    // (O) the driver's stdout summary must agree with the receipt it wrote
    let so = null; try { so = JSON.parse(run.stdout); } catch {}
    const soOk = !!so && !!r && prof.stdoutKeys.every((k) => k in so && JSON.stringify(so[k]) === JSON.stringify(r[k]));
    e.stdout = { parsed: !!so, agrees: soOk };
    if (!soOk) out.findings.push('run-' + name + '-stdout-mismatch');
    const c = runCounter(receipt);
    e.counterExit = c.exit; e.counterFindings = c.findings;
    if (c.exit !== 0) out.findings.push('counter-' + name);
  }
  snapCheck('after-runs');
  // (5) cross-run and (6) evidence-to-live
  const [ra, rb] = out.runs.map((x) => (x.exit === 0 ? load(path.join(scratch, 'run-' + x.name, 'receipt.json')) : null));
  if (ra && rb) {
    if (!(ra.host?.launchToken && rb.host?.launchToken && ra.host.launchToken !== rb.host.launchToken && ra.nonce !== rb.nonce)) out.findings.push('cross-run-identity');
  }
  const fa = prof.fingerprint(ra), fb = prof.fingerprint(rb), fe = prof.fingerprint(load(evPath));
  if (fa && fb) { out.agreement.crossRun = JSON.stringify(fa) === JSON.stringify(fb); if (!out.agreement.crossRun) out.findings.push('cross-run-mismatch'); } else out.findings.push('cross-run-unmeasurable');
  if (fa && fe) { out.agreement.evidence = JSON.stringify(fa) === JSON.stringify(fe); if (!out.agreement.evidence) out.findings.push('evidence-mismatch'); } else out.findings.push('evidence-unmeasurable');
  out.fingerprint = fa;
  const clean = out.findings.length === 0;
  out.predicate = clean && out.pinSource === 'frozen';
  return finish(out.predicate ? 0 : clean ? 4 : 1);
}
try { await main(); } catch (err) { out.findings.push('internal-error'); out.error = String(err?.stack || err); finish(1); }

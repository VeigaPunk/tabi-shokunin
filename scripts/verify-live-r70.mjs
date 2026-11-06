#!/usr/bin/env node
// Live verifier, tabi round 70: re-derives a held synthetic-gesture capability by RUNNING its
// pinned driver, instead of trusting a committed receipt (r69 closure routed defect R1: the
// r69 counter reads a receipt; a fabricated-but-consistent receipt passes it).
//
// Profiles (frozen; pins are sha256 of the committed bytes):
//   synthscroll-r69  capability chromium-synth-scroll-gesture-linux (round 69)
//   synthtap-r70     capability chromium-synth-tap-gesture-linux   (round 70)
//
// What one invocation does, in order:
//   (1) pins: sha256(driver file) and sha256(counter file) must equal the profile pins, before
//       any browser is launched (exit 2, finding driver-pin / counter-pin);
//   (2) --no-run is the no-work control: finding no-run, exit 1;
//   (3) the committed evidence receipt must pass the pinned counter;
//   (4) two cold live runs, each in its own scratch subdirectory, on fresh loopback ports, with a
//       nonce the VERIFIER draws at random (never a fixed string). Per run: driver exit 0; the
//       receipt is a new file written during the run; receipt.nonce and the page nonce equal the
//       drawn nonce; the receipt's driver digest equals the digest of the binary EXECUTED; the
//       Chromium argv carries the drawn CDP port and the fixture origin carries the drawn HTTP
//       port; the pinned counter exits 0 on it against the profile's FROZEN driver digest. A
//       receipt therefore passes only if it names the executed binary AND that binary is the
//       frozen driver;
//   (5) cross-run: the two launch tokens and nonces differ, and the measured fingerprint agrees;
//   (6) evidence-to-live: the committed evidence receipt's fingerprint equals run a's.
// Predicate: no findings AND frozen pins (no override flags).
//
// Usage: node verify-live-r70.mjs --profile <synthscroll-r69|synthtap-r70> --scratch <ABS dir>
//          [--no-run] [--json]
//        Control-only overrides (never a scored run): --driver <path> --driver-sha256 <hex>
//          (execute another binary pinned to its own digest, so the run-binding and counter
//          checks are exercised on forgers).
// Exit: 0 predicate true; 1 evaluated and false (incl. --no-run); 2 usage or pin refusal;
//       4 every check held but an override flag was used (a control run is never a pass).
// Write scope: --scratch only. Never touches the lane tree.
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const LANE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RUN_TIMEOUT_MS = 600000;
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
const out = { schema: 'tabi-r70-live-verifier', profile: null, capability: null, predicate: false, exit: null, pinSource: 'frozen', findings: [], driver: null, driverSha256: null, counterSha256: null, evidence: null, runs: [], agreement: { crossRun: null, evidence: null } };
const finish = (code) => {
  out.exit = code;
  if (flags.has('json')) console.log(JSON.stringify(out, null, 1));
  else console.log('TABI_R70_LIVE profile=' + out.profile + ' predicate=' + out.predicate + ' pinSource=' + out.pinSource + ' findings=' + (out.findings.join(',') || 'none') + ' runs=' + out.runs.map((r) => r.name + ':' + r.exit + '/' + r.counterExit).join(','));
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
  let driver = path.join(LANE, prof.driver); let driverPin = prof.driverSha256;
  if (flags.has('driver') || flags.has('driver-sha256')) {
    if (!str('driver') || !/^[0-9a-f]{64}$/.test(str('driver-sha256') || '')) { out.findings.push('usage'); console.error('usage: --driver needs --driver-sha256 <64 hex>'); return finish(2); }
    driver = path.resolve(str('driver')); driverPin = str('driver-sha256'); out.pinSource = 'override';
  }
  out.driver = driver;
  const counter = path.join(LANE, prof.counter);
  // (1) pins before any launch
  let dBytes = null, cBytes = null;
  try { dBytes = fs.readFileSync(driver); } catch {}
  try { cBytes = fs.readFileSync(counter); } catch {}
  out.driverSha256 = dBytes ? sha256(dBytes) : null; out.counterSha256 = cBytes ? sha256(cBytes) : null;
  if (!/^[0-9a-f]{64}$/.test(driverPin) || out.driverSha256 !== driverPin) { out.findings.push('driver-pin'); return finish(2); }
  if (!/^[0-9a-f]{64}$/.test(prof.counterSha256) || out.counterSha256 !== prof.counterSha256) { out.findings.push('counter-pin'); return finish(2); }
  // Chromium creates its singleton Unix socket under TMPDIR (= <scratch>/run-x/work for the pinned
  // drivers): `<work>/org.chromium.Chromium.XXXXXX/SingletonSocket`. A path over the 107-byte
  // sun_path limit makes Chromium exit FATAL "Socket path too long"
  // (chrome/browser/process_singleton_posix.cc:313, observed in r70 control c2/positive attempt 1)
  // and the pinned r69 driver then waits 240 s for a page target. Refuse before any launch.
  const sockLen = Buffer.byteLength(path.join(scratch, 'run-a', 'work', 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));
  if (sockLen > 107) { out.findings.push('scratch-path-too-long'); console.error('usage: --scratch too long for Chromium\'s singleton socket (' + sockLen + ' > 107 bytes)'); return finish(2); }
  // (2) no-work control
  if (flags.has('no-run')) { out.findings.push('no-run'); out.note = 'no-run control: the target is unreachable without executing the pinned driver'; return finish(1); }
  const runCounter = (receipt, expectSha = prof.driverSha256) => {
    const p = spawnSync(process.execPath, [counter, '--receipt', receipt, '--expect-driver-sha256', expectSha, '--json'], { encoding: 'utf8', timeout: COUNTER_TIMEOUT_MS });
    let j = null; try { j = JSON.parse(p.stdout); } catch {}
    return { exit: p.status, verdict: j?.verdict ?? null, findings: j ? j.findings.map((f) => f.id) : null };
  };
  // (3) committed evidence -- always against the profile's FROZEN driver pin (the evidence was
  // produced by the frozen driver; an override applies to the live runs only)
  const evPath = path.join(LANE, prof.evidence);
  const ev = runCounter(evPath, prof.driverSha256);
  out.evidence = { path: prof.evidence, sha256: fs.existsSync(evPath) ? sha256(fs.readFileSync(evPath)) : null, counterExit: ev.exit, findings: ev.findings };
  if (ev.exit !== 0) out.findings.push('evidence-counter');
  // (4) two cold live runs with verifier-drawn nonces and ports
  fs.mkdirSync(scratch, { recursive: true });
  const used = new Set();
  for (const name of ['a', 'b']) {
    const dir = path.join(scratch, 'run-' + name);
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const httpPort = await freshPort(used); const cdpPort = await freshPort(used);
    const nonce = prof.noncePrefix + 'live-' + crypto.randomBytes(5).toString('hex') + '-' + name;
    const receipt = path.join(dir, 'receipt.json');
    const existedBefore = fs.existsSync(receipt);
    const spawnedAt = Date.now();
    const run = spawnSync(process.execPath, [driver, '--scratch', path.join(dir, 'work'), '--out', receipt, '--nonce', nonce, '--http-port', String(httpPort), '--cdp-port', String(cdpPort)], { encoding: 'utf8', timeout: RUN_TIMEOUT_MS });
    const e = { name, nonce, httpPort, cdpPort, exit: run.status, signal: run.signal, wallMs: Date.now() - spawnedAt, counterExit: null, counterFindings: null, binding: {}, receiptSha256: null };
    out.runs.push(e);
    if (run.status !== 0) { out.findings.push('run-' + name + '-failed'); continue; }
    const st = (() => { try { return fs.statSync(receipt); } catch { return null; } })();
    const r = load(receipt);
    e.receiptSha256 = st ? sha256(fs.readFileSync(receipt)) : null;
    const argvList = arr(r?.host?.argv);
    e.binding = {
      newFile: !existedBefore && !!st && st.mtimeMs >= spawnedAt - 1000,
      nonce: !!r && r.nonce === nonce && r.nonceOnPage === nonce,
      driverDigest: !!r && r.driverSha256 === driverPin,
      cdpPort: argvList.includes('--remote-debugging-port=' + cdpPort),
      httpPort: !!r && typeof r.fixture?.origin === 'string' && r.fixture.origin === 'http://127.0.0.1:' + httpPort,
    };
    for (const [k, ok] of Object.entries(e.binding)) if (!ok) out.findings.push('run-' + name + '-' + k);
    const c = runCounter(receipt);
    e.counterExit = c.exit; e.counterFindings = c.findings;
    if (c.exit !== 0) out.findings.push('counter-' + name);
  }
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

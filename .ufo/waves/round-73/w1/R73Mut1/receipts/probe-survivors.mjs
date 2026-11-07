#!/usr/bin/env node
// R73Mut1 survivor probes: for each mutant that survived the battery, construct a receipt/prior
// set that the pristine r73 counter refuses and the mutant accepts (or show the mutant only drops
// a co-firing id, i.e. no verdict change). Receipts/priors are written under p/<id>/.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = '/fast/scratch/hyaku/tabi-r73/R73Mut1';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const PRISTINE = path.join(ROOT, 's/check-synthpinch-r73.mjs');
const REAL = LANE + '/corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json';
const PIN = '3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4';
const NONCE = 'tabi-r73-l1-3409ab53b905';
const SMOKES = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${LANE}/.ufo/waves/round-73/controls/c1/smoke${n}.receipt.json`);
const DEGEN = ['degenerate-dispatch-wheel', 'degenerate-set-scale', 'degenerate-skip-touch'].map((f) => `${LANE}/.ufo/waves/round-73/controls/c1/${f}.receipt.json`);
const PRIORS = [...SMOKES, ...DEGEN];
const real = JSON.parse(fs.readFileSync(REAL, 'utf8'));
const clone = (v) => JSON.parse(JSON.stringify(v));
const evsOf = (r, leg, pred = () => true) => r.events.filter((e) => e.leg === leg && pred(e));

const runCounter = (counter, receipt, priors = PRIORS, nonce = NONCE) => {
  const a = [counter, '--receipt', receipt, '--expect-driver-sha256', PIN, '--expect-nonce', nonce, ...priors.flatMap((p) => ['--prior', p]), '--json'];
  const p = spawnSync(process.execPath, a, { encoding: 'utf8', timeout: 120000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, findings: j ? j.findings.map((f) => f.id) : null, derived: j ? j.derived : null };
};
const launder = (file, r, priors = PRIORS) => {
  const pre = runCounter(PRISTINE, file, priors);
  if (pre.derived) {
    const d = pre.derived;
    const rt = d.touch.touchSpanMs > 0 && d.slow.touchSpanMs !== null ? +(d.slow.touchSpanMs / d.touch.touchSpanMs).toFixed(2) : null;
    r.slowToTouchSpanRatio = rt; r.legShape = d; fs.writeFileSync(file, JSON.stringify(r));
  }
  return pre;
};
const writePrior = (dir, name, fn) => { const p = path.join(dir, name); fs.writeFileSync(p, JSON.stringify(fn(clone(real)))); return p; };
const swapToken = (x) => { const t = x.host.launchToken; x.host.launchToken = t.slice(0, -1) + (t.endsWith('0') ? '1' : '0'); };
const swapUrl = (x) => { const d = x.host.devtoolsListening; const id = d.url.split('/devtools/browser/')[1]; const nu = id.slice(0, -1) + (id.endsWith('0') ? '1' : '0'); x.host.stderrHead = x.host.stderrHead.split(id).join(nu); d.url = d.url.replace(id, nu); };
const shiftTs = (x) => { x.events.forEach((e) => { e.ts += 0.5; }); };
const pushSend = (r, method, params) => { r.cdpSendLog.push({ id: r.cdpSendLog.length + 1, method, params }); };

// mode 'accept': receipt/prior set that pristine refuses (target id) and mutant accepts (exit 0).
// mode 'cofire': mutant drops one id but another check still refuses; record both finding sets.
const PROBES = [
  { id: 'r72-in-span-lower-1', mode: 'accept', launder: true, target: 'leg-in-timing', mut(r) { const w = evsOf(r, 'in', (e) => e.type === 'wheel'); const t0 = w[0].ts; w.forEach((e, k) => { e.ts = t0 + (k * 100) / (w.length - 1); }); } },
  { id: 'r72-zero-span-upper-100000', mode: 'accept', launder: true, target: 'leg-zero-timing', mut(r) { const w = evsOf(r, 'zero', (e) => e.type === 'wheel'); w[w.length - 1].ts = w[0].ts + 7000; } },
  { id: 'r72-pinch-params-first-only', mode: 'accept', target: 'pinch-call-params', mut(r) { r.cdpSendLog.filter((c) => c.method === 'Input.synthesizePinchGesture')[5].params.scaleFactor = 2.5; } },
  { id: 'r72-empty-params-open', mode: 'accept', target: 'send-log-allowlist', mut(r) { pushSend(r, 'Page.enable', { extra: 1 }); } },
  { id: 'r72-leg-mark-monotonic-dropped', mode: 'accept', target: 'leg-marks', mut(r) { r.legMarks[1].at = r.legMarks[0].at - 1; } },
  { id: 'r72-browser-getversion-once-dropped', mode: 'accept', target: 'send-log-allowlist', mut(r) { pushSend(r, 'Browser.getVersion', {}); } },
  { id: 'r72-dmo-once-dropped', mode: 'accept', target: 'send-log-allowlist', mut(r) { pushSend(r, 'Emulation.setDeviceMetricsOverride', clone(r.cdpSendLog.find((c) => c.method === 'Emulation.setDeviceMetricsOverride').params)); } },
  { id: 'r72-leg-error-message-loose', mode: 'accept', target: 'leg-pen-error', mut(r) { r.legs.find((l) => l.name === 'pen').cdpError = '{"code":-32602,"message":"Other failure"}'; } },
  { id: 'r72-server-log-binding-some', mode: 'accept', target: 'server-log-binding', mut(r) { const s = r.serverLog.find((x) => x.path === '/' && x.status === 200); s.run = 'tabi-r73-other'; r.serverLog.push({ path: '/', query: 'run=' + r.nonce, run: r.nonce, status: 200 }); } },
  { id: 'r72-seq-first-free', mode: 'accept', target: 'seq-monotonic', mut(r) { r.events[0].seq = 42; } },
  { id: 'r72-event-types-deltamode-dropped', mode: 'cofire', target: 'event-types', mut(r) { evsOf(r, 'in', (e) => e.type === 'wheel')[0].deltaMode = '0'; } },
  { id: 'r72-initial-scale-cdp-dropped', mode: 'cofire', target: 'initial-scale', mut(r) { r.legs[0].scaleBefore.cdp = 7; } },
  { id: 'r73-replay-timeline-type-included', mode: 'accept', target: 'replay-event-timeline', extraPrior(r, dir) { return writePrior(dir, 'prior-type.prior.json', (p) => { swapToken(p); swapUrl(p); p.events.forEach((e) => { e.type = 'zz-' + e.type; }); return p; }); } },
  { id: 'r73-replay-browserid-length-loose', mode: 'accept', target: 'replay-devtools-url', mut(r) { const d = r.host.devtoolsListening; const id = d.url.split('/devtools/browser/')[1]; const nu = 'abc123'; r.host.stderrHead = r.host.stderrHead.split(id).join(nu); d.url = d.url.replace(id, nu); } },
  { id: 'r73-replay-token-priors-last-only', mode: 'accept', target: 'replay-launch-token', priorsOnly(r, dir) { const collision = writePrior(dir, 'prior-token-collision.json', (p) => { swapUrl(p); shiftTs(p); return p; }); return [collision, SMOKES[0]]; } },
  { id: 'r73-replay-token-shape-12-or-more', mode: 'accept', target: 'replay-launch-token', mut(r) { r.host.launchToken = '0123456789abc'; } },
  { id: 'r73-leg-marks-at-zero', mode: 'accept', target: 'leg-marks', mut(r) { r.legMarks[0].at = 0; } },
  { id: 'r73-devtools-port-string-coercion', mode: 'accept', target: 'devtools-port-binding', mut(r) { const d = r.host.devtoolsListening; d.port = String(d.port); } },
  { id: 'r73-touch-seq-length-only', mode: 'accept', launder: true, target: 'leg-touch-seq', mut(r) { const t = evsOf(r, 'touch', (e) => e.type === 'touchend'); t[t.length - 1].type = 'touchcancel'; } },
  { id: 'r73-teardown-curl-fixture-number', mode: 'accept', target: 'teardown-closure', mut(r) { r.teardown.postKillCurl.fixture = 6; } },
  { id: 'r73-layoutmetrics-params-open', mode: 'accept', target: 'send-log-allowlist', mut(r) { pushSend(r, 'Page.getLayoutMetrics', { x: 1 }); } },
  { id: 'r73-origin-port-optional', mode: 'accept', target: 'send-log-allowlist', mut(r) { r.fixture.origin = 'http://127.0.0.1'; r.cdpSendLog.find((c) => c.method === 'Page.navigate').params.url = 'http://127.0.0.1/?run=' + encodeURIComponent(r.nonce); } },
  { id: 'r73-host-chromium-any-version', mode: 'accept', target: 'host-chromium', mut(r) { r.host.chromium = 'Chromium 155'; } },
];

const out = [];
for (const spec of PROBES) {
  const dir = path.join(ROOT, 'p', spec.id);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const r = clone(real); spec.mut && spec.mut(r);
  const file = path.join(dir, 'receipt.json');
  fs.writeFileSync(file, JSON.stringify(r));
  if (spec.launder) launder(file, r);
  const priors = spec.priorsOnly ? spec.priorsOnly(r, dir) : [spec.extraPrior ? spec.extraPrior(r, dir) : null, ...PRIORS].filter(Boolean);
  const pristine = runCounter(PRISTINE, file, priors);
  const mutant = runCounter(path.join(ROOT, 'm', spec.id, 'check-synthpinch-r73.mjs'), file, priors);
  const row = { id: spec.id, mode: spec.mode, target: spec.target, pristineExit: pristine.exit, pristineFindings: pristine.findings, mutantExit: mutant.exit, mutantFindings: mutant.findings,
    distinguishes: spec.mode === 'accept' ? (pristine.exit === 1 && (pristine.findings || []).includes(spec.target) && mutant.exit === 0) : null };
  out.push(row);
  console.log(JSON.stringify(row));
  fs.writeFileSync(path.join(dir, 'probe.json'), JSON.stringify(row, null, 1));
}
fs.mkdirSync(path.join(ROOT, 'results'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'results', 'probes.json'), JSON.stringify(out, null, 1));
console.log('PROBES DONE', out.length, 'distinguishing', out.filter((x) => x.distinguishes === true).length, 'cofire', out.filter((x) => x.mode === 'cofire').length);

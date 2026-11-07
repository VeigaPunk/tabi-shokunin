#!/usr/bin/env node
// R72Mut1: for each surviving semantic mutant, demonstrate a concrete receipt mutation that the
// PRISTINE counter refuses for the named id but the mutant accepts (the would-kill case).
// Launders legShape/slowToTouchSpanRatio with the pristine re-derivation first, like the battery.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const S = '/fast/scratch/hyaku/tabi-r72/R72Mut1';
const PRISTINE = path.join(S, 's', 'check-synthpinch-r72.mjs');
const REAL = '/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json';
const PIN = 'd007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877';
const real = JSON.parse(fs.readFileSync(REAL, 'utf8'));
const clone = (v) => JSON.parse(JSON.stringify(v));
const LEGS = ['start', 'in', 'out', 'clamp', 'unit', 'default', 'touch', 'slow', 'pen', 'outside', 'zero'];
const evsOf = (r, leg, pred = () => true) => r.events.filter((e) => e.leg === leg && pred(e));
const legIdx = (r, leg) => r.legs.findIndex((l) => l.name === leg);
const pushSend = (r, method, params) => { r.cdpSendLog.push({ id: r.cdpSendLog.length + 1, method, params }); };

const P = [];
const probe = (mutant, idPattern, expect, alsoAllowed, mutate) => P.push({ mutant, idPattern, expect, alsoAllowed, mutate });

probe('in-span-lower-1', /^m\d+-in-span-lower-1$/, 'leg-in-timing', [], (r) => {
  const w = evsOf(r, 'in', (e) => e.type === 'wheel'); const t0 = w[0].ts; const n = w.length;
  w.forEach((e, k) => { e.ts = t0 + (k * 100) / (n - 1); });
});
probe('zero-span-upper-100000', /^e\d+-zero-span-upper-100000$/, 'leg-zero-timing', [], (r) => {
  const w = evsOf(r, 'zero', (e) => e.type === 'wheel'); const t0 = w[0].ts; const n = w.length;
  w.forEach((e, k) => { e.ts = t0 + (k * 7000) / (n - 1); });
});
probe('pinch-params-first-only', /^m\d+-pinch-params-first-only$/, 'pinch-call-params', [], (r) => {
  const idx = r.cdpSendLog.map((c, i) => [c, i]).filter(([c]) => c.method === 'Input.synthesizePinchGesture').map(([, i]) => i);
  r.cdpSendLog[idx[5]].params.scaleFactor = 2.5;
});
probe('wheel-anchor-tolerance-2', /^m\d+-wheel-anchor-tolerance-2$/, 'wheel-anchor', [], (r) => {
  evsOf(r, 'in', (e) => e.type === 'wheel')[0].clientX += 2.5;
});
probe('allowlist-empty-params-open', /^m\d+-allowlist-empty-params-open$/, 'send-log-allowlist', [], (r) => {
  pushSend(r, 'Page.enable', { extra: 1 });
});
probe('leg-marks-monotonic-dropped', /^m\d+-leg-marks-monotonic-dropped$/, 'leg-marks', ['event-leg-window'], (r) => {
  r.legMarks[3].at = r.legMarks[2].at - 1;
});
probe('browser-getversion-once-dropped', /^m\d+-browser-getversion-once-dropped$/, 'send-log-allowlist', [], (r) => {
  pushSend(r, 'Browser.getVersion', {});
});
probe('dmo-once-dropped', /^m\d+-dmo-once-dropped$/, 'send-log-allowlist', [], (r) => {
  pushSend(r, 'Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
});
probe('leg-error-message-loose', /^m\d+-leg-error-message-loose$/, 'leg-pen-error', [], (r) => {
  r.legs[legIdx(r, 'pen')].cdpError = '{"code":-32602,"message":"Other failure"}';
});
probe('server-log-binding-some', /^e\d+-server-log-binding-some$/, 'server-log-binding', [], (r) => {
  const row = r.serverLog.find((s2) => s2 && s2.path === '/' && s2.status === 200);
  const nonce = row.run; row.run = 'tabi-r72-other';
  r.serverLog.push({ path: '/', query: 'run=' + nonce, run: nonce, status: 200 });
});
probe('event-types-deltamode-dropped', /^e\d+-event-types-deltamode-dropped$/, 'event-types', ['leg-in-wheels'], (r) => {
  evsOf(r, 'in', (e) => e.type === 'wheel')[0].deltaMode = '0';
});
probe('seq-first-free', /^e\d+-seq-first-free$/, 'seq-monotonic', [], (r) => {
  r.events[0].seq = 42;
});
probe('initial-scale-cdp-dropped', /^e\d+-initial-scale-cdp-dropped$/, 'initial-scale', ['scale-agreement'], (r) => {
  r.legs[0].scaleBefore.cdp = 7;
});

const runCounter = (counter, file, pin = true) => {
  const p = spawnSync(process.execPath, [counter, '--receipt', file, ...(pin ? ['--expect-driver-sha256', PIN] : []), '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, findings: j ? j.findings.map((f) => f.id) : null, derived: j ? j.derived : null };
};
const dirs = fs.readdirSync(S).filter((d) => /^(m|e)\d+-/.test(d) && fs.statSync(path.join(S, d)).isDirectory());
const out = [];
for (const p of P) {
  const dir = dirs.find((d) => p.idPattern.test(d));
  if (!dir) { out.push({ mutant: p.mutant, error: 'no mutant dir' }); continue; }
  const counter = path.join(S, dir, 'check-synthpinch-r72.mjs');
  const r = clone(real); p.mutate(r);
  const raw = path.join(S, 'probe-' + p.mutant + '.json');
  fs.writeFileSync(raw, JSON.stringify(r));
  const pre = runCounter(PRISTINE, raw, false);
  if (!pre.derived) { out.push({ mutant: p.mutant, error: 'no derived', exit: pre.exit }); continue; }
  const d = pre.derived;
  const rt = d.touch.touchSpanMs > 0 && d.slow.touchSpanMs !== null ? +(d.slow.touchSpanMs / d.touch.touchSpanMs).toFixed(2) : null;
  r.legShape = d; r.slowToTouchSpanRatio = rt;
  const f = path.join(S, 'probe-' + p.mutant + '-l.json');
  fs.writeFileSync(f, JSON.stringify(r));
  const pr = runCounter(PRISTINE, f);
  const mu = runCounter(counter, f);
  const extraPr = (pr.findings || []).filter((x) => x !== p.expect && !p.alsoAllowed.includes(x));
  out.push({
    mutant: p.mutant, dir, expect: p.expect, alsoAllowed: p.alsoAllowed,
    pristineExit: pr.exit, pristineFindings: pr.findings, pristineHasExpect: (pr.findings || []).includes(p.expect),
    pristineIsolatedAsCase: pr.exit === 1 && (pr.findings || []).includes(p.expect) && extraPr.length === 0,
    mutantExit: mu.exit, mutantFindings: mu.findings, mutantHasExpect: (mu.findings || []).includes(p.expect),
    distinguishes: (pr.findings || []).includes(p.expect) && !(mu.findings || []).includes(p.expect),
  });
  console.log(JSON.stringify(out[out.length - 1]));
}
fs.writeFileSync(path.join(S, 'probe-results.json'), JSON.stringify(out, null, 1));

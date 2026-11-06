// R69Review2 false-green forgeries against scripts/check-synthscroll-r69.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = LANE + '/scripts/check-synthscroll-r69.mjs';
const SCORED = LANE + '/corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json';
const CTRL = LANE + '/.ufo/waves/round-69/controls/c2-degenerate/dispatch-wheel-receipt.json';
const WAVE = LANE + '/.ufo/waves/round-69/w1/R69Review2';
const PIN = '13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3';

const renum = (r) => { r.cdpSendLog = r.cdpSendLog.map((c, i) => ({ ...c, id: i + 1 })); return r; };
const green = (r) => { r.degenerate = null; r.predicate = true; r.synthScrollHypothesis = 'CONFIRMED'; r.failures = []; return r; };

// FG1: dispatch-wheel control (real producer = Input.dispatchMouseEvent wheel) laundered HARD:
// strip the dispatchMouseEvent rows, insert 3 synthetic gesture rows with frozen params, renumber.
const fg1 = green(renum((() => {
  const d = JSON.parse(fs.readFileSync(CTRL, 'utf8'));
  d.cdpSendLog = d.cdpSendLog.filter((c) => c.method !== 'Input.dispatchMouseEvent');
  const ti = d.cdpSendLog.findIndex((c) => c.method === 'Input.synthesizeScrollGesture');
  const fake = ['mouse', 'default', 'repeat'].map((n) => ({ method: 'Input.synthesizeScrollGesture', params: JSON.parse(JSON.stringify(d.plan.find((l) => l.name === n).params)) }));
  d.cdpSendLog.splice(ti < 0 ? d.cdpSendLog.length : ti, 0, ...fake);
  return d;
})()));
fs.writeFileSync(path.join(WAVE, 'forged-FG1-stronglaunder-dispatch-wheel.json'), JSON.stringify(fg1, null, 1));

// FG2: scored receipt with every Runtime.evaluate row deleted (simulates a driver that hides sends).
const fg2 = green(renum((() => {
  const d = JSON.parse(fs.readFileSync(SCORED, 'utf8'));
  d.cdpSendLog = d.cdpSendLog.filter((c) => c.method !== 'Runtime.evaluate');
  return d;
})()));
fs.writeFileSync(path.join(WAVE, 'forged-FG2-omit-evaluate.json'), JSON.stringify(fg2, null, 1));

// FG4: fully fabricated from scratch — no chromium ever launched on this host for it.
const N = 'tabi-r69-forged-review2';
const FROZEN = [
  { name: 'start', params: null, expectScrollY: 0 },
  { name: 'mouse', params: { x: 400, y: 400, yDistance: -600, gestureSourceType: 'mouse' }, expectScrollY: 600 },
  { name: 'default', params: { x: 400, y: 400, yDistance: 300 }, expectScrollY: 300 },
  { name: 'repeat', params: { x: 400, y: 400, yDistance: -200, gestureSourceType: 'mouse', repeatCount: 2, repeatDelayMs: 100 }, expectScrollY: 900 },
  { name: 'touch', params: { x: 400, y: 400, yDistance: -500, gestureSourceType: 'touch', preventFling: true }, expectScrollY: 900 },
];
let seq = 0;
const ev = (leg, type, extra = {}) => ({ type, seq: ++seq, leg, ts: seq * 100, pointerType: extra.pointerType ?? null, isTrusted: true, cancelable: true, deltaX: extra.deltaX ?? null, deltaY: extra.deltaY ?? null, deltaMode: extra.deltaMode ?? null, scrollYAtDispatch: extra.scrollYAtDispatch ?? 0 });
const events = [];
for (let i = 0; i < 6; i++) events.push(ev('mouse', 'wheel', { deltaX: 0, deltaY: 100, deltaMode: 0, scrollYAtDispatch: i * 100 }));
events.push(ev('mouse', 'scrollend', { scrollYAtDispatch: 600 }));
for (let i = 0; i < 3; i++) events.push(ev('default', 'wheel', { deltaX: 0, deltaY: -100, deltaMode: 0, scrollYAtDispatch: 600 - i * 100 }));
events.push(ev('default', 'scrollend', { scrollYAtDispatch: 300 }));
for (let i = 0; i < 3; i++) events.push(ev('repeat', 'wheel', { deltaX: 0, deltaY: 200, deltaMode: 0, scrollYAtDispatch: 300 + i * 200 }));
for (let i = 0; i < 3; i++) events.push(ev('repeat', 'scrollend', { scrollYAtDispatch: 900 }));
events.push(ev('touch', 'pointerdown', { pointerType: 'touch', scrollYAtDispatch: 900 }));
events.push(ev('touch', 'touchstart', { scrollYAtDispatch: 900 }));
events.push(ev('touch', 'pointermove', { pointerType: 'touch', scrollYAtDispatch: 900 }));
events.push(ev('touch', 'pointermove', { pointerType: 'touch', scrollYAtDispatch: 900 }));
events.push(ev('touch', 'pointerup', { pointerType: 'touch', scrollYAtDispatch: 900 }));
events.push(ev('touch', 'touchend', { scrollYAtDispatch: 900 }));
const cdp = [
  { method: 'Browser.getVersion', params: {} },
  { method: 'Page.enable', params: {} },
  { method: 'Runtime.enable', params: {} },
  { method: 'Emulation.setDeviceMetricsOverride', params: { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false } },
  { method: 'Page.navigate', params: { url: 'http://127.0.0.1:45999/?run=' + N } },
  { method: 'Runtime.evaluate', params: { expression: 'document.readyState === "complete"', returnByValue: true } },
];
for (const leg of FROZEN.slice(1)) { cdp.push({ method: 'Runtime.evaluate', params: { expression: 'window.__setLeg("' + leg.name + '")', returnByValue: true } }); cdp.push({ method: 'Runtime.evaluate', params: { expression: 'window.scrollY', returnByValue: true } }); cdp.push({ method: 'Input.synthesizeScrollGesture', params: JSON.parse(JSON.stringify(leg.params)) }); cdp.push({ method: 'Runtime.evaluate', params: { expression: 'window.scrollY', returnByValue: true } }); }
const fg4 = green({
  schema: 'tabi-chrome-cdp-synthscroll-r69', nonce: N, degenerate: null, driverSha256: PIN,
  host: { chromium: 'Chromium 155.0.8059.84 Arch Linux', cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3', argv: ['/usr/bin/chromium', '--headless=new'], launchToken: 'deadbeefcafe' },
  fixture: { sha256: '0'.repeat(64), origin: 'http://127.0.0.1:45999', viewport: { width: 1280, height: 900 }, documentHeight: 6000 },
  plan: FROZEN, nonceOnPage: N,
  legs: [
    { name: 'start', params: null, scrollYBefore: 0, scrollY: 0, cdpResult: null, elapsedMs: 100 },
    { name: 'mouse', params: FROZEN[1].params, scrollYBefore: 0, scrollY: 600, cdpResult: {}, elapsedMs: 1500 },
    { name: 'default', params: FROZEN[2].params, scrollYBefore: 600, scrollY: 300, cdpResult: {}, elapsedMs: 1400 },
    { name: 'repeat', params: FROZEN[3].params, scrollYBefore: 300, scrollY: 900, cdpResult: {}, elapsedMs: 2000 },
    { name: 'touch', params: FROZEN[4].params, scrollYBefore: 900, scrollY: 900, cdpResult: {}, elapsedMs: 1200 },
  ],
  events, cdpSendLog: renum({ cdpSendLog: cdp }).cdpSendLog,
  pageState: { scrollY: 900, scrollEvents: 13, eventCount: events.length },
  serverLog: [{ path: '/', query: 'run=' + N, run: N, status: 200 }],
  teardown: { postKillSweepCount: 0, survivors: [], sweepError: null, portProbes: { fixture: 'closed', devtools: 'closed' }, postKillCurl: { fixture: 7, devtools: 7 } },
  sweeps: { preLaunch: 0, midRun: 2, postKill: 0 }, failures: [], synthScrollHypothesis: 'CONFIRMED', predicate: true,
});
fs.writeFileSync(path.join(WAVE, 'forged-FG4-fabricated-from-scratch.json'), JSON.stringify(fg4, null, 1));

// FG5: the exact asked scenario done naively — logged gestures with yDistance 0 plus logged hidden wheels.
const fg5 = green((() => {
  const d = JSON.parse(fs.readFileSync(SCORED, 'utf8'));
  d.cdpSendLog.filter((c) => c.method === 'Input.synthesizeScrollGesture').forEach((g) => { g.params.yDistance = 0; });
  return d;
})());
fs.writeFileSync(path.join(WAVE, 'forged-FG5-ydistance0-in-log.json'), JSON.stringify(fg5, null, 1));

const run = (file, extra = []) => {
  const p = spawnSync(process.execPath, [COUNTER, '--receipt', file, '--json', ...extra], { encoding: 'utf8' });
  let parsed = null; try { parsed = JSON.parse(p.stdout); } catch {}
  return { file: path.basename(file), exit: p.status, verdict: parsed?.verdict, checkCount: parsed?.checkCount, findings: parsed?.findings?.map((f) => f.id) ?? null };
};
const rows = [
  run(path.join(WAVE, 'forged-FG1-stronglaunder-dispatch-wheel.json')),
  run(path.join(WAVE, 'forged-FG2-omit-evaluate.json')),
  run(path.join(WAVE, 'forged-FG1-stronglaunder-dispatch-wheel.json'), ['--expect-driver-sha256', PIN]),
  run(path.join(WAVE, 'forged-FG4-fabricated-from-scratch.json')),
  run(path.join(WAVE, 'forged-FG4-fabricated-from-scratch.json'), ['--expect-driver-sha256', PIN]),
  run(path.join(WAVE, 'forged-FG5-ydistance0-in-log.json')),
];
for (const r of rows) console.log(JSON.stringify(r));

#!/usr/bin/env node
// R69Exec4 falsification driver for hypothesis H: on /usr/bin/chromium 155.0.8059.84
// --headless=new, Input.synthesizeScrollGesture {gestureSourceType:'touch'} delivers
// pointer(touch)+touchstart/touchend but never scrolls the document.
// Each --variant is one receipt. Legs: `control` (same gesture, source mouse) then
// `touch` (variant params). The control proves the page/document scrolls at all.
// Usage: node driver.mjs --variant <name> --scratch <ABS> --out <ABS .json>
//        --nonce <tabi-r69-...> --http-port <p> --cdp-port <p>
// Exit 0: receipt written (closure proof recorded); 1: run failed before receipt; 2: usage.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-r69-exec4-touch-variant';
const SELF = fileURLToPath(import.meta.url);
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const usage = (d) => { console.error(JSON.stringify({ schema: SCHEMA, error: 'usage', detail: d })); process.exit(2); };
const isAbs = (p) => typeof p === 'string' && p.length > 0 && path.isAbsolute(p);
let scratch = opt('scratch'), out = opt('out');
if (!isAbs(scratch || '')) usage('--scratch must be absolute');
scratch = path.resolve(scratch); fs.mkdirSync(scratch, { recursive: true });
if (!isAbs(out || '') || !out.endsWith('.json')) usage('--out must be absolute .json');
out = path.resolve(out); fs.mkdirSync(path.dirname(out), { recursive: true });
const nonce = opt('nonce');
if (!nonce || !/^tabi-r69-[a-z0-9-]+$/.test(nonce)) usage('--nonce must match tabi-r69-[a-z0-9-]+');
const ports = ['http-port', 'cdp-port'].map((k) => Number(opt(k)));
const [httpPort, cdpPort] = ports;
for (const p of ports) if (!Number.isInteger(p) || p < 41000 || p > 48999) usage('ports must be integers 41000..48999');
if (httpPort === cdpPort) usage('ports must differ');
if (!fs.existsSync('/usr/bin/chromium')) usage('/usr/bin/chromium missing');

async function freePort(p) {
  await new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', (e) => { srv.close(); if (e.code === 'EADDRINUSE') reject(new Error('port ' + p + ' busy')); else reject(e); });
    srv.once('listening', () => srv.close(resolve));
    srv.listen(p, '127.0.0.1');
  });
}
try { for (const p of ports) await freePort(p); } catch (e) { usage('free-port precheck: ' + e.message); }

const TOUCH_BASE = { x: 400, y: 400, yDistance: -500, gestureSourceType: 'touch', preventFling: true };
const VARIANTS = {
  // baseline reproduction of the lane touch leg on a plain document
  'baseline-doc': { fixture: 'doc' },
  // Emulation.setTouchEmulationEnabled
  'touch-emulation': { fixture: 'doc', emulation: [['Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }]] },
  // Emulation.setDeviceMetricsOverride mobile:true alone (no touch emulation, no meta)
  'mobile-metrics-only': { fixture: 'doc', emulation: [['Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: true }]] },
  // Emulation.setDeviceMetricsOverride mobile:true + touch emulation
  'mobile+touch-emulation': { fixture: 'doc', emulation: [['Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: true }], ['Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }]] },
  // Emulation.setEmitTouchEventsForMouse
  'emit-touch-mouse': { fixture: 'doc', emulation: [['Emulation.setEmitTouchEventsForMouse', { enabled: true, configuration: 'mobile' }]] },
  // viewport meta width=device-width under mobile emulation
  'mobile+meta+touch-emulation': { fixture: 'doc', meta: true, emulation: [['Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: true }], ['Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }]] },
  // scrollable div instead of the document
  'div-scroller': { fixture: 'div' },
  // larger yDistance / slower speed
  'large-slow': { fixture: 'doc', touch: { ...TOUCH_BASE, yDistance: -1200, speed: 400 } },
  // no preventFling
  'no-prevent-fling': { fixture: 'doc', touch: { ...TOUCH_BASE, preventFling: false } },
  // launch flag --touch-events=enabled
  'touch-events-flag': { fixture: 'doc', flags: ['--touch-events=enabled'] },
  // touch emulation plus the touch-events flag
  'touch-emulation+flag': { fixture: 'doc', flags: ['--touch-events=enabled'], emulation: [['Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }]] },
  // non-passive touch listeners (does touchmove delivery depend on listener passivity?)
  'nonpassive-touch': { fixture: 'doc', nonpassive: true },
  // attribution control: raw Input.dispatchTouchEvent swipe (not synthesizeScrollGesture)
  'dispatch-touch-control': { fixture: 'doc', touchMode: 'dispatch' },
  // full mobile device mode: metrics + touch + meta + touch-events flag
  'mobile+meta+touch-emulation+flag': { fixture: 'doc', meta: true, flags: ['--touch-events=enabled'], emulation: [['Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: true }], ['Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }]] },
};
const variantName = opt('variant');
if (!variantName || !VARIANTS[variantName]) usage('--variant must be one of ' + Object.keys(VARIANTS).join('|'));
const V = VARIANTS[variantName];
const touchParams = { ...TOUCH_BASE, ...(V.touch || {}) };
const controlParams = { x: 400, y: 400, yDistance: -300, gestureSourceType: 'mouse' };

// ---- fixture ----
function fixtureHtml(kind, meta, nonceText, nonpassive) {
  const metaTag = meta ? '<meta name="viewport" content="width=device-width, initial-scale=1">' : '';
  const listenerOpts = nonpassive ? '{ capture: true, passive: false }' : '{ capture: true, passive: true }';
  const recorder = `
window.__seq = 0; window.__leg = 'start'; window.__events = []; window.__scrolls = 0; window.__nonceOnPage = null;
window.__target = function () { return document.getElementById('scroller') || document.scrollingElement; };
const rec = function (e) {
  const t = window.__target();
  window.__events.push({ type: e.type, seq: ++window.__seq, leg: window.__leg, ts: e.timeStamp,
    pointerType: e.pointerType || null, isTrusted: e.isTrusted, cancelable: e.cancelable,
    deltaX: typeof e.deltaX === 'number' ? e.deltaX : null, deltaY: typeof e.deltaY === 'number' ? e.deltaY : null,
    clientX: typeof e.clientX === 'number' ? e.clientX : null, clientY: typeof e.clientY === 'number' ? e.clientY : null,
    touches: e.touches ? e.touches.length : null, changedTouches: e.changedTouches ? e.changedTouches.length : null,
    scrollYAtDispatch: t ? t.scrollTop : null });
};
for (const t of ['wheel', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend', 'touchcancel'])
  document.addEventListener(t, rec, LISTENER_OPTS);
window.addEventListener('scroll', function (e) { window.__scrolls += 1; });
document.addEventListener('scroll', function (e) { window.__scrolls += 1; }, true);
document.addEventListener('DOMContentLoaded', function () { window.__nonceOnPage = document.getElementById('nonce').textContent; });
window.__setLeg = function (name) { window.__leg = name; return name; };
`;
  if (kind === 'div') {
    return `<!doctype html><html><head><meta charset="utf-8">${metaTag}<title>r69exec4 div</title>
<style>html, body { margin: 0; padding: 0; height: 100%; } #scroller { position: fixed; inset: 0; overflow: auto; -webkit-overflow-scrolling: auto; } #tall { height: 6000px; width: 100%; background: linear-gradient(#f00, #00f); }</style>
<script>${recorder.replace('LISTENER_OPTS', listenerOpts)}</script></head><body><p id="nonce" style="position:fixed;left:0;top:0;margin:0;font:0/0 monospace;z-index:9">${nonceText}</p><div id="scroller"><div id="tall"></div></div></body></html>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8">${metaTag}<title>r69exec4 doc</title>
<style>html, body { margin: 0; padding: 0; } #tall { height: 6000px; width: 100%; background: linear-gradient(#f00, #00f); }</style>
<script>${recorder.replace('LISTENER_OPTS', listenerOpts)}</script></head><body><p id="nonce" style="position:fixed;left:0;top:0;margin:0;font:0/0 monospace;z-index:9">${nonceText}</p><div id="tall"></div></body></html>`;
}
const FIXTURE = fixtureHtml(V.fixture, !!V.meta, nonce, !!V.nonpassive);
const fixtureSha = sha256(FIXTURE);

// ---- scratch/paths ----
const launchToken = crypto.randomBytes(6).toString('hex');
const profileDir = path.join(scratch, 'p' + launchToken.slice(0, 6)); // short: unix singleton socket path limit
const runHome = path.join(scratch, 'h' + launchToken.slice(0, 6));
const env = {
  ...process.env,
  HOME: runHome,
  XDG_CONFIG_HOME: path.join(runHome, '.config'),
  XDG_CACHE_HOME: path.join(runHome, '.cache'),
  XDG_DATA_HOME: path.join(runHome, '.local', 'share'),
  XDG_STATE_HOME: path.join(runHome, '.local', 'state'),
  XDG_RUNTIME_DIR: path.join(runHome, 'run'),
  TMPDIR: scratch,
};
for (const d of ['', '.config', '.cache', path.join('.local', 'share'), path.join('.local', 'state'), 'run']) fs.mkdirSync(path.join(runHome, d), { recursive: true });
fs.mkdirSync(profileDir, { recursive: true });
const NEEDLES = [launchToken, profileDir];
function sweepOnce() {
  const o = { pids: [], error: null };
  const r = spawnSync('ps', ['-eo', 'pid,args'], { encoding: 'utf8', timeout: 15000 });
  if (r.status !== 0) { o.error = 'ps exit ' + r.status; return o; }
  for (const line of (r.stdout || '').split('\n')) {
    if (NEEDLES.some((n) => line.includes(n))) {
      const pid = Number(line.trim().split(/\s+/)[0]);
      if (Number.isInteger(pid) && pid > 1) o.pids.push(pid);
    }
  }
  return o;
}
async function sweepToZero() {
  let rounds = 0, last = null;
  while (rounds < 20) {
    last = sweepOnce();
    if (last.error || last.pids.length === 0) break;
    for (const pid of last.pids) { try { process.kill(pid, 'SIGKILL'); } catch {} }
    await sleep(250); rounds++;
  }
  return { rounds, survivors: last.error ? [] : last.pids, error: last.error };
}
function probePort(p) {
  return new Promise((resolve) => {
    const s = net.connect({ port: p, host: '127.0.0.1' });
    let done = false; const fin = (v) => { if (!done) { done = true; try { s.destroy(); } catch {} resolve(v); } };
    s.setTimeout(1200, () => fin('timeout'));
    s.on('connect', () => fin('open')); s.on('error', () => fin('closed'));
  });
}
const pre = sweepOnce();
if (pre.error || pre.pids.length !== 0) usage('launch token not fresh: ' + JSON.stringify(pre));

// ---- server + chrome ----
const serverLog = [];
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, ''), at: Date.now() });
  if (u.pathname === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(FIXTURE); }
  else { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('nf'); }
});
const cdpSendLog = [];
const receipt = {
  schema: SCHEMA, variant: variantName, nonce, driverSha256: sha256(fs.readFileSync(SELF)),
  driverCopyPath: out, fixture: { kind: V.fixture, meta: !!V.meta, sha256: fixtureSha, origin: 'http://127.0.0.1:' + httpPort },
  plan: { control: { params: controlParams }, touch: { mode: V.touchMode || 'synthScrollGesture', params: touchParams } },
  emulation: V.emulation || [], flags: V.flags || [],
  host: { chromium: '', product: '', protocolVersion: '', argv: [], launchToken },
  legs: [], events: [], cdpSendLog, pageState: {}, serverLog,
  teardown: {}, failures: [],
};
const childArgv = ['/usr/bin/chromium', '--headless=new', '--remote-debugging-port=' + cdpPort,
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
  '--force-device-scale-factor=1', '--window-size=1280,900', ...(V.flags || []), 'about:blank'];
receipt.host.argv = childArgv;
let child = null, ws = null, stderrHead = '', closed = false, closing = null;
function teardown() {
  if (closing) return closing;
  closing = (async () => {
  closed = true;
  try { if (ws) ws.close(); } catch {}
  if (child?.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
  await sleep(500);
  const swept = await sweepToZero();
  server.closeAllConnections();
  await Promise.race([new Promise((r) => server.close(r)), sleep(2000)]);
  const portProbes = { http: await probePort(httpPort), cdp: await probePort(cdpPort) };
  const curlExit = (p) => spawnSync('/usr/bin/curl', ['--noproxy', '*', '--silent', '--max-time', '2', 'http://127.0.0.1:' + p + '/'], { encoding: 'utf8', timeout: 4000 }).status;
  receipt.teardown = { sweep: swept, portProbes, postKillCurl: { http: curlExit(httpPort), cdp: curlExit(cdpPort) } };
  if (swept.error || swept.survivors.length) receipt.failures.push({ id: 'teardown-survivors', detail: JSON.stringify(swept) });
  if (Object.values(portProbes).some((v) => v !== 'closed')) receipt.failures.push({ id: 'teardown-port', detail: JSON.stringify(portProbes) });
  if (Object.values(receipt.teardown.postKillCurl).some((v) => v !== 7)) receipt.failures.push({ id: 'teardown-curl', detail: JSON.stringify(receipt.teardown.postKillCurl) });
  })();
  return closing;
}
let interrupted = false;
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { interrupted = true; receipt.failures.push({ id: 'interrupted', detail: sig }); receipt.host.stderrHead = stderrHead.slice(0, 4096); await teardown(); fs.writeFileSync(out, JSON.stringify(receipt, null, 1)); process.exit(1); });

try {
  await new Promise((res, rej) => { server.once('error', rej); server.listen(httpPort, '127.0.0.1', res); });
  const ver = spawnSync('/usr/bin/chromium', ['--version'], { encoding: 'utf8', timeout: 15000, env });
  if (ver.status !== 0) throw new Error('chromium --version failed');
  receipt.host.chromium = ver.stdout.trim();
  child = spawn(childArgv[0], childArgv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env });
  child.stderr.on('data', (d) => { if (stderrHead.length < 4096) stderrHead += d.toString('utf8').slice(0, 4096 - stderrHead.length); });
  let launchErr = null; child.on('error', (e) => { launchErr = e; });
  let page = null;
  for (let i = 0; i < 200 && !page; i++) {
    if (launchErr) throw launchErr;
    try {
      const r = await fetch('http://127.0.0.1:' + cdpPort + '/json/list', { signal: AbortSignal.timeout(1500) });
      if (r.ok) page = (await r.json()).find((t) => t.type === 'page');
    } catch {}
    if (!page) await sleep(150);
  }
  if (!page || !new RegExp('^ws://127\\.0\\.0\\.1:' + cdpPort + '/').test(page.webSocketDebuggerUrl)) throw new Error('no loopback page target; stderr=' + stderrHead.slice(0, 400));
  if (sweepOnce().pids.length < 1) throw new Error('launch token unbound');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('ws open timeout')), 20000); ws.addEventListener('open', () => { clearTimeout(t); res(); }, { once: true }); ws.addEventListener('error', () => { clearTimeout(t); rej(new Error('ws error')); }, { once: true }); });
  let msgId = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); const p = pending.get(m.id); if (p) { pending.delete(m.id); clearTimeout(p.timer); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m); } });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++msgId; cdpSendLog.push({ id, method, params, at: Date.now() });
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout ' + method)); }, 60000);
    pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params }));
  });
  const evalV = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
  const version = await send('Browser.getVersion');
  receipt.host.product = version.result.product; receipt.host.protocolVersion = version.result.protocolVersion;
  await send('Page.enable'); await send('Runtime.enable');
  for (const [method, params] of (V.emulation || [])) await send(method, params);
  await send('Page.navigate', { url: receipt.fixture.origin + '/?run=' + encodeURIComponent(nonce) });
  let ready = false;
  for (let i = 0; i < 120 && !ready; i++) {
    try { ready = await evalV('document.readyState === "complete" && Array.isArray(window.__events) && document.getElementById("nonce") && document.getElementById("nonce").textContent === ' + JSON.stringify(nonce)); } catch {}
    if (!ready) await sleep(100);
  }
  if (!ready) throw new Error('fixture not ready');
  receipt.nonceOnPage = await evalV('window.__nonceOnPage');
  receipt.viewportInfo = await evalV('({innerWidth: window.innerWidth, innerHeight: window.innerHeight, dpr: window.devicePixelRatio, scrollHeight: document.scrollingElement.scrollHeight, clientHeight: document.scrollingElement.clientHeight, hasTouch: "ontouchstart" in window, touchPoints: navigator.maxTouchPoints || 0})');
  const measure = () => evalV('(function(){var t=window.__target();return {targetScrollTop: t.scrollTop, windowScrollY: window.scrollY, documentScrollTop: document.scrollingElement.scrollTop, scrolls: window.__scrolls};})()');
  const settle = async () => {
    let prev = null, stable = 0, last = null;
    for (let i = 0; i < 300; i++) {
      last = await measure();
      const k = JSON.stringify(last);
      if (k === prev) stable++; else stable = 0;
      prev = k;
      if (stable >= 3) return last;
      await sleep(50);
    }
    return last;
  };
  const legs = [
    { name: 'control', mode: 'synth', params: controlParams },
    { name: 'touch', mode: V.touchMode || 'synth', params: touchParams },
  ];
  for (const leg of legs) {
    await evalV('window.__setLeg(' + JSON.stringify(leg.name) + ')');
    const before = await measure();
    const t0 = Date.now();
    let cdpResult = null, error = null;
    try {
      if (leg.mode === 'synth') {
        cdpResult = (await send('Input.synthesizeScrollGesture', leg.params)).result;
      } else if (leg.mode === 'dispatch') {
        const x0 = 640, y0 = 700, steps = 24, dy = 20;
        await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 0, radiusX: 1, radiusY: 1, force: 1 }] });
        for (let i = 1; i <= steps; i++) {
          await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0, y: y0 - i * dy, id: 0, radiusX: 1, radiusY: 1, force: 1 }] });
          await sleep(16);
        }
        await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        cdpResult = { dispatchedSteps: steps };
      }
    } catch (e) { error = e.message; receipt.failures.push({ id: 'leg-error:' + leg.name, detail: e.message }); }
    const after = await settle();
    receipt.legs.push({ name: leg.name, mode: leg.mode, params: leg.params, before, after, deltaTargetScroll: after.targetScrollTop - before.targetScrollTop, deltaWindowScroll: after.windowScrollY - before.windowScrollY, cdpResult, error, elapsedMs: Date.now() - t0 });
  }
  await evalV('window.__setLeg("end")');
  receipt.events = await evalV('JSON.parse(JSON.stringify(window.__events))');
  receipt.pageState = await measure();
} catch (e) { receipt.failures.push({ id: 'run-error', detail: e.message }); }
finally { await teardown(); }
receipt.host.stderrHead = stderrHead.slice(0, 4096);
const byLeg = (n) => receipt.events.filter((e) => e.leg === n);
const cnt = (evs, t, pt) => evs.filter((e) => e.type === t && (pt === undefined || e.pointerType === pt)).length;
const tl = byLeg('touch');
const touchLeg = receipt.legs.find((l) => l.name === 'touch');
const controlLeg = receipt.legs.find((l) => l.name === 'control');
receipt.measurements = {
  control: controlLeg ? { deltaTargetScroll: controlLeg.deltaTargetScroll, deltaWindowScroll: controlLeg.deltaWindowScroll, wheel: cnt(byLeg('control'), 'wheel') } : null,
  touch: {
    deltaTargetScroll: touchLeg ? touchLeg.deltaTargetScroll : null,
    deltaWindowScroll: touchLeg ? touchLeg.deltaWindowScroll : null,
    scrolled: !!(touchLeg && (Math.abs(touchLeg.deltaTargetScroll) >= 1 || Math.abs(touchLeg.deltaWindowScroll) >= 1)),
    touchstart: cnt(tl, 'touchstart'), touchmove: cnt(tl, 'touchmove'), touchend: cnt(tl, 'touchend'), touchcancel: cnt(tl, 'touchcancel'),
    pointerdown: cnt(tl, 'pointerdown', 'touch'), pointermove: cnt(tl, 'pointermove', 'touch'), pointerup: cnt(tl, 'pointerup', 'touch'),
    wheel: cnt(tl, 'wheel'), scrollEvents: (touchLeg && touchLeg.after && touchLeg.after.scrolls) - (touchLeg && touchLeg.before ? touchLeg.before.scrolls : 0),
    touchmoveDelivered: cnt(tl, 'touchmove') >= 1,
    allTrusted: tl.length > 0 && tl.every((e) => e.isTrusted === true),
  },
};
receipt.verdict = {
  h: 'touch-source Input.synthesizeScrollGesture never scrolls the document',
  controlScrolled: !!(controlLeg && controlLeg.deltaTargetScroll >= 1),
  touchScrolled: receipt.measurements.touch.scrolled,
  falsifiedIfTouchScrolled: receipt.measurements.touch.scrolled,
  nonceMatches: receipt.nonceOnPage === nonce,
};
fs.writeFileSync(path.join(scratch, 'server-log.json'), JSON.stringify(serverLog, null, 1));
fs.writeFileSync(out, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, variant: variantName, control: receipt.measurements.control, touch: receipt.measurements.touch, viewportInfo: receipt.viewportInfo, failures: receipt.failures, teardown: receipt.teardown }));
process.exitCode = receipt.failures.length === 0 && receipt.verdict.nonceMatches ? 0 : 1;

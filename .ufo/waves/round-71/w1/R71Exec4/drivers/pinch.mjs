#!/usr/bin/env node
// Chromium Input.synthesizePinchGesture runner: tabi round 71, C1 (coverage capability
// `chromium-synth-pinch-gesture-linux`). Usage:
//   node chrome-cdp-synthpinch-round71.mjs --scratch <ABS dir> --out <ABS receipt.json>
//     --nonce <tabi-r71-lowercase/digits/hyphens> --http-port <1024..65535> --cdp-port <1024..65535>
//     [--degenerate dispatch-wheel|set-scale|skip-touch]   (CONTROL runs only; never a scored run)
// Exit 0: every leg matched the frozen shape (LEG_SHAPE below); 1: retained red receipt;
// 2: usage refusal.
//
// Domain: the DevTools protocol command Input.synthesizePinchGesture (S173 Input.pdl; handler
// S174 input_handler.cc:2093-2136; dispatch S176 synthetic_pinch_gesture.cc; mouse path S177
// synthetic_touchpad_pinch_gesture.cc; touch path S178 synthetic_touchscreen_pinch_gesture.cc)
// driven against a loopback fixture in a 1280x900 desktop viewport. The page records every
// wheel / pointer / touch event with a sequence number, the leg it fell in, ctrlKey, deltaY,
// deltaMode, coordinates (per touch point for touch events), isTrusted and the visual-viewport
// scale at dispatch; after each leg the driver records the page scale twice (page-side
// visualViewport.scale and CDP Page.getLayoutMetrics cssVisualViewport.scale). The driver
// records every CDP method it sent (`cdpSendLog`) and the DevTools listening line from
// Chromium's stderr, so a counter can tell the gesture producer from a look-alike
// (Input.dispatchMouseEvent mouseWheel with ctrl, Input.dispatchTouchEvent, or
// Emulation.setPageScaleFactor). Leg shapes are frozen from the L1 smoke probe; see LEG_SHAPE.
// Round-70 routed defect R4: a Chromium child that exits during launch ends the run at once
// (child exit listener) instead of waiting for a page target.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-synthpinch-r71';
const SELF = fileURLToPath(import.meta.url);
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;
const PORT_PROBE_TIMEOUT_MS = 1500;
const VIEWPORT = { width: 1280, height: 900 };
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
class PathError extends Error {}
const isAbsNative = (p) => typeof p === 'string' && p.length > 0 && path.isAbsolute(p);
const norm = (p) => path.resolve(p);
const realNorm = (p) => { try { return fs.realpathSync(norm(p)); } catch { return norm(p); } };
const inside = (child, parent) => {
  const c = realNorm(child); const p = realNorm(parent);
  const rel = path.relative(p, c);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
};

function validateScratch(given) {
  if (!isAbsNative(given || '')) throw new PathError('--scratch must be an absolute native path');
  const dir = realNorm(given);
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.statSync(dir).isDirectory()) throw new PathError('--scratch is not a directory');
  try { fs.accessSync(dir, fs.constants.W_OK); } catch { throw new PathError('--scratch not writable: ' + dir); }
  // Chromium's singleton socket lives at <TMPDIR>/org.chromium.Chromium.XXXXXX/SingletonSocket;
  // over 107 bytes Chromium exits FATAL "Socket path too long" (r70 R4). Refuse up front.
  const sock = Buffer.byteLength(path.join(fs.realpathSync(dir), 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));
  if (sock > 107) throw new PathError('--scratch too long for Chromium\'s singleton socket (' + sock + ' > 107 bytes)');
  return dir;
}
function validateOut(given) {
  if (!isAbsNative(given || '')) throw new PathError('--out must be an absolute native path');
  if (!given.endsWith('.json')) throw new PathError('--out must end .json');
  return norm(given);
}
function validateProfile(scratch, token, profileDir) {
  if (!inside(profileDir, scratch)) throw new PathError('profile escapes scratch');
  if (profileDir.includes(token) === false) throw new PathError('profile does not carry the launch token');
  return profileDir;
}

const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : null; };
const usage = (detail) => { console.error(JSON.stringify({ schema: SCHEMA, error: 'usage', detail })); process.exit(2); };
let scratchDir, outReceipt;
try { scratchDir = validateScratch(opt('scratch')); outReceipt = validateOut(opt('out')); } catch (e) { usage(e.message); }
fs.mkdirSync(path.dirname(outReceipt), { recursive: true });
const DEGENERATE = opt('degenerate');
if (DEGENERATE !== null && !['dispatch-wheel', 'set-scale', 'skip-touch'].includes(DEGENERATE)) usage('--degenerate must be dispatch-wheel|set-scale|skip-touch (control runs only)');
const nonce = opt('nonce');
if (!nonce || !/^tabi-r71-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r71- followed by lowercase letters/digits/hyphens');
const ports = ['http-port', 'cdp-port'].map((key) => {
  const p = Number(opt(key));
  if (!p || !Number.isInteger(p) || p < 1024 || p > 65535) usage('--' + key + ' must be an integer 1024..65535');
  return p;
});
const [fixturePort, devPort] = ports;
if (fixturePort === devPort) usage('HTTP and CDP ports must differ');
const chromiumArg = '/fast/scratch/hyaku/tabi-r71/R71Exec4/wrap/chromium-wrapper.sh';
if (!fs.existsSync(chromiumArg)) usage('/usr/bin/chromium not present');
async function freePort(port) {
  await new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', (e) => { srv.close(); if (e.code === 'EADDRINUSE') reject(new Error('port ' + port + ' busy')); else reject(e); });
    srv.once('listening', () => srv.close(resolve));
    srv.listen(port, '127.0.0.1');
  });
}
try { for (const p of ports) await freePort(p); } catch (e) { usage('free-port precheck: ' + e.message); }
const launchToken = crypto.randomBytes(6).toString('hex');
const profileDir = validateProfile(scratchDir, launchToken, path.join(scratchDir, 'profile-' + launchToken));
const runHome = path.join(scratchDir, 'home-' + launchToken);
const runXdgConfig = path.join(runHome, '.config');
const runXdg = {
  HOME: runHome,
  XDG_CONFIG_HOME: runXdgConfig,
  XDG_CACHE_HOME: path.join(runHome, '.cache'),
  XDG_DATA_HOME: path.join(runHome, '.local', 'share'),
  XDG_STATE_HOME: path.join(runHome, '.local', 'state'),
  XDG_RUNTIME_DIR: path.join(runHome, 'run'),
  TMPDIR: scratchDir,
};
const runCrashDb = path.join(runXdgConfig, 'chromium', 'Crash Reports');
try {
  for (const d of [runCrashDb, runXdg.XDG_CACHE_HOME, runXdg.XDG_DATA_HOME, runXdg.XDG_STATE_HOME, runXdg.XDG_RUNTIME_DIR]) fs.mkdirSync(d, { recursive: true });
} catch (e) { usage('scratch home dirs: ' + e.message); }
const SWEEP_NEEDLES = [launchToken, profileDir, runCrashDb];
function sweepOnce() {
  const out = { at: new Date().toISOString(), pids: [], error: null };
  try {
    const r = spawnSync('ps', ['-eo', 'pid,args'], { encoding: 'utf8', timeout: 15000 });
    if (r.status !== 0) { out.error = 'ps exited ' + r.status; return out; }
    for (const line of (r.stdout || '').split('\n')) {
      if (SWEEP_NEEDLES.some((n) => line.includes(n))) {
        const pid = Number(line.trim().split(/\s+/)[0]);
        if (Number.isInteger(pid) && pid > 1) out.pids.push(pid);
      }
    }
  } catch (e) { out.error = e.message; }
  return out;
}
const killPid = (pid, sig = 'SIGKILL') => { try { process.kill(pid, sig); return true; } catch { return false; } };
async function sweepToZero() {
  let rounds = 0, last = null;
  while (rounds < SWEEP_MAX_ROUNDS) {
    last = sweepOnce();
    if (last.error || last.pids.length === 0) break;
    for (const pid of last.pids) killPid(pid);
    await sleep(SWEEP_WAIT_MS);
    rounds++;
  }
  return { postKillSweepCount: last.error ? -1 : Math.max(0, rounds - 1), survivors: last.error ? [] : last.pids, sweepError: last.error };
}
function probePort(port) {
  return new Promise((resolve) => {
    const s = net.connect({ port, host: '127.0.0.1' });
    let done = false;
    const fin = (v) => { if (!done) { done = true; try { s.destroy(); } catch {} resolve(v); } };
    s.setTimeout(PORT_PROBE_TIMEOUT_MS, () => fin('timeout'));
    s.on('connect', () => fin('open'));
    s.on('error', () => fin('closed'));
  });
}

const preLaunch = sweepOnce();
if (preLaunch.error || preLaunch.pids.length !== 0) usage('launch token not fresh');

/*SYNTHPINCH-FIXTURE-BEGIN*/
const FIXTURE_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r71 synthpinch fixture</title>
<style>html, body { margin: 0; padding: 0; background: #fff; width: 3000px; height: 3000px; } #pad { position: absolute; left: 100px; top: 100px; width: 600px; height: 400px; margin: 0; background: #08f; }</style>
<script>
window.__seq = 0; window.__leg = 'start'; window.__events = []; window.__nonceOnPage = null;
const pts = (list) => (list ? Array.from(list).map((t) => [Math.round(t.clientX * 100) / 100, Math.round(t.clientY * 100) / 100]) : null);
const rec = function (e) {
  window.__events.push({ type: e.type, seq: ++window.__seq, leg: window.__leg, ts: e.timeStamp, isTrusted: e.isTrusted,
    pointerType: e.pointerType || null, ctrlKey: e.ctrlKey === true, deltaY: typeof e.deltaY === 'number' ? e.deltaY : null,
    deltaMode: typeof e.deltaMode === 'number' ? e.deltaMode : null,
    clientX: typeof e.clientX === 'number' ? e.clientX : null, clientY: typeof e.clientY === 'number' ? e.clientY : null,
    touches: pts(e.touches), changed: pts(e.changedTouches),
    scale: window.visualViewport ? window.visualViewport.scale : null,
    target: e.target && e.target.id ? e.target.id : (e.target && e.target.nodeName ? e.target.nodeName : null) });
};
for (const t of ['wheel', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'gesturestart', 'gesturechange', 'gestureend'])
  document.addEventListener(t, rec, { capture: true, passive: true });
window.__setLeg = function (name) { window.__leg = name; return name; };
document.addEventListener('DOMContentLoaded', function () { window.__nonceOnPage = document.getElementById('nonce').textContent; });
</script></head><body><p id="nonce" style="position:absolute;left:0;top:0;margin:0;font:0/0 monospace">__NONCE__</p><div id="pad"></div></body></html>`;
/*SYNTHPINCH-FIXTURE-END*/
const FIXTURE_HTML = FIXTURE_TEMPLATE.replaceAll('__NONCE__', nonce);
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), FIXTURE_HTML);
const AT = { x: 400, y: 300 };
// Legs run in order; the page scale carries over between legs. `zero` is last: with
// scaleFactor 0 the touchpad gesture's end time is infinite (S177:162-174), so it never
// finishes and Chromium never answers the command (bounded wait ZERO_WAIT_MS).
const LEGS = [
  { name: 'start', params: null },
  { name: 'in', params: { x: AT.x, y: AT.y, scaleFactor: 2, gestureSourceType: 'mouse' } },
  { name: 'out', params: { x: AT.x, y: AT.y, scaleFactor: 0.5, gestureSourceType: 'mouse' } },
  { name: 'clamp', params: { x: AT.x, y: AT.y, scaleFactor: 0.5, gestureSourceType: 'mouse' } },
  { name: 'unit', params: { x: AT.x, y: AT.y, scaleFactor: 1, gestureSourceType: 'mouse' } },
  { name: 'default', params: { x: AT.x, y: AT.y, scaleFactor: 1.5 } },
  { name: 'touch', params: { x: AT.x, y: AT.y, scaleFactor: 2, gestureSourceType: 'touch' } },
  { name: 'slow', params: { x: AT.x, y: AT.y, scaleFactor: 2, relativeSpeed: 200, gestureSourceType: 'touch' } },
  { name: 'pen', params: { x: AT.x, y: AT.y, scaleFactor: 2, gestureSourceType: 'pen' } },
  { name: 'outside', params: { x: 5000, y: AT.y, scaleFactor: 2, gestureSourceType: 'mouse' } },
  { name: 'zero', params: { x: AT.x, y: AT.y, scaleFactor: 0, gestureSourceType: 'mouse' } },
];
const SETTLE_MS = 700;
const ZERO_WAIT_MS = 4000;
const serverLog = [];
const fixtureServer = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  const status = u.pathname === '/' ? 200 : 404;
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, ''), run: u.searchParams.get('run') || '', status });
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/' ? FIXTURE_HTML : 'not found');
});
const origin = 'http://127.0.0.1:' + fixturePort;
const failures = [];
const cdpSendLog = [];
const receipt = {
  schema: SCHEMA, nonce, degenerate: DEGENERATE, driverSha256: sha256(fs.readFileSync(SELF)),
  startedAt: new Date().toISOString(), finishedAt: null,
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', argv: [], launchToken, devtoolsListening: null, childExit: null },
  fixture: { sha256: sha256(FIXTURE_HTML), origin, viewport: VIEWPORT, anchor: AT },
  plan: LEGS, nonceOnPage: null, legs: [], events: [], cdpSendLog, serverLog,
  teardown: { postKillSweepCount: -1, survivors: [], sweepError: 'not-run', portProbes: null, postKillCurl: null },
  sweeps: {}, failures, legShape: {}, synthPinchHypothesis: 'UNMEASURED', predicate: false,
};
const childArgv = [chromiumArg, '--headless=new', '--remote-debugging-port=' + devPort,
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
  '--force-device-scale-factor=1',
  '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
receipt.host.argv = childArgv;
let child = null, ws = null, midRunCount = 0, closing = null, stderrHead = '';
async function teardown() {
  if (closing) return closing;
  closing = (async () => {
    try { if (ws) ws.close(); } catch {}
    if (child?.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
    await sleep(600);
    const swept = await sweepToZero();
    fixtureServer.closeAllConnections();
    await Promise.race([new Promise((resolve) => fixtureServer.close(resolve)), sleep(2000)]);
    const portProbes = { fixture: await probePort(fixturePort), devtools: await probePort(devPort) };
    const curlExit = (port) => spawnSync('/usr/bin/curl', ['--noproxy', '*', '--silent', '--show-error', '--max-time', '2', 'http://127.0.0.1:' + port + '/'], { encoding: 'utf8', timeout: 4000 }).status;
    receipt.teardown = {
      postKillSweepCount: swept.postKillSweepCount, survivors: swept.survivors, sweepError: swept.sweepError,
      portProbes, postKillCurl: { fixture: curlExit(fixturePort), devtools: curlExit(devPort) },
    };
    receipt.sweeps = { preLaunch: preLaunch.pids.length, midRun: midRunCount, postKill: swept.postKillSweepCount };
    if (swept.sweepError) failures.push({ id: 'sweep-error', detail: swept.sweepError });
    if (swept.postKillSweepCount !== 0 || swept.survivors.length || Object.values(portProbes).some((v) => v !== 'closed') || Object.values(receipt.teardown.postKillCurl).some((v) => v !== 7)) failures.push({ id: 'teardown-closure', detail: 'closure proof failed' });
  })();
  return closing;
}
let interrupted = false;
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { interrupted = true; failures.push({ id: 'interrupted', detail: sig }); await teardown(); fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1)); process.exit(1); });
try {
  await new Promise((resolve, reject) => { fixtureServer.once('error', reject); fixtureServer.listen(fixturePort, '127.0.0.1', resolve); });
  const version = spawnSync(chromiumArg, ['--version'], { encoding: 'utf8', timeout: 15000, env: { ...process.env, ...runXdg } });
  if (version.status !== 0) throw new Error('chromium version failed');
  receipt.host.chromium = version.stdout.trim();
  child = spawn(childArgv[0], childArgv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env: { ...process.env, ...runXdg } });
  let launchError = null;
  child.on('error', (e) => { launchError = e; });
  child.on('exit', (code, signal) => { receipt.host.childExit = { code, signal, at: new Date().toISOString() }; if (!closing) launchError = launchError || new Error('chromium exited during the run: code ' + code + ' signal ' + signal); });
  child.stderr.on('data', (d) => { if (stderrHead.length < 4096) stderrHead += d.toString('utf8').slice(0, 4096 - stderrHead.length); });

  const fetchJSON = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
  let page = null;
  for (let i = 0; i < 400 && !page; i++) {
    if (launchError) throw launchError;
    try { page = (await fetchJSON('http://127.0.0.1:' + devPort + '/json/list')).find((t) => t.type === 'page'); } catch {}
    if (!page) await sleep(150);
  }
  if (!page || !new RegExp('^ws://127\\.0\\.0\\.1:' + devPort + '/').test(page.webSocketDebuggerUrl)) throw new Error('no loopback page target');
  midRunCount = sweepOnce().pids.length;
  if (midRunCount < 1) throw new Error('launch token unbound');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('ws open timeout')), 20000); ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true }); ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('ws error')); }, { once: true }); });
  let msgId = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const msg = JSON.parse(ev.data); const p = pending.get(msg.id); if (p) { pending.delete(msg.id); clearTimeout(p.timer); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg); } });
  const send = (method, params = {}, timeoutMs = 30000) => new Promise((resolve, reject) => { const id = ++msgId; cdpSendLog.push({ id, method, params }); const timer = setTimeout(() => { pending.delete(id); reject(new Error('no-response-' + timeoutMs + 'ms ' + method)); }, timeoutMs); pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params })); });
  const evalValue = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
  const scales = async () => {
    const page = await evalValue('window.visualViewport.scale');
    const m = await send('Page.getLayoutMetrics');
    return { page, cdp: m.result?.cssVisualViewport?.scale ?? null };
  };
  const ver = await send('Browser.getVersion');
  receipt.host.cdpProduct = ver.result.product;
  receipt.host.cdpProtocolVersion = ver.result.protocolVersion;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: origin + '/?run=' + encodeURIComponent(nonce) });
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) {
    try { ready = await evalValue('document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(nonce)); } catch {}
    if (!ready) await sleep(100);
  }
  if (!ready) throw new Error('fixture not ready');
  receipt.nonceOnPage = await evalValue('window.__nonceOnPage');
  let degenScale = 1;
  for (const leg of LEGS) {
    await evalValue('window.__setLeg(' + JSON.stringify(leg.name) + ')');
    const before = await scales();
    const t0 = Date.now();
    let result = null, cdpError = null;
    const skip = DEGENERATE === 'skip-touch' && (leg.name === 'touch' || leg.name === 'slow');
    if (leg.params && !skip) {
      const p = leg.params;
      try {
        if (DEGENERATE === 'dispatch-wheel' || DEGENERATE === 'set-scale') {
          // Look-alike producers (control runs only).
          const src = p.gestureSourceType;
          if (p.x > VIEWPORT.width) throw new Error(JSON.stringify({ code: -32602, message: 'Position out of bounds' }));
          if (src === 'pen') throw new Error(JSON.stringify({ code: -32602, message: 'Unknown gestureSourceType' }));
          if (p.scaleFactor === 0) { await sleep(ZERO_WAIT_MS); throw new Error('no-response-' + ZERO_WAIT_MS + 'ms Input.synthesizePinchGesture'); }
          if (src === 'touch' || p.scaleFactor === 1) { /* no events */ }
          else if (DEGENERATE === 'dispatch-wheel') {
            for (let k = 0; k < 12; k++) await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: p.x, y: p.y, deltaX: 0, deltaY: p.scaleFactor > 1 ? -5 : 5, modifiers: 2 });
          } else {
            degenScale = Math.max(1, degenScale * p.scaleFactor);
            await send('Emulation.setPageScaleFactor', { pageScaleFactor: degenScale });
          }
        } else {
          result = (await send('Input.synthesizePinchGesture', p, leg.name === 'zero' ? ZERO_WAIT_MS : 30000)).result;
        }
      } catch (e) { cdpError = e.message; }
      await sleep(SETTLE_MS);
    }
    const after = await scales();
    receipt.legs.push({ name: leg.name, params: leg.params, skipped: skip, cdpResult: result, cdpError, elapsedMs: Date.now() - t0, scaleBefore: before, scaleAfter: after });
  }
  await evalValue('window.__setLeg("end")');
  receipt.events = await evalValue('JSON.parse(JSON.stringify(window.__events))');
} catch (e) { failures.push({ id: 'drive-error', detail: e.message }); }
finally { await teardown(); }
receipt.host.stderrHead = stderrHead.slice(0, 4096);
{
  const m = /DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/([0-9a-f-]{36}))/.exec(stderrHead);
  receipt.host.devtoolsListening = m ? { url: m[1], port: Number(m[2]), browserId: m[3] } : null;
}
receipt.finishedAt = new Date().toISOString();
// Per-leg observed shape, re-derived independently by the counter from the raw events.
const MOVES = new Set(['pointermove', 'touchmove']);
function legSummary(name) {
  const evs = receipt.events.filter((e) => e.leg === name);
  const wheels = evs.filter((e) => e.type === 'wheel');
  const tm = evs.filter((e) => e.type === 'touchmove');
  const kinds = [...new Set(evs.map((e) => e.type + (e.pointerType ? '(' + e.pointerType + ')' : '')))].sort();
  const leg = receipt.legs.find((l) => l.name === name) || {};
  const span = (list) => (list.length >= 2 ? +(list[list.length - 1].ts - list[0].ts).toFixed(1) : null);
  return {
    kinds, total: evs.length, allTrusted: evs.every((e) => e.isTrusted === true),
    wheels: wheels.length, wheelCtrlAll: wheels.every((e) => e.ctrlKey === true),
    wheelSign: wheels.length === 0 ? null : wheels.every((e) => e.deltaY < 0) ? 'in' : wheels.every((e) => e.deltaY > 0) ? 'out' : wheels.every((e) => e.deltaY === 0) ? 'zero' : 'mixed',
    wheelSpanMs: span(wheels),
    touchmoves: tm.length, touchSpanMs: span(evs.filter((e) => /^touch/.test(e.type))),
    nonMove: evs.filter((e) => !MOVES.has(e.type) && e.type !== 'wheel').map((e) => e.type + (e.pointerType ? '(' + e.pointerType + ')' : '')),
    scaleAfter: leg.scaleAfter ? leg.scaleAfter.page : null,
  };
}
for (const leg of LEGS) receipt.legShape[leg.name] = legSummary(leg.name);
// Frozen leg shape (L1 smoke probe on Chromium 155.0.8059.84, Linux, --headless=new; S176-S178
// lines in the knowledge note). Scale targets carry over: in 1->2, out 2->1, clamp 1->1 (minimum
// page scale), unit no gesture, default 1->1.5, touch/slow/pen/outside/zero unchanged.
const TOUCH_SEQ = ['pointerdown(touch)', 'touchstart', 'pointerdown(touch)', 'touchstart', 'pointerup(touch)', 'touchend', 'pointerup(touch)', 'touchend'];
const LEG_SHAPE = {
  start: { wheels: 0, wheelSign: null, nonMove: [], scale: 1, error: null },
  in: { wheelSign: 'in', minWheels: 5, nonMove: [], scale: 2, span: [150, 450], error: null },
  out: { wheelSign: 'out', minWheels: 5, nonMove: [], scale: 1, span: [150, 450], error: null },
  clamp: { wheelSign: 'out', minWheels: 5, nonMove: [], scale: 1, span: [150, 450], error: null },
  unit: { wheels: 0, wheelSign: null, nonMove: [], scale: 1, error: null },
  default: { wheelSign: 'in', minWheels: 3, nonMove: [], scale: 1.5, span: [60, 300], error: null },
  touch: { wheels: 0, wheelSign: null, nonMove: TOUCH_SEQ, scale: 1.5, minTouchmoves: 5, error: null },
  slow: { wheels: 0, wheelSign: null, nonMove: TOUCH_SEQ, scale: 1.5, minTouchmoves: 15, error: null },
  pen: { wheels: 0, wheelSign: null, nonMove: [], scale: 1.5, error: 'Unknown gestureSourceType' },
  outside: { wheels: 0, wheelSign: null, nonMove: [], scale: 1.5, error: 'Position out of bounds' },
  zero: { wheelSign: 'zero', minWheels: 20, nonMove: [], scale: 1.5, error: 'no-response-' + ZERO_WAIT_MS + 'ms' },
};
const near = (a, b) => typeof a === 'number' && Math.abs(a - b) <= 0.01;
const shapeOk = (name) => {
  const want = LEG_SHAPE[name]; const got = receipt.legShape[name]; const leg = receipt.legs.find((l) => l.name === name);
  if (!want || !got || !leg || leg.skipped || !got.allTrusted) return false;
  if (want.wheels !== undefined && got.wheels !== want.wheels) return false;
  if (want.minWheels !== undefined && !(got.wheels >= want.minWheels && got.wheelCtrlAll)) return false;
  if (got.wheelSign !== want.wheelSign) return false;
  if (JSON.stringify(got.nonMove) !== JSON.stringify(want.nonMove)) return false;
  if (!near(leg.scaleAfter?.page, want.scale) || !near(leg.scaleAfter?.cdp, want.scale)) return false;
  if (want.span && !(got.wheelSpanMs >= want.span[0] && got.wheelSpanMs <= want.span[1])) return false;
  if (want.minTouchmoves !== undefined && !(got.touchmoves >= want.minTouchmoves)) return false;
  if (want.error === null ? leg.cdpError !== null : !(typeof leg.cdpError === 'string' && leg.cdpError.includes(want.error))) return false;
  return true;
};
const pinchCalls = cdpSendLog.filter((c) => c.method === 'Input.synthesizePinchGesture').length;
const lookAlikes = cdpSendLog.filter((c) => /^Input\.(dispatch|emulateTouch)/.test(c.method) || /^Emulation\.(setPageScaleFactor|setTouchEmulationEnabled|setEmitTouchEventsForMouse)$/.test(c.method)).length;
const slowRatio = receipt.legShape.touch.touchSpanMs > 0 ? receipt.legShape.slow.touchSpanMs / receipt.legShape.touch.touchSpanMs : null;
receipt.slowToTouchSpanRatio = slowRatio === null ? null : +slowRatio.toFixed(2);
receipt.synthPinchHypothesis = (LEGS.every((l) => shapeOk(l.name)) && slowRatio !== null && slowRatio >= 3 && slowRatio <= 5 && pinchCalls === 10 && lookAlikes === 0 && receipt.nonceOnPage === nonce && receipt.degenerate === null) ? 'CONFIRMED' : 'REFUTED';
receipt.predicate = receipt.synthPinchHypothesis === 'CONFIRMED' && receipt.failures.length === 0 && !interrupted;
fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1));
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, predicate: receipt.predicate, synthPinchHypothesis: receipt.synthPinchHypothesis, degenerate: DEGENERATE, slowToTouchSpanRatio: receipt.slowToTouchSpanRatio, legShape: receipt.legShape, legs: receipt.legs.map((l) => ({ name: l.name, cdpError: l.cdpError, elapsedMs: l.elapsedMs, scaleAfter: l.scaleAfter })), devtools: receipt.host.devtoolsListening, teardown: receipt.teardown, failures }, null, 1));
process.exitCode = receipt.predicate ? 0 : 1;

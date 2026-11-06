#!/usr/bin/env node
// Chromium Input.synthesizePinchGesture variant probe: tabi round 71, seat R71Exec3.
// Falsification probe of the r71 pinch knowledge beyond the frozen legs. One Chromium run
// per variant (--variant), loopback fixture, 1280x900 desktop viewport unless a leg overrides
// it. Usage:
//   node chrome-cdp-pinchprobe-r71.mjs --variant <name> --scratch <ABS dir> --out <ABS .json>
//     --nonce <tabi-r71-...> --http-port <41000..48999> --cdp-port <41000..48999>
// Exit 0: the run completed and the receipt was written (a red cdpError is data, not a run
// failure); 2: usage refusal; 1: the run itself failed (no page, ws closed, teardown hole).
//
// Patterns copied from the pinned lane driver scripts/chrome-cdp-synthpinch-round71.mjs
// (sha256 5318780c...): short-scratch singleton-socket guard, launch token, XDG sandbox,
// PID sweep, child exit listener (r70 R4), fixture that records every wheel/pointer/touch
// event with leg, ctrlKey, deltaY, coordinates, isTrusted and visualViewport.scale at
// dispatch, double scale read (page + Page.getLayoutMetrics), cdpSendLog, teardown closure.
// Additions for this probe: deltaYRaw/scaleRaw strings (NaN survives JSON), per-variant leg
// plans, per-leg pre-actions (device metrics / touch emulation), bounded per-leg timeouts and
// an in-flight liveness probe (Runtime.evaluate while a gesture command is pending).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-r71-pinchprobe-R71Exec3';
const SELF = fileURLToPath(import.meta.url);
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;
const PORT_PROBE_TIMEOUT_MS = 1500;
const VIEWPORT = { width: 1280, height: 900 };
const SETTLE_MS = 700;
const PRE_SETTLE_MS = 500;
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

// One entry per variant; each leg runs once, in order, page scale carries over between legs.
// `pre` runs CDP commands before the leg (device metrics / touch emulation). `pinch` is the
// Input.synthesizePinchGesture params; `scroll` is Input.synthesizeScrollGesture params.
// `timeoutMs` bounds the CDP wait (a no-response is data). `liveness` probes Runtime.evaluate
// while the gesture command is still pending.
const VARIANTS = {
  scale3: [
    { name: 'start' },
    { name: 'p3', pinch: { x: 400, y: 300, scaleFactor: 3, gestureSourceType: 'mouse' } },
    { name: 'p3b', pinch: { x: 100, y: 100, scaleFactor: 3, gestureSourceType: 'mouse' } },
  ],
  scale025: [
    { name: 'start' },
    { name: 'q', pinch: { x: 400, y: 300, scaleFactor: 0.25, gestureSourceType: 'mouse' } },
  ],
  negative: [
    { name: 'start' },
    { name: 'neg', pinch: { x: 400, y: 300, scaleFactor: -1, gestureSourceType: 'mouse' }, timeoutMs: 10000 },
  ],
  queue: [
    { name: 'start' },
    { name: 'zero', pinch: { x: 400, y: 300, scaleFactor: 0, gestureSourceType: 'mouse' }, timeoutMs: 3000 },
    { name: 'afterzero', pinch: { x: 400, y: 300, scaleFactor: 2, gestureSourceType: 'mouse' }, timeoutMs: 6000, liveness: true },
    { name: 'scroll', scroll: { x: 400, y: 300, xDistance: 0, yDistance: -200, speed: 800, gestureSourceType: 'mouse' }, timeoutMs: 3000 },
  ],
  touchmobile: [
    { name: 'start' },
    { name: 'm_mobile', pre: [{ method: 'Emulation.setDeviceMetricsOverride', params: { width: 1280, height: 900, deviceScaleFactor: 1, mobile: true } }], pinch: { x: 400, y: 300, scaleFactor: 2, gestureSourceType: 'touch' } },
    { name: 'm_touch', pre: [{ method: 'Emulation.setTouchEmulationEnabled', params: { enabled: true, maxTouchPoints: 5 } }], pinch: { x: 400, y: 300, scaleFactor: 2, gestureSourceType: 'touch' } },
    { name: 'm_default', pinch: { x: 400, y: 300, scaleFactor: 2 } },
    { name: 'm_narrow', pre: [{ method: 'Emulation.setDeviceMetricsOverride', params: { width: 390, height: 844, deviceScaleFactor: 3, mobile: true } }], pinch: { x: 200, y: 400, scaleFactor: 2, gestureSourceType: 'touch' } },
  ],
  speed1600: [
    { name: 'start' },
    { name: 's', pinch: { x: 400, y: 300, scaleFactor: 2, relativeSpeed: 1600, gestureSourceType: 'mouse' } },
  ],
  speed100: [
    { name: 'start' },
    { name: 's', pinch: { x: 400, y: 300, scaleFactor: 2, relativeSpeed: 100, gestureSourceType: 'mouse' } },
  ],
  law: [
    { name: 'start' },
    { name: 'in', pinch: { x: 400, y: 300, scaleFactor: 2, gestureSourceType: 'mouse' } },
    { name: 'out', pinch: { x: 400, y: 300, scaleFactor: 0.5, gestureSourceType: 'mouse' } },
  ],
  edge: [
    { name: 'start' },
    { name: 'edge_mouse', pinch: { x: 5, y: 5, scaleFactor: 2, gestureSourceType: 'mouse' } },
    { name: 'edge_touch', pinch: { x: 5, y: 5, scaleFactor: 2, gestureSourceType: 'touch' } },
  ],
};

const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : null; };
const usage = (detail) => { console.error(JSON.stringify({ schema: SCHEMA, error: 'usage', detail })); process.exit(2); };
const variant = opt('variant');
if (!variant || !Object.prototype.hasOwnProperty.call(VARIANTS, variant)) usage('--variant must be one of ' + Object.keys(VARIANTS).join('|'));
const PLAN = VARIANTS[variant];
let scratchDir, outReceipt;
try { scratchDir = validateScratch(opt('scratch')); outReceipt = validateOut(opt('out')); } catch (e) { usage(e.message); }
fs.mkdirSync(path.dirname(outReceipt), { recursive: true });
const nonce = opt('nonce');
if (!nonce || !/^tabi-r71-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r71- followed by lowercase letters/digits/hyphens');
const ports = ['http-port', 'cdp-port'].map((key) => {
  const p = Number(opt(key));
  if (!p || !Number.isInteger(p) || p < 1024 || p > 65535) usage('--' + key + ' must be an integer 1024..65535');
  return p;
});
const [fixturePort, devPort] = ports;
if (fixturePort === devPort) usage('HTTP and CDP ports must differ');
const chromiumArg = '/usr/bin/chromium';
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

const FIXTURE_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r71 pinchprobe fixture</title>
<style>html, body { margin: 0; padding: 0; background: #fff; width: 3000px; height: 3000px; } #pad { position: absolute; left: 100px; top: 100px; width: 600px; height: 400px; margin: 0; background: #08f; }</style>
<script>
window.__seq = 0; window.__leg = 'start'; window.__events = []; window.__nonceOnPage = null;
const pts = (list) => (list ? Array.from(list).map((t) => [Math.round(t.clientX * 100) / 100, Math.round(t.clientY * 100) / 100]) : null);
const rec = function (e) {
  window.__events.push({ type: e.type, seq: ++window.__seq, leg: window.__leg, ts: e.timeStamp, isTrusted: e.isTrusted,
    pointerType: e.pointerType || null, ctrlKey: e.ctrlKey === true,
    deltaY: typeof e.deltaY === 'number' ? e.deltaY : null, deltaYRaw: typeof e.deltaY === 'number' ? String(e.deltaY) : null,
    deltaMode: typeof e.deltaMode === 'number' ? e.deltaMode : null,
    clientX: typeof e.clientX === 'number' ? e.clientX : null, clientY: typeof e.clientY === 'number' ? e.clientY : null,
    touches: pts(e.touches), changed: pts(e.changedTouches),
    scale: window.visualViewport ? window.visualViewport.scale : null,
    scaleRaw: window.visualViewport ? String(window.visualViewport.scale) : null,
    target: e.target && e.target.id ? e.target.id : (e.target && e.target.nodeName ? e.target.nodeName : null) });
};
for (const t of ['wheel', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'gesturestart', 'gesturechange', 'gestureend'])
  document.addEventListener(t, rec, { capture: true, passive: true });
window.__setLeg = function (name) { window.__leg = name; return name; };
document.addEventListener('DOMContentLoaded', function () { window.__nonceOnPage = document.getElementById('nonce').textContent; });
</script></head><body><p id="nonce" style="position:absolute;left:0;top:0;margin:0;font:0/0 monospace">__NONCE__</p><div id="pad"></div></body></html>`;
const FIXTURE_HTML = FIXTURE_TEMPLATE.replaceAll('__NONCE__', nonce);
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), FIXTURE_HTML);
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
  schema: SCHEMA, variant, nonce, driverSha256: sha256(fs.readFileSync(SELF)),
  startedAt: new Date().toISOString(), finishedAt: null,
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', argv: [], launchToken, devtoolsListening: null, childExit: null },
  fixture: { sha256: sha256(FIXTURE_HTML), origin, viewport: VIEWPORT },
  plan: PLAN, preActions: [], nonceOnPage: null, legs: [], events: [], cdpSendLog, serverLog,
  teardown: { postKillSweepCount: -1, survivors: [], sweepError: 'not-run', portProbes: null, postKillCurl: null },
  sweeps: {}, failures, wsClosed: null, predicate: false,
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
  ws.addEventListener('close', () => {
    receipt.wsClosed = { at: new Date().toISOString(), pending: [...pending.keys()] };
    for (const [id, p] of pending) { clearTimeout(p.timer); p.reject(new Error('ws-closed id ' + id)); }
    pending.clear();
  });
  const send = (method, params = {}, timeoutMs = 30000) => new Promise((resolve, reject) => { const id = ++msgId; cdpSendLog.push({ id, method, params }); const timer = setTimeout(() => { pending.delete(id); reject(new Error('no-response-' + timeoutMs + 'ms ' + method)); }, timeoutMs); pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params })); });
  const evalValue = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
  const vv = async () => JSON.parse(await evalValue('JSON.stringify({s:String(window.visualViewport.scale),w:window.visualViewport.width,h:window.visualViewport.height,ox:window.visualViewport.offsetLeft,oy:window.visualViewport.offsetTop})'));
  const scales = async () => {
    const page = await vv();
    const m = await send('Page.getLayoutMetrics');
    const cdp = m.result?.cssVisualViewport?.scale ?? null;
    return { page: page.s, pageNum: Number(page.s), vv: page, cdp: cdp === null ? null : String(cdp), cdpNum: typeof cdp === 'number' ? cdp : null };
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
  for (const leg of PLAN) {
    for (const pre of leg.pre || []) {
      await send(pre.method, pre.params);
      receipt.preActions.push({ leg: leg.name, method: pre.method, params: pre.params, at: new Date().toISOString() });
    }
    if (leg.pre) await sleep(PRE_SETTLE_MS);
    await evalValue('window.__setLeg(' + JSON.stringify(leg.name) + ')');
    const before = await scales();
    const t0 = Date.now();
    let cdpResult = null, cdpError = null, liveness = null;
    if (leg.pinch) {
      const timeoutMs = leg.timeoutMs || 30000;
      const pendingCall = send('Input.synthesizePinchGesture', leg.pinch, timeoutMs)
        .then((r) => ({ ok: true, result: r.result })).catch((e) => ({ ok: false, error: e.message }));
      if (leg.liveness) {
        await sleep(1200);
        liveness = await evalValue('1+1').then((v) => ({ ok: v === 2, value: v })).catch((e) => ({ ok: false, error: e.message }));
      }
      const r = await pendingCall;
      if (r.ok) cdpResult = r.result; else cdpError = r.error;
      await sleep(SETTLE_MS);
    } else if (leg.scroll) {
      const timeoutMs = leg.timeoutMs || 30000;
      const r = await send('Input.synthesizeScrollGesture', leg.scroll, timeoutMs)
        .then((x) => ({ ok: true, result: x.result })).catch((e) => ({ ok: false, error: e.message }));
      if (r.ok) cdpResult = r.result; else cdpError = r.error;
      await sleep(SETTLE_MS);
    }
    const after = await scales();
    receipt.legs.push({ name: leg.name, plan: leg, cdpResult, cdpError, liveness, elapsedMs: Date.now() - t0, scaleBefore: before, scaleAfter: after });
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
    wheelPositions: [...new Set(wheels.map((e) => e.clientX + ',' + e.clientY))].slice(0, 6),
    deltaYRawSample: wheels.slice(0, 4).map((e) => e.deltaYRaw),
    touchmoves: tm.length, touchSpanMs: span(evs.filter((e) => /^touch/.test(e.type))),
    touchPoints: [...new Set(evs.filter((e) => e.type === 'touchstart' || e.type === 'touchmove').map((e) => JSON.stringify(e.touches)))].slice(0, 6),
    nonMove: evs.filter((e) => !MOVES.has(e.type) && e.type !== 'wheel').map((e) => e.type + (e.pointerType ? '(' + e.pointerType + ')' : '')),
    scaleAfterPage: leg.scaleAfter ? leg.scaleAfter.page : null,
    scaleAfterCdp: leg.scaleAfter ? leg.scaleAfter.cdp : null,
    cdpResult: leg.cdpResult ?? null, cdpError: leg.cdpError ?? null, elapsedMs: leg.elapsedMs ?? null,
  };
}
receipt.legShape = {};
for (const leg of PLAN) receipt.legShape[leg.name] = legSummary(leg.name);
receipt.predicate = failures.length === 0 && !interrupted && receipt.nonceOnPage === nonce;
fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1));
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, variant, predicate: receipt.predicate, nonce, legs: receipt.legs.map((l) => ({ name: l.name, cdpResult: l.cdpResult, cdpError: l.cdpError, liveness: l.liveness, elapsedMs: l.elapsedMs, scaleBefore: l.scaleBefore ? l.scaleBefore.page : null, scaleAfter: l.scaleAfter ? l.scaleAfter.page : null })), legShape: receipt.legShape, wsClosed: receipt.wsClosed, childExit: receipt.host.childExit, teardown: receipt.teardown, failures }, null, 1));
process.exitCode = receipt.predicate ? 0 : 1;

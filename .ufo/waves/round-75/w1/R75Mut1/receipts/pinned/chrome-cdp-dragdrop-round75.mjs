#!/usr/bin/env node
// Chromium drag-and-drop interception runner: tabi round 75, C1 (coverage capability
// `chromium-drag-intercept-linux`, generation r75). Launch, sweep and teardown plumbing are the
// round-74 imecompose driver's, unchanged; the fixture, legs, CDP event capture and leg shapes are
// new. Usage:
//   node chrome-cdp-dragdrop-round75.mjs --scratch <ABS dir> --out <ABS receipt.json>
//     --nonce <tabi-r75-lowercase/digits/hyphens> --http-port <1024..65535> --cdp-port <1024..65535>
//     [--degenerate native-mouse|no-intercept|script-events]   (CONTROL runs only; never a scored run)
// Exit 0: every leg matched the frozen shape (LEG_SHAPE below); 1: retained red receipt;
// 2: usage refusal.
//
// Domain: the DevTools protocol commands Input.setInterceptDrags and Input.dispatchDragEvent and
// the event Input.dragIntercepted (Input.pdl; browser-side handler input_handler.cc) driven against
// a loopback fixture holding a draggable source <div id=src> (its dragstart sets text/plain and
// text/x-tabi), a drop zone <div id=dz> that cancels dragenter/dragover and accepts the drop, and a
// zone <div id=nz> that cancels nothing. A real mouse press + move on the source starts a drag;
// with interception on, the browser reports the drag data as Input.dragIntercepted instead of
// running a native drag, and the driver replays THAT data with Input.dispatchDragEvent. The page
// records every drag, pointer and mouse event (window bubble phase, after the targets' own
// handlers) with a sequence number, the leg it fell in, target, client x/y, buttons, isTrusted,
// defaultPrevented and the DataTransfer view (types, text/plain and text/x-tabi data, dropEffect,
// effectAllowed, item count). The driver records every CDP method it sent (`cdpSendLog`), every
// Input.* CDP event it received (`cdpEventLog`) and Chromium's DevTools listening line, so a
// counter can tell the interception producer from a native mouse drag, a dispatch without
// interception, or script-dispatched DragEvents.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-dragdrop-r75';
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
if (DEGENERATE !== null && !['native-mouse', 'no-intercept', 'script-events'].includes(DEGENERATE)) usage('--degenerate must be native-mouse|no-intercept|script-events (control runs only)');
const nonce = opt('nonce');
if (!nonce || !/^tabi-r75-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r75- followed by lowercase letters/digits/hyphens');
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

/*DRAGDROP-FIXTURE-BEGIN*/
const FIXTURE_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r75 dragdrop fixture</title>
<style>html, body { margin: 0; padding: 0; background: #fff; } #src { position: absolute; left: 100px; top: 100px; width: 100px; height: 40px; background: #cfc; } #dz { position: absolute; left: 400px; top: 100px; width: 200px; height: 200px; background: #ccf; } #nz { position: absolute; left: 400px; top: 400px; width: 200px; height: 200px; background: #fcc; }</style>
<script>
window.__seq = 0; window.__leg = 'start'; window.__events = []; window.__nonceOnPage = null;
window.__marks = [{ name: 'start', at: performance.now() }]; window.__closed = false; window.__late = 0;
window.__drops = 0; window.__starts = 0;
const rec = function (e) {
  if (window.__closed) { window.__late++; return; }
  const dt = e.dataTransfer || null;
  window.__events.push({ type: e.type, seq: ++window.__seq, leg: window.__leg, ts: e.timeStamp, at: performance.now(), isTrusted: e.isTrusted,
    target: e.target && e.target.id ? e.target.id : (e.target && e.target.nodeName ? e.target.nodeName : null),
    x: e.clientX, y: e.clientY, buttons: e.buttons, defaultPrevented: e.defaultPrevented,
    types: dt ? Array.from(dt.types) : null, plain: dt ? dt.getData('text/plain') : null, custom: dt ? dt.getData('text/x-tabi') : null,
    dropEffect: dt ? dt.dropEffect : null, effectAllowed: dt ? dt.effectAllowed : null, items: dt ? dt.items.length : null });
};
for (const t of ['dragstart', 'drag', 'dragenter', 'dragover', 'dragleave', 'drop', 'dragend', 'pointerdown', 'pointerup', 'pointercancel', 'mousedown', 'mouseup', 'click'])
  window.addEventListener(t, rec, false);
window.__setLeg = function (name) { window.__leg = name; window.__marks.push({ name: name, at: performance.now() }); return name; };
window.__state = function () { return JSON.stringify({ dz: document.getElementById('dz').textContent, nz: document.getElementById('nz').textContent, drops: window.__drops, starts: window.__starts }); };
window.__closeRecord = function () { window.__closed = true; return JSON.stringify({ events: window.__events, marks: window.__marks, closedAt: performance.now() }); };
document.addEventListener('DOMContentLoaded', function () {
  window.__nonceOnPage = document.getElementById('nonce').textContent;
  document.getElementById('src').addEventListener('dragstart', function (e) { window.__starts++; e.dataTransfer.setData('text/plain', 'tabi-drag'); e.dataTransfer.setData('text/x-tabi', 'x1'); e.dataTransfer.effectAllowed = 'copyMove'; });
  const dz = document.getElementById('dz');
  for (const t of ['dragenter', 'dragover']) dz.addEventListener(t, function (e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
  dz.addEventListener('drop', function (e) { e.preventDefault(); window.__drops++; dz.textContent = e.dataTransfer.getData('text/plain') + '|' + e.dataTransfer.getData('text/x-tabi'); });
  const nz = document.getElementById('nz');
  nz.addEventListener('drop', function (e) { window.__drops++; nz.textContent = 'dropped'; });
});
</script></head><body><p id="nonce" style="position:absolute;left:0;top:0;margin:0;font:0/0 monospace">__NONCE__</p><div id="src" draggable="true">drag</div><div id="dz"></div><div id="nz"></div></body></html>`;
/*DRAGDROP-FIXTURE-END*/
const FIXTURE_HTML = FIXTURE_TEMPLATE.replaceAll('__NONCE__', nonce);
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), FIXTURE_HTML);
// Legs run in order on one page; every leg but `start` sends exactly one CDP Input command.
// `data: 'INTERCEPTED'` means: the data object of the run's single Input.dragIntercepted event,
// sent unchanged (no intercepted event -> the leg sends nothing and records an error). EXT is an
// external drag (no source in the page) with fixed data. `bad-type` names a drag type the
// protocol does not accept.
const EXT = { items: [{ mimeType: 'text/plain', data: 'tabi-ext' }], dragOperationsMask: 1 };
const mouse = (type, x, y, buttons, extra = {}) => ({ type, x, y, button: 'left', buttons, ...extra });
const drag = (type, x, y, data) => ({ type, x, y, data });
const LEGS = [
  { name: 'start', cmd: null, params: null },
  { name: 'intercept-on', cmd: 'Input.setInterceptDrags', params: { enabled: true } },
  { name: 'press', cmd: 'Input.dispatchMouseEvent', params: mouse('mousePressed', 150, 120, 1, { clickCount: 1 }) },
  { name: 'move-start', cmd: 'Input.dispatchMouseEvent', params: mouse('mouseMoved', 170, 125, 1) },
  { name: 'move-far', cmd: 'Input.dispatchMouseEvent', params: mouse('mouseMoved', 450, 150, 1) },
  { name: 'enter-dz', cmd: 'Input.dispatchDragEvent', params: drag('dragEnter', 450, 150, 'INTERCEPTED') },
  { name: 'over-dz', cmd: 'Input.dispatchDragEvent', params: drag('dragOver', 460, 160, 'INTERCEPTED') },
  { name: 'drop-dz', cmd: 'Input.dispatchDragEvent', params: drag('drop', 460, 160, 'INTERCEPTED') },
  { name: 'release', cmd: 'Input.dispatchMouseEvent', params: mouse('mouseReleased', 460, 160, 0, { clickCount: 1 }) },
  { name: 'ext-enter-nz', cmd: 'Input.dispatchDragEvent', params: drag('dragEnter', 450, 450, EXT) },
  { name: 'ext-drop-nz', cmd: 'Input.dispatchDragEvent', params: drag('drop', 450, 450, EXT) },
  { name: 'ext-enter-dz', cmd: 'Input.dispatchDragEvent', params: drag('dragEnter', 450, 150, EXT) },
  { name: 'ext-cancel', cmd: 'Input.dispatchDragEvent', params: drag('dragCancel', 450, 150, EXT) },
  { name: 'ext-drop-dz', cmd: 'Input.dispatchDragEvent', params: drag('drop', 470, 170, EXT) },
  { name: 'bad-type', cmd: 'Input.dispatchDragEvent', params: drag('dragLeave', 450, 150, EXT) },
];
const SETTLE_MS = 300;
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
const cdpEventLog = [];
const receipt = {
  schema: SCHEMA, nonce, degenerate: DEGENERATE, driverSha256: sha256(fs.readFileSync(SELF)),
  startedAt: new Date().toISOString(), finishedAt: null,
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', argv: [], launchToken, devtoolsListening: null, childExit: null },
  fixture: { sha256: sha256(FIXTURE_HTML), origin, viewport: VIEWPORT },
  plan: LEGS, nonceOnPage: null, legs: [], events: [], cdpSendLog, cdpEventLog, serverLog,
  teardown: { postKillSweepCount: -1, survivors: [], sweepError: 'not-run', portProbes: null, postKillCurl: null },
  sweeps: {}, failures, legShape: {}, dragHypothesis: 'UNMEASURED', predicate: false,
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
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (typeof msg.method === 'string' && msg.id === undefined) { if (msg.method.startsWith('Input.')) cdpEventLog.push({ method: msg.method, params: msg.params, afterSendId: msgId }); return; }
    const p = pending.get(msg.id); if (p) { pending.delete(msg.id); clearTimeout(p.timer); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg); }
  });
  const send = (method, params = {}, timeoutMs = 30000) => new Promise((resolve, reject) => { const id = ++msgId; cdpSendLog.push({ id, method, params }); const timer = setTimeout(() => { pending.delete(id); reject(new Error('no-response-' + timeoutMs + 'ms ' + method)); }, timeoutMs); pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params })); });
  const evalValue = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
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
  const KNOWN = { items: [{ mimeType: 'text/plain', data: 'tabi-drag' }, { mimeType: 'text/x-tabi', data: 'x1' }], dragOperationsMask: 17 };
  for (const leg of LEGS) {
    await evalValue('window.__setLeg(' + JSON.stringify(leg.name) + ')');
    const t0 = Date.now();
    let result = null, cdpError = null, sentData = null;
    try {
      if (leg.cmd) {
        let p = leg.params;
        if (p && p.data === 'INTERCEPTED') {
          const hits = cdpEventLog.filter((e) => e.method === 'Input.dragIntercepted');
          const data = DEGENERATE === 'no-intercept' || DEGENERATE === 'native-mouse' || DEGENERATE === 'script-events' ? KNOWN : (hits.length === 1 ? hits[0].params.data : null);
          if (data === null) throw new Error('no single Input.dragIntercepted event to replay (' + hits.length + ')');
          p = { ...p, data }; sentData = data;
        }
        if (DEGENERATE !== null && leg.cmd === 'Input.setInterceptDrags') {
          // Look-alike producers (control runs only): interception never turned on.
        } else if (DEGENERATE === 'native-mouse' && leg.cmd === 'Input.dispatchDragEvent') {
          // Look-alike producer (control runs only): a native mouse drag at the same points.
          if (p.type === 'drop') await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', buttons: 0, clickCount: 1 });
          else if (p.type !== 'dragLeave') await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.x, y: p.y, button: 'left', buttons: 1 });
        } else if (DEGENERATE === 'script-events' && leg.cmd === 'Input.dispatchDragEvent') {
          // Look-alike producer (control runs only): script-dispatched DragEvents with a script DataTransfer.
          const map = { dragEnter: ['dragenter', 'dragover'], dragOver: ['dragover'], drop: ['dragover', 'drop'], dragCancel: ['dragleave'] };
          await evalValue('(() => { const p = ' + JSON.stringify(p) + '; const t = document.elementFromPoint(p.x, p.y); const dt = new DataTransfer(); for (const it of p.data.items) dt.setData(it.mimeType, it.data); for (const type of (' + JSON.stringify(map) + ')[p.type] || []) t.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, clientX: p.x, clientY: p.y, dataTransfer: dt })); return 1; })()');
        } else {
          result = (await send(leg.cmd, p)).result;
        }
      }
    } catch (e) { cdpError = e.message; }
    await sleep(SETTLE_MS);
    const state = JSON.parse(await evalValue('window.__state()'));
    receipt.legs.push({ name: leg.name, cmd: leg.cmd, params: leg.params, sentData, cdpResult: result, cdpError, elapsedMs: Date.now() - t0, stateAfter: state });
  }
  const record = JSON.parse(await evalValue('window.__closeRecord()'));
  receipt.events = record.events;
  receipt.legMarks = record.marks;
  receipt.closedAt = record.closedAt;
  await sleep(SETTLE_MS);
  receipt.lateAfterClose = await evalValue('window.__late');
} catch (e) { failures.push({ id: 'drive-error', detail: e.message }); }
finally { await teardown(); }
receipt.host.stderrHead = stderrHead.slice(0, 4096);
{
  const m = /DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/([0-9a-f-]{36}))/.exec(stderrHead);
  receipt.host.devtoolsListening = m ? { url: m[1], port: Number(m[2]), browserId: m[3] } : null;
}
receipt.finishedAt = new Date().toISOString();
// Per-leg observed shape, re-derived independently by the counter from the raw events.
const dtView = (e) => (e.types === null ? '-' : [e.types.join('+'), e.plain, e.custom, e.dropEffect, e.effectAllowed, e.items].join('|'));
function legSummary(name) {
  const evs = receipt.events.filter((e) => e.leg === name);
  const leg = receipt.legs.find((l) => l.name === name) || {};
  return {
    seq: evs.map((e) => e.type + '@' + e.target), trusted: evs.map((e) => e.isTrusted), prevented: evs.map((e) => e.defaultPrevented),
    xy: evs.map((e) => e.x + ',' + e.y + ',' + e.buttons), dt: evs.map(dtView), stateAfter: leg.stateAfter || null,
  };
}
for (const leg of LEGS) receipt.legShape[leg.name] = legSummary(leg.name);
// Frozen leg shape: FILLED FROM THE L1 PROBE RECEIPTS (controls/c1/probe/p1-p3, identical across 3).
const DT_SRC = 'text/plain+text/x-tabi';
const dtv = (types, plain, custom, de, ea, items) => [types, plain, custom, de, ea, items].join('|');
const st = (dz, nz, drops, starts) => ({ dz, nz, drops, starts });
const DROPPED = 'tabi-drag|x1';
const NONE = { seq: [], trusted: [], prevented: [], xy: [], dt: [] };
const LEG_SHAPE = {
  start: { ...NONE, state: st('', '', 0, 0), error: null },
  'intercept-on': { ...NONE, state: st('', '', 0, 0), error: null },
  press: { seq: ['pointerdown@src', 'mousedown@src'], trusted: [true, true], prevented: [false, false], xy: ['150,120,1', '150,120,1'], dt: ['-', '-'], state: st('', '', 0, 0), error: null },
  'move-start': { seq: ['dragstart@src', 'pointercancel@src'], trusted: [true, true], prevented: [false, false], xy: ['150,120,1', '0,0,0'], dt: [dtv(DT_SRC, 'tabi-drag', 'x1', 'none', 'copyMove', 2), '-'], state: st('', '', 0, 1), error: null },
  'move-far': { ...NONE, state: st('', '', 0, 1), error: null },
  'enter-dz': { seq: ['drag@src', 'dragenter@dz'], trusted: [true, true], prevented: [false, true], xy: ['450,150,0', '450,150,0'], dt: [dtv(DT_SRC, '', '', 'none', 'copyMove', 2), dtv(DT_SRC, '', '', 'copy', 'copyMove', 2)], state: st('', '', 0, 1), error: null },
  'over-dz': { seq: ['dragover@dz'], trusted: [true], prevented: [true], xy: ['460,160,0'], dt: [dtv(DT_SRC, '', '', 'copy', 'copyMove', 2)], state: st('', '', 0, 1), error: null },
  'drop-dz': { seq: ['drag@src', 'dragover@dz', 'drop@dz', 'dragend@src'], trusted: [true, true, true, true], prevented: [false, true, true, false], xy: ['460,160,0', '460,160,0', '460,160,0', '460,160,0'],
    dt: [dtv(DT_SRC, '', '', 'none', 'copyMove', 2), dtv(DT_SRC, '', '', 'copy', 'copyMove', 2), dtv(DT_SRC, 'tabi-drag', 'x1', 'copy', 'copyMove', 2), dtv(DT_SRC, '', '', 'copy', 'copyMove', 2)], state: st(DROPPED, '', 1, 1), error: null },
  release: { seq: ['pointerup@dz', 'mouseup@dz'], trusted: [true, true], prevented: [false, false], xy: ['460,160,0', '460,160,0'], dt: ['-', '-'], state: st(DROPPED, '', 1, 1), error: null },
  'ext-enter-nz': { seq: ['dragenter@nz'], trusted: [true], prevented: [false], xy: ['450,450,0'], dt: [dtv('text/plain', '', '', 'copy', 'copy', 1)], state: st(DROPPED, '', 1, 1), error: null },
  'ext-drop-nz': { seq: ['dragover@nz', 'dragleave@nz'], trusted: [true, true], prevented: [false, false], xy: ['450,450,0', '450,450,0'], dt: [dtv('text/plain', '', '', 'copy', 'copy', 1), dtv('text/plain', '', '', 'none', 'copy', 1)], state: st(DROPPED, '', 1, 1), error: null },
  'ext-enter-dz': { seq: ['dragenter@dz'], trusted: [true], prevented: [true], xy: ['450,150,0'], dt: [dtv('text/plain', '', '', 'copy', 'copy', 1)], state: st(DROPPED, '', 1, 1), error: null },
  'ext-cancel': { ...NONE, state: st(DROPPED, '', 1, 1), error: null },
  'ext-drop-dz': { ...NONE, state: st(DROPPED, '', 1, 1), error: null },
  'bad-type': { ...NONE, state: st(DROPPED, '', 1, 1), error: "Unexpected event type 'dragLeave'" },
};
const shapeOk = (name) => {
  const want = LEG_SHAPE[name]; const got = receipt.legShape[name]; const leg = receipt.legs.find((l) => l.name === name);
  if (!want || !got || !leg) return false;
  for (const k of ['seq', 'trusted', 'prevented', 'xy', 'dt']) if (JSON.stringify(got[k]) !== JSON.stringify(want[k])) return false;
  if (JSON.stringify(got.stateAfter) !== JSON.stringify(want.state)) return false;
  if (want.error === null ? leg.cdpError !== null : !(typeof leg.cdpError === 'string' && leg.cdpError.includes(want.error))) return false;
  return true;
};
const count = (m) => cdpSendLog.filter((c) => c.method === m).length;
const intercepted = cdpEventLog.filter((e) => e.method === 'Input.dragIntercepted').length;
const lookAlikes = cdpSendLog.filter((c) => /^Input\.(dispatchKeyEvent|dispatchTouchEvent|emulateTouch|synthesize|insertText|ime)/.test(c.method) || (c.method === 'Runtime.evaluate' && /dispatchEvent|new (Drag|Mouse|Pointer)Event|DataTransfer|textContent\s*\+?=(?!=)/.test(c.params.expression || ''))).length;
receipt.dragHypothesis = (LEGS.every((l) => shapeOk(l.name)) && count('Input.setInterceptDrags') === 1 && count('Input.dispatchDragEvent') === 9 && count('Input.dispatchMouseEvent') === 4 && intercepted === 1 && lookAlikes === 0 && receipt.nonceOnPage === nonce && receipt.degenerate === null) ? 'CONFIRMED' : 'REFUTED';
receipt.predicate = receipt.dragHypothesis === 'CONFIRMED' && receipt.failures.length === 0 && !interrupted;
fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1));
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, predicate: receipt.predicate, dragHypothesis: receipt.dragHypothesis, degenerate: DEGENERATE, legShape: receipt.legShape, legs: receipt.legs.map((l) => ({ name: l.name, cdpError: l.cdpError, elapsedMs: l.elapsedMs })), intercepted: cdpEventLog, devtools: receipt.host.devtoolsListening, teardown: receipt.teardown, failures }, null, 1));
process.exitCode = receipt.predicate ? 0 : 1;

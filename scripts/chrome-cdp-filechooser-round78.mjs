#!/usr/bin/env node
// Chromium file-chooser runner: tabi round 78, C1 (coverage capability
// `chromium-file-chooser-linux`, generation r78). Carried from r77 with two additions: the main frame
// is recorded from `Page.getFrameTree` (frame id, parent, url) and the page-side element descriptors of
// the five fixture controls are recorded (`fixtureInputs`: tag, type, attributes, rect), so a counter can
// bind each chooser event to the page element its leg recorded instead of to a browser-assigned
// `backendNodeId` (round-77 routed defect 2 / QUALITY 150). Usage:
//   node chrome-cdp-filechooser-round78.mjs --scratch <ABS dir> --out <ABS receipt.json>
//     --nonce <tabi-r78-lowercase/digits/hyphens> --http-port <1024..65535> --cdp-port <1024..65535>
//     [--degenerate page-stub|eval-trigger|swap-files]   (CONTROL runs only; never a scored run)
// Exit 0: every leg matched the frozen shape (LEG_SHAPE below); 1: retained red receipt;
// 2: usage refusal.
//
// Domain: the DevTools protocol command Page.setInterceptFileChooserDialog (with its experimental
// `cancel` flag), the event Page.fileChooserOpened and the command DOM.setFileInputFiles (Page.pdl,
// DOM.pdl; renderer inspector_page_agent.cc, inspector_dom_agent.cc; file_input_type.cc) driven
// against a loopback fixture with four `<input type=file>` elements (single, multiple,
// webkitdirectory, accept=".png") and a button whose click handler calls the single input's
// click(). A real mouse click (Input.dispatchMouseEvent press + release) opens each chooser; the
// driver waits for Page.fileChooserOpened and answers it with DOM.setFileInputFiles on the
// event's backendNodeId, with files it wrote under a scratch directory bound to the launch token.
// The page records every pointer/mouse/click/input/change/cancel event (window capture phase, with
// a sequence number, the leg, isTrusted, the transient user-activation state, coordinates and the
// input's file list as [name, size, type]) and the outcome of reading every chosen file; the
// driver records every CDP method it sent (`cdpSendLog`), every file-chooser and main-frame
// navigation CDP event it received (`cdpEventLog`, each with the id of the last send before it),
// the main frame id, each CDP error as the protocol's {code, message}, and Chromium's DevTools
// listening line, so a counter can tell real choosers from page stubs, script clicks, or files
// other than the plan's.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-filechooser-r78';
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
if (DEGENERATE !== null && !['page-stub', 'eval-trigger', 'swap-files'].includes(DEGENERATE)) usage('--degenerate must be page-stub|eval-trigger|swap-files (control runs only)');
const nonce = opt('nonce');
if (!nonce || !/^tabi-r78-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r78- followed by lowercase letters/digits/hyphens');
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


/*CHOOSER-FIXTURE-BEGIN*/
const FIXTURE_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r77 file-chooser fixture</title>
<style>html, body { margin: 0; padding: 0; background: #fff; } input, button { position: absolute; width: 120px; height: 40px; margin: 0; padding: 0; border: 0; } #s { left: 100px; top: 100px; } #m { left: 300px; top: 100px; } #d { left: 500px; top: 100px; } #k { left: 700px; top: 100px; } #f { left: 100px; top: 300px; }</style>
<script>
window.__seq = 0; window.__leg = 'start'; window.__events = []; window.__nonceOnPage = null;
window.__marks = [{ name: 'start', at: performance.now() }]; window.__closed = false; window.__late = 0;
const fl = function (t) { return Array.from(t.files, function (f) { return [f.name, f.size, f.type]; }); };
const hex = function (b) { return Array.from(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, '0'); }).join(''); };
const push = function (o) { if (window.__closed) { window.__late++; return; } o.seq = ++window.__seq; o.leg = window.__leg; o.at = performance.now(); window.__events.push(o); };
const rec = function (e) {
  const m = typeof e.clientX === 'number';
  const t = e.target && e.target.id ? e.target.id : (e.target && e.target.nodeName ? e.target.nodeName : null);
  const fileEv = (e.type === 'input' || e.type === 'change' || e.type === 'cancel') && e.target && e.target.type === 'file';
  push({ type: e.type, ts: e.timeStamp, isTrusted: e.isTrusted, act: navigator.userActivation.isActive, target: t,
    x: m ? e.clientX : null, y: m ? e.clientY : null, buttons: m ? e.buttons : null, files: fileEv ? fl(e.target) : null, ret: null });
  if (e.type === 'change' && fileEv) {
    const input = e.target; const chosen = Array.from(input.files);
    (async function () {
      for (const f of chosen) {
        let ret; try { ret = 'hex:' + hex(await f.arrayBuffer()); } catch (err) { ret = 'error:' + err.name; }
        const now = performance.now();
        push({ type: 'read', ts: now, isTrusted: true, act: null, target: input.id, x: null, y: null, buttons: null, files: [[f.name, f.size, f.type]], ret: ret });
      }
    })();
  }
};
for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'input', 'change', 'cancel'])
  window.addEventListener(t, rec, true);
window.__setLeg = function (name) { window.__leg = name; window.__marks.push({ name: name, at: performance.now() }); return name; };
window.__state = function () { const g = function (id) { return document.getElementById(id); }; return JSON.stringify({ s: fl(g('s')), m: fl(g('m')), d: fl(g('d')), k: fl(g('k')), sValue: g('s').value }); };
window.__inputs = function () { return JSON.stringify(['s', 'm', 'd', 'k', 'f'].map(function (id) { const e = document.getElementById(id); const r = e.getBoundingClientRect(); return { id: id, tag: e.tagName.toLowerCase(), type: e.type || null, multiple: e.multiple === true, webkitdirectory: e.hasAttribute('webkitdirectory'), accept: e.getAttribute('accept'), rect: { left: r.left, top: r.top, width: r.width, height: r.height } }; })); };
window.__closeRecord = function () { window.__closed = true; return JSON.stringify({ events: window.__events, marks: window.__marks, closedAt: performance.now() }); };
document.addEventListener('DOMContentLoaded', function () {
  window.__nonceOnPage = document.getElementById('nonce').textContent;
  document.getElementById('f').addEventListener('click', function () { document.getElementById('s').click(); });
});
</script></head><body><p id="nonce" style="position:absolute;left:0;top:0;margin:0;font:0/0 monospace">__NONCE__</p><input type="file" id="s"><input type="file" id="m" multiple><input type="file" id="d" webkitdirectory><input type="file" id="k" accept=".png"><button id="f">forward</button></body></html>`;
/*CHOOSER-FIXTURE-END*/
const FIXTURE_HTML = FIXTURE_TEMPLATE.replaceAll('__NONCE__', nonce);
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), FIXTURE_HTML);
// Upload files: written under <scratch>/upload-<launch token>; tabi-missing.txt is never written.
const UPLOAD = { 'tabi-a.txt': Buffer.from('tabi-alpha\n', 'utf8'), 'tabi-b.bin': Buffer.from([0, 1, 2, 3, 255]) };
const MISSING = 'tabi-missing.txt';
const uploadDir = path.join(scratchDir, 'upload-' + launchToken);
try { fs.mkdirSync(uploadDir); for (const [n, b] of Object.entries(UPLOAD)) fs.writeFileSync(path.join(uploadDir, n), b); } catch (e) { usage('upload dir: ' + e.message); }
// Legs run in order on one page. `intercept` sends Page.setInterceptFileChooserDialog with the leg's
// params (a `click` leg with `intercept` sends it first). A `click` leg sends one mouse press and
// one mouse release at the point, waits up to OPEN_WAIT_MS for Page.fileChooserOpened, and when
// `files` is not null answers with DOM.setFileInputFiles on the event's backendNodeId (paths in
// the upload dir). `script` evaluates the single input's click() with no user gesture. `set-object`
// resolves the forward BUTTON to a remote object and calls DOM.setFileInputFiles on it.
const LEGS = [
  { name: 'start', kind: null, at: null, intercept: null, files: null },
  { name: 'intercept-on', kind: 'intercept', at: null, intercept: { enabled: true }, files: null },
  { name: 'pick-single', kind: 'click', at: [160, 120], intercept: null, files: ['tabi-a.txt'] },
  { name: 'pick-multiple', kind: 'click', at: [360, 120], intercept: null, files: ['tabi-a.txt', 'tabi-b.bin'] },
  { name: 'pick-same', kind: 'click', at: [160, 120], intercept: null, files: ['tabi-a.txt'] },
  { name: 'pick-first-only', kind: 'click', at: [160, 120], intercept: null, files: ['tabi-b.bin', 'tabi-a.txt'] },
  { name: 'pick-missing', kind: 'click', at: [160, 120], intercept: null, files: [MISSING] },
  { name: 'pick-empty', kind: 'click', at: [160, 120], intercept: null, files: [] },
  { name: 'dir-mode', kind: 'click', at: [560, 120], intercept: null, files: null },
  { name: 'accept-ignored', kind: 'click', at: [760, 120], intercept: null, files: ['tabi-a.txt'] },
  { name: 'forward-click', kind: 'click', at: [160, 320], intercept: null, files: ['tabi-a.txt'] },
  { name: 'script-click', kind: 'script', at: null, intercept: null, files: null },
  { name: 'not-file-input', kind: 'set-object', at: null, intercept: null, files: ['tabi-a.txt'] },
  { name: 'intercept-cancel', kind: 'click', at: [160, 120], intercept: { enabled: true, cancel: true }, files: null },
  { name: 'intercept-off', kind: 'click', at: [160, 120], intercept: { enabled: false }, files: null },
];
const SETTLE_MS = 300;
const OPEN_WAIT_MS = 1500;
const SCRIPT_CLICK = 'document.getElementById("s").click(), 1';
const BUTTON_OBJECT = 'document.getElementById("f")';
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
const LOGGED_EVENTS = new Set(['Page.fileChooserOpened', 'Page.frameNavigated']);
const receipt = {
  schema: SCHEMA, nonce, degenerate: DEGENERATE, driverSha256: sha256(fs.readFileSync(SELF)),
  startedAt: new Date().toISOString(), finishedAt: null,
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', argv: [], launchToken, devtoolsListening: null, childExit: null },
  fixture: { sha256: sha256(FIXTURE_HTML), origin, viewport: VIEWPORT },
  upload: { dir: uploadDir, files: Object.fromEntries(Object.entries(UPLOAD).map(([n, b]) => [n, { size: b.length, sha256: sha256(b) }])), missing: MISSING },
  plan: LEGS, nonceOnPage: null, mainFrameId: null, frameTree: null, fixtureInputs: null, legs: [], events: [], cdpSendLog, cdpEventLog, serverLog,
  teardown: { postKillSweepCount: -1, survivors: [], sweepError: 'not-run', portProbes: null, postKillCurl: null },
  sweeps: {}, failures, legShape: {}, chooserHypothesis: 'UNMEASURED', predicate: false,
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
// A CDP error is kept as the protocol's own object {code, message} (round-75 routed defect 3: the
// code is checked, not only the message).
class CdpError extends Error { constructor(obj) { super(JSON.stringify(obj)); this.cdp = obj; } }
const errObj = (e) => (e instanceof CdpError ? { code: e.cdp.code ?? null, message: e.cdp.message ?? null } : { code: null, message: String(e && e.message) });
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
    if (typeof msg.method === 'string' && msg.id === undefined) {
      if (!LOGGED_EVENTS.has(msg.method)) return;
      // main-frame navigations only, kept as {frameId, url} (round-76 routed defect 2: frame ids and urls are bound)
      if (msg.method === 'Page.frameNavigated') { const f = msg.params && msg.params.frame; if (!f || f.parentId !== undefined) return; cdpEventLog.push({ method: msg.method, params: { frameId: f.id, url: f.url }, afterSendId: msgId }); return; }
      cdpEventLog.push({ method: msg.method, params: msg.params, afterSendId: msgId });
      return;
    }
    const p = pending.get(msg.id); if (p) { pending.delete(msg.id); clearTimeout(p.timer); msg.error ? p.reject(new CdpError(msg.error)) : p.resolve(msg); }
  });
  const send = (method, params = {}, timeoutMs = 30000) => new Promise((resolve, reject) => { const id = ++msgId; cdpSendLog.push({ id, method, params }); const timer = setTimeout(() => { pending.delete(id); reject(new Error('no-response-' + timeoutMs + 'ms ' + method)); }, timeoutMs); pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params })); });
  const evalValue = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
  const ver = await send('Browser.getVersion');
  receipt.host.cdpProduct = ver.result.product;
  receipt.host.cdpProtocolVersion = ver.result.protocolVersion;
  await send('Page.enable'); await send('Runtime.enable');
  const ft = (await send('Page.getFrameTree')).result.frameTree;
  receipt.mainFrameId = ft.frame.id;
  receipt.frameTree = { mainFrameId: ft.frame.id, mainFrameParentId: ft.frame.parentId ?? null, mainFrameUrl: ft.frame.url };
  await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: origin + '/?run=' + encodeURIComponent(nonce) });
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) {
    try { ready = await evalValue('document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(nonce)); } catch {}
    if (!ready) await sleep(100);
  }
  if (!ready) throw new Error('fixture not ready');
  receipt.nonceOnPage = await evalValue('window.__nonceOnPage');
  receipt.fixtureInputs = JSON.parse(await evalValue('window.__inputs()'));
  if (DEGENERATE === 'page-stub') {
    // Look-alike producer (control runs only): no chooser is ever opened; a page script dispatches
    // a synthetic click and sets the input's files from a DataTransfer, then dispatches input/change.
    await evalValue('(() => { window.__stub = (x, y, names) => { const i = document.elementFromPoint(x, y); i.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: x, clientY: y })); if (!names) return 0; const dt = new DataTransfer(); for (const n of names) dt.items.add(new File([n === "tabi-b.bin" ? new Uint8Array([0, 1, 2, 3, 255]) : "tabi-alpha\\n"], n, { type: n.endsWith(".txt") ? "text/plain" : "application/octet-stream" })); i.files = dt.files; i.dispatchEvent(new Event("input", { bubbles: true })); i.dispatchEvent(new Event("change", { bubbles: true })); return names.length; }; return 1; })()');
  }
  const openings = () => cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened');
  const waitOpening = async (before) => { const t = Date.now(); while (openings().length === before && Date.now() - t < OPEN_WAIT_MS) await sleep(20); return openings().length > before ? openings()[before] : null; };
  const runLeg = async (leg) => {
    const t0 = Date.now();
    const rec = { name: leg.name, kind: leg.kind, interceptSendId: null, interceptResult: null, interceptError: null, triggerSendId: null, triggerResult: null, triggerError: null,
      opened: null, openedNode: null, setSendId: null, setParams: null, setResult: null, setError: null, elapsedMs: 0, stateAfter: null };
    try {
      if (leg.intercept) {
        const r = send('Page.setInterceptFileChooserDialog', leg.intercept); rec.interceptSendId = msgId;
        try { rec.interceptResult = (await r).result; } catch (e) { rec.interceptError = errObj(e); }
      }
      if (leg.kind === 'click' || leg.kind === 'script') {
        const before = openings().length;
        let trig;
        if (leg.kind === 'script') trig = send('Runtime.evaluate', { expression: SCRIPT_CLICK, returnByValue: true });
        else if (DEGENERATE === 'page-stub') trig = send('Runtime.evaluate', { expression: 'window.__stub(' + leg.at[0] + ', ' + leg.at[1] + ', ' + JSON.stringify(leg.files) + ')', returnByValue: true });
        else if (DEGENERATE === 'eval-trigger') {
          // Look-alike producer (control runs only): a script click WITH a CDP user gesture (untrusted click).
          trig = send('Runtime.evaluate', { expression: 'document.elementFromPoint(' + leg.at[0] + ', ' + leg.at[1] + ').click(), 1', returnByValue: true, userGesture: true });
        } else {
          await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: leg.at[0], y: leg.at[1], button: 'left', buttons: 1, clickCount: 1 });
          trig = send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: leg.at[0], y: leg.at[1], button: 'left', buttons: 0, clickCount: 1 });
        }
        rec.triggerSendId = msgId;
        try { rec.triggerResult = (await trig).result; } catch (e) { rec.triggerError = errObj(e); }
        const ev = await waitOpening(before);
        rec.opened = ev !== null;
        rec.openedNode = ev && ev.params && Number.isInteger(ev.params.backendNodeId) ? ev.params.backendNodeId : null;
        if (leg.files !== null && ev !== null) {
          let names = leg.files;
          if (DEGENERATE === 'swap-files' && leg.name === 'pick-multiple') names = [...names].reverse();
          rec.setParams = { files: names.map((n) => path.join(uploadDir, n)), backendNodeId: rec.openedNode };
          const s = send('DOM.setFileInputFiles', rec.setParams); rec.setSendId = msgId;
          try { rec.setResult = (await s).result; } catch (e) { rec.setError = errObj(e); }
        }
      } else if (leg.kind === 'set-object') {
        const trig = send('Runtime.evaluate', { expression: BUTTON_OBJECT, returnByValue: false }); rec.triggerSendId = msgId;
        try { const r = (await trig).result.result; rec.triggerResult = { type: r.type, subtype: r.subtype, className: r.className, description: r.description, objectId: r.objectId }; } catch (e) { rec.triggerError = errObj(e); }
        rec.setParams = { files: leg.files.map((n) => path.join(uploadDir, n)), objectId: rec.triggerResult ? rec.triggerResult.objectId : null };
        const s = send('DOM.setFileInputFiles', rec.setParams); rec.setSendId = msgId;
        try { rec.setResult = (await s).result; } catch (e) { rec.setError = errObj(e); }
      }
    } catch (e) { rec.triggerError = errObj(e); }
    await sleep(SETTLE_MS);
    rec.elapsedMs = Date.now() - t0;
    return rec;
  };
  for (const leg of LEGS) {
    await evalValue('window.__setLeg(' + JSON.stringify(leg.name) + ')');
    const rec = await runLeg(leg);
    rec.stateAfter = JSON.parse(await evalValue('window.__state()'));
    receipt.legs.push(rec);
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
// Per-leg observed shape, re-derived independently by the counter from the raw events and logs.
// `opened`: the Page.fileChooserOpened events bound to the leg's trigger send, as [mode, backendNodeId];
// `files`: [type, target, files] of every input/change/cancel event; `read`: [target, name, outcome].
const legSummary = (name) => {
  const evs = receipt.events.filter((e) => e.leg === name);
  const leg = receipt.legs.find((l) => l.name === name) || {};
  const bound = cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened' && leg.triggerSendId != null && e.afterSendId === leg.triggerSendId);
  const ptr = evs.filter((e) => e.type !== 'read');
  return {
    seq: evs.map((e) => e.type + '@' + e.target), trusted: ptr.map((e) => e.isTrusted), act: ptr.map((e) => e.act),
    xy: ptr.map((e) => [e.x, e.y, e.buttons]), files: ptr.filter((e) => e.files !== null).map((e) => [e.type, e.target, e.files]),
    read: evs.filter((e) => e.type === 'read').map((e) => [e.target, e.files && e.files[0] ? e.files[0][0] : null, e.ret]),
    opened: bound.map((e) => [e.params.mode, e.params.backendNodeId ?? null]),
    error: [leg.interceptError ?? null, leg.triggerError ?? null, leg.setError ?? null], stateAfter: leg.stateAfter ?? null,
  };
};
for (const leg of LEGS) receipt.legShape[leg.name] = legSummary(leg.name);
/*LEG-SHAPE-BEGIN*/
// Frozen leg shape: FILLED FROM THE L1 SHAPE PROBES (lesson-proof/shape-s1..s3, driver build with LEG_SHAPE = null;
// identical across the 3, backendNodeIds included).
const LEG_SHAPE = {
  "start": {"seq":[],"trusted":[],"act":[],"xy":[],"files":[],"read":[],"opened":[],"error":[null,null,null],"stateAfter":{"s":[],"m":[],"d":[],"k":[],"sValue":""}},
  "intercept-on": {"seq":[],"trusted":[],"act":[],"xy":[],"files":[],"read":[],"opened":[],"error":[null,null,null],"stateAfter":{"s":[],"m":[],"d":[],"k":[],"sValue":""}},
  "pick-single": {"seq":["pointerdown@s","mousedown@s","pointerup@s","mouseup@s","click@s","input@s","change@s","read@s"],"trusted":[true,true,true,true,true,true,true],"act":[true,true,true,true,true,false,false],"xy":[[160,120,1],[160,120,1],[160,120,0],[160,120,0],[160,120,0],[null,null,null],[null,null,null]],"files":[["input","s",[["tabi-a.txt",11,"text/plain"]]],["change","s",[["tabi-a.txt",11,"text/plain"]]]],"read":[["s","tabi-a.txt","hex:746162692d616c7068610a"]],"opened":[["selectSingle",5]],"error":[null,null,null],"stateAfter":{"s":[["tabi-a.txt",11,"text/plain"]],"m":[],"d":[],"k":[],"sValue":"C:\\fakepath\\tabi-a.txt"}},
  "pick-multiple": {"seq":["pointerdown@m","mousedown@m","pointerup@m","mouseup@m","click@m","input@m","change@m","read@m","read@m"],"trusted":[true,true,true,true,true,true,true],"act":[true,true,true,true,true,false,false],"xy":[[360,120,1],[360,120,1],[360,120,0],[360,120,0],[360,120,0],[null,null,null],[null,null,null]],"files":[["input","m",[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]]],["change","m",[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]]]],"read":[["m","tabi-a.txt","hex:746162692d616c7068610a"],["m","tabi-b.bin","hex:00010203ff"]],"opened":[["selectMultiple",7]],"error":[null,null,null],"stateAfter":{"s":[["tabi-a.txt",11,"text/plain"]],"m":[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]],"d":[],"k":[],"sValue":"C:\\fakepath\\tabi-a.txt"}},
  "pick-same": {"seq":["pointerdown@s","mousedown@s","pointerup@s","mouseup@s","click@s","cancel@s"],"trusted":[true,true,true,true,true,true],"act":[true,true,true,true,true,false],"xy":[[160,120,1],[160,120,1],[160,120,0],[160,120,0],[160,120,0],[null,null,null]],"files":[["cancel","s",[["tabi-a.txt",11,"text/plain"]]]],"read":[],"opened":[["selectSingle",5]],"error":[null,null,null],"stateAfter":{"s":[["tabi-a.txt",11,"text/plain"]],"m":[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]],"d":[],"k":[],"sValue":"C:\\fakepath\\tabi-a.txt"}},
  "pick-first-only": {"seq":["pointerdown@s","mousedown@s","pointerup@s","mouseup@s","click@s","input@s","change@s","read@s"],"trusted":[true,true,true,true,true,true,true],"act":[true,true,true,true,true,false,false],"xy":[[160,120,1],[160,120,1],[160,120,0],[160,120,0],[160,120,0],[null,null,null],[null,null,null]],"files":[["input","s",[["tabi-b.bin",5,"application/octet-stream"]]],["change","s",[["tabi-b.bin",5,"application/octet-stream"]]]],"read":[["s","tabi-b.bin","hex:00010203ff"]],"opened":[["selectSingle",5]],"error":[null,null,null],"stateAfter":{"s":[["tabi-b.bin",5,"application/octet-stream"]],"m":[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]],"d":[],"k":[],"sValue":"C:\\fakepath\\tabi-b.bin"}},
  "pick-missing": {"seq":["pointerdown@s","mousedown@s","pointerup@s","mouseup@s","click@s","input@s","change@s","read@s"],"trusted":[true,true,true,true,true,true,true],"act":[true,true,true,true,true,false,false],"xy":[[160,120,1],[160,120,1],[160,120,0],[160,120,0],[160,120,0],[null,null,null],[null,null,null]],"files":[["input","s",[["tabi-missing.txt",0,"text/plain"]]],["change","s",[["tabi-missing.txt",0,"text/plain"]]]],"read":[["s","tabi-missing.txt","error:NotFoundError"]],"opened":[["selectSingle",5]],"error":[null,null,null],"stateAfter":{"s":[["tabi-missing.txt",0,"text/plain"]],"m":[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]],"d":[],"k":[],"sValue":"C:\\fakepath\\tabi-missing.txt"}},
  "pick-empty": {"seq":["pointerdown@s","mousedown@s","pointerup@s","mouseup@s","click@s"],"trusted":[true,true,true,true,true],"act":[true,true,true,true,true],"xy":[[160,120,1],[160,120,1],[160,120,0],[160,120,0],[160,120,0]],"files":[],"read":[],"opened":[["selectSingle",5]],"error":[null,null,null],"stateAfter":{"s":[["tabi-missing.txt",0,"text/plain"]],"m":[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]],"d":[],"k":[],"sValue":"C:\\fakepath\\tabi-missing.txt"}},
  "dir-mode": {"seq":["pointerdown@d","mousedown@d","pointerup@d","mouseup@d","click@d"],"trusted":[true,true,true,true,true],"act":[true,true,true,true,true],"xy":[[560,120,1],[560,120,1],[560,120,0],[560,120,0],[560,120,0]],"files":[],"read":[],"opened":[["selectSingle",14]],"error":[null,null,null],"stateAfter":{"s":[["tabi-missing.txt",0,"text/plain"]],"m":[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]],"d":[],"k":[],"sValue":"C:\\fakepath\\tabi-missing.txt"}},
  "accept-ignored": {"seq":["pointerdown@k","mousedown@k","pointerup@k","mouseup@k","click@k","input@k","change@k","read@k"],"trusted":[true,true,true,true,true,true,true],"act":[true,true,true,true,true,false,false],"xy":[[760,120,1],[760,120,1],[760,120,0],[760,120,0],[760,120,0],[null,null,null],[null,null,null]],"files":[["input","k",[["tabi-a.txt",11,"text/plain"]]],["change","k",[["tabi-a.txt",11,"text/plain"]]]],"read":[["k","tabi-a.txt","hex:746162692d616c7068610a"]],"opened":[["selectSingle",18]],"error":[null,null,null],"stateAfter":{"s":[["tabi-missing.txt",0,"text/plain"]],"m":[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]],"d":[],"k":[["tabi-a.txt",11,"text/plain"]],"sValue":"C:\\fakepath\\tabi-missing.txt"}},
  "forward-click": {"seq":["pointerdown@f","mousedown@f","pointerup@f","mouseup@f","click@f","click@s","input@s","change@s","read@s"],"trusted":[true,true,true,true,true,false,true,true],"act":[true,true,true,true,true,true,false,false],"xy":[[160,320,1],[160,320,1],[160,320,0],[160,320,0],[160,320,0],[0,0,0],[null,null,null],[null,null,null]],"files":[["input","s",[["tabi-a.txt",11,"text/plain"]]],["change","s",[["tabi-a.txt",11,"text/plain"]]]],"read":[["s","tabi-a.txt","hex:746162692d616c7068610a"]],"opened":[["selectSingle",5]],"error":[null,null,null],"stateAfter":{"s":[["tabi-a.txt",11,"text/plain"]],"m":[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]],"d":[],"k":[["tabi-a.txt",11,"text/plain"]],"sValue":"C:\\fakepath\\tabi-a.txt"}},
  "script-click": {"seq":["click@s"],"trusted":[false],"act":[false],"xy":[[0,0,0]],"files":[],"read":[],"opened":[],"error":[null,null,null],"stateAfter":{"s":[["tabi-a.txt",11,"text/plain"]],"m":[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]],"d":[],"k":[["tabi-a.txt",11,"text/plain"]],"sValue":"C:\\fakepath\\tabi-a.txt"}},
  "not-file-input": {"seq":[],"trusted":[],"act":[],"xy":[],"files":[],"read":[],"opened":[],"error":[null,null,{"code":-32000,"message":"Node is not a file input element"}],"stateAfter":{"s":[["tabi-a.txt",11,"text/plain"]],"m":[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]],"d":[],"k":[["tabi-a.txt",11,"text/plain"]],"sValue":"C:\\fakepath\\tabi-a.txt"}},
  "intercept-cancel": {"seq":["pointerdown@s","mousedown@s","pointerup@s","mouseup@s","click@s","cancel@s"],"trusted":[true,true,true,true,true,true],"act":[true,true,true,true,true,false],"xy":[[160,120,1],[160,120,1],[160,120,0],[160,120,0],[160,120,0],[null,null,null]],"files":[["cancel","s",[["tabi-a.txt",11,"text/plain"]]]],"read":[],"opened":[["selectSingle",5]],"error":[null,null,null],"stateAfter":{"s":[["tabi-a.txt",11,"text/plain"]],"m":[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]],"d":[],"k":[["tabi-a.txt",11,"text/plain"]],"sValue":"C:\\fakepath\\tabi-a.txt"}},
  "intercept-off": {"seq":["pointerdown@s","mousedown@s","pointerup@s","mouseup@s","click@s","cancel@s"],"trusted":[true,true,true,true,true,true],"act":[true,true,true,true,true,false],"xy":[[160,120,1],[160,120,1],[160,120,0],[160,120,0],[160,120,0],[null,null,null]],"files":[["cancel","s",[["tabi-a.txt",11,"text/plain"]]]],"read":[],"opened":[],"error":[null,null,null],"stateAfter":{"s":[["tabi-a.txt",11,"text/plain"]],"m":[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]],"d":[],"k":[["tabi-a.txt",11,"text/plain"]],"sValue":"C:\\fakepath\\tabi-a.txt"}},
};
/*LEG-SHAPE-END*/
const canonJ = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x));
const count = (m) => cdpSendLog.filter((c) => c.method === m).length;
const evCount = (m) => cdpEventLog.filter((e) => e.method === m).length;
// Look-alike producers in the send log: other Input commands, user-gesture evaluations, or script
// that dispatches events, assigns files or writes the record (the planned script-click leg's own
// expression is the one exception, matched exactly).
const lookAlikes = cdpSendLog.filter((c) => /^Input\.(dispatchKeyEvent|dispatchTouchEvent|emulateTouch|synthesize|insertText|ime|dispatchDragEvent|setInterceptDrags)/.test(c.method)
  || (c.method === 'Runtime.evaluate' && (c.params.userGesture === true || (c.params.expression !== SCRIPT_CLICK && /\.click\(|dispatchEvent|\.files\s*=|DataTransfer|__events\.push|__stub/.test(c.params.expression || ''))))).length;
receipt.chooserHypothesis = (LEG_SHAPE !== null && LEGS.every((l) => canonJ(receipt.legShape[l.name]) === canonJ(LEG_SHAPE[l.name])) && count('Input.dispatchMouseEvent') === 22
  && count('DOM.setFileInputFiles') === 9 && count('Page.setInterceptFileChooserDialog') === 3 && evCount('Page.fileChooserOpened') === 10 && evCount('Page.frameNavigated') === 1
  && lookAlikes === 0 && receipt.nonceOnPage === nonce && receipt.degenerate === null) ? 'CONFIRMED' : 'REFUTED';
receipt.predicate = receipt.chooserHypothesis === 'CONFIRMED' && receipt.failures.length === 0 && !interrupted;
fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1));
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, predicate: receipt.predicate, chooserHypothesis: receipt.chooserHypothesis, degenerate: DEGENERATE, legShape: receipt.legShape, teardown: receipt.teardown, failures }, null, 1));
process.exitCode = receipt.predicate ? 0 : 1;

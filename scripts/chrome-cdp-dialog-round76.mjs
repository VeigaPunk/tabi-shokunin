#!/usr/bin/env node
// Chromium JavaScript-dialog runner: tabi round 76, C1 (coverage capability
// `chromium-js-dialog-linux`, generation r76). Launch, sweep and teardown plumbing are the round-75
// dragdrop driver's, unchanged; the fixture, legs, CDP event capture and leg shapes are new. Usage:
//   node chrome-cdp-dialog-round76.mjs --scratch <ABS dir> --out <ABS receipt.json>
//     --nonce <tabi-r76-lowercase/digits/hyphens> --http-port <1024..65535> --cdp-port <1024..65535>
//     [--degenerate page-stub|eval-trigger|swap-accept]   (CONTROL runs only; never a scored run)
// Exit 0: every leg matched the frozen shape (LEG_SHAPE below); 1: retained red receipt;
// 2: usage refusal.
//
// Domain: the DevTools protocol command Page.handleJavaScriptDialog and the events
// Page.javascriptDialogOpening / Page.javascriptDialogClosed (Page.pdl; browser-side handler
// page_handler.cc; routing web_contents_impl.cc; renderer local_dom_window.cc) driven against a
// loopback fixture whose three buttons call alert(), confirm() and prompt() from their click
// handlers and whose window cancels beforeunload. A real mouse click (Input.dispatchMouseEvent
// press + release) opens each dialog; the driver waits for javascriptDialogOpening and answers it
// with handleJavaScriptDialog; two navigations (Page.navigate) raise the beforeunload dialog, which
// is dismissed once and accepted once. The page records every pointer/mouse/click/beforeunload
// event and every dialog function's return value (window bubble phase, with a sequence number, the
// leg, isTrusted, defaultPrevented, coordinates); the driver records every CDP method it sent
// (`cdpSendLog`), every dialog/main-frame-navigation CDP event it received (`cdpEventLog`, each
// with the id of the last send before it), each CDP error as the protocol's {code, message}, and
// Chromium's DevTools listening line, so a counter can tell real dialogs from page stubs, script
// clicks, or answers other than the plan's.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-dialog-r76';
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
if (DEGENERATE !== null && !['page-stub', 'eval-trigger', 'swap-accept'].includes(DEGENERATE)) usage('--degenerate must be page-stub|eval-trigger|swap-accept (control runs only)');
const nonce = opt('nonce');
if (!nonce || !/^tabi-r76-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r76- followed by lowercase letters/digits/hyphens');
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

/*DIALOG-FIXTURE-BEGIN*/
const FIXTURE_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r76 dialog fixture</title>
<style>html, body { margin: 0; padding: 0; background: #fff; } button { position: absolute; top: 100px; width: 100px; height: 40px; margin: 0; padding: 0; border: 0; } #a { left: 100px; } #c { left: 250px; } #p { left: 400px; }</style>
<script>
window.__seq = 0; window.__leg = 'start'; window.__events = []; window.__nonceOnPage = null;
window.__marks = [{ name: 'start', at: performance.now() }]; window.__closed = false; window.__late = 0;
window.__dialogs = 0; window.__last = '-'; window.__unloads = 0;
const repr = function (v) { return v === undefined ? 'undefined' : v === null ? 'null' : typeof v === 'boolean' ? String(v) : typeof v === 'string' ? 'string:' + v : 'other'; };
const rec = function (e) {
  if (window.__closed) { window.__late++; return; }
  const m = typeof e.clientX === 'number';
  window.__events.push({ type: e.type, seq: ++window.__seq, leg: window.__leg, ts: e.timeStamp, at: performance.now(), isTrusted: e.isTrusted,
    target: e.target && e.target.id ? e.target.id : (e.target && e.target.nodeName ? e.target.nodeName : null),
    x: m ? e.clientX : null, y: m ? e.clientY : null, buttons: m ? e.buttons : null, defaultPrevented: e.defaultPrevented, kind: null, ret: null });
};
window.addEventListener('beforeunload', function (e) { window.__unloads++; e.preventDefault(); e.returnValue = ''; }, false);
for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'beforeunload'])
  window.addEventListener(t, rec, false);
const dialog = function (kind, fn) {
  return function (e) {
    const t0 = performance.now();
    const v = fn();
    window.__dialogs++; window.__last = kind + '=' + repr(v);
    if (window.__closed) { window.__late++; return; }
    window.__events.push({ type: 'dialog-return', seq: ++window.__seq, leg: window.__leg, ts: t0, at: performance.now(), isTrusted: e.isTrusted,
      target: e.target && e.target.id ? e.target.id : null, x: null, y: null, buttons: null, defaultPrevented: false, kind: kind, ret: repr(v) });
  };
};
window.__setLeg = function (name) { window.__leg = name; window.__marks.push({ name: name, at: performance.now() }); return name; };
window.__state = function () { return JSON.stringify({ dialogs: window.__dialogs, last: window.__last, unloads: window.__unloads, path: location.pathname }); };
window.__closeRecord = function () { window.__closed = true; return JSON.stringify({ events: window.__events, marks: window.__marks, closedAt: performance.now() }); };
document.addEventListener('DOMContentLoaded', function () {
  window.__nonceOnPage = document.getElementById('nonce').textContent;
  document.getElementById('a').addEventListener('click', dialog('alert', function () { return alert('tabi-alert'); }));
  document.getElementById('c').addEventListener('click', dialog('confirm', function () { return confirm('tabi-confirm'); }));
  document.getElementById('p').addEventListener('click', dialog('prompt', function () { return prompt('tabi-prompt', 'tabi-default'); }));
});
</script></head><body><p id="nonce" style="position:absolute;left:0;top:0;margin:0;font:0/0 monospace">__NONCE__</p><button id="a">alert</button><button id="c">confirm</button><button id="p">prompt</button></body></html>`;
const NEXT_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r76 next</title></head><body><p id="nonce">__NONCE__</p></body></html>`;
/*DIALOG-FIXTURE-END*/
const FIXTURE_HTML = FIXTURE_TEMPLATE.replaceAll('__NONCE__', nonce);
const NEXT_HTML = NEXT_TEMPLATE.replaceAll('__NONCE__', nonce);
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), FIXTURE_HTML);
// Legs run in order on one page. A `click` leg sends one mouse press and one mouse release at the
// button's centre (the release is answered only after the dialog its click handler opens is
// closed, so it is sent without waiting), waits for Page.javascriptDialogOpening, then sends
// Page.handleJavaScriptDialog with `handle`. A `navigate` leg sends Page.navigate to `path` (the
// page's beforeunload handler cancels, so Chromium asks first) and handles that dialog the same
// way. `handle-only` sends Page.handleJavaScriptDialog with no dialog open. The page-side record is
// closed BEFORE the last leg (`unload-accept` leaves the page); that leg's evidence is the CDP
// event log, the fixture server log and the state read on the new document.
const LEGS = [
  { name: 'start', kind: null, at: null, path: null, handle: null },
  { name: 'alert-accept', kind: 'click', at: [150, 120], path: null, handle: { accept: true } },
  { name: 'confirm-accept', kind: 'click', at: [300, 120], path: null, handle: { accept: true } },
  { name: 'confirm-dismiss', kind: 'click', at: [300, 120], path: null, handle: { accept: false } },
  { name: 'prompt-text', kind: 'click', at: [450, 120], path: null, handle: { accept: true, promptText: 'tabi-typed' } },
  { name: 'prompt-noparam', kind: 'click', at: [450, 120], path: null, handle: { accept: true } },
  { name: 'prompt-dismiss', kind: 'click', at: [450, 120], path: null, handle: { accept: false, promptText: 'tabi-ignored' } },
  { name: 'no-dialog', kind: 'handle-only', at: null, path: null, handle: { accept: true } },
  { name: 'unload-dismiss', kind: 'navigate', at: null, path: '/next', handle: { accept: false } },
  { name: 'unload-accept', kind: 'navigate', at: null, path: '/next', handle: { accept: true } },
];
const SETTLE_MS = 300;
const DIALOG_WAIT_MS = 5000;
const serverLog = [];
const fixtureServer = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  const status = u.pathname === '/' || u.pathname === '/next' ? 200 : 404;
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, ''), run: u.searchParams.get('run') || '', status });
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/' ? FIXTURE_HTML : u.pathname === '/next' ? NEXT_HTML : 'not found');
});
const origin = 'http://127.0.0.1:' + fixturePort;
const failures = [];
const cdpSendLog = [];
const cdpEventLog = [];
const LOGGED_EVENTS = new Set(['Page.javascriptDialogOpening', 'Page.javascriptDialogClosed', 'Page.frameNavigated']);
const receipt = {
  schema: SCHEMA, nonce, degenerate: DEGENERATE, driverSha256: sha256(fs.readFileSync(SELF)),
  startedAt: new Date().toISOString(), finishedAt: null,
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', argv: [], launchToken, devtoolsListening: null, childExit: null },
  fixture: { sha256: sha256(FIXTURE_HTML), nextSha256: sha256(NEXT_HTML), origin, viewport: VIEWPORT },
  plan: LEGS, nonceOnPage: null, legs: [], events: [], cdpSendLog, cdpEventLog, serverLog,
  teardown: { postKillSweepCount: -1, survivors: [], sweepError: 'not-run', portProbes: null, postKillCurl: null },
  sweeps: {}, failures, legShape: {}, dialogHypothesis: 'UNMEASURED', predicate: false,
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
  let mainFrameId = null;
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (typeof msg.method === 'string' && msg.id === undefined) {
      if (!LOGGED_EVENTS.has(msg.method)) return;
      if (msg.method === 'Page.frameNavigated') { const f = msg.params && msg.params.frame; if (!f || f.parentId !== undefined) return; cdpEventLog.push({ method: msg.method, params: { url: f.url, isMain: f.id === mainFrameId }, afterSendId: msgId }); return; }
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
  mainFrameId = (await send('Page.getFrameTree')).result.frameTree.frame.id;
  await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: origin + '/?run=' + encodeURIComponent(nonce) });
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) {
    try { ready = await evalValue('document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(nonce)); } catch {}
    if (!ready) await sleep(100);
  }
  if (!ready) throw new Error('fixture not ready');
  receipt.nonceOnPage = await evalValue('window.__nonceOnPage');
  if (DEGENERATE === 'page-stub') {
    // Look-alike producer (control runs only): the page's dialog functions are replaced by stubs
    // that return what the plan's handle would make a real dialog return; no dialog ever opens.
    await evalValue('(() => { window.alert = () => undefined; window.confirm = () => window.__leg === "confirm-accept"; window.prompt = () => ({ "prompt-text": "tabi-typed", "prompt-noparam": "" })[window.__leg] ?? null; return 1; })()');
  }
  const openings = () => cdpEventLog.filter((e) => e.method === 'Page.javascriptDialogOpening').length;
  const waitOpening = async (before) => { const t = Date.now(); while (openings() === before && Date.now() - t < DIALOG_WAIT_MS) await sleep(20); return openings() > before; };
  const runLeg = async (leg) => {
    const t0 = Date.now();
    const rec = { name: leg.name, kind: leg.kind, triggerSendId: null, triggerResult: null, triggerError: null, handleSendId: null, handleParams: null, handleResult: null, handleError: null, opened: null, elapsedMs: 0, stateAfter: null };
    try {
      if (leg.kind === 'click' || leg.kind === 'navigate') {
        const before = openings();
        let trig;
        if (leg.kind === 'click' && DEGENERATE === 'eval-trigger') {
          // Look-alike producer (control runs only): a script click (untrusted, no user gesture).
          const id = { 150: 'a', 300: 'c', 450: 'p' }[leg.at[0]];
          trig = send('Runtime.evaluate', { expression: 'setTimeout(() => document.getElementById(' + JSON.stringify(id) + ').click(), 0), 1', returnByValue: true });
        } else if (leg.kind === 'click') {
          await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: leg.at[0], y: leg.at[1], button: 'left', buttons: 1, clickCount: 1 });
          trig = send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: leg.at[0], y: leg.at[1], button: 'left', buttons: 0, clickCount: 1 });
        } else {
          trig = send('Page.navigate', { url: origin + leg.path + '?run=' + encodeURIComponent(nonce) });
        }
        rec.triggerSendId = msgId;
        trig.catch(() => {});
        rec.opened = await waitOpening(before);
        let hp = leg.handle;
        if (DEGENERATE === 'swap-accept' && leg.name.startsWith('confirm-')) hp = { ...hp, accept: !hp.accept };
        rec.handleParams = hp;
        const h = send('Page.handleJavaScriptDialog', hp); rec.handleSendId = msgId;
        try { rec.handleResult = (await h).result; } catch (e) { rec.handleError = errObj(e); }
        try { rec.triggerResult = (await trig).result; } catch (e) { rec.triggerError = errObj(e); }
      } else if (leg.kind === 'handle-only') {
        rec.handleParams = leg.handle;
        const h = send('Page.handleJavaScriptDialog', leg.handle); rec.handleSendId = msgId;
        try { rec.handleResult = (await h).result; } catch (e) { rec.handleError = errObj(e); }
      }
    } catch (e) { rec.triggerError = errObj(e); }
    await sleep(SETTLE_MS);
    rec.elapsedMs = Date.now() - t0;
    return rec;
  };
  for (const leg of LEGS.slice(0, -1)) {
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
  {
    const leg = LEGS[LEGS.length - 1];
    const rec = await runLeg(leg);
    let st = null;
    for (let i = 0; i < 50 && !st; i++) {
      try { st = await evalValue('document.readyState === "complete" && location.pathname === "/next" ? JSON.stringify({ path: location.pathname, runIsNonce: new URLSearchParams(location.search).get("run") === ' + JSON.stringify(nonce) + ', pageNonceIsNonce: document.getElementById("nonce").textContent === ' + JSON.stringify(nonce) + ' }) : null'); } catch {}
      if (!st) await sleep(100);
    }
    rec.stateAfter = st ? JSON.parse(st) : null;
    receipt.legs.push(rec);
  }
} catch (e) { failures.push({ id: 'drive-error', detail: e.message }); }
finally { await teardown(); }
receipt.host.stderrHead = stderrHead.slice(0, 4096);
{
  const m = /DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/([0-9a-f-]{36}))/.exec(stderrHead);
  receipt.host.devtoolsListening = m ? { url: m[1], port: Number(m[2]), browserId: m[3] } : null;
}
receipt.finishedAt = new Date().toISOString();
// Per-leg observed shape, re-derived independently by the counter from the raw events and logs.
// `dialog`: the CDP dialog/navigation events bound to the leg's trigger send (opening) and
// handle send (closed, navigated); `nav`: Page.navigate's errorText for navigate legs.
const pathOf = (u) => { try { return new URL(u).pathname; } catch { return null; } };
const cdpView = (e) => (e.method === 'Page.javascriptDialogOpening' ? ['opening', e.params.type, e.params.message, e.params.defaultPrompt ?? null, e.params.hasBrowserHandler, pathOf(e.params.url)]
  : e.method === 'Page.javascriptDialogClosed' ? ['closed', e.params.result, e.params.userInput] : ['navigated', pathOf(e.params.url)]);
function legSummary(name) {
  const evs = receipt.events.filter((e) => e.leg === name);
  const leg = receipt.legs.find((l) => l.name === name) || {};
  const bound = cdpEventLog.filter((e) => (e.method === 'Page.javascriptDialogOpening' && leg.triggerSendId != null && e.afterSendId === leg.triggerSendId)
    || (e.method !== 'Page.javascriptDialogOpening' && leg.handleSendId != null && e.afterSendId === leg.handleSendId));
  return {
    seq: evs.map((e) => e.type + '@' + e.target), trusted: evs.map((e) => e.isTrusted), prevented: evs.map((e) => e.defaultPrevented),
    xy: evs.map((e) => [e.x, e.y, e.buttons]), ret: evs.filter((e) => e.type === 'dialog-return').map((e) => [e.kind, e.ret]),
    dialog: bound.map(cdpView), handleError: leg.handleError ?? null, triggerError: leg.triggerError ?? null,
    nav: leg.kind === 'navigate' && leg.triggerResult ? (leg.triggerResult.errorText ?? null) : null, stateAfter: leg.stateAfter ?? null,
  };
}
for (const leg of LEGS) receipt.legShape[leg.name] = legSummary(leg.name);
/*LEG-SHAPE-BEGIN*/
// Frozen leg shape: FILLED FROM THE L1 PROBE RECEIPTS (controls/c1/probe/p1-p3; identical across the 3 once the
// unload-accept state is read as booleans against the nonce).
const LEG_SHAPE = {
  "start": {"seq":[],"trusted":[],"prevented":[],"xy":[],"ret":[],"dialog":[],"handleError":null,"triggerError":null,"nav":null,"stateAfter":{"dialogs":0,"last":"-","unloads":0,"path":"/"}},
  "alert-accept": {"seq":["pointerdown@a","mousedown@a","pointerup@a","mouseup@a","dialog-return@a","click@a"],"trusted":[true,true,true,true,true,true],"prevented":[false,false,false,false,false,false],"xy":[[150,120,1],[150,120,1],[150,120,0],[150,120,0],[null,null,null],[150,120,0]],"ret":[["alert","undefined"]],"dialog":[["opening","alert","tabi-alert","",true,"/"],["closed",true,""]],"handleError":null,"triggerError":null,"nav":null,"stateAfter":{"dialogs":1,"last":"alert=undefined","unloads":0,"path":"/"}},
  "confirm-accept": {"seq":["pointerdown@c","mousedown@c","pointerup@c","mouseup@c","dialog-return@c","click@c"],"trusted":[true,true,true,true,true,true],"prevented":[false,false,false,false,false,false],"xy":[[300,120,1],[300,120,1],[300,120,0],[300,120,0],[null,null,null],[300,120,0]],"ret":[["confirm","true"]],"dialog":[["opening","confirm","tabi-confirm","",true,"/"],["closed",true,""]],"handleError":null,"triggerError":null,"nav":null,"stateAfter":{"dialogs":2,"last":"confirm=true","unloads":0,"path":"/"}},
  "confirm-dismiss": {"seq":["pointerdown@c","mousedown@c","pointerup@c","mouseup@c","dialog-return@c","click@c"],"trusted":[true,true,true,true,true,true],"prevented":[false,false,false,false,false,false],"xy":[[300,120,1],[300,120,1],[300,120,0],[300,120,0],[null,null,null],[300,120,0]],"ret":[["confirm","false"]],"dialog":[["opening","confirm","tabi-confirm","",true,"/"],["closed",false,""]],"handleError":null,"triggerError":null,"nav":null,"stateAfter":{"dialogs":3,"last":"confirm=false","unloads":0,"path":"/"}},
  "prompt-text": {"seq":["pointerdown@p","mousedown@p","pointerup@p","mouseup@p","dialog-return@p","click@p"],"trusted":[true,true,true,true,true,true],"prevented":[false,false,false,false,false,false],"xy":[[450,120,1],[450,120,1],[450,120,0],[450,120,0],[null,null,null],[450,120,0]],"ret":[["prompt","string:tabi-typed"]],"dialog":[["opening","prompt","tabi-prompt","tabi-default",true,"/"],["closed",true,"tabi-typed"]],"handleError":null,"triggerError":null,"nav":null,"stateAfter":{"dialogs":4,"last":"prompt=string:tabi-typed","unloads":0,"path":"/"}},
  "prompt-noparam": {"seq":["pointerdown@p","mousedown@p","pointerup@p","mouseup@p","dialog-return@p","click@p"],"trusted":[true,true,true,true,true,true],"prevented":[false,false,false,false,false,false],"xy":[[450,120,1],[450,120,1],[450,120,0],[450,120,0],[null,null,null],[450,120,0]],"ret":[["prompt","string:"]],"dialog":[["opening","prompt","tabi-prompt","tabi-default",true,"/"],["closed",true,""]],"handleError":null,"triggerError":null,"nav":null,"stateAfter":{"dialogs":5,"last":"prompt=string:","unloads":0,"path":"/"}},
  "prompt-dismiss": {"seq":["pointerdown@p","mousedown@p","pointerup@p","mouseup@p","dialog-return@p","click@p"],"trusted":[true,true,true,true,true,true],"prevented":[false,false,false,false,false,false],"xy":[[450,120,1],[450,120,1],[450,120,0],[450,120,0],[null,null,null],[450,120,0]],"ret":[["prompt","null"]],"dialog":[["opening","prompt","tabi-prompt","tabi-default",true,"/"],["closed",false,"tabi-ignored"]],"handleError":null,"triggerError":null,"nav":null,"stateAfter":{"dialogs":6,"last":"prompt=null","unloads":0,"path":"/"}},
  "no-dialog": {"seq":[],"trusted":[],"prevented":[],"xy":[],"ret":[],"dialog":[],"handleError":{"code":-32602,"message":"No dialog is showing"},"triggerError":null,"nav":null,"stateAfter":{"dialogs":6,"last":"prompt=null","unloads":0,"path":"/"}},
  "unload-dismiss": {"seq":["beforeunload@#document"],"trusted":[true],"prevented":[true],"xy":[[null,null,null]],"ret":[],"dialog":[["opening","beforeunload","","",true,"/"],["closed",false,""]],"handleError":null,"triggerError":null,"nav":"net::ERR_ABORTED","stateAfter":{"dialogs":6,"last":"prompt=null","unloads":1,"path":"/"}},
  "unload-accept": {"seq":[],"trusted":[],"prevented":[],"xy":[],"ret":[],"dialog":[["opening","beforeunload","","",true,"/"],["closed",true,""],["navigated","/next"]],"handleError":null,"triggerError":null,"nav":null,"stateAfter":{"path":"/next","runIsNonce":true,"pageNonceIsNonce":true}},
};
/*LEG-SHAPE-END*/
const canonJ = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x));
const count = (m) => cdpSendLog.filter((c) => c.method === m).length;
const evCount = (m) => cdpEventLog.filter((e) => e.method === m).length;
// Look-alike producers in the send log: other Input commands, or script that replaces the dialog
// functions, clicks, dispatches events or writes the record (leg NAMES such as "confirm-accept"
// are not look-alikes: the first probe build matched them and refuted every honest run).
const lookAlikes = cdpSendLog.filter((c) => /^Input\.(dispatchKeyEvent|dispatchTouchEvent|emulateTouch|synthesize|insertText|ime)/.test(c.method) || (c.method === 'Runtime.evaluate' && /window\.(alert|confirm|prompt)\s*=|\.click\(|dispatchEvent|__events\.push/.test(c.params.expression || ''))).length;
receipt.dialogHypothesis = (LEG_SHAPE !== null && LEGS.every((l) => canonJ(receipt.legShape[l.name]) === canonJ(LEG_SHAPE[l.name])) && count('Input.dispatchMouseEvent') === 12 && count('Page.handleJavaScriptDialog') === 9
  && count('Page.navigate') === 3 && evCount('Page.javascriptDialogOpening') === 8 && evCount('Page.javascriptDialogClosed') === 8 && evCount('Page.frameNavigated') === 2
  && lookAlikes === 0 && receipt.nonceOnPage === nonce && receipt.degenerate === null) ? 'CONFIRMED' : 'REFUTED';
receipt.predicate = receipt.dialogHypothesis === 'CONFIRMED' && receipt.failures.length === 0 && !interrupted;
fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1));
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, predicate: receipt.predicate, dialogHypothesis: receipt.dialogHypothesis, degenerate: DEGENERATE, legShape: receipt.legShape, teardown: receipt.teardown, failures }, null, 1));
process.exitCode = receipt.predicate ? 0 : 1;

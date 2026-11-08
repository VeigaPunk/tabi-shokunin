#!/usr/bin/env node
// Chromium runner: tabi round 91, C1 (coverage capability `chromium-showpicker-proxy-linux`).
// Domain: programmatic file-picker invocation — `HTMLInputElement.showPicker()` — reached
// through a `window.postMessage` proxy in the element's own document, across a same-origin
// iframe and a cross-origin iframe, on Chromium 155/Linux `--headless=new`.
//
// The round-90 knowledge note named this frontier and did not hold it: "a same-element origin
// comparison (an input reachable from both origins via a `postMessage` proxy) — not constructible
// in the current loopback fixture." Generation r91 constructs it: one parent document
// (http://127.0.0.1:<http>) carries `<iframe id="so" src="/same.html">` (same origin) and
// `<iframe id="xo" src="http://127.0.0.1:<child>/child.html">` (cross origin), each child document
// carrying the SAME element shapes (`#s` file, `#dt` date, `#co` colour) and a `message` handler
// that accepts only the parent origin and calls `showPicker()` on the named element.
//
// Fifteen legs, one fresh browser per leg (activation is per-window state):
//   * same-origin direct: parent calls `so.contentDocument.getElementById('s').showPicker()`
//     with no activation, with a real parent click, and with a real click inside the iframe;
//   * same-origin proxy and cross-origin proxy: parent posts `{cmd:'showpicker',target}` to the
//     child window; the child handler calls `showPicker()` — file and date arms, no activation,
//     parent activation, child activation;
//   * the cross-origin answer: `DOM.setFileInputFiles` answered on the proxy-opened chooser
//     delivers the named file to the CHILD input and leaves the parent input empty;
//   * the direct cross-origin access: `contentDocument` is null and `contentWindow.document`
//     throws SecurityError.
//
// Usage:
//   node chrome-cdp-showpicker-proxy-round91.mjs --lane <ABS lane> --nonce <tabi-r91-...>
//     --scratch <ABS dir> --out <ABS receipt.json> --http-port <1024..65535>
//     --cdp-port <1024..65535> --child-port <1024..65535>
// Exit 0: every leg completed with no error and the receipt was written; 1: a leg failed (the
// receipt is still written, with the failure recorded); 2: usage refusal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-showpicker-proxy-r91';
const SELF = fileURLToPath(import.meta.url);
const CHROMIUM = '/usr/bin/chromium';
const VIEWPORT = { width: 1280, height: 900 };
const SETTLE_MS = 400;
const OPEN_WAIT_MS = 2000;
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;
const PORT_PROBE_TIMEOUT_MS = 1500;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const lane = opt('lane');
const nonce = opt('nonce');
const scratchDir = opt('scratch');
const outReceipt = opt('out');
if (!lane || !path.isAbsolute(lane)) usage('--lane must be an absolute path');
if (!nonce || !/^tabi-r91-[a-z0-9-]{4,48}$/.test(nonce)) usage('--nonce must match tabi-r91-[a-z0-9-]{4,48}');
if (!scratchDir || !path.isAbsolute(scratchDir)) usage('--scratch must be an absolute path');
if (!outReceipt || !path.isAbsolute(outReceipt) || !outReceipt.endsWith('.json')) usage('--out must be an absolute .json path');
const ports = ['http-port', 'cdp-port', 'child-port'].map((key) => {
  const v = opt(key);
  if (!/^[0-9]+$/.test(v || '')) usage('--' + key + ' must be an integer');
  const n = Number(v);
  if (n < 1024 || n > 65535) usage('--' + key + ' out of range');
  return n;
});
const [fixturePort, devPort, childPort] = ports;
if (new Set(ports).size !== 3) usage('HTTP, CDP and child ports must all differ');
fs.mkdirSync(scratchDir, { recursive: true });
fs.mkdirSync(path.dirname(outReceipt), { recursive: true });
function freePort(port) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', (e) => { srv.close(); reject(new Error('port ' + port + ' busy: ' + e.message)); });
    srv.once('listening', () => srv.close(resolve));
    srv.listen(port, '127.0.0.1');
  });
}
try { for (const p of ports) await freePort(p); } catch (e) { usage('free-port precheck: ' + e.message); }
{
  let maxSock = 0;
  for (let i = 1; i <= 15; i++) {  // the frozen plan has 15 legs
    const sock = Buffer.byteLength(path.join(fs.realpathSync(scratchDir), 'leg-' + String(i).padStart(2, '0'), 'profile', 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));
    if (sock > maxSock) maxSock = sock;
  }
  if (maxSock > 107) usage('scratch too long for the Chromium singleton socket: ' + maxSock);
}

const PARENT_ORIGIN = 'http://127.0.0.1:' + fixturePort;
const CHILD_ORIGIN = 'http://127.0.0.1:' + childPort;

// The three documents. The child template is served at both `/same.html` (same origin) and
// `/child.html` (the child origin); the only difference is the injected parent origin.
const childHtml = (parentOrigin) => `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r91 child</title>
<style>html,body{margin:0;background:#fef}#s{position:absolute;left:20px;top:20px;width:120px;height:40px}#dt{position:absolute;left:20px;top:80px;width:120px;height:40px}#co{position:absolute;left:20px;top:140px;width:120px;height:40px}#cpad{position:absolute;left:440px;top:40px;width:100px;height:40px;background:#eef}</style></head>
<body><input type="file" id="s"><input type="date" id="dt"><input type="color" id="co"><div id="cpad"></div>
<script>
window.__proxy = null; window.__log = []; window.__events = []; window.__closed = false; window.__late = 0; window.__leg = 'start';
const push = function (o) { if (window.__closed) { window.__late++; return; } o.at = performance.now(); window.__events.push(o); };
for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'input', 'change', 'cancel'])
  window.addEventListener(t, function (e) { push({ type: e.type, isTrusted: e.isTrusted, target: e.target && e.target.id ? e.target.id : null, act: navigator.userActivation.isActive, x: typeof e.clientX === 'number' ? e.clientX : null, y: typeof e.clientY === 'number' ? e.clientY : null, buttons: typeof e.buttons === 'number' ? e.buttons : null, files: null }); }, true);
window.__setLeg = function (n) { window.__leg = n; return n; };
window.__act = function () { return JSON.stringify({ isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive }); };
window.__state = function () { return JSON.stringify(Array.from(document.getElementById('s').files, function (f) { return [f.name, f.size, f.type]; })); };
window.__elements = function () { return JSON.stringify(['s', 'dt', 'co'].map(function (id) { var e = document.getElementById(id); var r = e.getBoundingClientRect(); return { id: id, tag: e.tagName.toLowerCase(), type: e.getAttribute('type'), accept: e.getAttribute('accept'), rect: { left: r.left, top: r.top, width: r.width, height: r.height } }; })); };
window.__reset = function () { window.__proxy = null; window.__log = []; return 'reset'; };
window.__closeRecord = function () { window.__closed = true; return JSON.stringify({ events: window.__events, closedAt: performance.now() }); };
window.__ready = function () { return document.readyState === 'complete' && !!document.getElementById('cpad'); };
window.addEventListener('message', function (e) {
  const d = e.data || {};
  window.__log.push({ origin: e.origin, cmd: d.cmd || null, target: d.target || null, at: performance.now() });
  if (d.cmd !== 'showpicker' || e.origin !== ${JSON.stringify(parentOrigin)}) return;
  let out;
  try { const r = document.getElementById(d.target).showPicker(); out = { ok: true, ret: String(r), target: d.target, origin: e.origin }; }
  catch (err) { out = { ok: false, name: err.name, message: err.message, target: d.target, origin: e.origin }; }
  window.__proxy = out;
  try { e.source.postMessage({ cmd: 'result', result: out }, e.origin); } catch (e2) {}
});
</script></body></html>`;

const PARENT_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r91 parent</title>
<style>html,body{margin:0;background:#fff}#ps{position:absolute;left:100px;top:650px;width:120px;height:40px}#pad{position:absolute;left:300px;top:800px;width:120px;height:40px;background:#eef}#so{position:absolute;left:40px;top:120px;width:600px;height:500px;border:0}#xo{position:absolute;left:660px;top:120px;width:600px;height:500px;border:0}</style></head>
<body><div id="pad"></div><input type="file" id="ps"><iframe id="so" src="/same.html?run=__RUN__"></iframe><iframe id="xo" src="${CHILD_ORIGIN}/child.html?run=__RUN__"></iframe>
<script>
window.__replies = []; window.__events = []; window.__closed = false; window.__late = 0; window.__leg = 'start';
const push = function (o) { if (window.__closed) { window.__late++; return; } o.at = performance.now(); window.__events.push(o); };
for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'input', 'change', 'cancel'])
  window.addEventListener(t, function (e) { push({ type: e.type, isTrusted: e.isTrusted, target: e.target && e.target.id ? e.target.id : null, act: navigator.userActivation.isActive, x: typeof e.clientX === 'number' ? e.clientX : null, y: typeof e.clientY === 'number' ? e.clientY : null, buttons: typeof e.buttons === 'number' ? e.buttons : null, files: null }); }, true);
window.__setLeg = function (n) { window.__leg = n; return n; };
window.__act = function () { return JSON.stringify({ isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive }); };
window.__elements = function () { const e = document.getElementById('ps'); const r = e.getBoundingClientRect(); return JSON.stringify([{ id: 'ps', tag: e.tagName.toLowerCase(), type: e.getAttribute('type'), accept: e.getAttribute('accept'), rect: { left: r.left, top: r.top, width: r.width, height: r.height } }]); };
window.__state = function () { return JSON.stringify(Array.from(document.getElementById('ps').files, function (f) { return [f.name, f.size, f.type]; })); };
window.__ready = function () { return document.readyState === 'complete' && !!document.getElementById('so') && !!document.getElementById('xo'); };
window.__closeRecord = function () { window.__closed = true; return JSON.stringify({ events: window.__events, closedAt: performance.now() }); };
window.addEventListener('message', function (e) { window.__replies.push({ origin: e.origin, data: e.data }); });
</script></body></html>`;

const ACT_EXPR = 'JSON.stringify({isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive})';
const PARENT_READY = 'document.readyState === "complete" && !!window.__ready && window.__ready()';
const CHILD_READY = 'document.readyState === "complete" && !!window.__ready && window.__ready()';
const PARENT_ELEMENTS = 'window.__elements()';
const CHILD_ELEMENTS = 'window.__elements()';
const PARENT_REPLIES = 'JSON.stringify(window.__replies)';
const CHILD_PROXY = 'window.__proxy === null ? "null" : JSON.stringify(window.__proxy)';
const CHILD_PROXYLOG = 'JSON.stringify(window.__log)';
const CHILD_STATE = 'window.__state()';
const PARENT_STATE = 'window.__state()';
const CHILD_RESET = 'window.__reset()';
const CHILD_ACT = 'window.__act()';
const CHILD_CLOSE = 'window.__closeRecord()';
const PARENT_CLOSE = 'window.__closeRecord()';
const CHILD_LATE = 'window.__late';
const PARENT_LATE = 'window.__late';
const CHILD_SETLEG = (n) => 'window.__setLeg(' + JSON.stringify(n) + ')';
const PARENT_SETLEG = (n) => 'window.__setLeg(' + JSON.stringify(n) + ')';
const RECT_EXPR = (frame) => 'JSON.stringify(document.getElementById(' + JSON.stringify(frame) + ').getBoundingClientRect())';
const POST_EXPR = (frame, target, targetOrigin) => 'JSON.stringify((function(){ var f = document.getElementById(' + JSON.stringify(frame) + '); f.contentWindow.postMessage({cmd:"showpicker",target:' + JSON.stringify(target) + '}, ' + JSON.stringify(targetOrigin) + '); return "sent"; })())';
const DIRECT_EXPR = (frame, target) => 'JSON.stringify((function(){ try { var d = document.getElementById(' + JSON.stringify(frame) + ').contentDocument; var el = d.getElementById(' + JSON.stringify(target) + '); var r = el.showPicker(); return {ok:true, ret:String(r)}; } catch(e){ return {ok:false, name:e.name, message:e.message}; } })())';
const CROSS_EXPR = 'JSON.stringify((function(){ var f = document.getElementById("xo"); var out = { contentDocument: f.contentDocument === null ? null : "object" }; try { var d = f.contentWindow.document; out.windowDocument = d ? "object" : null; } catch(e){ out.windowDocument = e.name; } try { f.contentDocument.getElementById("s").showPicker(); out.showPicker = "reached"; } catch(e){ out.showPicker = e.name + ": " + e.message; } return out; })())';

// Legs. `frame` names the iframe the element lives in; `direct` calls showPicker from the parent
// document (same-origin legs only); `proxy` posts the message; `parentPad`/`childPad` are real
// CDP clicks that grant activation in the named window.
const LEGS = [
  { name: 'sp91-so-direct-noact', frame: 'so', target: 's', mode: 'direct', parentPad: false, childPad: false },
  { name: 'sp91-so-direct-parentact', frame: 'so', target: 's', mode: 'direct', parentPad: true, childPad: false },
  { name: 'sp91-so-direct-childact', frame: 'so', target: 's', mode: 'direct', parentPad: false, childPad: true },
  { name: 'sp91-so-proxy-noact', frame: 'so', target: 's', mode: 'proxy', parentPad: false, childPad: false },
  { name: 'sp91-so-proxy-childact', frame: 'so', target: 's', mode: 'proxy', parentPad: false, childPad: true },
  { name: 'sp91-so-proxy-date-noact', frame: 'so', target: 'dt', mode: 'proxy', parentPad: false, childPad: false },
  { name: 'sp91-so-proxy-date-childact', frame: 'so', target: 'dt', mode: 'proxy', parentPad: false, childPad: true },
  { name: 'sp91-xo-proxy-file-noact', frame: 'xo', target: 's', mode: 'proxy', parentPad: false, childPad: false },
  { name: 'sp91-xo-proxy-file-parentact', frame: 'xo', target: 's', mode: 'proxy', parentPad: true, childPad: false },
  { name: 'sp91-xo-proxy-file-childact', frame: 'xo', target: 's', mode: 'proxy', parentPad: false, childPad: true },
  { name: 'sp91-xo-proxy-file-answer', frame: 'xo', target: 's', mode: 'proxy', parentPad: false, childPad: true, answer: 'tabi-r91-answer.txt' },
  { name: 'sp91-xo-proxy-date-noact', frame: 'xo', target: 'dt', mode: 'proxy', parentPad: false, childPad: false },
  { name: 'sp91-xo-proxy-date-childact', frame: 'xo', target: 'dt', mode: 'proxy', parentPad: false, childPad: true },
  { name: 'sp91-xo-proxy-color-childact', frame: 'xo', target: 'co', mode: 'proxy', parentPad: false, childPad: true },
  { name: 'sp91-xo-direct-access', frame: 'xo', target: 's', mode: 'cross-access', parentPad: false, childPad: false },
];

const receipt = {
  schema: SCHEMA, lane: path.basename(lane), nonce, driverSha256: sha256(fs.readFileSync(SELF)),
  startedAt: new Date().toISOString(), finishedAt: null,
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', node: process.version },
  fixture: { parent: { origin: PARENT_ORIGIN, sha256: '' }, same: { origin: PARENT_ORIGIN, path: '/same.html', sha256: '' }, child: { origin: CHILD_ORIGIN, path: '/child.html', sha256: '' }, viewport: VIEWPORT },
  ports: { http: fixturePort, cdp: devPort, child: childPort },
  elements: null, legs: [], failures: [],
};
{
  const v = spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8', timeout: 15000 });
  receipt.host.chromium = v.status === 0 ? v.stdout.trim() : 'failed status ' + v.status;
}

const needlePids = (needles) => {
  const out = [];
  try {
    const r = spawnSync('ps', ['-eo', 'pid,args'], { encoding: 'utf8', timeout: 15000 });
    if (r.status !== 0) return { error: 'ps exited ' + r.status, pids: out };
    for (const line of (r.stdout || '').split('\n')) {
      if (needles.some((n) => line.includes(n))) {
        const pid = Number(line.trim().split(/\s+/)[0]);
        if (Number.isInteger(pid) && pid > 1) out.push(pid);
      }
    }
  } catch (e) { return { error: e.message, pids: out }; }
  return { error: null, pids: out };
};
async function sweepToZero(needles) {
  let rounds = 0; let last = null;
  while (rounds < SWEEP_MAX_ROUNDS) {
    last = needlePids(needles);
    if (last.error || last.pids.length === 0) break;
    for (const pid of last.pids) { try { process.kill(pid, 'SIGKILL'); } catch {} }
    await sleep(SWEEP_WAIT_MS);
    rounds++;
  }
  return { rounds, survivors: last && !last.error ? last.pids : [], error: last ? last.error : 'never-ran' };
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
class CdpError extends Error { constructor(obj) { super(JSON.stringify(obj)); this.cdp = obj; } }
const errObj = (e) => (e instanceof CdpError ? { code: e.cdp.code ?? null, message: e.cdp.message ?? null } : { code: null, message: String(e && e.message) });

async function runLeg(leg) {
  const rec = {
    name: leg.name, frame: leg.frame, target: leg.target, mode: leg.mode, parentPad: leg.parentPad, childPad: leg.childPad, answer: null, answerSet: null,
    interceptSendId: null, interceptResult: null, interceptError: null,
    parentPadPressId: null, parentPadReleaseId: null, parentPadElement: null, parentPadError: null,
    childPadPressId: null, childPadReleaseId: null, childPadElement: null, childPadError: null,
    directSendId: null, directResult: null, direct: null, directError: null,
    postSendId: null, postResult: null, postError: null, replySendId: null, proxySendId: null, proxyLogSendId: null,
    crossSendId: null, crossResult: null, crossAccess: null, crossError: null,
    activationBefore: null, activationAfter: null, childActivationBefore: null, childActivationAfter: null,
    replies: null, proxy: null, proxyLog: null, childState: null, parentState: null,
    elements: null, choosers: [], chooserWaitMs: null, stateAfterDismiss: null,
    dismissSendId: null, dismissResult: null, dismissError: null,
    pageEvents: [], childEvents: [], marks: [], closedAt: null, childClosedAt: null, lateAfterClose: null, childLateAfterClose: null,
    argv: [], launchToken: null, cdpProduct: null, cdpProtocolVersion: null, stderrHead: '', devtoolsListening: null,
    frameTree: null, contexts: [], childContextId: null, childFrameId: null, soFrameId: null, xoFrameId: null,
    serverLog: [], childServerLog: [], cdpSendLog: [], cdpEventLog: [], teardown: null, errors: [],
  };
  const cdpSendLog = rec.cdpSendLog; const cdpEventLog = rec.cdpEventLog;
  rec.marks.push({ name: 'start', at: performance.now() });
  const launchToken = crypto.randomBytes(6).toString('hex');
  rec.launchToken = launchToken;
  const legDir = path.join(scratchDir, 'leg-' + String(LEGS.indexOf(leg) + 1).padStart(2, '0'));
  fs.rmSync(legDir, { recursive: true, force: true });
  fs.mkdirSync(legDir, { recursive: true });
  const profileDir = path.join(legDir, 'profile');
  const runHome = path.join(legDir, 'home');
  const runXdg = {
    HOME: runHome, XDG_CONFIG_HOME: path.join(runHome, '.config'), XDG_CACHE_HOME: path.join(runHome, '.cache'),
    XDG_DATA_HOME: path.join(runHome, '.local', 'share'), XDG_STATE_HOME: path.join(runHome, '.local', 'state'),
    XDG_RUNTIME_DIR: path.join(runHome, 'run'), TMPDIR: legDir,
  };
  const runCrashDb = path.join(runXdg.XDG_CONFIG_HOME, 'chromium', 'Crash Reports');
  for (const d of [runCrashDb, runXdg.XDG_CACHE_HOME, runXdg.XDG_DATA_HOME, runXdg.XDG_STATE_HOME, runXdg.XDG_RUNTIME_DIR, profileDir]) fs.mkdirSync(d, { recursive: true });
  const uploadDir = path.join(legDir, 'upload');
  fs.mkdirSync(uploadDir, { recursive: true });
  const answerBytes = Buffer.from('tabi-r91-answer-alpha\n');
  if (leg.answer) {
    fs.writeFileSync(path.join(uploadDir, leg.answer), answerBytes);
    rec.answer = { name: leg.answer, size: answerBytes.length, sha256: sha256(answerBytes), hex: answerBytes.toString('hex') };
  }
  const needles = [legDir, runCrashDb, 'profile-' + launchToken];
  const pre = needlePids(needles);
  if (pre.error || pre.pids.length !== 0) { rec.errors.push('fresh-leg dir not clean: ' + JSON.stringify(pre)); return rec; }
  const parentHtml = PARENT_HTML.replaceAll('__RUN__', nonce);
  const sameHtml = childHtml(PARENT_ORIGIN);
  const childHtmlPage = childHtml(PARENT_ORIGIN);
  rec.parentSha256 = sha256(parentHtml); rec.sameSha256 = sha256(sameHtml); rec.childSha256 = sha256(childHtmlPage);
  const serverLog = [];
  const childServerLog = [];
  const parentServer = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://127.0.0.1');
    const body = u.pathname === '/' ? parentHtml : (u.pathname === '/same.html' ? sameHtml : null);
    serverLog.push({ path: u.pathname, run: u.searchParams.get('run') || '', status: body ? 200 : 404 });
    res.writeHead(body ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(body || 'not found');
  });
  const childServer = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://127.0.0.1');
    const body = u.pathname === '/child.html' ? childHtmlPage : null;
    childServerLog.push({ path: u.pathname, run: u.searchParams.get('run') || '', status: body ? 200 : 404 });
    res.writeHead(body ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(body || 'not found');
  });
  const childArgv = [CHROMIUM, '--headless=new', '--remote-debugging-port=' + devPort,
    '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
    '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
    '--force-device-scale-factor=1', '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
  rec.argv = childArgv;
  let child = null; let ws = null; let closing = null;
  const teardown = async () => {
    if (closing) return closing;
    closing = (async () => {
      try { if (ws) ws.close(); } catch {}
      if (child && child.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
      await sleep(500);
      const swept = await sweepToZero(needles);
      parentServer.closeAllConnections(); childServer.closeAllConnections();
      await Promise.race([new Promise((resolve) => parentServer.close(resolve)), sleep(2000)]);
      await Promise.race([new Promise((resolve) => childServer.close(resolve)), sleep(2000)]);
      const portProbes = { fixture: await probePort(fixturePort), devtools: await probePort(devPort), child: await probePort(childPort) };
      const curlExit = (p) => spawnSync('/usr/bin/curl', ['--noproxy', '*', '--silent', '--show-error', '--max-time', '2', 'http://127.0.0.1:' + p + '/'], { encoding: 'utf8', timeout: 4000 }).status;
      rec.teardown = { sweepRounds: swept.rounds, survivors: swept.survivors, sweepError: swept.error, portProbes, postKillCurl: { fixture: curlExit(fixturePort), devtools: curlExit(devPort), child: curlExit(childPort) } };
      if (swept.error || swept.survivors.length) rec.errors.push('teardown sweep: ' + JSON.stringify(swept));
      if (Object.values(portProbes).some((v) => v !== 'closed')) rec.errors.push('teardown ports: ' + JSON.stringify(portProbes));
      if (Object.values(rec.teardown.postKillCurl).some((v) => v !== 7)) rec.errors.push('teardown curl: ' + JSON.stringify(rec.teardown.postKillCurl));
    })();
    return closing;
  };
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { teardown(); });
  try {
    await new Promise((resolve, reject) => { parentServer.once('error', reject); parentServer.listen(fixturePort, '127.0.0.1', resolve); });
    await new Promise((resolve, reject) => { childServer.once('error', reject); childServer.listen(childPort, '127.0.0.1', resolve); });
    child = spawn(childArgv[0], childArgv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env: { ...process.env, ...runXdg } });
    let launchError = null;
    child.on('error', (e) => { launchError = e; });
    child.stderr.on('data', (d) => { if (rec.stderrHead.length < 4096) rec.stderrHead += d.toString('utf8').slice(0, 4096 - rec.stderrHead.length); });
    const fetchJSON = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
    let page = null;
    for (let k = 0; k < 400 && !page; k++) {
      if (launchError) throw launchError;
      try { page = (await fetchJSON('http://127.0.0.1:' + devPort + '/json/list')).find((t) => t.type === 'page'); } catch {}
      if (!page) await sleep(150);
    }
    if (!page || !new RegExp('^ws://127\\.0\\.0\\.1:' + devPort + '/').test(page.webSocketDebuggerUrl)) throw new Error('no loopback page target');
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('ws open timeout')), 20000);
      ws.addEventListener('open', () => { clearTimeout(t); resolve(); }, { once: true });
      ws.addEventListener('error', () => { clearTimeout(t); reject(new Error('ws error')); }, { once: true });
    });
    let msgId = 0; const pending = new Map();
    const LOGGED_EVENTS = new Set(['Page.fileChooserOpened', 'Page.frameNavigated', 'Runtime.executionContextCreated']);
    ws.addEventListener('message', (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch { return; }
      if (typeof msg.method === 'string' && msg.id === undefined) {
        if (!LOGGED_EVENTS.has(msg.method)) return;
        if (msg.method === 'Runtime.executionContextCreated') {
          const c = msg.params && msg.params.context;
          if (!c || !c.auxData) return;
          rec.contexts.push({ id: c.id, origin: c.origin, frameId: c.auxData.frameId ?? null, isDefault: c.auxData.isDefault === true });
          return;
        }
        if (msg.method === 'Page.frameNavigated') {
          const f = msg.params && msg.params.frame;
          if (!f || f.parentId !== undefined) return;
          cdpEventLog.push({ method: msg.method, params: { frameId: f.id, url: f.url }, afterSendId: msgId });
          return;
        }
        cdpEventLog.push({ method: msg.method, params: msg.params, afterSendId: msgId });
        return;
      }
      const p = pending.get(msg.id);
      if (p) { pending.delete(msg.id); clearTimeout(p.timer); msg.error ? p.reject(new CdpError(msg.error)) : p.resolve(msg); }
    });
    const send = (method, params = {}, timeoutMs = 30000) => new Promise((resolve, reject) => {
      const id = ++msgId; cdpSendLog.push({ id, method, params });
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('no-response-' + timeoutMs + 'ms ' + method)); }, timeoutMs);
      pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params }));
    });
    const evalValue = async (expression, extra = {}) => {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, ...extra });
      if (r.result.exceptionDetails) throw new Error('eval-exception: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 500));
      return r.result.result.value;
    };
    const evalInContext = async (contextId, expression) => {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, contextId });
      if (r.result.exceptionDetails) throw new Error('eval-exception: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 500));
      return r.result.result.value;
    };
    const ver = await send('Browser.getVersion');
    rec.cdpProduct = ver.result.product;
    rec.cdpProtocolVersion = ver.result.protocolVersion;
    await send('Page.enable'); await send('Runtime.enable');
    const ft = (await send('Page.getFrameTree')).result.frameTree;
    rec.frameTree = { mainFrameId: ft.frame.id, mainFrameParentId: ft.frame.parentId ?? null, mainFrameUrl: ft.frame.url };
    await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
    await send('Page.setInterceptFileChooserDialog', { enabled: true }); rec.interceptSendId = msgId;
    await send('Page.navigate', { url: PARENT_ORIGIN + '/?run=' + encodeURIComponent(nonce) });
    let ready = false;
    for (let k = 0; k < 120 && !ready; k++) {
      try { ready = await evalValue(PARENT_READY); } catch {}
      if (!ready) await sleep(100);
    }
    if (!ready) throw new Error('parent fixture not ready');
    const frameIds = { main: ft.frame.id };
    for (let k = 0; k < 120; k++) {
      const f2 = (await send('Page.getFrameTree')).result.frameTree;
      const walk = (f) => { if (f.frame.url.endsWith('/same.html?run=' + nonce)) frameIds.so = f.frame.id; if (f.frame.url === CHILD_ORIGIN + '/child.html?run=' + nonce) frameIds.xo = f.frame.id; for (const c of f.childFrames || []) walk(c); };
      walk(f2);
      if (frameIds.so && frameIds.xo) break;
      await sleep(100);
    }
    if (!frameIds.so || !frameIds.xo) throw new Error('iframe frames not found: ' + JSON.stringify(frameIds));
    rec.soFrameId = frameIds.so; rec.xoFrameId = frameIds.xo;
    const frameFor = leg.frame === 'so' ? frameIds.so : frameIds.xo;
    rec.childFrameId = frameFor;
    let childCtx = null;
    for (let k = 0; k < 120 && !childCtx; k++) {
      childCtx = rec.contexts.find((c) => c.frameId === frameFor && c.isDefault === true);
      if (childCtx) {
        try { if (!(await evalInContext(childCtx.id, CHILD_READY))) childCtx = null; } catch { childCtx = null; }
      }
      if (!childCtx) await sleep(100);
    }
    if (!childCtx) throw new Error('child context not ready');
    rec.childContextId = childCtx.id;
    rec.marks.push({ name: 'pre', at: performance.now() });
    await evalInContext(childCtx.id, CHILD_SETLEG('pre'));
    await evalValue(PARENT_SETLEG('pre'));
    await evalInContext(childCtx.id, CHILD_RESET);
    await evalValue('window.__replies.length = 0');
    // the same-element comparison: both child documents carry the same shapes, at different origins
    const soCtx = rec.contexts.find((c) => c.frameId === frameIds.so && c.isDefault === true);
    const xoCtx = rec.contexts.find((c) => c.frameId === frameIds.xo && c.isDefault === true);
    if (!soCtx || !xoCtx) throw new Error('both child contexts required for the same-element record');
    const soElements = JSON.parse(await evalInContext(soCtx.id, CHILD_ELEMENTS));
    const xoElements = JSON.parse(await evalInContext(xoCtx.id, CHILD_ELEMENTS));
    const parentElements = JSON.parse(await evalValue(PARENT_ELEMENTS));
    rec.elements = { parent: { origin: PARENT_ORIGIN, elements: parentElements }, so: { origin: PARENT_ORIGIN, elements: soElements }, xo: { origin: CHILD_ORIGIN, elements: xoElements } };
    rec.activationBefore = JSON.parse(await evalValue(ACT_EXPR));
    rec.childActivationBefore = JSON.parse(await evalInContext(childCtx.id, CHILD_ACT));
    if (leg.parentPad) {
      await evalValue(PARENT_SETLEG('parent-click'));
      rec.parentPadElement = await evalValue('document.elementFromPoint(360,820).id');
      const press = send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 360, y: 820, button: 'left', buttons: 1, clickCount: 1 }); rec.parentPadPressId = msgId;
      try { await press; } catch (e) { rec.parentPadError = errObj(e); }
      const release = send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 360, y: 820, button: 'left', buttons: 0, clickCount: 1 }); rec.parentPadReleaseId = msgId;
      try { await release; } catch (e) { rec.parentPadError = errObj(e); }
      await sleep(200);
    }
    if (leg.childPad) {
      await evalInContext(childCtx.id, CHILD_SETLEG('child-click'));
      const rect = JSON.parse(await evalValue(RECT_EXPR(leg.frame)));
      const bx = rect.left + 490, by = rect.top + 60;
      rec.childPadElement = await evalInContext(childCtx.id, 'document.elementFromPoint(' + (bx - rect.left) + ',' + (by - rect.top) + ').id');
      const press = send('Input.dispatchMouseEvent', { type: 'mousePressed', x: bx, y: by, button: 'left', buttons: 1, clickCount: 1 }); rec.childPadPressId = msgId;
      try { await press; } catch (e) { rec.childPadError = errObj(e); }
      const release = send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: bx, y: by, button: 'left', buttons: 0, clickCount: 1 }); rec.childPadReleaseId = msgId;
      try { await release; } catch (e) { rec.childPadError = errObj(e); }
      await sleep(200);
    }
    const chooserCount = () => cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened').length;
    const before = chooserCount();
    const actionAt = Date.now();
    if (leg.mode === 'direct') {
      await evalValue(PARENT_SETLEG('show-picker'));
      const p = send('Runtime.evaluate', { expression: DIRECT_EXPR(leg.frame, leg.target), returnByValue: true }); rec.directSendId = msgId;
      try {
        const r = await p;
        rec.directResult = r.result.result ? r.result.result.value : null;
        rec.direct = rec.directResult === null ? null : JSON.parse(rec.directResult);
      } catch (e) { rec.directError = errObj(e); }
    } else if (leg.mode === 'proxy') {
      await evalValue(PARENT_SETLEG('post-proxy'));
      const targetOrigin = leg.frame === 'so' ? PARENT_ORIGIN : CHILD_ORIGIN;
      const p = send('Runtime.evaluate', { expression: POST_EXPR(leg.frame, leg.target, targetOrigin), returnByValue: true }); rec.postSendId = msgId;
      try { rec.postResult = (await p).result.result ? (await p).result.result.value : null; } catch (e) { rec.postError = errObj(e); }
      for (let k = 0; k < 100; k++) {
        const rp = send('Runtime.evaluate', { expression: PARENT_REPLIES, returnByValue: true }); rec.replySendId = msgId;
        try { rec.replies = JSON.parse((await rp).result.result.value || '[]'); } catch (e) { rec.postError = rec.postError || errObj(e); }
        if (rec.replies && rec.replies.length) break;
        await sleep(50);
      }
      const pr = send('Runtime.evaluate', { expression: CHILD_PROXY, returnByValue: true, contextId: childCtx.id }); rec.proxySendId = msgId;
      try { const v = (await pr).result.result.value; rec.proxy = v && v !== 'null' ? JSON.parse(v) : null; } catch (e) { rec.postError = rec.postError || errObj(e); }
      const pl = send('Runtime.evaluate', { expression: CHILD_PROXYLOG, returnByValue: true, contextId: childCtx.id }); rec.proxyLogSendId = msgId;
      try { rec.proxyLog = JSON.parse((await pl).result.result.value || '[]'); } catch (e) { rec.postError = rec.postError || errObj(e); }
    } else if (leg.mode === 'cross-access') {
      await evalValue(PARENT_SETLEG('cross-access'));
      const p = send('Runtime.evaluate', { expression: CROSS_EXPR, returnByValue: true }); rec.crossSendId = msgId;
      try { const v = (await p).result.result.value; rec.crossResult = v; rec.crossAccess = JSON.parse(v); } catch (e) { rec.crossError = errObj(e); }
    }
    const t0 = Date.now();
    while (chooserCount() === before && Date.now() - t0 < OPEN_WAIT_MS) await sleep(25);
    rec.chooserWaitMs = Date.now() - t0;
    await sleep(SETTLE_MS);
    rec.choosers = cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened').map((e) => ({ params: e.params, afterSendId: e.afterSendId }));
    if (leg.mode === 'proxy' && leg.answer && rec.choosers.length) {
      const ev = rec.choosers[rec.choosers.length - 1].params;
      const files = [path.join(uploadDir, leg.answer)];
      rec.answerSet = { files, backendNodeId: ev.backendNodeId, setSendId: null, setResult: null, setError: null };
      const sp = send('DOM.setFileInputFiles', { files, backendNodeId: ev.backendNodeId }); rec.answerSet.setSendId = msgId;
      try { rec.answerSet.setResult = (await sp).result; } catch (e) { rec.answerSet.setError = errObj(e); }
      await sleep(500);
    }
    if (rec.choosers.length && !(leg.answer && leg.mode === 'proxy')) {
      const p = send('Page.setInterceptFileChooserDialog', { enabled: true, cancel: true }); rec.dismissSendId = msgId;
      try { rec.dismissResult = (await p).result; } catch (e) { rec.dismissError = errObj(e); }
      await sleep(SETTLE_MS);
    }
    await evalInContext(childCtx.id, CHILD_SETLEG('settle'));
    await evalValue(PARENT_SETLEG('settle'));
    rec.marks.push({ name: 'settle', at: performance.now() });
    await sleep(SETTLE_MS);
    rec.activationAfter = JSON.parse(await evalValue(ACT_EXPR));
    rec.childActivationAfter = JSON.parse(await evalInContext(childCtx.id, CHILD_ACT));
    rec.childState = JSON.parse(await evalInContext(childCtx.id, CHILD_STATE));
    rec.parentState = JSON.parse(await evalValue(PARENT_STATE));
    rec.stateAfterDismiss = rec.parentState;
    const pr = await evalValue(PARENT_CLOSE); const pjr = JSON.parse(pr);
    rec.pageEvents = pjr.events; rec.closedAt = pjr.closedAt;
    const cr = await evalInContext(childCtx.id, CHILD_CLOSE); const cjr = JSON.parse(cr);
    rec.childEvents = cjr.events; rec.childClosedAt = cjr.closedAt;
    await sleep(SETTLE_MS);
    rec.lateAfterClose = await evalValue(PARENT_LATE);
    rec.childLateAfterClose = await evalInContext(childCtx.id, CHILD_LATE);
    rec.serverLog = serverLog; rec.childServerLog = childServerLog;
    const dl = /DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/([0-9a-f-]{36}))/.exec(rec.stderrHead);
    rec.devtoolsListening = dl ? { url: dl[1], port: Number(dl[2]), browserId: dl[3] } : null;
    rec.actionAt = actionAt;
  } catch (e) {
    rec.errors.push('drive-error: ' + (e && e.message ? e.message : String(e)));
  } finally { await teardown(); }
  return rec;
}

for (const leg of LEGS) {
  const rec = await runLeg(leg);
  if (!receipt.elements && rec.elements) receipt.elements = rec.elements;
  if (!receipt.host.cdpProduct && rec.cdpProduct) receipt.host.cdpProduct = rec.cdpProduct;
  if (!receipt.host.cdpProtocolVersion && rec.cdpProtocolVersion) receipt.host.cdpProtocolVersion = rec.cdpProtocolVersion;
  if (rec.errors.length) receipt.failures.push({ leg: leg.name, errors: rec.errors });
  receipt.legs.push(rec);
  fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
  console.error('leg ' + leg.name + ' errors=' + rec.errors.length + ' direct=' + JSON.stringify(rec.direct) + ' proxy=' + JSON.stringify(rec.proxy) + ' choosers=' + rec.choosers.length);
}
receipt.finishedAt = new Date().toISOString();
{
  // the fixture pins cover the exact documents served in this run
  const first = receipt.legs[0] || {};
  receipt.fixture.parent.sha256 = first.parentSha256 || '';
  receipt.fixture.same.sha256 = first.sameSha256 || '';
  receipt.fixture.child.sha256 = first.childSha256 || '';
}
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({
  schema: SCHEMA, legs: receipt.legs.length, failures: receipt.failures,
  summary: receipt.legs.map((l) => ({ name: l.name, direct: l.direct, proxy: l.proxy, choosers: l.choosers.map((c) => [c.params.mode, c.params.frameId === l.childFrameId ? 'child' : 'other']), act: [l.activationBefore, l.activationAfter], childAct: [l.childActivationBefore, l.childActivationAfter], childState: l.childState, parentState: l.parentState, cross: l.crossAccess })),
}, null, 1));
process.exitCode = receipt.failures.length === 0 ? 0 : 1;

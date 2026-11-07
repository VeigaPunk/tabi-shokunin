#!/usr/bin/env node
// Chromium runner: tabi round 79, C1 (coverage capability `chromium-showpicker-linux`).
// Domain: programmatic file-picker invocation — `HTMLInputElement.showPicker()` — under
// `Page.setInterceptFileChooserDialog`, on Chromium 155/Linux `--headless=new`.
//
// The page fixture is the round-78 driver's /*CHOOSER-FIXTURE-BEGIN*/ template, extracted
// byte-identical at runtime and patched with exactly three additions, each asserted present:
//   * a neutral `<div id="pad">` (no default action) used to grant transient user activation
//     with a real trusted CDP click, and a `<input type="file" id="dis" disabled>`;
//   * `__inputs()` also describes `dis`; `__state()` also reports `dis`'s file list.
// The fixture's own event recorder already captures pointer/mouse/click/input/change/cancel
// events with isTrusted, the transient-activation state, coordinates and file lists.
//
// One fresh browser per leg (the launch token, profile, HOME/XDG and crash-db dirs are per leg):
// `navigator.userActivation.hasBeenActive` is per-window state, so a shared browser would let an
// earlier leg's activation leak into a later "no activation" leg. Every leg records its own
// cdpSendLog/cdpEventLog, argv, frame tree and teardown proof.
//
// Usage:
//   node chrome-cdp-showpicker-round79.mjs --lane <ABS lane> --nonce <tabi-r79-...>
//     --scratch <ABS dir> --out <ABS receipt.json> --http-port <1024..65535> --cdp-port <1024..65535>
// Exit 0: every leg completed with no error and the receipt was written; 1: a leg failed (the
// receipt is still written, with the failure recorded); 2: usage refusal. The driver records; it
// does not judge the law — the counter does (round-78 lesson: a producer self-check that pins a
// browser-assigned id refused honest runs).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-showpicker-r79';
const SELF = fileURLToPath(import.meta.url);
const CHROMIUM = '/usr/bin/chromium';
const FIXTURE_SOURCE = path.join(path.dirname(SELF), 'chrome-cdp-filechooser-round78.mjs');
const VIEWPORT = { width: 1280, height: 900 };
const OPEN_WAIT_MS = 2000;
const MIN_OBSERVE_MS = 2000;
const SETTLE_MS = 500;
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
if (!nonce || !/^tabi-r79-[a-z0-9-]{4,48}$/.test(nonce)) usage('--nonce must match tabi-r79-[a-z0-9-]{4,48}');
if (!scratchDir || !path.isAbsolute(scratchDir)) usage('--scratch must be an absolute path');
if (!outReceipt || !path.isAbsolute(outReceipt) || !outReceipt.endsWith('.json')) usage('--out must be an absolute .json path');
const ports = ['http-port', 'cdp-port'].map((key) => {
  const v = opt(key);
  if (!/^[0-9]+$/.test(v || '')) usage('--' + key + ' must be an integer');
  const n = Number(v);
  if (n < 1024 || n > 65535) usage('--' + key + ' out of range');
  return n;
});
const [fixturePort, devPort] = ports;
if (fixturePort === devPort) usage('HTTP and CDP ports must differ');
fs.mkdirSync(scratchDir, { recursive: true });
fs.mkdirSync(path.dirname(outReceipt), { recursive: true });
function freePort(port) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', (e) => { srv.close(); reject(new Error('port ' + port + ' busy')); });
    srv.once('listening', () => srv.close(resolve));
    srv.listen(port, '127.0.0.1');
  });
}
try { for (const p of ports) await freePort(p); } catch (e) { usage('free-port precheck: ' + e.message); }
{
  const sock = Buffer.byteLength(path.join(fs.realpathSync(scratchDir), 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));
  if (sock > 107) usage('scratch too long for the Chromium singleton socket: ' + sock);
}

// ---- fixture: the round-78 template, byte-identical, plus the three asserted patches ----
const driverSrc = fs.readFileSync(FIXTURE_SOURCE, 'utf8');
const fm = /\/\*CHOOSER-FIXTURE-BEGIN\*\/\r?\nconst FIXTURE_TEMPLATE = (`[\s\S]*?`);?\r?\n\/\*CHOOSER-FIXTURE-END\*\//.exec(driverSrc);
if (!fm || !fm[1].startsWith('`') || !fm[1].endsWith('`') || fm[1].includes('${')) usage('could not extract the fixture template from ' + FIXTURE_SOURCE);
const TEMPLATE = (0, eval)('(' + fm[1] + ')');
const PATCH_STYLE = ' #pad { position: absolute; width: 120px; height: 40px; background: #eef; left: 300px; top: 300px; } #dis { left: 100px; top: 500px; }';
const PATCH_BODY = '<div id="pad"></div><input type="file" id="dis" disabled>';
const PATCH_INPUTS_FROM = "['s', 'm', 'd', 'k', 'f'].map";
const PATCH_INPUTS_TO = "['s', 'm', 'd', 'k', 'f', 'dis'].map";
const PATCH_STATE_FROM = "s: fl(g('s')), m: fl(g('m')), d: fl(g('d')), k: fl(g('k')), sValue: g('s').value";
const PATCH_STATE_TO = "s: fl(g('s')), m: fl(g('m')), d: fl(g('d')), k: fl(g('k')), dis: fl(g('dis')), sValue: g('s').value";
for (const [from, to] of [[PATCH_INPUTS_FROM, PATCH_INPUTS_TO], [PATCH_STATE_FROM, PATCH_STATE_TO]]) {
  const n = TEMPLATE.split(from).length - 1;
  if (n !== 1) usage('fixture patch anchor not unique: ' + from.slice(0, 40) + ' (' + n + ')');
}
const PATCHED = TEMPLATE
  .replace('</style>', PATCH_STYLE + '</style>')
  .replace('</body>', PATCH_BODY + '</body>')
  .replace(PATCH_INPUTS_FROM, PATCH_INPUTS_TO)
  .replace(PATCH_STATE_FROM, PATCH_STATE_TO);
for (const needle of [PATCH_STYLE, PATCH_BODY, PATCH_INPUTS_TO, PATCH_STATE_TO]) {
  if (!PATCHED.includes(needle)) usage('fixture patch did not apply: ' + needle.slice(0, 40));
}
const FIXTURE_HTML = PATCHED.replaceAll('__NONCE__', nonce);

// The page-side expression the driver sends to invoke showPicker(). One exact template per
// target so the counter can reconstruct every allowed expression from the leg plan.
const wrapperFor = (target) => '(function(){ try { var r = document.getElementById(' + JSON.stringify(target) + ').showPicker(); return {ok: true, ret: String(r)}; } catch (e) { return {ok: false, name: e.name, message: e.message}; } })()';
const ACT_EXPR = 'JSON.stringify({isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive})';
const READY_EXPR = (n) => 'document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(n);

// Legs. `kind: 'showpicker'` invokes showPicker() on `target`; `kind: 'click'` is the round-78
// trigger path as the control (a real mouse click on a file input).
const LEGS = [
  { name: 'sp-nogesture-intercept-on', kind: 'showpicker', target: 's', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp-nogesture-intercept-off', kind: 'showpicker', target: 's', intercept: null, priorClick: null, gesture: false },
  { name: 'sp-click-then-show', kind: 'showpicker', target: 's', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp-cdp-gesture', kind: 'showpicker', target: 's', intercept: { enabled: true }, priorClick: null, gesture: true },
  { name: 'sp-intercept-off-click-then-show', kind: 'showpicker', target: 's', intercept: null, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp-multiple-show', kind: 'showpicker', target: 'm', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp-disabled', kind: 'showpicker', target: 'dis', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp-cancel-armed', kind: 'showpicker', target: 's', intercept: { enabled: true, cancel: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp-show-twice', kind: 'showpicker-twice', target: 's', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp-click-control', kind: 'click', target: 's', at: [160, 120], intercept: { enabled: true } },
];

let launchSeq = 0;
const receipt = {
  schema: SCHEMA, lane: path.basename(lane), nonce, driverSha256: sha256(fs.readFileSync(SELF)),
  startedAt: new Date().toISOString(), finishedAt: null,
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', node: process.version },
  fixture: { sha256: sha256(FIXTURE_HTML), origin: 'http://127.0.0.1:' + fixturePort, viewport: VIEWPORT, patch: { style: PATCH_STYLE, body: PATCH_BODY, inputs: PATCH_INPUTS_TO, state: PATCH_STATE_TO } },
  ports: { http: fixturePort, cdp: devPort },
  frameTree: null, fixtureInputs: null, legs: [], failures: [],
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
  const idx = LEGS.indexOf(leg);
  const rec = {
    name: leg.name, kind: leg.kind, target: leg.target, intercept: leg.intercept, priorClick: leg.priorClick ?? null, gesture: leg.gesture ?? null,
    interceptSendId: null, interceptResult: null, interceptError: null,
    priorPressId: null, priorReleaseId: null, priorClickElement: null, priorClickError: null,
    triggerSendId: null, triggerResult: null, triggerError: null, showPicker: null,
    trigger2SendId: null, trigger2Result: null, trigger2Error: null, showPicker2: null,
    chooserWaitMs: null, activationBefore: null, activationAfter: null, stateAfter: null,
    dismissSendId: null, dismissResult: null, dismissError: null, stateAfterDismiss: null,
    pageEvents: [], marks: [], closedAt: null, lateAfterClose: null,
    argv: [], cdpSendLog: [], cdpEventLog: [], teardown: null, devtoolsListening: null, errors: [],
  };
  const cdpSendLog = rec.cdpSendLog; const cdpEventLog = rec.cdpEventLog;
  const launchToken = crypto.randomBytes(6).toString('hex');
  const profileDir = path.join(scratchDir, 'profile-' + launchToken);
  const runHome = path.join(scratchDir, 'home-' + launchToken);
  const runXdgConfig = path.join(runHome, '.config');
  const runXdg = {
    HOME: runHome, XDG_CONFIG_HOME: runXdgConfig, XDG_CACHE_HOME: path.join(runHome, '.cache'),
    XDG_DATA_HOME: path.join(runHome, '.local', 'share'), XDG_STATE_HOME: path.join(runHome, '.local', 'state'),
    XDG_RUNTIME_DIR: path.join(runHome, 'run'), TMPDIR: scratchDir,
  };
  const runCrashDb = path.join(runXdgConfig, 'chromium', 'Crash Reports');
  for (const d of [runCrashDb, runXdg.XDG_CACHE_HOME, runXdg.XDG_DATA_HOME, runXdg.XDG_STATE_HOME, runXdg.XDG_RUNTIME_DIR, profileDir]) fs.mkdirSync(d, { recursive: true });
  const needles = [launchToken, profileDir, runCrashDb];
  const pre = needlePids(needles);
  if (pre.error || pre.pids.length !== 0) { rec.errors.push('launch token not fresh: ' + JSON.stringify(pre)); return rec; }
  const serverLog = [];
  const fixtureServer = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://127.0.0.1');
    serverLog.push({ path: u.pathname, run: u.searchParams.get('run') || '', status: u.pathname === '/' ? 200 : 404 });
    res.writeHead(u.pathname === '/' ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(u.pathname === '/' ? FIXTURE_HTML : 'not found');
  });
  const origin = 'http://127.0.0.1:' + fixturePort;
  const childArgv = [CHROMIUM, '--headless=new', '--remote-debugging-port=' + devPort,
    '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
    '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
    '--force-device-scale-factor=1', '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
  rec.argv = childArgv;
  rec.launchToken = launchToken;
  let child = null; let ws = null; let stderrHead = ''; let closing = null;
  const teardown = async () => {
    if (closing) return closing;
    closing = (async () => {
      try { if (ws) ws.close(); } catch {}
      if (child && child.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
      await sleep(600);
      const swept = await sweepToZero(needles);
      fixtureServer.closeAllConnections();
      await Promise.race([new Promise((resolve) => fixtureServer.close(resolve)), sleep(2000)]);
      const portProbes = { fixture: await probePort(fixturePort), devtools: await probePort(devPort) };
      const curlExit = (p) => spawnSync('/usr/bin/curl', ['--noproxy', '*', '--silent', '--show-error', '--max-time', '2', 'http://127.0.0.1:' + p + '/'], { encoding: 'utf8', timeout: 4000 }).status;
      rec.teardown = {
        sweepRounds: swept.rounds, survivors: swept.survivors, sweepError: swept.error,
        portProbes, postKillCurl: { fixture: curlExit(fixturePort), devtools: curlExit(devPort) },
      };
      if (swept.error || swept.survivors.length) rec.errors.push('teardown sweep: ' + JSON.stringify(swept));
      if (Object.values(portProbes).some((v) => v !== 'closed')) rec.errors.push('teardown ports: ' + JSON.stringify(portProbes));
      if (Object.values(rec.teardown.postKillCurl).some((v) => v !== 7)) rec.errors.push('teardown curl: ' + JSON.stringify(rec.teardown.postKillCurl));
    })();
    return closing;
  };
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { teardown(); });
  try {
    await new Promise((resolve, reject) => { fixtureServer.once('error', reject); fixtureServer.listen(fixturePort, '127.0.0.1', resolve); });
    child = spawn(childArgv[0], childArgv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env: { ...process.env, ...runXdg } });
    let launchError = null;
    child.on('error', (e) => { launchError = e; });
    child.stderr.on('data', (d) => { if (stderrHead.length < 4096) stderrHead += d.toString('utf8').slice(0, 4096 - stderrHead.length); });
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
    const LOGGED_EVENTS = new Set(['Page.fileChooserOpened', 'Page.frameNavigated']);
    ws.addEventListener('message', (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch { return; }
      if (typeof msg.method === 'string' && msg.id === undefined) {
        if (!LOGGED_EVENTS.has(msg.method)) return;
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
    const ver = await send('Browser.getVersion');
    rec.cdpProduct = ver.result.product;
    rec.cdpProtocolVersion = ver.result.protocolVersion;
    await send('Page.enable'); await send('Runtime.enable');
    const ft = (await send('Page.getFrameTree')).result.frameTree;
    rec.frameTree = { mainFrameId: ft.frame.id, mainFrameParentId: ft.frame.parentId ?? null, mainFrameUrl: ft.frame.url };
    await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: origin + '/?run=' + encodeURIComponent(nonce) });
    let ready = false;
    for (let k = 0; k < 100 && !ready; k++) {
      try { ready = await evalValue(READY_EXPR(nonce)); } catch {}
      if (!ready) await sleep(100);
    }
    if (!ready) throw new Error('fixture not ready');
    rec.fixtureInputs = JSON.parse(await evalValue('window.__inputs()'));
    rec.serverLog = serverLog;
    const chooserCount = () => cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened').length;
    const setLeg = async (name) => { await evalValue('window.__setLeg(' + JSON.stringify(name) + ')'); };
    await setLeg('pre');
    rec.activationBefore = JSON.parse(await evalValue(ACT_EXPR));
    if (leg.intercept) {
      const p = send('Page.setInterceptFileChooserDialog', leg.intercept); rec.interceptSendId = msgId;
      try { rec.interceptResult = (await p).result; } catch (e) { rec.interceptError = errObj(e); }
    }
    if (leg.priorClick) {
      await setLeg('prior-click');
      rec.priorClickElement = await evalValue('document.elementFromPoint(' + leg.priorClick.at[0] + ',' + leg.priorClick.at[1] + ').id');
      const press = send('Input.dispatchMouseEvent', { type: 'mousePressed', x: leg.priorClick.at[0], y: leg.priorClick.at[1], button: 'left', buttons: 1, clickCount: 1 });
      rec.priorPressId = msgId;
      try { await press; } catch (e) { rec.priorClickError = errObj(e); }
      const release = send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: leg.priorClick.at[0], y: leg.priorClick.at[1], button: 'left', buttons: 0, clickCount: 1 });
      rec.priorReleaseId = msgId;
      try { await release; } catch (e) { rec.priorClickError = errObj(e); }
      await sleep(150);
      rec.activationBefore = JSON.parse(await evalValue(ACT_EXPR));
    }
    const before = chooserCount();
    if (leg.kind === 'showpicker' || leg.kind === 'showpicker-twice') {
      await setLeg('show-picker');
      const triggerAt = Date.now();
      const params = { expression: wrapperFor(leg.target), returnByValue: true };
      if (leg.gesture) params.userGesture = true;
      const p = send('Runtime.evaluate', params); rec.triggerSendId = msgId;
      let r = null;
      try { r = await p; } catch (e) { rec.triggerError = errObj(e); }
      if (r) {
        const v = r.result.result ? r.result.result.value : undefined;
        rec.showPicker = v === undefined ? null : v;
        rec.triggerResult = r.result.exceptionDetails ? { exceptionDetails: r.result.exceptionDetails } : { value: v === undefined ? null : v };
      }
      const t0 = Date.now();
      while (chooserCount() === before && Date.now() - t0 < OPEN_WAIT_MS) await sleep(20);
      rec.chooserWaitMs = Date.now() - triggerAt;
      if (leg.kind === 'showpicker-twice') {
        await setLeg('show-picker-2');
        const p2 = send('Runtime.evaluate', { expression: wrapperFor(leg.target), returnByValue: true }); rec.trigger2SendId = msgId;
        let r2 = null;
        try { r2 = await p2; } catch (e) { rec.trigger2Error = errObj(e); }
        if (r2) {
          const v2 = r2.result.result ? r2.result.result.value : undefined;
          rec.showPicker2 = v2 === undefined ? null : v2;
          rec.trigger2Result = r2.result.exceptionDetails ? { exceptionDetails: r2.result.exceptionDetails } : { value: v2 === undefined ? null : v2 };
        }
      }
      while (Date.now() - triggerAt < MIN_OBSERVE_MS) await sleep(50);
    } else {
      await setLeg('click');
      const press = send('Input.dispatchMouseEvent', { type: 'mousePressed', x: leg.at[0], y: leg.at[1], button: 'left', buttons: 1, clickCount: 1 });
      rec.priorPressId = msgId;
      try { await press; } catch (e) { rec.priorClickError = errObj(e); }
      const release = send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: leg.at[0], y: leg.at[1], button: 'left', buttons: 0, clickCount: 1 });
      rec.triggerSendId = msgId;
      try { await release; } catch (e) { rec.triggerError = errObj(e); }
      const t0 = Date.now();
      while (chooserCount() === before && Date.now() - t0 < OPEN_WAIT_MS) await sleep(20);
      rec.chooserWaitMs = Date.now() - t0;
      while (Date.now() - t0 < MIN_OBSERVE_MS) await sleep(50);
    }
    await setLeg('settle');
    await sleep(SETTLE_MS);
    rec.activationAfter = JSON.parse(await evalValue(ACT_EXPR));
    rec.stateAfter = JSON.parse(await evalValue('window.__state()'));
    if (chooserCount() > before && leg.intercept && !leg.intercept.cancel) {
      const p = send('Page.setInterceptFileChooserDialog', { enabled: true, cancel: true }); rec.dismissSendId = msgId;
      try { rec.dismissResult = (await p).result; } catch (e) { rec.dismissError = errObj(e); }
      await sleep(SETTLE_MS);
      rec.stateAfterDismiss = JSON.parse(await evalValue('window.__state()'));
    }
    const record = JSON.parse(await evalValue('window.__closeRecord()'));
    rec.pageEvents = record.events;
    rec.marks = record.marks;
    rec.closedAt = record.closedAt;
    await sleep(SETTLE_MS);
    rec.lateAfterClose = await evalValue('window.__late');
    rec.stderrHead = stderrHead.slice(0, 2000);
    const dl = /DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/([0-9a-f-]{36}))/.exec(stderrHead);
    rec.devtoolsListening = dl ? { url: dl[1], port: Number(dl[2]), browserId: dl[3] } : null;
  } catch (e) {
    rec.errors.push('drive-error: ' + (e && e.message ? e.message : String(e)));
  } finally { await teardown(); }
  launchSeq++;
  return rec;
}

for (const leg of LEGS) {
  const rec = await runLeg(leg);
  if (!receipt.frameTree && rec.frameTree) receipt.frameTree = rec.frameTree;
  if (!receipt.host.cdpProduct && rec.cdpProduct) receipt.host.cdpProduct = rec.cdpProduct;
  if (!receipt.host.cdpProtocolVersion && rec.cdpProtocolVersion) receipt.host.cdpProtocolVersion = rec.cdpProtocolVersion;
  if (!receipt.fixtureInputs && rec.fixtureInputs) receipt.fixtureInputs = rec.fixtureInputs;
  if (rec.errors.length) receipt.failures.push({ leg: leg.name, errors: rec.errors });
  receipt.legs.push(rec);
  fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
  console.error('leg ' + leg.name + ' done, errors=' + rec.errors.length + ' showPicker=' + JSON.stringify(rec.showPicker) + ' choosers=' + rec.cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened').length);
}
receipt.finishedAt = new Date().toISOString();
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({
  schema: SCHEMA, legs: receipt.legs.length, failures: receipt.failures,
  summary: receipt.legs.map((l) => ({ name: l.name, showPicker: l.showPicker, choosers: l.cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened').map((e) => [e.params.mode, e.params.backendNodeId]), act: [l.activationBefore, l.activationAfter], state: l.stateAfter })),
}, null, 1));
process.exitCode = receipt.failures.length === 0 ? 0 : 1;

#!/usr/bin/env node
// R78Exec3 frontier probe: HTMLInputElement.showPicker() on the single file input #s under
// CDP file-chooser interception (Page.setInterceptFileChooserDialog), pinned Chromium
// 155.0.8059.84 --headless=new. Launch/env/transport/teardown plumbing is copied from the r78
// producer driver scripts/chrome-cdp-filechooser-round78.mjs (exact argv, isolated XDG HOME,
// loopback fixture, ws transport, detached process-group SIGKILL + ps sweep + port probes).
// The page fixture is the driver's /*CHOOSER-FIXTURE-BEGIN*/ template extracted byte-identical
// at runtime, patched ONLY with one neutral <div id="pad"> (no default action) used to grant
// transient user activation via a real trusted CDP click. The probe never modifies the lane.
// Scenarios (all on #s, fresh browser per scenario):
//   S1 intercept off,  no activation,        showPicker() via plain Runtime.evaluate
//   S2 intercept on,   no activation,        showPicker() via plain Runtime.evaluate
//   S3 intercept on,   prior trusted click on #pad (transient activation), showPicker()
//   S4 intercept off,  prior trusted click on #pad, showPicker()
//   S5 intercept on,   trusted click directly on #s (control: chooser MUST open + event)
//   S6 intercept on,   no activation,        showPicker() via Runtime.evaluate userGesture:true
// Output: one JSON record at --out (seat dir). Exit 0 = every scenario completed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';

const DRIVER_PATH = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-filechooser-round78.mjs';
const CHROMIUM = '/usr/bin/chromium';
const SCHEMA = 'tabi-r78-exec3-showpicker-probe';
const NONCE = 'tabi-r78-exec3-showpicker-probe';
const VIEWPORT = { width: 1280, height: 900 };
const OPEN_WAIT_MS = 2000;   // window in which Page.fileChooserOpened may arrive
const MIN_OBSERVE_MS = 2000; // minimum trigger -> state read distance (files after 2 s)
const SETTLE_MS = 500;
const SWEEP_MAX_ROUNDS = 20, SWEEP_WAIT_MS = 250, PORT_PROBE_TIMEOUT_MS = 1500;
const ACT_EXPR = 'JSON.stringify({isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive})';
const SHOWPICKER_WRAPPER = '(function(){ try { var r = document.getElementById("s").showPicker(); return {ok: true, ret: String(r)}; } catch (e) { return {ok: false, name: e.name, message: e.message}; } })()';
const SCENARIOS = [
  { name: 'S1-intercept-off-no-activation', intercept: null, priorClick: null, showPickerGesture: false },
  { name: 'S2-intercept-on-no-activation', intercept: { enabled: true }, priorClick: null, showPickerGesture: false },
  { name: 'S3-intercept-on-prior-trusted-click', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, showPickerGesture: false },
  { name: 'S4-intercept-off-prior-trusted-click', intercept: null, priorClick: { at: [360, 320], wantTarget: 'pad' }, showPickerGesture: false },
  { name: 'S5-control-intercept-on-click-on-s', intercept: { enabled: true }, priorClick: { at: [160, 120], wantTarget: 's' }, showPickerGesture: null },
  { name: 'S6-intercept-on-no-activation-cdp-gesture', intercept: { enabled: true }, priorClick: null, showPickerGesture: true },
];

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const scratchDir = path.resolve(opt('scratch') || '');
const outFile = path.resolve(opt('out') || '');
if (!opt('scratch') || !path.isAbsolute(opt('scratch')) || !opt('out') || !outFile.endsWith('.json')) {
  console.error('usage: node probe-showpicker.mjs --scratch <ABS dir> --out <ABS .json>');
  process.exit(2);
}
fs.mkdirSync(scratchDir, { recursive: true });
fs.mkdirSync(path.dirname(outFile), { recursive: true });
try { fs.accessSync(scratchDir, fs.constants.W_OK); } catch { console.error('scratch not writable'); process.exit(2); }
{
  // Chromium singleton socket law (r70 R4): refuse a scratch whose SingletonSocket path exceeds 107 bytes.
  const sock = Buffer.byteLength(path.join(fs.realpathSync(scratchDir), 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));
  if (sock > 107) { console.error('scratch too long for Chromium singleton socket: ' + sock); process.exit(2); }
}
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- fixture: extract the driver's template verbatim, patch only #pad ----
const driverSrc = fs.readFileSync(DRIVER_PATH, 'utf8');
const fm = /\/\*CHOOSER-FIXTURE-BEGIN\*\/\r?\nconst FIXTURE_TEMPLATE = (`[\s\S]*?`);?\r?\n\/\*CHOOSER-FIXTURE-END\*\//.exec(driverSrc);
if (!fm || !fm[1].startsWith('`') || !fm[1].endsWith('`') || fm[1].includes('${')) {
  console.error('could not extract fixture template from driver'); process.exit(2);
}
const DRIVER_TEMPLATE = (0, eval)('(' + fm[1] + ')');
const PATCH_STYLE = ' #pad { position: absolute; width: 120px; height: 40px; background: #eef; left: 300px; top: 300px; }';
const PATCH_BODY = '<div id="pad"></div>';
const PATCHED = DRIVER_TEMPLATE
  .replace('</style>', PATCH_STYLE + '</style>')
  .replace('</body>', PATCH_BODY + '</body>');
if (!PATCHED.includes(PATCH_STYLE) || !PATCHED.includes(PATCH_BODY) || PATCHED === DRIVER_TEMPLATE) {
  console.error('fixture patch failed'); process.exit(2);
}
const fixtureHtml = PATCHED.replaceAll('__NONCE__', NONCE);

const needlePids = (needles) => {
  const out = [];
  try {
    const r = spawnSync('ps', ['-eo', 'pid,args'], { encoding: 'utf8', timeout: 15000 });
    if (r.status !== 0) return { error: 'ps exited ' + r.status, pids: out };
    for (const line of (r.stdout || '').split('\n'))
      if (needles.some((n) => line.includes(n))) {
        const pid = Number(line.trim().split(/\s+/)[0]);
        if (Number.isInteger(pid) && pid > 1) out.push(pid);
      }
  } catch (e) { return { error: e.message, pids: out }; }
  return { error: null, pids: out };
};
async function sweepToZero(needles) {
  let rounds = 0, last = null;
  while (rounds < SWEEP_MAX_ROUNDS) {
    last = needlePids(needles);
    if (last.error || last.pids.length === 0) break;
    for (const pid of last.pids) { try { process.kill(pid, 'SIGKILL'); } catch {} }
    await sleep(SWEEP_WAIT_MS);
    rounds++;
  }
  return { rounds, survivors: last && last.error ? [] : (last ? last.pids : []), error: last ? last.error : 'never-ran' };
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
async function freePort(port) {
  await new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', (e) => { srv.close(); if (e.code === 'EADDRINUSE') reject(new Error('port ' + port + ' busy')); else reject(e); });
    srv.once('listening', () => srv.close(resolve));
    srv.listen(port, '127.0.0.1');
  });
}

async function runScenario(i, sc) {
  const rec = {
    name: sc.name, intercept: sc.intercept, priorClick: sc.priorClick, showPickerGesture: sc.showPickerGesture,
    errors: [], cdpSendLog: [], cdpEventLog: [], chooserEvents: [], pageEvents: null, phaseMarks: null,
    activationBefore: null, activationAfter: null, showPickerResult: null, showPickerException: null,
    elementChecks: {}, fixtureInputs: null, stateAfter2s: null, dismiss: null, countSuffix: i,
    fixturePort: 18730 + i, cdpPort: 18830 + i, teardown: null, chromium: '', cdpProduct: '', cdpProtocolVersion: '',
  };
  const cdpSendLog = rec.cdpSendLog, cdpEventLog = rec.cdpEventLog;
  const launchToken = crypto.randomBytes(6).toString('hex');
  const fixturePort = rec.fixturePort, devPort = rec.cdpPort;
  try { await freePort(fixturePort); await freePort(devPort); } catch (e) { rec.errors.push('free-port: ' + e.message); return rec; }
  const profileDir = path.join(scratchDir, 'profile-' + launchToken);
  const runHome = path.join(scratchDir, 'home-' + launchToken);
  const runXdgConfig = path.join(runHome, '.config');
  const runXdg = { HOME: runHome, XDG_CONFIG_HOME: runXdgConfig, XDG_CACHE_HOME: path.join(runHome, '.cache'),
    XDG_DATA_HOME: path.join(runHome, '.local', 'share'), XDG_STATE_HOME: path.join(runHome, '.local', 'state'),
    XDG_RUNTIME_DIR: path.join(runHome, 'run'), TMPDIR: scratchDir };
  const runCrashDb = path.join(runXdgConfig, 'chromium', 'Crash Reports');
  for (const d of [runCrashDb, runXdg.XDG_CACHE_HOME, runXdg.XDG_DATA_HOME, runXdg.XDG_STATE_HOME, runXdg.XDG_RUNTIME_DIR, profileDir])
    fs.mkdirSync(d, { recursive: true });
  const needles = [launchToken, profileDir, runCrashDb];
  const pre = needlePids(needles);
  if (pre.error || pre.pids.length !== 0) { rec.errors.push('launch token not fresh: ' + JSON.stringify(pre)); return rec; }

  const serverLog = [];
  const fixtureServer = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://127.0.0.1');
    serverLog.push({ path: u.pathname, run: u.searchParams.get('run') || '', status: u.pathname === '/' ? 200 : 404 });
    res.writeHead(u.pathname === '/' ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(u.pathname === '/' ? fixtureHtml : 'not found');
  });
  const origin = 'http://127.0.0.1:' + fixturePort;
  const childArgv = [CHROMIUM, '--headless=new', '--remote-debugging-port=' + devPort,
    '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
    '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
    '--force-device-scale-factor=1', '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
  rec.argv = childArgv;
  rec.fixtureSha256 = sha256(fixtureHtml);
  let child = null, ws = null, stderrHead = '', closing = null;
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
      const curl = (p) => spawnSync('/usr/bin/curl', ['--noproxy', '*', '--silent', '--show-error', '--max-time', '2', 'http://127.0.0.1:' + p + '/'], { encoding: 'utf8', timeout: 4000 }).status;
      rec.teardown = { sweepRounds: swept.rounds, survivors: swept.survivors, sweepError: swept.error, portProbes, postKillCurl: { fixture: curl(fixturePort), devtools: curl(devPort) } };
    })();
    return closing;
  };
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { teardown(); });
  class CdpError extends Error { constructor(obj) { super(JSON.stringify(obj)); this.cdp = obj; } }
  try {
    await new Promise((resolve, reject) => { fixtureServer.once('error', reject); fixtureServer.listen(fixturePort, '127.0.0.1', resolve); });
    const ver0 = spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8', timeout: 15000, env: { ...process.env, ...runXdg } });
    if (ver0.status !== 0) throw new Error('chromium --version failed');
    rec.chromium = ver0.stdout.trim();
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
    if (!page) throw new Error('no page target');
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { const t = setTimeout(() => reject(new Error('ws open timeout')), 20000);
      ws.addEventListener('open', () => { clearTimeout(t); resolve(); }, { once: true });
      ws.addEventListener('error', () => { clearTimeout(t); reject(new Error('ws error')); }, { once: true }); });
    let msgId = 0; const pending = new Map();
    const LOGGED_EVENTS = new Set(['Page.fileChooserOpened', 'Page.frameNavigated', 'Runtime.consoleAPICalled', 'Runtime.exceptionThrown', 'Log.entryAdded']);
    const consoleLines = [];
    ws.addEventListener('message', (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch { return; }
      if (typeof msg.method === 'string' && msg.id === undefined) {
        if (!LOGGED_EVENTS.has(msg.method)) return;
        if (msg.method === 'Page.frameNavigated') {
          const f = msg.params && msg.params.frame;
          if (!f || f.parentId !== undefined) return;
          cdpEventLog.push({ method: msg.method, params: { frameId: f.id, url: f.url }, afterSendId: msgId }); return;
        }
        if (msg.method === 'Runtime.consoleAPICalled') {
          consoleLines.push({ type: msg.params && msg.params.type, text: (msg.params && msg.params.args || []).map((a) => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ') });
          return;
        }
        cdpEventLog.push({ method: msg.method, params: msg.params, afterSendId: msgId }); return;
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
    rec.cdpProduct = ver.result.product; rec.cdpProtocolVersion = ver.result.protocolVersion;
    await send('Page.enable'); await send('Runtime.enable');
    try { await send('Log.enable'); rec.logDomain = 'enabled'; } catch (e) { rec.logDomain = 'unsupported: ' + e.message; }
    await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: origin + '/?run=' + encodeURIComponent(NONCE) });
    let ready = false;
    for (let k = 0; k < 100 && !ready; k++) {
      try { ready = await evalValue('document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(NONCE)); } catch {}
      if (!ready) await sleep(100);
    }
    if (!ready) throw new Error('fixture not ready');
    rec.fixtureInputs = JSON.parse(await evalValue('window.__inputs()'));
    const chooserCount = () => cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened').length;
    const setLeg = async (name) => { await evalValue('window.__setLeg(' + JSON.stringify(name) + ')'); };

    await setLeg('pre');
    rec.activationBefore = JSON.parse(await evalValue(ACT_EXPR));
    if (sc.intercept) {
      const p = send('Page.setInterceptFileChooserDialog', sc.intercept); rec.interceptSendId = msgId;
      try { rec.interceptResult = (await p).result; } catch (e) { rec.errors.push('intercept: ' + e.message); }
    }
    if (sc.priorClick) {
      await setLeg('prior-click');
      rec.elementChecks.priorClickElement = await evalValue('document.elementFromPoint(' + sc.priorClick.at[0] + ',' + sc.priorClick.at[1] + ').id');
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: sc.priorClick.at[0], y: sc.priorClick.at[1], button: 'left', buttons: 1, clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: sc.priorClick.at[0], y: sc.priorClick.at[1], button: 'left', buttons: 0, clickCount: 1 });
      await sleep(150);
      rec.activationBefore = JSON.parse(await evalValue(ACT_EXPR));
    }
    if (sc.showPickerGesture !== null) {
      await setLeg('show-picker');
      const before = chooserCount();
      const params = { expression: SHOWPICKER_WRAPPER, returnByValue: true };
      if (sc.showPickerGesture) params.userGesture = true;
      const triggerAt = Date.now();
      const p = send('Runtime.evaluate', params); rec.triggerSendId = msgId;
      let r = null;
      try { r = await p; } catch (e) { rec.errors.push('showPicker send: ' + e.message); }
      if (r) {
        rec.showPickerResult = r.result.result && r.result.result.value !== undefined ? r.result.result.value : null;
        rec.showPickerException = r.result.exceptionDetails || null;
      }
      const t0 = Date.now();
      while (chooserCount() === before && Date.now() - t0 < OPEN_WAIT_MS) await sleep(20);
      rec.chooserWaitMs = Math.max(Date.now() - triggerAt, OPEN_WAIT_MS * (chooserCount() > before ? 0 : 1));
      while (Date.now() - triggerAt < MIN_OBSERVE_MS) await sleep(50);
    }
    await setLeg('settle');
    await sleep(sc.showPickerGesture !== null ? 100 : MIN_OBSERVE_MS);
    rec.activationAfter = JSON.parse(await evalValue(ACT_EXPR));
    rec.stateAfter2s = JSON.parse(await evalValue('window.__state()'));
    rec.chooserEvents = cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened');
    if (rec.chooserEvents.length && sc.intercept) {
      const p = send('Page.setInterceptFileChooserDialog', { enabled: true, cancel: true }); rec.dismissSendId = msgId;
      try { rec.dismissResult = (await p).result; } catch (e) { rec.errors.push('dismiss: ' + e.message); }
      await sleep(SETTLE_MS);
      rec.dismiss = { cancelEventOnPage: JSON.parse(await evalValue('window.__state()')).s, settleState: JSON.parse(await evalValue('window.__state()')) };
    }
    const record = JSON.parse(await evalValue('window.__closeRecord()'));
    rec.pageEvents = record.events; rec.phaseMarks = record.marks;
    rec.consoleLines = consoleLines;
    rec.stderrHead = stderrHead.slice(0, 2000);
  } catch (e) { rec.errors.push('drive-error: ' + e.message); }
  finally { await teardown(); }
  return rec;
}

const out = {
  schema: SCHEMA, probe: 'showpicker-under-interception', nonce: NONCE,
  startedAt: new Date().toISOString(), finishedAt: null,
  fixtureSha256: sha256(fixtureHtml),
  fixturePatch: { style: PATCH_STYLE, body: PATCH_BODY, note: 'driver template otherwise byte-identical (extracted from ' + DRIVER_PATH + ' at runtime)' },
  host: { chromiumArg: CHROMIUM, chromiumVersion: null, node: process.version },
  scenarios: [],
};
{
  const v = spawnSync(CHROMIUM, ['--version'], { encoding: 'utf8', timeout: 15000 });
  out.host.chromiumVersion = v.status === 0 ? v.stdout.trim() : ('failed status ' + v.status);
}
let fatal = 0;
for (let i = 0; i < SCENARIOS.length; i++) {
  const rec = await runScenario(i, SCENARIOS[i]);
  if (rec.errors.length) fatal++;
  out.scenarios.push(rec);
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
  console.error('scenario ' + rec.name + ' done, errors=' + rec.errors.length + ' chooserEvents=' + rec.chooserEvents.length + ' showPicker=' + JSON.stringify(rec.showPickerResult));
}
out.finishedAt = new Date().toISOString();
fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, scenarios: out.scenarios.map((s) => ({ name: s.name, showPicker: s.showPickerResult, chooserEvents: s.chooserEvents.length, activationBefore: s.activationBefore, stateAfter2s: s.stateAfter2s, errors: s.errors })), fatal }, null, 1));
process.exitCode = fatal === 0 ? 0 : 1;

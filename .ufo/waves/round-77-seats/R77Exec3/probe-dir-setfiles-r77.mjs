#!/usr/bin/env node
// R77Exec3 frontier probe (tabi round 77 w1): does DOM.setFileInputFiles([<dir>]) answer
// within 5 s on a webkitdirectory <input> whose chooser was intercepted
// (Page.setInterceptFileChooserDialog + real mouse click), and does the page receive
// input+change with one File per regular file under <dir>, each with non-empty
// webkitRelativePath? Variant `nondir` gives the same directory path to the plain
// single-file input instead. Chromium 155.0.8059.84 --headless=new, /usr/bin/chromium.
// Launch/teardown plumbing is the lane driver chrome-cdp-filechooser-round77.mjs's,
// copied unchanged (scratch validation incl. 107-byte singleton bound, XDG sandbox,
// argv, detached spawn, /json/list poll, needle sweep, port+curl closure proof).
// The fixture, the CDP flow and the receipt are new. Every CDP message (send,
// response, timeout) and every CDP event is logged with timestamps.
//
//   node probe-dir-setfiles-r77.mjs --scratch <ABS> --out <ABS .json> --variant dir|nondir
//     --http-port <int> --cdp-port <int> --nonce <str>
// Exit 0: run completed (outcome HOLDS or REFUTED, both are valid measurements);
// exit 1: drive error / interrupted / teardown not clean; exit 2: usage refusal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';

const SCHEMA = 'tabi-r77-exec3-dirsetfiles-probe';
const OPEN_WAIT_MS = 3000;
const POST_SET_WATCH_MS = 12000;
const SET_CMD_TIMEOUT_MS = 20000;
const CMD_TIMEOUT_MS = 15000;
const VIEWPORT = { width: 1280, height: 900 };
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;
const PORT_PROBE_TIMEOUT_MS = 1500;
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
  const sock = Buffer.byteLength(path.join(fs.realpathSync(dir), 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));
  if (sock > 107) throw new PathError('--scratch too long for Chromium\'s singleton socket (' + sock + ' > 107 bytes)');
  return dir;
}
const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : null; };
const usage = (detail) => { console.error(JSON.stringify({ schema: SCHEMA, error: 'usage', detail })); process.exit(2); };
let scratchDir, outReceipt;
try {
  scratchDir = validateScratch(opt('scratch'));
  outReceipt = norm(opt('out') || '');
  if (!isAbsNative(outReceipt) || !outReceipt.endsWith('.json')) throw new PathError('--out must be absolute and end .json');
} catch (e) { usage(e.message); }
fs.mkdirSync(path.dirname(outReceipt), { recursive: true });
const VARIANT = opt('variant');
if (!['dir', 'nondir'].includes(VARIANT)) usage('--variant must be dir|nondir');
const nonce = opt('nonce');
if (!nonce || !/^tabi-r77-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r77- followed by lowercase letters/digits/hyphens');
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
const profileDir = path.join(scratchDir, 'profile-' + launchToken);
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

// Directory under test: 3 regular files, one nested one level down.
const dirPath = path.join(scratchDir, 'up-' + launchToken, 'd-' + launchToken);
const PLAN = {
  'a-first.txt': Buffer.from('alpha\n', 'utf8'),
  'b-two.bin': Buffer.from([0, 1, 2, 3, 255]),
  'sub/three-deep.txt': Buffer.from('nested\n', 'utf8'),
};
try {
  fs.mkdirSync(path.join(dirPath, 'sub'), { recursive: true });
  for (const [rel, buf] of Object.entries(PLAN)) fs.writeFileSync(path.join(dirPath, rel), buf);
} catch (e) { usage('upload dir: ' + e.message); }
const plannedFiles = Object.fromEntries(Object.entries(PLAN).map(([rel, b]) => [rel, { size: b.length, sha256: sha256(b) }]));

// Target input: #d for the dir variant, #s for the nondir variant. Both present always.
const TARGET_ID = VARIANT === 'dir' ? 'd' : 's';
const FIXTURE_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r77 exec3 dir-setfiles probe</title>
<style>html, body { margin: 0; padding: 0; background: #fff; } input { position: absolute; width: 120px; height: 40px; margin: 0; padding: 0; border: 0; } #s { left: 100px; top: 100px; } #d { left: 500px; top: 100px; }</style>
<script>
window.__seq = 0; window.__events = [];
const fi = function (f) { return { name: f.name, size: f.size, type: f.type, rel: f.webkitRelativePath }; };
const push = function (o) { o.seq = ++window.__seq; o.at = performance.now(); window.__events.push(o); };
const rec = function (e) {
  const fileEv = (e.type === 'input' || e.type === 'change' || e.type === 'cancel') && e.target && e.target.type === 'file';
  push({ type: e.type, ts: e.timeStamp, isTrusted: e.isTrusted, act: navigator.userActivation.isActive,
    target: e.target && e.target.id ? e.target.id : null,
    files: fileEv ? Array.from(e.target.files, fi) : null, nFiles: fileEv ? e.target.files.length : null });
};
for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'input', 'change', 'cancel'])
  window.addEventListener(t, rec, true);
window.__state = function () { const g = function (id) { return document.getElementById(id); };
  return JSON.stringify({ s: Array.from(g('s').files, fi), d: Array.from(g('d').files, fi),
    sRel: g('s').value, dRel: g('d').value, webkitdirD: g('d').webkitdirectory || false }); };
document.addEventListener('DOMContentLoaded', function () { window.__nonceOnPage = document.getElementById('nonce').textContent; });
</script></head><body><p id="nonce" style="position:absolute;left:0;top:0;margin:0;font:0/0 monospace">${nonce}</p><input type="file" id="s"><input type="file" id="d" webkitdirectory></body></html>`;
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), FIXTURE_HTML);

const serverLog = [];
const fixtureServer = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  const status = u.pathname === '/' ? 200 : 404;
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, ''), status });
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/' ? FIXTURE_HTML : 'not found');
});
const origin = 'http://127.0.0.1:' + fixturePort;
const failures = [];
const cdps = []; // every CDP message, both directions, with ms timestamps
const startedMs = performance.now();
const nowMs = () => Math.round(performance.now() - startedMs);
const receipt = {
  schema: SCHEMA, probe: 'setFileInputFiles-directory-on-webkitdirectory', variant: VARIANT, nonce,
  startedAt: new Date().toISOString(), finishedAt: null,
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', argv: [], devtoolsListening: null, childExit: null, stderrHead: '' },
  scratch: { dir: scratchDir, singletonSocketLen: Buffer.byteLength(path.join(scratchDir, 'org.chromium.Chromium.XXXXXX', 'SingletonSocket')) },
  dirUnderTest: { path: dirPath, files: plannedFiles },
  fixture: { sha256: sha256(FIXTURE_HTML), origin, viewport: VIEWPORT, targetInput: TARGET_ID },
  intercept: { sendId: null, result: null, error: null },
  click: { rect: null, point: null, pressedSendId: null, releasedSendId: null, error: null },
  chooser: { opened: null, event: null, openedAfterReleaseMs: null },
  setFiles: { sendId: null, params: null, answered: null, latencyMs: null, result: null, error: null },
  watch: { budgetMs: POST_SET_WATCH_MS, sampled: 0, chooserEventsDuringWatch: [], changedAtWatchMs: null },
  page: { nonceOnPage: null, events: [], finalState: null },
  outcome: { commandAnswered: false, commandLatencyMs: null, within5s: false, inputEvent: false, changeEvent: false,
    fileCount: null, allRelNonEmpty: null, rels: null, filesMatchPlan: null, secondChooserAfterSet: null,
    verdict: 'UNMEASURED', reasons: [] },
  teardown: { postKillSweepCount: -1, survivors: [], sweepError: 'not-run', portProbes: null, postKillCurl: null },
  sweeps: { preLaunch: preLaunch.pids.length, midRun: null, postKill: null },
  serverLog, cdps, failures,
};
const childArgv = [chromiumArg, '--headless=new', '--remote-debugging-port=' + devPort,
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
  '--force-device-scale-factor=1',
  '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
receipt.host.argv = childArgv;
let child = null, ws = null, midRunCount = null, closing = null, stderrHead = '';
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
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { interrupted = true; failures.push({ id: 'interrupted', detail: sig }); await teardown(); receipt.finishedAt = new Date().toISOString(); fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1)); process.exit(1); });
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
    if (msg.id !== undefined) {
      const p = pending.get(msg.id);
      cdps.push({ t: nowMs(), dir: 'recv', id: msg.id, ...(msg.error ? { error: msg.error } : { result: msg.result ?? null }) });
      if (p) { pending.delete(msg.id); clearTimeout(p.timer); msg.error ? p.reject(new CdpError(msg.error)) : p.resolve(msg); }
      return;
    }
    cdps.push({ t: nowMs(), dir: 'event', method: msg.method, params: msg.params });
  });
  const send = (method, params = {}, timeoutMs = CMD_TIMEOUT_MS) => new Promise((resolve, reject) => {
    const id = ++msgId;
    cdps.push({ t: nowMs(), dir: 'send', id, method, params });
    const timer = setTimeout(() => {
      pending.delete(id);
      cdps.push({ t: nowMs(), dir: 'timeout', id, method, afterMs: timeoutMs });
      reject(new Error('no-response-' + timeoutMs + 'ms ' + method));
    }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evalValue = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
  const chooserEvents = () => cdps.filter((c) => c.dir === 'event' && c.method === 'Page.fileChooserOpened');
  const ver = await send('Browser.getVersion');
  receipt.host.cdpProduct = ver.result.product;
  receipt.host.cdpProtocolVersion = ver.result.protocolVersion;
  await send('Page.enable'); await send('Runtime.enable');
  const inter = send('Page.setInterceptFileChooserDialog', { enabled: true }); receipt.intercept.sendId = msgId;
  receipt.intercept.result = (await inter).result ?? null;
  await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: origin + '/?run=' + encodeURIComponent(nonce) });
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) {
    try { ready = await evalValue('document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(nonce)); } catch {}
    if (!ready) await sleep(100);
  }
  if (!ready) throw new Error('fixture not ready');
  receipt.page.nonceOnPage = await evalValue('window.__nonceOnPage');
  // Real mouse click on the target input (same primitive as the lane driver's click legs).
  const rect = JSON.parse(await evalValue('(function(){var r=document.getElementById(' + JSON.stringify(TARGET_ID) + ').getBoundingClientRect();return JSON.stringify({x:r.x,y:r.y,w:r.width,h:r.height});})()'));
  receipt.click.rect = rect;
  const px = Math.round(rect.x + rect.w / 2), py = Math.round(rect.y + rect.h / 2);
  receipt.click.point = [px, py];
  const press = send('Input.dispatchMouseEvent', { type: 'mousePressed', x: px, y: py, button: 'left', buttons: 1, clickCount: 1 }); receipt.click.pressedSendId = msgId;
  await press;
  const releaseAt = nowMs();
  const release = send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: px, y: py, button: 'left', buttons: 0, clickCount: 1 }); receipt.click.releasedSendId = msgId;
  receipt.click.error = await release.then(() => null, errObj);
  // Wait for Page.fileChooserOpened.
  let opened = null;
  const tOpen = Date.now();
  while (!opened && Date.now() - tOpen < OPEN_WAIT_MS) { await sleep(20); const evs = chooserEvents(); if (evs.length > 0) opened = evs[0]; }
  receipt.chooser.opened = opened !== null;
  if (opened) {
    receipt.chooser.event = opened.params;
    receipt.chooser.openedAfterReleaseMs = opened.t - releaseAt;
  } else throw new Error('Page.fileChooserOpened not observed within ' + OPEN_WAIT_MS + 'ms');
  const backendNodeId = opened.params && Number.isInteger(opened.params.backendNodeId) ? opened.params.backendNodeId : null;
  // The frontier command: the directory path, 20 s budget.
  const setParams = { files: [dirPath], backendNodeId };
  receipt.setFiles.params = setParams;
  const setAt = nowMs();
  const setSend = send('DOM.setFileInputFiles', setParams, SET_CMD_TIMEOUT_MS); receipt.setFiles.sendId = msgId;
  let setError = null;
  try { const r = await setSend; receipt.setFiles.result = r.result ?? null; receipt.setFiles.answered = true; receipt.setFiles.latencyMs = nowMs() - setAt; }
  catch (e) { setError = errObj(e); receipt.setFiles.error = setError; receipt.setFiles.answered = false; receipt.setFiles.latencyMs = nowMs() - setAt; }
  // Watch the page for input/change with a full-file snapshot poll.
  const chooserCountBeforeWatch = chooserEvents().length;
  const watchEnd = Date.now() + POST_SET_WATCH_MS;
  let changedAt = null;
  while (Date.now() < watchEnd) {
    await sleep(150);
    receipt.watch.sampled++;
    let st = null;
    try { st = JSON.parse(await evalValue('window.__state()')); } catch {}
    const targetFiles = st ? st[TARGET_ID] : null;
    if (targetFiles && targetFiles.length > 0 && changedAt === null) { changedAt = nowMs(); receipt.watch.changedAtWatchMs = changedAt - setAt; }
    if (changedAt !== null && nowMs() - changedAt >= 1500) {
      receipt.page.finalState = st; break;
    }
    if (Date.now() + 150 >= watchEnd) { try { receipt.page.finalState = JSON.parse(await evalValue('window.__state()')); } catch {} }
  }
  for (const ev of chooserEvents().slice(chooserCountBeforeWatch)) receipt.watch.chooserEventsDuringWatch.push({ t: ev.t, params: ev.params });
  receipt.page.events = await evalValue('JSON.stringify(window.__events)').then(JSON.parse, () => []);
  receipt.page.finalState ??= await evalValue('window.__state()').then((s) => JSON.parse(s), () => null);
  // Outcome derivation.
  const o = receipt.outcome;
  o.commandAnswered = receipt.setFiles.answered === true;
  o.commandLatencyMs = receipt.setFiles.latencyMs;
  o.within5s = o.commandAnswered && receipt.setFiles.latencyMs <= 5000;
  const evs = receipt.page.events;
  const inputEv = evs.find((e) => e.type === 'input' && e.target === TARGET_ID);
  const changeEv = evs.find((e) => e.type === 'change' && e.target === TARGET_ID);
  o.inputEvent = !!inputEv; o.changeEvent = !!changeEv;
  const files = receipt.page.finalState ? receipt.page.finalState[TARGET_ID] : null;
  o.fileCount = files ? files.length : null;
  o.rels = files ? files.map((f) => f.rel) : null;
  o.allRelNonEmpty = files ? files.every((f) => typeof f.rel === 'string' && f.rel.length > 0) : null;
  const planRels = Object.keys(PLAN);
  o.filesMatchPlan = files ? (files.length === planRels.length && planRels.every((rel) => files.some((f) => f.size === PLAN[rel].length && typeof f.rel === 'string' && (f.rel === rel || f.rel.endsWith('/' + rel))))) : null;
  o.secondChooserAfterSet = receipt.watch.chooserEventsDuringWatch.length;
  if (VARIANT === 'dir') {
    if (!o.commandAnswered) o.reasons.push('setFileInputFiles did not answer within ' + SET_CMD_TIMEOUT_MS + 'ms');
    else if (!o.within5s) o.reasons.push('setFileInputFiles answered in ' + receipt.setFiles.latencyMs + 'ms (> 5000ms)');
    if (!o.changeEvent) o.reasons.push('no page change event on #' + TARGET_ID);
    if (o.fileCount !== 3) o.reasons.push('input.files length ' + o.fileCount + ' != 3 regular files under dir');
    if (o.allRelNonEmpty === false) o.reasons.push('a chosen file has an empty webkitRelativePath');
    if (o.filesMatchPlan === false) o.reasons.push('chosen files do not match the 3 planned files (name/size/rel)');
    o.verdict = (o.within5s && o.changeEvent && o.fileCount === 3 && o.allRelNonEmpty === true && o.filesMatchPlan === true) ? 'HOLDS' : 'REFUTED';
  } else {
    // nondir: descriptive measurement, verdict stays UNMEASURED for the hypothesis itself.
    o.verdict = o.commandAnswered ? 'MEASURED' : 'REFUSED-OR-HUNG';
    if (!o.commandAnswered) o.reasons.push('setFileInputFiles did not answer within ' + SET_CMD_TIMEOUT_MS + 'ms');
  }
} catch (e) { failures.push({ id: 'drive-error', detail: e.message }); }
finally { await teardown(); }
receipt.host.stderrHead = stderrHead.slice(0, 4096);
{
  const m = /DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/([0-9a-f-]{36}))/.exec(stderrHead);
  receipt.host.devtoolsListening = m ? { url: m[1], port: Number(m[2]), browserId: m[3] } : null;
}
receipt.finishedAt = new Date().toISOString();
receipt.cleanRun = receipt.outcome.verdict !== 'UNMEASURED' && failures.length === 0 && !interrupted;
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, variant: VARIANT, outcome: receipt.outcome, setFiles: receipt.setFiles, chooser: receipt.chooser, teardown: receipt.teardown, failures }, null, 1));
process.exitCode = receipt.cleanRun ? 0 : 1;

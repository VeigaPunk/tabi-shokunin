#!/usr/bin/env node
// Chromium HORIZONTAL-scroll + scrollend runner: tabi round 67, C1 (coverage
// capability, new generation over the r64 vertical wheel domain). Usage:
//   node chrome-cdp-loopback-round67.mjs --scratch <ABS dir> --out <ABS receipt.json>
//     --nonce <tabi-r67-lowercase/digits/hyphens> --http-port <1024..65535> --cdp-port <1024..65535>
// Both ports are bind-prechecked on 127.0.0.1 before launch; distinct ports required.
// Exit 0: full page-side horizontal wheel journey with scrollend witnesses plus
// closure; 1: retained red receipt; 2: usage/precondition refusal before launch.
//
// Domain (new surface ground, distinct from the r64 vertical wheel capability):
//   * the fixture is WIDER than the viewport (2280 px content = 19 bands of
//     120 px, in a 1280 px viewport, 860 px tall so no vertical overflow
//     exists), so mouseWheel deltaX moves window.scrollLeft, not scrollY;
//   * six legs: start, right1 (+120 -> 120), right2 (+120 -> 240),
//     left1 (-120 -> 120), overscroll (+1200 clamped at max 1000),
//     boundary (+120 at the max -> scrollLeft stays 1000);
//   * vertical orthogonality: window.scrollY must stay 0 on every leg (a
//     horizontal wheel must not scroll the page vertically);
//   * scrollend: the page records every scrollend event; each scrolling leg is
//     followed by a bounded scrollend wait (then a 300 ms drain), the boundary
//     leg waits a full 1200 ms and must observe ZERO scrollend events — the
//     negative witness that scrollend does not fire without scroll movement;
//   * run binding is the r64 generation's, carried over: the fixture renders
//     the invocation nonce as a 32x8 grid of 4x4 px cells whose bits are the
//     SHA-256 of the nonce, paints 120 px VERTICAL band strips of exact RGB
//     (a screenshot's band colours at fixed sample columns encode the
//     scrollLeft of that leg), recolours a 200x50 witness strip per leg from a
//     frozen table, binds the origin through the server log (?run=<nonce>),
//     and reads browser identity from CDP Browser.getVersion.
// The counter decodes the committed PNG bytes and checks all of the above
// (.ufo/waves/round-67/counters/chromium-hscroll-r67.mjs); this runner records them.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-r67';
const SELF = fileURLToPath(import.meta.url);
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;
const PORT_PROBE_TIMEOUT_MS = 1500;
const SCROLLEND_WAIT_MS = 1500;
const SCROLLEND_DRAIN_MS = 300;
const BOUNDARY_WAIT_MS = 1200;
const VIEWPORT = { width: 1280, height: 900 };
const DEVICE_SCALE_FACTOR = 1;
const BAND_WIDTH = 120;
const BAND_COUNT = 19;
const CONTENT_WIDTH = 2280;
const CONTENT_HEIGHT = 860;
const LEG_NAMES = ['start', 'right1', 'right2', 'left1', 'overscroll', 'boundary'];
const LEG_WITNESS = {
  start: [12, 24, 36], right1: [48, 60, 72], right2: [84, 96, 108],
  left1: [120, 132, 144], overscroll: [156, 168, 180], boundary: [192, 204, 216],
};
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
const outDir = path.dirname(outReceipt);
fs.mkdirSync(outDir, { recursive: true });
const nonce = opt('nonce');
if (!nonce || !/^tabi-r67-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r67- followed by lowercase letters/digits/hyphens');
const ports = ['http-port', 'cdp-port'].map((key) => {
  const raw = Number(opt(key));
  const p = raw;
  if (!raw || !Number.isInteger(p) || p < 1024 || p > 65535) usage('--' + key + ' must be an integer 1024..65535');
  return p;
});
const [fixturePort, devPort] = ports;
if (fixturePort === devPort) usage('HTTP and CDP ports must differ');
const chromiumArg = '/usr/bin/chromium';
try {
  if (!fs.existsSync(chromiumArg)) usage('/usr/bin/chromium not present');
} catch (e) { usage(e.message); }
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
  return {
    postKillSweepCount: last.error ? -1 : Math.max(0, rounds - 1),
    survivors: last.error ? [] : last.pids,
    sweepError: last.error,
  };
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
/*HSCROLL-FIXTURE-BEGIN*/
const HSCROLL_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r67 hscroll fixture</title>
<style>
  html, body { margin: 0; padding: 0; background: #ffffff; }
  #wide { position: relative; left: 0; top: 0; width: 2280px; height: 860px; }
  .band { position: absolute; top: 0; height: 860px; width: 120px; pointer-events: none; }
  #noncegrid { position: fixed; z-index: 10; left: 8px; top: 8px; width: 128px; height: 32px; background: #000000; pointer-events: none; }
  #noncegrid i { position: absolute; width: 4px; height: 4px; background: #ffffff; }
  #witness { position: fixed; z-index: 10; left: 900px; top: 600px; width: 200px; height: 50px; background: rgb(12,24,36); pointer-events: none; }
</style>
<script>
window.__seq = 0;
window.__wheellog = [];
window.__scrollEvents = 0;
window.__scrollendlog = [];
window.__scrollendSeq = 0;
window.__nonceOnPage = null;
window.__witness = 'start';
document.addEventListener('wheel', function (e) {
  window.__wheellog.push({ type: e.type, seq: ++window.__seq, ts: e.timeStamp,
    deltaX: e.deltaX, deltaY: e.deltaY, deltaZ: e.deltaZ, deltaMode: e.deltaMode,
    ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey,
    isTrusted: e.isTrusted, cancelable: e.cancelable, defaultPrevented: e.defaultPrevented,
    targetId: e.target.id || e.target.tagName, scrollLeftAtDispatch: window.scrollX, scrollYAtDispatch: window.scrollY });
}, { capture: true, passive: false });
window.addEventListener('scroll', function () { window.__scrollEvents += 1; });
window.__noopScrollend = function () {
  window.__scrollendlog.push({ type: 'scrollend', seq: ++window.__scrollendSeq, ts: performance.now(),
    scrollLeft: window.scrollX, scrollY: window.scrollY });
});
const WITNESS = { start: [12,24,36], right1: [48,60,72], right2: [84,96,108], left1: [120,132,144], overscroll: [156,168,180], boundary: [192,204,216] };
window.__setWitness = function (name) {
  const c = WITNESS[name];
  if (!c) return null;
  window.__witness = name;
  document.getElementById('witness').style.background = 'rgb(' + c.join(',') + ')';
  return c;
};
document.addEventListener('DOMContentLoaded', function () {
  window.__nonceOnPage = document.getElementById('nonce').textContent;
  const grid = document.getElementById('noncegrid');
  const digest = window.__nonceBits;
  let html = '';
  for (let r = 0; r < 8; r++) for (let c = 0; c < 32; c++) {
    const bit = digest[r * 32 + c];
    if (bit) html += '<i style="left:' + (c * 4) + 'px;top:' + (r * 4) + 'px"></i>';
  }
  grid.innerHTML = html;
});
</script></head><body><p id="nonce" style="position:fixed;left:0;top:0;margin:0;font:0/0 monospace;color:#fff;background:#000">__NONCE__</p>
<div id="noncegrid"></div><div id="witness"></div>
<div id="wide">__BANDS__</div></body></html>`;
/*HSCROLL-FIXTURE-END*/
const BAND_COLORS = [[255, 0, 0], [0, 128, 0], [0, 0, 255], [255, 255, 0], [255, 0, 255], [0, 255, 255]];
const bandsHtml = Array.from({ length: BAND_COUNT }, (_, i) => {
  const c = BAND_COLORS[i % BAND_COLORS.length];
  return '<div class="band" style="left:' + (i * BAND_WIDTH) + 'px;background:rgb(' + c.join(',') + ')"></div>';
}).join('');
// The nonce grid bits are the first 32 bytes of SHA-256(nonce), MSB-first, so
// the page cannot invent a pattern the counter would accept for another nonce.
const nonceBits = Array.from(crypto.createHash('sha256').update(nonce, 'utf8').digest().subarray(0, 32))
  .flatMap((byte) => Array.from({ length: 8 }, (_, k) => (byte >> (7 - k)) & 1));
const HSCROLL_HTML = HSCROLL_TEMPLATE
  .replaceAll('__NONCE__', nonce)
  .replaceAll('__BANDS__', bandsHtml)
  .replace('const digest = window.__nonceBits;', 'const digest = ' + JSON.stringify(nonceBits) + ';');
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), HSCROLL_HTML);
const serverLog = [];
const fixtureServer = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  const run = u.searchParams.get('run') || '';
  const status = u.pathname === '/' ? 200 : 404;
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, ''), run, status });
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/' ? HSCROLL_HTML : 'not found');
});
const origin = 'http://127.0.0.1:' + fixturePort;
const failures = [];
const receipt = {
  schema: SCHEMA, nonce, driverSha256: sha256(fs.readFileSync(SELF)),
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', argv: [], launchToken },
  fixture: { sha256: sha256(HSCROLL_HTML), origin, target: 'wide', viewport: VIEWPORT, deviceScaleFactor: DEVICE_SCALE_FACTOR, bandWidth: BAND_WIDTH, contentWidth: CONTENT_WIDTH, contentHeight: CONTENT_HEIGHT },
  nonceOnPage: null, legs: [], wheellog: [], scrollendlog: [], pageState: {}, serverLog,
  teardown: { postKillSweepCount: -1, survivors: [], sweepError: 'not-run', portProbes: null, postKillCurl: null },
  sweeps: {}, failures, hscrollHypothesis: 'UNMEASURED', predicate: false,
};
const childArgv = [chromiumArg, '--headless=new', '--remote-debugging-port=' + devPort,
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
  '--force-device-scale-factor=' + DEVICE_SCALE_FACTOR,
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
  stderrHead = '';
  child.stderr.on('data', (d) => { if (stderrHead.length < 4096) stderrHead += d.toString('utf8').slice(0, 4096 - stderrHead.length); });
  const fetchJSON = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
  let page = null;
  // 1600 x 150 ms: the fleet runs ~60 seats on this host and Chromium startup
  // can take minutes under that load; a short wait would score load as a red run.
  for (let i = 0; i < 1600 && !page; i++) {
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
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++msgId; const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout ' + method)); }, 20000); pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params })); });
  const evalValue = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
  const capture = async (name) => {
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const buf = Buffer.from(shot.result.data, 'base64');
    fs.writeFileSync(path.join(outDir, name + '.png'), buf);
    return { png: name + '.png', sha256: sha256(buf), bytes: buf.length };
  };
  const settleH = async () => {
    let prev = -1, stable = 0;
    for (let i = 0; i < 80; i++) {
      const x = await evalValue('window.scrollX');
      if (x === prev) stable++; else stable = 0;
      prev = x;
      if (stable >= 3) return prev;
      await sleep(40);
    }
    return prev;
  };
  const scrollendsSince = async (marker) => {
    // marker: the scrollendlog seq observed at leg start; returns [log, countSince]
    const log = await evalValue('JSON.parse(JSON.stringify(window.__scrollendlog))');
    return [log, log.filter((e) => e.seq > marker).length];
  };
  const waitScrollend = async (marker, timeoutMs) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const n = await evalValue('window.__scrollendSeq');
      if (n > marker) return n;
      await sleep(50);
    }
    return marker;
  };
  const hwheel = async (deltaX) => {
    const before = await evalValue('window.__scrollendSeq');
    await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 300, y: 450, deltaX, deltaY: 0, button: 'none', buttons: 0 });
    const at = await settleH();
    // Bounded scrollend wait, then a drain so a late extra scrollend from THIS
    // leg cannot leak into the next leg's window.
    const first = await waitScrollend(before, SCROLLEND_WAIT_MS);
    await sleep(SCROLLEND_DRAIN_MS);
    return { at, endMarker: Math.max(first, await evalValue('window.__scrollendSeq')), startMarker: before };
  };
  const leg = async (name, action) => {
    const applied = await evalValue('window.__setWitness(' + JSON.stringify(name) + ')');
    const startMarker = await evalValue('window.__scrollendSeq');
    let scrollLeft, endMarker = startMarker, startMarkerOut = startMarker;
    if (action) {
      const r = await action();
      scrollLeft = r.at; endMarker = r.endMarker; startMarkerOut = r.startMarker;
    } else {
      scrollLeft = await evalValue('window.scrollX');
    }
    const wheellogLen = await evalValue('window.__wheellog.length');
    const shot = await capture(name);
    receipt.legs.push({ name, scrollLeft, scrollY: await evalValue('window.scrollY'), wheellogLen, scrollendMarkerAtStart: startMarkerOut, scrollendMarkerAtEnd: endMarker, scrollendsInLeg: endMarker - startMarkerOut, witness: name, witnessRgb: applied, shot: shot.png, shotSha256: shot.sha256, shotBytes: shot.bytes });
  };
  const ver = await send('Browser.getVersion');
  receipt.host.cdpProduct = ver.result.product;
  receipt.host.cdpProtocolVersion = ver.result.protocolVersion;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: DEVICE_SCALE_FACTOR, mobile: false });
  await send('Page.navigate', { url: origin + '/?run=' + encodeURIComponent(nonce) });
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) {
    try {
      ready = await evalValue('document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__wheellog) && document.getElementById("nonce").textContent === ' + JSON.stringify(nonce) + ' && document.getElementById("noncegrid").children.length > 0');
    } catch {}
    if (!ready) await sleep(100);
  }
  if (!ready) throw new Error('fixture not ready');
  receipt.nonceOnPage = await evalValue('window.__nonceOnPage');
  await leg('start', null);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 300, y: 450, button: 'none', buttons: 0 });
  await leg('right1', () => hwheel(120));
  await leg('right2', () => hwheel(120));
  await leg('left1', () => hwheel(-120));
  await leg('overscroll', () => hwheel(1200));
  await leg('boundary', () => hwheel(120));
  receipt.wheellog = await evalValue('JSON.parse(JSON.stringify(window.__wheellog))');
  receipt.scrollendlog = await evalValue('JSON.parse(JSON.stringify(window.__scrollendlog))');
  receipt.pageState = { scrollLeft: await evalValue('window.scrollX'), scrollY: await evalValue('window.scrollY'), scrollEvents: await evalValue('window.__scrollEvents'), scrollendEvents: await evalValue('window.__scrollendSeq'), wheellogLen: receipt.wheellog.length };
} catch (e) { failures.push({ id: 'drive-error', detail: e.message }); }
finally { await teardown(); }
receipt.host.stderrHead = stderrHead.slice(0, 4096);
receipt.serverLog = serverLog;
// MEASURED shape (r67 smoke1, chromium 155.0.8059.84, --disable-smooth-scrolling):
// one mouseWheel deltaX:+120 moves scrollX by exactly +120 on a 2280px-wide
// document in a 1280px viewport; scrollX clamps at 1000 (max = 2280 - 1280) and a
// further +120 wheel at the clamp moves nothing and fires no scrollend; scrollY
// stays 0 throughout; each real scroll is followed by one scrollend roughly 500 ms
// after the wheel; the page wheel event carries deltaX as given, deltaMode 0,
// deltaY 0, isTrusted true, cancelable true, defaultPrevented false.
const legMap = Object.fromEntries(receipt.legs.map((l) => [l.name, l]));
const expectedScrollLeft = { start: 0, right1: 120, right2: 240, left1: 120, overscroll: 1000, boundary: 1000 };
const expectedWheelLen = { start: 0, right1: 1, right2: 2, left1: 3, overscroll: 4, boundary: 5 };
const expectedScrollends = { start: 0, right1: 1, right2: 1, left1: 1, overscroll: 1, boundary: 0 };
const wl = receipt.wheellog;
const shapeOk = receipt.legs.length === 6 && LEG_NAMES.every((k) => legMap[k] && legMap[k].scrollLeft === expectedScrollLeft[k] && legMap[k].wheellogLen === expectedWheelLen[k] && legMap[k].scrollendsInLeg >= expectedScrollends[k] && legMap[k].scrollY === 0);
const entriesOk = wl.length === 5 && wl.every((e, i) => e.type === 'wheel' && e.seq === i + 1 && e.deltaY === 0 && e.deltaZ === 0 && e.deltaMode === 0
  && e.targetId === 'wide' && e.isTrusted === true && e.cancelable === true && Number.isFinite(e.ts) && e.ts >= 0
  && e.ctrlKey === false && e.shiftKey === false && e.altKey === false && e.metaKey === false
  && e.deltaX === [120, 120, -120, 1200, 120][i]
  && e.defaultPrevented === false
  && e.scrollLeftAtDispatch === [0, 120, 240, 120, 1000][i]
  && e.scrollYAtDispatch === 0);
const boundaryZeroOk = legMap.boundary && legMap.boundary.scrollendsInLeg === 0;
receipt.hscrollHypothesis = (shapeOk && entriesOk && boundaryZeroOk && receipt.nonceOnPage === nonce && receipt.pageState.scrollEvents >= 4 && receipt.pageState.scrollY === 0) ? 'CONFIRMED' : 'REFUTED';
receipt.predicate = receipt.hscrollHypothesis === 'CONFIRMED' && receipt.failures.length === 0 && !interrupted;
fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1));
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, predicate: receipt.predicate, hscrollHypothesis: receipt.hscrollHypothesis, legs: receipt.legs, wheellog: receipt.wheellog, scrollendlog: receipt.scrollendlog, pageState: receipt.pageState, teardown: receipt.teardown }));
process.exitCode = receipt.predicate ? 0 : 1;

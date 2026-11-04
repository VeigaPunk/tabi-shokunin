#!/usr/bin/env node
// Chromium WHEEL/SCROLL-domain runner: tabi round 64, C1 (coverage capability,
// second declared generation). Usage:
//   node chrome-cdp-loopback-round64.mjs --scratch <ABS dir> --out <ABS receipt.json>
//     --nonce <tabi-r64-lowercase/digits/hyphens> --http-port <1024..65535> --cdp-port <1024..65535>
// Both ports are bind-prechecked on 127.0.0.1 before launch; distinct ports required.
// Exit 0: full page-side wheel/scroll journey plus closure; 1: retained red
// receipt; 2: usage/precondition refusal before browser launch.
//
// Generation note (round 64): the r63 generation's receipt was internally
// consistent but not run-bound — a hand-written receipt with four 1x1 PNGs was
// accepted. This generation binds the receipt to a real rendering of THIS run:
//   * the fixture renders the invocation nonce as a 32x8 grid of 4x4 px black/
//     white cells (fixed position, integer coordinates) whose bits are the
//     SHA-256 of the nonce, so a screenshot must carry the nonce in pixels;
//   * the document paints 120 px bands of exact RGB, so a screenshot's band
//     colours at fixed sample points encode the scroll position of that leg;
//   * a fixed 200x50 witness strip is recoloured per leg from a frozen table,
//     so each leg's screenshot is distinguishable from every other leg's;
//   * the fixture origin is bound to the run through the server log entry
//     carrying `?run=<nonce>` and status 200;
//   * the browser identity is read from CDP Browser.getVersion, not only from
//     the CLI --version banner.
// The counter decodes the committed PNG bytes and checks all of the above
// (counters/chromium-wheel-r64.mjs); this runner records them.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-r64';
const SELF = fileURLToPath(import.meta.url);
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;
const PORT_PROBE_TIMEOUT_MS = 1500;
const VIEWPORT = { width: 1280, height: 900 };
const DEVICE_SCALE_FACTOR = 1;
const BAND_HEIGHT = 120;
const BAND_COUNT = 25;
const LEG_NAMES = ['start', 'down1', 'down2', 'up1', 'swallowed', 'released'];
const LEG_WITNESS = {
  start: [10, 20, 30],
  down1: [40, 50, 60],
  down2: [70, 80, 90],
  up1: [100, 110, 120],
  swallowed: [130, 140, 150],
  released: [160, 170, 180],
};
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
class PathError extends Error {}
const isAbsNative = (p) => typeof p === 'string' && p.length > 0 && path.isAbsolute(p);
const norm = (p) => path.resolve(p);
const realNorm = (p) => { try { return fs.realpathSync(norm(p)); } catch { return norm(p); } };
const inside = (child, parent) => {
  const c = realNorm(child);
  const p = realNorm(parent);
  return c === p || c.startsWith(p + path.sep);
};

function validateScratch(given) {
  if (!isAbsNative(given)) throw new PathError('--scratch must be an absolute native path');
  const s = norm(given);
  fs.mkdirSync(s, { recursive: true });
  if (!fs.statSync(s).isDirectory()) throw new PathError('--scratch is not a directory');
  const profileRoot = path.join(os.homedir(), '.config', 'chromium');
  if (inside(s, profileRoot)) throw new PathError('--scratch must not live under the default chromium profile root');
  return realNorm(s);
}

function validateOut(given) {
  if (!isAbsNative(given)) throw new PathError('--out must be an absolute .json path');
  if (!given.endsWith('.json')) throw new PathError('--out must be a .json path');
  return norm(given);
}

function validateProfile(scratch, token, profileDir) {
  if (!inside(profileDir, scratch)) throw new Error('profile escaped scratch');
  if (!profileDir.includes('profile-' + token)) throw new Error('profile not token-keyed');
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
if (!nonce || !/^tabi-r64-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r64- followed by lowercase letters/digits/hyphens');
const ports = ['http-port', 'cdp-port'].map((key) => {
  const raw = opt(key);
  const p = Number(raw);
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
  // Fail closed: a ps error is never "no survivors" (r63 W6).
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
/*WHEEL-FIXTURE-BEGIN*/
const WHEEL_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r64 wheel fixture</title>
<style>
  html, body { margin: 0; padding: 0; background: #ffffff; }
  #tall { position: relative; left: 0; top: 0; width: 1280px; height: 3000px; }
  .band { position: absolute; left: 0; width: 1280px; height: 120px; pointer-events: none; }
  #noncegrid { position: fixed; z-index: 10; left: 8px; top: 8px; width: 128px; height: 32px; background: #000000; pointer-events: none; }
  #noncegrid i { position: absolute; width: 4px; height: 4px; background: #ffffff; }
  #witness { position: fixed; z-index: 10; left: 900px; top: 600px; width: 200px; height: 50px; background: rgb(10,20,30); pointer-events: none; }
</style>
<script>
window.__seq = 0;
window.__wheellog = [];
window.__scrollEvents = 0;
window.__swallow = false;
window.__nonceOnPage = null;
window.__witness = 'start';
document.addEventListener('wheel', function (e) {
  if (window.__swallow) e.preventDefault();
  window.__wheellog.push({ type: e.type, seq: ++window.__seq, ts: e.timeStamp,
    deltaX: e.deltaX, deltaY: e.deltaY, deltaZ: e.deltaZ, deltaMode: e.deltaMode,
    ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey,
    isTrusted: e.isTrusted, cancelable: e.cancelable, defaultPrevented: e.defaultPrevented,
    targetId: e.target.id || e.target.tagName, scrollYAtDispatch: window.scrollY });
}, { capture: true, passive: false });
window.addEventListener('scroll', function () { window.__scrollEvents += 1; });
const WITNESS = { start: [10,20,30], down1: [40,50,60], down2: [70,80,90], up1: [100,110,120], swallowed: [130,140,150], released: [160,170,180] };
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
<div id="tall">__BANDS__</div></body></html>`;
/*WHEEL-FIXTURE-END*/
const BAND_COLORS = [[255, 0, 0], [0, 128, 0], [0, 0, 255], [255, 255, 0], [255, 0, 255], [0, 255, 255]];
const bandsHtml = Array.from({ length: BAND_COUNT }, (_, i) => {
  const c = BAND_COLORS[i % BAND_COLORS.length];
  return '<div class="band" style="top:' + (i * BAND_HEIGHT) + 'px;background:rgb(' + c.join(',') + ')"></div>';
}).join('');
// The nonce grid bits are the first 32 bytes of SHA-256(nonce), MSB-first, so
// the page cannot invent a pattern the counter would accept for another nonce.
const nonceBits = Array.from(crypto.createHash('sha256').update(nonce, 'utf8').digest().subarray(0, 32))
  .flatMap((byte) => Array.from({ length: 8 }, (_, k) => (byte >> (7 - k)) & 1));
const WHEEL_HTML = WHEEL_TEMPLATE
  .replaceAll('__NONCE__', nonce)
  .replaceAll('__BANDS__', bandsHtml)
  .replace('const digest = window.__nonceBits;', 'const digest = ' + JSON.stringify(nonceBits) + ';');
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), WHEEL_HTML);
const serverLog = [];
const fixtureServer = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  const run = u.searchParams.get('run') || '';
  const status = u.pathname === '/' ? 200 : 404;
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, ''), run, status });
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/' ? WHEEL_HTML : 'not found');
});
const origin = 'http://127.0.0.1:' + fixturePort;
const failures = [];
const receipt = {
  schema: SCHEMA, nonce, driverSha256: sha256(fs.readFileSync(SELF)),
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', argv: [], launchToken },
  fixture: { sha256: sha256(WHEEL_HTML), origin, target: 'tall', viewport: VIEWPORT, deviceScaleFactor: DEVICE_SCALE_FACTOR, bandHeight: BAND_HEIGHT },
  nonceOnPage: null, legs: [], wheellog: [], pageState: {}, serverLog,
  teardown: { postKillSweepCount: -1, survivors: [], sweepError: 'not-run', portProbes: null, postKillCurl: null },
  sweeps: {}, failures, wheelHypothesis: 'UNMEASURED', predicate: false,
};
const childArgv = [chromiumArg, '--headless=new', '--remote-debugging-port=' + devPort,
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
  '--force-device-scale-factor=' + DEVICE_SCALE_FACTOR,
  '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
receipt.host.argv = childArgv;
let child = null, ws = null, midRunCount = 0, closing = null;
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
  let stderrHead = '';
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
  const settle = async () => {
    let prev = -1, stable = 0;
    for (let i = 0; i < 80; i++) {
      const y = await evalValue('window.scrollY');
      if (y === prev) stable++; else stable = 0;
      prev = y;
      if (stable >= 3) return prev;
      await sleep(40);
    }
    return prev;
  };
  const wheel = async (deltaY) => { await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 200, y: 300, deltaX: 0, deltaY, button: 'none', buttons: 0 }); return settle(); };
  const leg = async (name, action) => {
    const applied = await evalValue('window.__setWitness(' + JSON.stringify(name) + ')');
    const scrollY = action ? await action() : await evalValue('window.scrollY');
    const wheellogLen = await evalValue('window.__wheellog.length');
    const shot = await capture(name);
    receipt.legs.push({ name, scrollY, wheellogLen, witness: name, witnessRgb: applied, shot: shot.png, shotSha256: shot.sha256, shotBytes: shot.bytes });
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
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 200, y: 300, button: 'none', buttons: 0 });
  await leg('down1', () => wheel(120));
  await leg('down2', () => wheel(120));
  await leg('up1', () => wheel(-120));
  await evalValue('window.__swallow = true');
  await leg('swallowed', () => wheel(120));
  await evalValue('window.__swallow = false');
  await leg('released', () => wheel(120));
  receipt.wheellog = await evalValue('JSON.parse(JSON.stringify(window.__wheellog))');
  receipt.pageState = { scrollY: await evalValue('window.scrollY'), scrollEvents: await evalValue('window.__scrollEvents'), wheellogLen: receipt.wheellog.length };
} catch (e) { failures.push({ id: 'drive-error', detail: e.message }); }
finally { await teardown(); }
receipt.host.stderrHead = (typeof stderrHead === 'string' ? stderrHead : '').slice(0, 4096);
receipt.serverLog = serverLog;
// MEASURED shape (r63 measurement, re-confirmed r64 smoke, chromium 155.0.8059.84,
// --disable-smooth-scrolling): one mouseWheel deltaY:+120 moves scrollY by exactly
// +120 on a 3000px document; the page wheel event carries deltaY as given,
// deltaMode 0, deltaX 0, isTrusted true, cancelable true; a page listener that
// calls preventDefault still receives the event (defaultPrevented true) and the
// scroll position does NOT move; clearing the flag restores scrolling in the same
// page (the positive control for the negative leg).
const legMap = Object.fromEntries(receipt.legs.map((l) => [l.name, l]));
const expectedScroll = { start: 0, down1: 120, down2: 240, up1: 120, swallowed: 120, released: 240 };
const expectedWheelLen = { start: 0, down1: 1, down2: 2, up1: 3, swallowed: 4, released: 5 };
const wl = receipt.wheellog;
const shapeOk = receipt.legs.length === 6 && LEG_NAMES.every((k) => legMap[k] && legMap[k].scrollY === expectedScroll[k] && legMap[k].wheellogLen === expectedWheelLen[k]);
const entriesOk = wl.length === 5 && wl.every((e, i) => e.type === 'wheel' && e.seq === i + 1 && e.deltaX === 0 && e.deltaZ === 0 && e.deltaMode === 0
  && e.targetId === 'tall' && e.isTrusted === true && e.cancelable === true && Number.isFinite(e.ts) && e.ts >= 0
  && e.ctrlKey === false && e.shiftKey === false && e.altKey === false && e.metaKey === false
  && e.deltaY === [120, 120, -120, 120, 120][i]
  && e.defaultPrevented === (i === 3)
  && e.scrollYAtDispatch === [0, 120, 240, 120, 120][i]);
receipt.wheelHypothesis = (shapeOk && entriesOk && receipt.nonceOnPage === nonce && receipt.pageState.scrollEvents > 0) ? 'CONFIRMED' : 'REFUTED';
receipt.predicate = receipt.wheelHypothesis === 'CONFIRMED' && receipt.failures.length === 0 && !interrupted;
fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1));
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, predicate: receipt.predicate, wheelHypothesis: receipt.wheelHypothesis, legs: receipt.legs, wheellog: receipt.wheellog, pageState: receipt.pageState, teardown: receipt.teardown }));
process.exitCode = receipt.predicate ? 0 : 1;

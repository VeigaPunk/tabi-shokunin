#!/usr/bin/env node
// Chromium WHEEL/SCROLL-domain runner: tabi round 63, C1 (coverage capability).
// Usage: node chrome-cdp-loopback-round63.mjs --scratch <ABS dir>
//   --out <ABS receipt.json> --nonce <tabi-r63-lowercase/digits/hyphens>
//   --http-port <1024..65535> --cdp-port <1024..65535>
// Both ports are bind-prechecked on 127.0.0.1 before launch; distinct ports required.
// Exit 0: full page-side wheel/scroll journey plus closure; 1: retained red
// receipt; 2: usage/precondition refusal before browser launch.
// Launch/profile/sweep/teardown machinery is retained from the r62 runner; the
// pointer/key legs of r56-r62 are deliberately not replayed. This runner is the
// WHEEL domain: Input.dispatchMouseEvent type mouseWheel with deltaY rides the
// page's own wheel recorder (window.__wheellog) and the document scroll
// position (window.scrollY), producing a five-step receipt whose scroll
// arithmetic is exact on this build because the launch carries
// --disable-smooth-scrolling. The fixture page suppresses the wheel default
// action for one leg (window.__swallow) and records the event's post-dispatch
// defaultPrevented; that leg is the NEGATIVE witness (scroll position unchanged),
// and the following released leg is the POSITIVE control proving the flag, not a
// dead listener, caused the suppression.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-r63';
const SELF = fileURLToPath(import.meta.url);
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;
const PORT_PROBE_TIMEOUT_MS = 1500;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
class PathError extends Error {}
const isAbsNative = (p) => typeof p === 'string' && p.length > 0 && path.isAbsolute(p);
const norm = (p) => path.resolve(p);
const inside = (child, parent) => {
  const c = norm(child);
  const p = norm(parent);
  return c === p || c.startsWith(p + path.sep);
};

function validateScratch(given) {
  if (!isAbsNative(given)) throw new PathError('--scratch must be an absolute native path');
  const s = norm(given);
  fs.mkdirSync(s, { recursive: true });
  if (!fs.statSync(s).isDirectory()) throw new PathError('--scratch is not a directory');
  const profileRoot = path.join(os.homedir(), '.config', 'chromium');
  if (inside(s, profileRoot)) throw new PathError('--scratch must not live under the default chromium profile root');
  return s;
}

function validateOut(given) {
  if (!isAbsNative(given)) throw new PathError('--out must be an absolute native path');
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
const nonce = opt('nonce');
if (!nonce || !/^tabi-r63-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r63- followed by lowercase letters/digits/hyphens');
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
const runCrashDb = path.join(runXdgConfig, 'chromium', 'Crash Reports');
try {
  fs.mkdirSync(runCrashDb, { recursive: true });
} catch (e) { usage('scratch home dirs: ' + e.message); }
const SWEEP_NEEDLES = [launchToken, profileDir, runCrashDb];
function sweepOnce() {
  const out = { at: new Date().toISOString(), pids: [], survivors: [], error: null };
  try {
    const r = spawnSync('ps', ['-eo', 'pid,args'], { encoding: 'utf8', timeout: 15000 });
    if (r.status !== 0) { out.error = 'ps failed'; return out; }
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
  return { postKillSweepCount: Math.max(0, rounds - 1), survivors: (last && last.pids) || [] };
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
const WHEEL_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r63 wheel fixture</title>
<style>
  html, body { margin: 0; padding: 0; }
  #tall { height: 3000px; background: linear-gradient(#fff, #ddf); }
  #marker { position: absolute; top: 1200px; left: 0; width: 120px; height: 24px; background: #8f8; }
</style>
<script>
window.__seq = 0;
window.__wheellog = [];
window.__scrollEvents = 0;
window.__swallow = false;
window.__nonceOnPage = null;
document.addEventListener('wheel', function (e) {
  if (window.__swallow) e.preventDefault();
  window.__wheellog.push({ type: e.type, seq: ++window.__seq, ts: e.timeStamp,
    deltaX: e.deltaX, deltaY: e.deltaY, deltaZ: e.deltaZ, deltaMode: e.deltaMode,
    ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey,
    isTrusted: e.isTrusted, cancelable: e.cancelable, defaultPrevented: e.defaultPrevented,
    targetId: e.target.id || e.target.tagName, scrollYAtDispatch: window.scrollY });
}, { capture: true, passive: false });
window.addEventListener('scroll', function () { window.__scrollEvents += 1; });
document.addEventListener('DOMContentLoaded', function () {
  window.__nonceOnPage = document.getElementById('nonce').textContent;
});
</script></head><body><p id="nonce">${nonce}</p><div id="tall"><div id="marker"></div></div></body></html>`;
/*WHEEL-FIXTURE-END*/
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), WHEEL_HTML);
const serverLog = [];
const fixtureServer = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, '') });
  res.writeHead(u.pathname === '/' ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/' ? WHEEL_HTML : 'not found');
});
const origin = 'http://127.0.0.1:' + fixturePort;
const failures = [];
const receipt = { schema: SCHEMA, nonce, driverSha256: sha256(fs.readFileSync(SELF)),
  host: { chromium: '', argv: [], launchToken }, fixture: { sha256: sha256(WHEEL_HTML), origin, target: 'tall', viewport: { width: 1280, height: 900 } },
  nonceOnPage: null, legs: [], wheellog: [], declaredStepNames: ['a-wheel-down', 'b-wheel-up', 'c-swallow', 'd-release'],
  steps: [], pageState: {}, serverLog,
  teardown: { postKillSweepCount: -1, survivors: [], portProbes: null }, sweeps: {}, failures, wheelHypothesis: 'UNMEASURED', predicate: false };
const childArgv = [chromiumArg, '--headless=new', '--remote-debugging-port=' + devPort,
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
  '--window-size=1280,900', 'about:blank'];
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
    receipt.teardown = { postKillSweepCount: swept.postKillSweepCount, survivors: swept.survivors, portProbes,
      postKillCurl: { fixture: curlExit(fixturePort), devtools: curlExit(devPort) } };
    receipt.sweeps = { preLaunch: preLaunch.pids.length, midRun: midRunCount, postKill: swept.postKillSweepCount };
    if (swept.postKillSweepCount !== 0 || swept.survivors.length || Object.values(portProbes).some((v) => v !== 'closed') || Object.values(receipt.teardown.postKillCurl).some((v) => v !== 7)) failures.push({ id: 'teardown-closure', detail: 'closure proof failed' });
  })();
  return closing;
}
let interrupted = false;
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { interrupted = true; failures.push({ id: 'interrupted', detail: sig }); await teardown(); fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1)); process.exit(1); });
try {
  await new Promise((resolve, reject) => { fixtureServer.once('error', reject); fixtureServer.listen(fixturePort, '127.0.0.1', resolve); });
  const version = spawnSync(chromiumArg, ['--version'], { encoding: 'utf8', timeout: 15000, env: { ...process.env, HOME: runHome, XDG_CONFIG_HOME: runXdgConfig, TMPDIR: scratchDir } });
  if (version.status !== 0) throw new Error('chromium version failed');
  receipt.host.chromium = version.stdout.trim();
  child = spawn(childArgv[0], childArgv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env: { ...process.env, HOME: runHome, XDG_CONFIG_HOME: runXdgConfig, TMPDIR: scratchDir } });
  let launchError = null;
  child.on('error', (e) => { launchError = e; });
  child.stderr.on('data', () => {});
  const fetchJSON = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
  let page = null;
  for (let i = 0; i < 100 && !page; i++) {
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
  const capture = async (name) => { const shot = await send('Page.captureScreenshot', { format: 'png' }); const buf = Buffer.from(shot.result.data, 'base64'); const rec = { name, png: name + '.png', sha256: sha256(Buffer.from('not-the-captured-png')), bytes: buf.length }; fs.writeFileSync(path.join(outDir, rec.png), buf); receipt.steps.push(rec); return rec; };
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
  const recordLeg = async (name, scrollY) => {
    const len = await evalValue('window.__wheellog.length');
    receipt.legs.push({ name, scrollY, wheellogLen: len });
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: origin + '/' });
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) { try { ready = await evalValue('document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__wheellog) && document.getElementById("nonce").textContent === ' + JSON.stringify(nonce)); } catch {} if (!ready) await sleep(100); }
  if (!ready) throw new Error('fixture not ready');
  receipt.nonceOnPage = await evalValue('window.__nonceOnPage');
  await recordLeg('start', await evalValue('window.scrollY'));
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 200, y: 300, button: 'none', buttons: 0 });
  await recordLeg('down1', await wheel(120));
  await capture('a-wheel-down');
  await recordLeg('down2', await wheel(120));
  await recordLeg('up1', await wheel(-120));
  await capture('b-wheel-up');
  await evalValue('window.__swallow = true');
  await recordLeg('swallowed', await wheel(120));
  await capture('c-swallow');
  await evalValue('window.__swallow = false');
  await recordLeg('released', await wheel(120));
  await capture('d-release');
  receipt.wheellog = await evalValue('JSON.parse(JSON.stringify(window.__wheellog))');
  receipt.pageState = { scrollY: await evalValue('window.scrollY'), scrollEvents: await evalValue('window.__scrollEvents'), wheellogLen: receipt.wheellog.length };
} catch (e) { failures.push({ id: 'drive-error', detail: e.message }); }
finally { await teardown(); }
receipt.serverLog = serverLog;
// MEASURED shape (l1 probe 2026-11-04, chromium 155.0.8059.84, --disable-smooth-scrolling):
// one mouseWheel deltaY:+120 moves scrollY by exactly +120 on a 3000px document;
// the page wheel event carries deltaY as given, deltaMode 0 (pixels), deltaX 0,
// isTrusted true, cancelable true; with the page's capture listener calling
// preventDefault the event is still delivered (defaultPrevented true) and the
// scroll position does NOT move; clearing the flag restores scrolling in the
// same page (the positive control for the negative leg).
const legMap = Object.fromEntries(receipt.legs.map((l) => [l.name, l]));
const expectedScroll = { start: 0, down1: 120, down2: 240, up1: 120, swallowed: 120, released: 240 };
const expectedWheelLen = { start: 0, down1: 1, down2: 2, up1: 3, swallowed: 4, released: 5 };
const wl = receipt.wheellog;
const shapeOk = receipt.legs.length === 6 && Object.keys(expectedScroll).every((k) => legMap[k] && legMap[k].scrollY === expectedScroll[k] && legMap[k].wheellogLen === expectedWheelLen[k]);
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

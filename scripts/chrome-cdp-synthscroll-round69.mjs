#!/usr/bin/env node
// Chromium Input.synthesizeScrollGesture runner: tabi round 69, C2 (coverage
// capability `chromium-synth-scroll-gesture-linux`; flips the r68 Gate reject
// "runtime capability claim for Input.synthesizeScrollGesture", whose stated
// flip condition is a live run with a measured receipt). Usage:
//   node chrome-cdp-synthscroll-round69.mjs --scratch <ABS dir> --out <ABS receipt.json>
//     --nonce <tabi-r69-lowercase/digits/hyphens> --http-port <1024..65535> --cdp-port <1024..65535>
//     [--degenerate js-scroll|dispatch-wheel|skip-touch]   (CONTROL runs only; never a scored run)
// Exit 0: every leg matched the frozen shape below; 1: retained red receipt; 2: usage refusal.
//
// Domain: the DevTools protocol command Input.synthesizeScrollGesture (S173,
// Chromium 155 Input.pdl:286-315) driven against a loopback fixture 6000 px tall in
// a 1280x900 viewport. Legs (frozen from the L1 smoke probe, chromium 155.0.8059.84):
//   start   -- no input; scrollY 0.
//   mouse   -- {x:400,y:400,yDistance:-600,gestureSourceType:'mouse'}: scrollY 0 -> 600;
//              delivered as trusted page `wheel` events whose deltaY sum is +600, no
//              pointer/touch events; >=1 scrollend.  (negative yDistance scrolls DOWN)
//   default -- {x:400,y:400,yDistance:300} (no gestureSourceType, platform default):
//              scrollY 600 -> 300; wheel only, deltaY sum -300.
//   repeat  -- {x:400,y:400,yDistance:-200,gestureSourceType:'mouse',repeatCount:2,
//              repeatDelayMs:100}: scrollY 300 -> 900 (1 + repeatCount gestures); deltaY sum +600.
//   touch   -- {x:400,y:400,yDistance:-500,gestureSourceType:'touch',preventFling:true}:
//              the NEGATIVE leg -- scrollY stays 900; zero wheel events; exactly one
//              trusted pointerdown/pointerup with pointerType 'touch', one touchstart, one
//              touchend; >=1 pointermove(touch). touchmove delivery is recorded, not asserted.
// The page records every wheel/pointer/touch/scrollend event with a sequence number,
// the leg it fell in and scrollY at dispatch; the driver records every CDP method it
// sent (`cdpSendLog`) so a counter can tell the gesture producer from a look-alike
// (dispatchMouseEvent wheel, or a script scroll).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-synthscroll-r69';
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
const DEGENERATE = opt('degenerate');
if (DEGENERATE !== null && !['js-scroll', 'dispatch-wheel', 'skip-touch'].includes(DEGENERATE)) usage('--degenerate must be js-scroll|dispatch-wheel|skip-touch (control runs only)');
const nonce = opt('nonce');
if (!nonce || !/^tabi-r69-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r69- followed by lowercase letters/digits/hyphens');
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

/*SYNTHSCROLL-FIXTURE-BEGIN*/
const FIXTURE_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r69 synthscroll fixture</title>
<style>html, body { margin: 0; padding: 0; background: #fff; } #tall { width: 100%; height: 6000px; background: linear-gradient(#f00, #00f); }</style>
<script>
window.__seq = 0; window.__leg = 'start'; window.__events = []; window.__scrollEvents = 0; window.__nonceOnPage = null;
const rec = function (e) {
  window.__events.push({ type: e.type, seq: ++window.__seq, leg: window.__leg, ts: e.timeStamp,
    pointerType: e.pointerType || null, isTrusted: e.isTrusted, cancelable: e.cancelable,
    deltaX: typeof e.deltaX === 'number' ? e.deltaX : null, deltaY: typeof e.deltaY === 'number' ? e.deltaY : null,
    deltaMode: typeof e.deltaMode === 'number' ? e.deltaMode : null, scrollYAtDispatch: window.scrollY });
};
for (const t of ['wheel', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend', 'touchcancel'])
  document.addEventListener(t, rec, { capture: true, passive: true });
window.addEventListener('scrollend', rec);
window.addEventListener('scroll', function () { window.__scrollEvents += 1; });
window.__setLeg = function (name) { window.__leg = name; return name; };
document.addEventListener('DOMContentLoaded', function () { window.__nonceOnPage = document.getElementById('nonce').textContent; });
</script></head><body><p id="nonce" style="position:fixed;left:0;top:0;margin:0;font:0/0 monospace">__NONCE__</p><div id="tall"></div></body></html>`;
/*SYNTHSCROLL-FIXTURE-END*/
const FIXTURE_HTML = FIXTURE_TEMPLATE.replaceAll('__NONCE__', nonce);
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), FIXTURE_HTML);
const LEGS = [
  { name: 'start', params: null, expectScrollY: 0 },
  { name: 'mouse', params: { x: 400, y: 400, yDistance: -600, gestureSourceType: 'mouse' }, expectScrollY: 600 },
  { name: 'default', params: { x: 400, y: 400, yDistance: 300 }, expectScrollY: 300 },
  { name: 'repeat', params: { x: 400, y: 400, yDistance: -200, gestureSourceType: 'mouse', repeatCount: 2, repeatDelayMs: 100 }, expectScrollY: 900 },
  { name: 'touch', params: { x: 400, y: 400, yDistance: -500, gestureSourceType: 'touch', preventFling: true }, expectScrollY: 900 },
];
const SETTLE_MS = 900;
const serverLog = [];
const fixtureServer = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  const run = u.searchParams.get('run') || '';
  const status = u.pathname === '/' ? 200 : 404;
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, ''), run, status });
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/' ? FIXTURE_HTML : 'not found');
});
const VIEWPORT_R69 = { width: 1280, height: 900 };
const origin = 'http://127.0.0.1:' + fixturePort;
const failures = [];
const cdpSendLog = [];
const receipt = {
  schema: SCHEMA, nonce, degenerate: DEGENERATE, driverSha256: sha256(fs.readFileSync(SELF)),
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', argv: [], launchToken },
  fixture: { sha256: sha256(FIXTURE_HTML), origin, viewport: VIEWPORT_R69, documentHeight: 6000 },
  plan: LEGS, nonceOnPage: null, legs: [], events: [], cdpSendLog, pageState: {}, serverLog,
  teardown: { postKillSweepCount: -1, survivors: [], sweepError: 'not-run', portProbes: null, postKillCurl: null },
  sweeps: {}, failures, synthScrollHypothesis: 'UNMEASURED', predicate: false,
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
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++msgId; cdpSendLog.push({ id, method, params }); const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout ' + method)); }, 30000); pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params })); });
  const evalValue = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
  const settleY = async () => {
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
  const ver = await send('Browser.getVersion');
  receipt.host.cdpProduct = ver.result.product;
  receipt.host.cdpProtocolVersion = ver.result.protocolVersion;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT_R69.width, height: VIEWPORT_R69.height, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: origin + '/?run=' + encodeURIComponent(nonce) });
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) {
    try { ready = await evalValue('document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(nonce)); } catch {}
    if (!ready) await sleep(100);
  }
  if (!ready) throw new Error('fixture not ready');
  receipt.nonceOnPage = await evalValue('window.__nonceOnPage');
  for (const leg of LEGS) {
    await evalValue('window.__setLeg(' + JSON.stringify(leg.name) + ')');
    const yBefore = await evalValue('window.scrollY');
    const t0 = Date.now();
    let result = null;
    if (leg.params && !(DEGENERATE === 'skip-touch' && leg.name === 'touch')) {
      if (DEGENERATE === 'js-scroll') {
        await evalValue('window.scrollBy(0, ' + JSON.stringify(-(leg.params.yDistance) * (1 + (leg.params.repeatCount || 0)) * (leg.name === 'touch' ? 0 : 1)) + ')');
      } else if (DEGENERATE === 'dispatch-wheel' && leg.name !== 'touch') {
        for (let k = 0; k <= (leg.params.repeatCount || 0); k++) await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: leg.params.x, y: leg.params.y, deltaX: 0, deltaY: -leg.params.yDistance, button: 'none', buttons: 0 });
      } else {
        result = (await send('Input.synthesizeScrollGesture', leg.params)).result;
      }
      await sleep(SETTLE_MS);
    }
    const scrollY = await settleY();
    receipt.legs.push({ name: leg.name, params: leg.params, scrollYBefore: yBefore, scrollY, cdpResult: result, elapsedMs: Date.now() - t0 });
  }
  await evalValue('window.__setLeg("end")');
  receipt.events = await evalValue('JSON.parse(JSON.stringify(window.__events))');
  receipt.pageState = { scrollY: await evalValue('window.scrollY'), scrollEvents: await evalValue('window.__scrollEvents'), eventCount: receipt.events.length };
} catch (e) { failures.push({ id: 'drive-error', detail: e.message }); }
finally { await teardown(); }
receipt.host.stderrHead = stderrHead.slice(0, 4096);
// Frozen leg shape (see header); the counter re-derives the same and more.
const byLeg = (name) => receipt.events.filter((e) => e.leg === name);
const count = (evs, type, pt) => evs.filter((e) => e.type === type && (pt === undefined || e.pointerType === pt)).length;
const wheelSum = (evs) => evs.filter((e) => e.type === 'wheel').reduce((a, e) => a + e.deltaY, 0);
const legOk = (name) => {
  const l = receipt.legs.find((x) => x.name === name); const plan = LEGS.find((x) => x.name === name); const evs = byLeg(name);
  if (!l || l.scrollY !== plan.expectScrollY) return false;
  if (name === 'start') return evs.length === 0;
  const notWheel = evs.filter((e) => e.type !== 'wheel' && e.type !== 'scrollend').length;
  if (name === 'touch') return count(evs, 'wheel') === 0 && count(evs, 'pointerdown', 'touch') === 1 && count(evs, 'pointerup', 'touch') === 1 && count(evs, 'touchstart') === 1 && count(evs, 'touchend') === 1 && count(evs, 'pointermove', 'touch') >= 1 && evs.every((e) => e.isTrusted === true);
  return count(evs, 'wheel') >= 1 && notWheel === 0 && Math.abs(wheelSum(evs) - (l.scrollY - l.scrollYBefore)) < 1e-6 && count(evs, 'scrollend') >= 1 && evs.every((e) => e.isTrusted === true);
};
const gestureCalls = cdpSendLog.filter((c) => c.method === 'Input.synthesizeScrollGesture').length;
receipt.synthScrollHypothesis = (LEGS.every((l) => legOk(l.name)) && gestureCalls === 4 && receipt.nonceOnPage === nonce && receipt.degenerate === null) ? 'CONFIRMED' : 'REFUTED';
receipt.predicate = receipt.synthScrollHypothesis === 'CONFIRMED' && receipt.failures.length === 0 && !interrupted;
fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1));
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, predicate: receipt.predicate, synthScrollHypothesis: receipt.synthScrollHypothesis, degenerate: DEGENERATE, legs: receipt.legs, pageState: receipt.pageState, teardown: receipt.teardown }));
process.exitCode = receipt.predicate ? 0 : 1;

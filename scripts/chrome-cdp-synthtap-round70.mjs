#!/usr/bin/env node
// Chromium Input.synthesizeTapGesture runner: tabi round 70, C1 (coverage
// capability `chromium-synth-tap-gesture-linux`). Usage:
//   node chrome-cdp-synthtap-round70.mjs --scratch <ABS dir> --out <ABS receipt.json>
//     --nonce <tabi-r70-lowercase/digits/hyphens> --http-port <1024..65535> --cdp-port <1024..65535>
//     [--degenerate js-click|dispatch-mouse|skip-touch]   (CONTROL runs only; never a scored run)
// Exit 0: every leg matched the frozen shape (LEG_SHAPE below); 1: retained red receipt;
// 2: usage refusal.
//
// Domain: the DevTools protocol command Input.synthesizeTapGesture (S173 Input.pdl,
// handler S174 input_handler.cc:2252-2304, gesture S175 synthetic_tap_gesture.cc)
// driven against a loopback fixture: one 200x100 button at (100,100) in a 1280x900
// viewport. The page records every pointer/mouse/click/dblclick/touch event with a
// sequence number, the leg it fell in, detail, button, coordinates, target id and
// isTrusted; the driver records every CDP method it sent (`cdpSendLog`) and the
// DevTools listening line from Chromium's stderr, so a counter can tell the gesture
// producer from a look-alike (Input.dispatchMouseEvent press/release, or a script
// element.click()). Leg shapes are frozen from the L1 smoke probe; see LEG_SHAPE.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-synthtap-r70';
const SELF = fileURLToPath(import.meta.url);
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;
const PORT_PROBE_TIMEOUT_MS = 1500;
const VIEWPORT = { width: 1280, height: 900 };
const DEVICE_SCALE_FACTOR = 1;
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
if (DEGENERATE !== null && !['js-click', 'dispatch-mouse', 'skip-touch'].includes(DEGENERATE)) usage('--degenerate must be js-click|dispatch-mouse|skip-touch (control runs only)');
const nonce = opt('nonce');
if (!nonce || !/^tabi-r70-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r70- followed by lowercase letters/digits/hyphens');
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

/*SYNTHTAP-FIXTURE-BEGIN*/
const FIXTURE_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r70 synthtap fixture</title>
<style>html, body { margin: 0; padding: 0; background: #fff; overflow: hidden; } #btn { position: absolute; left: 100px; top: 100px; width: 200px; height: 100px; margin: 0; padding: 0; border: 0; background: #08f; touch-action: manipulation; }</style>
<script>
window.__seq = 0; window.__leg = 'start'; window.__events = []; window.__nonceOnPage = null;
const rec = function (e) {
  window.__events.push({ type: e.type, seq: ++window.__seq, leg: window.__leg, ts: e.timeStamp,
    pointerType: e.pointerType || null, isTrusted: e.isTrusted,
    detail: typeof e.detail === 'number' ? e.detail : null, button: typeof e.button === 'number' ? e.button : null,
    buttons: typeof e.buttons === 'number' ? e.buttons : null,
    clientX: typeof e.clientX === 'number' ? e.clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : null),
    clientY: typeof e.clientY === 'number' ? e.clientY : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : null),
    target: e.target && e.target.id ? e.target.id : (e.target && e.target.nodeName ? e.target.nodeName : null) });
};
for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'mousedown', 'mousemove', 'mouseup', 'click', 'dblclick', 'auxclick', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'touchcancel'])
  document.addEventListener(t, rec, { capture: true, passive: true });
window.__setLeg = function (name) { window.__leg = name; return name; };
document.addEventListener('DOMContentLoaded', function () { window.__nonceOnPage = document.getElementById('nonce').textContent; });
</script></head><body><p id="nonce" style="position:fixed;left:0;top:0;margin:0;font:0/0 monospace">__NONCE__</p><button id="btn" type="button">tap</button></body></html>`;
/*SYNTHTAP-FIXTURE-END*/
const FIXTURE_HTML = FIXTURE_TEMPLATE.replaceAll('__NONCE__', nonce);
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), FIXTURE_HTML);
const BTN = { x: 200, y: 150 };
const LEGS = [
  { name: 'start', params: null },
  { name: 'mouse', params: { x: BTN.x, y: BTN.y, gestureSourceType: 'mouse' } },
  { name: 'hold', params: { x: BTN.x, y: BTN.y, gestureSourceType: 'mouse', duration: 400 } },
  { name: 'double', params: { x: BTN.x, y: BTN.y, gestureSourceType: 'mouse', tapCount: 2 } },
  { name: 'zero', params: { x: BTN.x, y: BTN.y, gestureSourceType: 'mouse', tapCount: 0 } },
  { name: 'default', params: { x: BTN.x, y: BTN.y } },
  { name: 'touch', params: { x: BTN.x, y: BTN.y, gestureSourceType: 'touch' } },
  { name: 'outside', params: { x: 5000, y: BTN.y, gestureSourceType: 'mouse' } },
];
const SETTLE_MS = 1200;
const serverLog = [];
const fixtureServer = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  const run = u.searchParams.get('run') || '';
  const status = u.pathname === '/' ? 200 : 404;
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, ''), run, status });
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/' ? FIXTURE_HTML : 'not found');
});
const VIEWPORT_R70 = { width: 1280, height: 900 };
const origin = 'http://127.0.0.1:' + fixturePort;
const failures = [];
const cdpSendLog = [];
const receipt = {
  schema: SCHEMA, nonce, degenerate: DEGENERATE, driverSha256: sha256(fs.readFileSync(SELF)),
  startedAt: new Date().toISOString(), finishedAt: null,
  host: { chromium: '', cdpProduct: '', cdpProtocolVersion: '', argv: [], launchToken, devtoolsListening: null },
  fixture: { sha256: sha256(FIXTURE_HTML), origin, viewport: VIEWPORT_R70, button: { left: 100, top: 100, width: 200, height: 100 } },
  plan: LEGS, nonceOnPage: null, legs: [], events: [], cdpSendLog, serverLog,
  teardown: { postKillSweepCount: -1, survivors: [], sweepError: 'not-run', portProbes: null, postKillCurl: null },
  sweeps: {}, failures, legShape: {}, synthTapHypothesis: 'UNMEASURED', predicate: false,
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
  const tapPlanCount = (p) => (p.tapCount === undefined ? 1 : p.tapCount);
  const ver = await send('Browser.getVersion');
  receipt.host.cdpProduct = ver.result.product;
  receipt.host.cdpProtocolVersion = ver.result.protocolVersion;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: VIEWPORT_R70.width, height: VIEWPORT_R70.height, deviceScaleFactor: 1, mobile: false });
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
    const t0 = Date.now();
    let result = null, cdpError = null;
    const skip = DEGENERATE === 'skip-touch' && (leg.name === 'touch' || leg.name === 'default');
    if (leg.params && !skip) {
      const p = leg.params;
      try {
        if (DEGENERATE === 'js-click') {
          if (leg.name !== 'outside') await evalValue('(function(){for(let i=0;i<' + tapPlanCount(p) + ';i++){const el=document.elementFromPoint(' + p.x + ',' + p.y + ');if(el)el.click();}return true;})()');
          else throw new Error(JSON.stringify({ code: -32602, message: 'Position out of bounds' }));
        } else if (DEGENERATE === 'dispatch-mouse') {
          if (leg.name === 'outside') throw new Error(JSON.stringify({ code: -32602, message: 'Position out of bounds' }));
          for (let k = 0; k < tapPlanCount(p); k++) {
            if (p.gestureSourceType === 'mouse') {
              await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', buttons: 1, clickCount: k + 1 });
              if (p.duration) await sleep(p.duration);
              await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', buttons: 0, clickCount: k + 1 });
            } else {
              await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p.x, y: p.y }] });
              await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
            }
          }
        } else {
          result = (await send('Input.synthesizeTapGesture', p)).result;
        }
      } catch (e) { cdpError = e.message; }
      await sleep(SETTLE_MS);
    }
    receipt.legs.push({ name: leg.name, params: leg.params, skipped: skip, cdpResult: result, cdpError, elapsedMs: Date.now() - t0 });
  }
  await evalValue('window.__setLeg("end")');
  receipt.events = await evalValue('JSON.parse(JSON.stringify(window.__events))');
} catch (e) { failures.push({ id: 'drive-error', detail: e.message }); }
finally { await teardown(); }
receipt.host.stderrHead = stderrHead.slice(0, 4096);
{
  const m = /DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/([0-9a-f-]{36}))/.exec(stderrHead);
  receipt.host.devtoolsListening = m ? { url: m[1], port: Number(m[2]), browserId: m[3] } : null;
}
receipt.finishedAt = new Date().toISOString();
// Per-leg observed shape: event type sequence (pointermove/mousemove dropped), counts,
// click details, trust, pointer types, press->release interval.
const byLeg = (name) => receipt.events.filter((e) => e.leg === name);
const MOVES = new Set(['pointermove', 'mousemove', 'touchmove']);
function legSummary(name) {
  const evs = byLeg(name);
  const seqTypes = evs.filter((e) => !MOVES.has(e.type)).map((e) => e.type + (e.pointerType ? '(' + e.pointerType + ')' : ''));
  const down = evs.filter((e) => e.type === 'pointerdown'); const up = evs.filter((e) => e.type === 'pointerup');
  return {
    seqTypes, total: evs.length, allTrusted: evs.every((e) => e.isTrusted === true),
    clickDetails: evs.filter((e) => e.type === 'click').map((e) => e.detail),
    dblclick: evs.filter((e) => e.type === 'dblclick').length,
    pressReleaseMs: down.length && up.length ? +(up[0].ts - down[0].ts).toFixed(1) : null,
    onButton: evs.filter((e) => e.type === 'click' || e.type === 'pointerdown').every((e) => e.target === 'btn'),
  };
}
for (const leg of LEGS) receipt.legShape[leg.name] = legSummary(leg.name);
// Frozen leg shape (from the L1 smoke probe, chromium 155.0.8059.84; S174/S175 lines in
// the knowledge note). The counter re-derives the same from the raw events, independently.
const MOUSE_TAP = ['pointerdown(mouse)', 'mousedown', 'pointerup(mouse)', 'mouseup', 'click(mouse)'];
const TOUCH_TAP = ['pointerdown(touch)', 'touchstart', 'pointerup(touch)', 'touchend'];
const LEG_SHAPE = {
  start: { seqTypes: [], cdpError: null },
  mouse: { seqTypes: MOUSE_TAP, clickDetails: [1], pressReleaseMs: [45, 150], cdpError: null },
  hold: { seqTypes: MOUSE_TAP, clickDetails: [1], pressReleaseMs: [395, 600], cdpError: null },
  double: { seqTypes: [...MOUSE_TAP, ...MOUSE_TAP], clickDetails: [1, 1], pressReleaseMs: [45, 150], cdpError: null },
  zero: { seqTypes: [], cdpError: null },
  default: { seqTypes: TOUCH_TAP, clickDetails: [], pressReleaseMs: [45, 150], cdpError: null },
  touch: { seqTypes: TOUCH_TAP, clickDetails: [], pressReleaseMs: [45, 150], cdpError: null },
  outside: { seqTypes: [], cdpError: 'Position out of bounds' },
};
const shapeOk = (name) => {
  const want = LEG_SHAPE[name]; const got = receipt.legShape[name]; const leg = receipt.legs.find((l) => l.name === name);
  if (!want || !got || !leg || leg.skipped) return false;
  if (JSON.stringify(got.seqTypes) !== JSON.stringify(want.seqTypes) || !got.allTrusted || !got.onButton || got.dblclick !== 0) return false;
  if (want.clickDetails && JSON.stringify(got.clickDetails) !== JSON.stringify(want.clickDetails)) return false;
  if (want.pressReleaseMs && !(got.pressReleaseMs >= want.pressReleaseMs[0] && got.pressReleaseMs <= want.pressReleaseMs[1])) return false;
  if (want.cdpError === null ? leg.cdpError !== null : !(typeof leg.cdpError === 'string' && leg.cdpError.includes(want.cdpError))) return false;
  return true;
};
const tapCalls = cdpSendLog.filter((c) => c.method === 'Input.synthesizeTapGesture').length;
const lookAlikes = cdpSendLog.filter((c) => /^Input\.dispatch/.test(c.method) || (c.method === 'Runtime.evaluate' && /click\(|dispatchEvent/.test(String(c.params?.expression)))).length;
receipt.synthTapHypothesis = (LEGS.every((l) => shapeOk(l.name)) && tapCalls === 7 && lookAlikes === 0 && receipt.nonceOnPage === nonce && receipt.degenerate === null) ? 'CONFIRMED' : 'REFUTED';
receipt.predicate = receipt.synthTapHypothesis === 'CONFIRMED' && receipt.failures.length === 0 && !interrupted;
fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1));
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, predicate: receipt.predicate, synthTapHypothesis: receipt.synthTapHypothesis, degenerate: DEGENERATE, legShape: receipt.legShape, legs: receipt.legs.map((l) => ({ name: l.name, cdpError: l.cdpError, elapsedMs: l.elapsedMs })), devtools: receipt.host.devtoolsListening, teardown: receipt.teardown, failures }, null, 1));
process.exitCode = receipt.predicate ? 0 : 1;

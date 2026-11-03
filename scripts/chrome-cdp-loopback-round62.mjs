#!/usr/bin/env node
// Chromium pointer BUTTON-domain runner: tabi round 62, C2 (coverage).
// Usage: node chrome-cdp-loopback-round62.mjs --scratch <ABS dir>
//   --out <ABS receipt.json> --nonce <tabi-r62-lowercase/digits/hyphens>
//   --http-port <1024..65535> --cdp-port <1024..65535>
// Both ports are bind-prechecked on 127.0.0.1 before launch; distinct ports required.
// Exit 0: full page-side secondary-button journey plus closure; 1: retained red
// receipt; 2: usage/precondition refusal before browser launch.
// r61 launch/profile/sweep/teardown machinery is retained verbatim; the keyboard
// and primary-button legs of r61 are deliberately not replayed. This runner is
// the SECONDARY-button domain: Input.dispatchMouseEvent mousePressed/mouseReleased
// with button:'right' delivers PointerEvents carrying button:2 / buttons bit
// field 2->0 to the page, the legacy mousedown/mouseup pair, and the contextmenu
// consequence event — witnessed by the page's own recorders (__btnlog, __mouselog,
// __clicklog). The fixture suppresses the contextmenu default action and records
// defaultPrevented, so the run never opens a menu. A second independent right
// press witnesses field consistency (r61 critic residual). A click listener is
// kept as a NEGATIVE witness: a right press must never produce a click entry.
// CDP's button is the enum 'right'; the DOM button is numeric 2. MouseEvent
// entries omit undefined pointerType/pointerId verbatim, rather than fabricating
// PointerEvent fields on legacy mousedown/mouseup events.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-r62';
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
  // Never nest scratch inside the operator's real chromium profile root.
  const profileRoot = path.join(os.homedir(), '.config', 'chromium');
  if (inside(s, profileRoot)) throw new PathError('--scratch must not live under the default chromium profile root');
  return s;
}

function validateOut(given) {
  if (!isAbsNative(given)) throw new PathError('--out must be an absolute native path');
  if (!given.endsWith('.json')) throw new PathError('--out must be a .json path');
  return norm(given);
}

// The profile is a THROWAWAY directory, always <scratch>/profile-<12 hex>.
// It can never be, or live under, the operator's default Chromium profile.
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
if (!nonce || !/^tabi-r62-[a-z0-9-]+$/.test(nonce)) usage('--nonce must be tabi-r62- followed by lowercase letters/digits/hyphens');
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

// Port probe: after the keyed kill nothing may answer on the fixture port or
// the DevTools port. A refused connect is the only green answer.
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
/*FIXTURE-BEGIN*/
const BUTTON_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r62 button fixture</title>
<style>
  #target, #target2 { width: 240px; height: 80px; margin: 16px; background: #eef; border: 1px solid #88f; }
</style>
<script>
window.__seq = 0;
window.__btnlog = []; window.__mouselog = []; window.__clicklog = [];
const __push = (arr, e, extra) => { const o = {type:e.type, seq:++window.__seq, ts:e.timeStamp, button:e.button, buttons:e.buttons}; if (extra) Object.assign(o, extra); arr.push(o); };
for (const type of ['pointermove','pointerdown','pointerup']) {
  document.addEventListener(type, function(e) {
    __push(window.__btnlog, e, {pointerType:e.pointerType, pointerId:e.pointerId, isTrusted:e.isTrusted, targetId:e.target.id || e.target.tagName});
  }, true);
}
for (const type of ['mousedown','mouseup','contextmenu']) {
  document.addEventListener(type, function(e) {
    if (type === 'contextmenu') e.preventDefault();
    __push(window.__mouselog, e, {isTrusted:e.isTrusted, defaultPrevented:e.defaultPrevented, targetId:e.target.id || e.target.tagName});
  }, true);
}
document.addEventListener('click', function(e) {
  __push(window.__clicklog, e, {isTrusted:e.isTrusted});
}, true);
window.__nonceOnPage = null;
document.addEventListener('DOMContentLoaded', function() {
  window.__nonceOnPage = document.getElementById('nonce').textContent;
});
</script></head><body><h1>Button domain</h1><p id="nonce">${nonce}</p>
<div id="target">right-click me</div>
<div id="target2">right-click me again</div></body></html>`;
/*FIXTURE-END*/
fs.writeFileSync(path.join(scratchDir, 'fixture.html'), BUTTON_HTML);
const serverLog = [];
const fixtureServer = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, '') });
  res.writeHead(u.pathname === '/button' ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(u.pathname === '/button' ? BUTTON_HTML : 'not found');
});
const origin = 'http://127.0.0.1:' + fixturePort;
const failures = [];
const receipt = { schema: SCHEMA, nonce, driverSha256: sha256(fs.readFileSync(SELF)),
  host: { chromium: '', argv: [], launchToken }, fixture: { sha256: sha256(BUTTON_HTML), origin, targets: ['target', 'target2'] },
  nonceOnPage: null, btnlog: [], mouselog: [], clicklog: [], serverLog,
  declaredStepNames: ['a-right-press', 'b-contextmenu', 'c-second-press'], steps: [], stepsExtended: [],
  journey: { secondary: { moved: null, afterPress: null, afterRelease: null, pngSteps: [] },
    secondPress: { afterPress2: null, afterRelease2: null } },
  teardown: { postKillSweepCount: -1, survivors: [], portProbes: null }, failures, predicate: false };
const childArgv = [chromiumArg, '--headless=new', '--remote-debugging-port=' + devPort,
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--disable-extensions', '--window-size=1280,900', 'about:blank'];
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
    if (swept.postKillSweepCount !== 0 || swept.survivors.length || Object.values(portProbes).some(v => v !== 'closed') || Object.values(receipt.teardown.postKillCurl).some(v => v !== 7)) failures.push({ id: 'teardown-closure', detail: 'closure proof failed' });
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
  child.on('error', e => { launchError = e; });
  child.stderr.on('data', () => {});
  const fetchJSON = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
  let page = null;
  for (let i = 0; i < 100 && !page; i++) {
    if (launchError) throw launchError;
    try { page = (await fetchJSON('http://127.0.0.1:' + devPort + '/json/list')).find(t => t.type === 'page'); } catch {}
    if (!page) await sleep(150);
  }
  if (!page || !new RegExp('^ws://127\\.0\\.0\\.1:' + devPort + '/').test(page.webSocketDebuggerUrl)) throw new Error('no loopback page target');
  midRunCount = sweepOnce().pids.length;
  if (midRunCount < 1) throw new Error('launch token unbound');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('ws open timeout')), 20000); ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true }); ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('ws error')); }, { once: true }); });
  let msgId = 0; const pending = new Map();
  ws.addEventListener('message', ev => { const msg = JSON.parse(ev.data); const p = pending.get(msg.id); if (p) { pending.delete(msg.id); clearTimeout(p.timer); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg); } });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++msgId; const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout ' + method)); }, 20000); pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params })); });
  const evalValue = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
  const capture = async (name) => { const shot = await send('Page.captureScreenshot', { format: 'png' }); const buf = Buffer.from(shot.result.data, 'base64'); const rec = { name, png: name + '.png', sha256: sha256(buf), bytes: buf.length }; fs.writeFileSync(path.join(outDir, rec.png), buf); receipt.steps.push(rec); return rec; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: origin + '/button' });
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) { try { ready = await evalValue('document.readyState === "complete" && location.pathname === "/button" && Array.isArray(window.__btnlog) && document.getElementById("nonce").textContent === ' + JSON.stringify(nonce)); } catch {} if (!ready) await sleep(100); }
  if (!ready) throw new Error('fixture not ready');
  receipt.nonceOnPage = await evalValue('window.__nonceOnPage');
  const rects = await evalValue('({t1:(()=>{const r=document.getElementById("target").getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})(),t2:(()=>{const r=document.getElementById("target2").getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()})');
  receipt.journey.secondary.rect = rects.t1;
  receipt.journey.secondPress.rect = rects.t2;
  const cx1 = Math.round(rects.t1.x + rects.t1.width / 2), cy1 = Math.round(rects.t1.y + rects.t1.height / 2);
  const cx2 = Math.round(rects.t2.x + rects.t2.width / 2), cy2 = Math.round(rects.t2.y + rects.t2.height / 2);
  // First secondary-button cycle on #target.
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx1, y: cy1, buttons: 0, pointerType: 'mouse' });
  receipt.journey.secondary.moved = await evalValue('window.__btnlog.find(e=>e.type==="pointermove") || null');
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx1, y: cy1, button: 'right', buttons: 2, clickCount: 1, pointerType: 'mouse' });
  receipt.journey.secondary.afterPress = { btnlog: await evalValue('window.__btnlog'), mouselog: await evalValue('window.__mouselog') };
  await capture('a-right-press');
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx1, y: cy1, button: 'right', buttons: 0, clickCount: 1, pointerType: 'mouse' });
  receipt.journey.secondary.afterRelease = { btnlog: await evalValue('window.__btnlog'), mouselog: await evalValue('window.__mouselog') };
  await capture('b-contextmenu');
  // Second independent secondary-button cycle on #target2 (consistency witness).
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx2, y: cy2, button: 'right', buttons: 2, clickCount: 1, pointerType: 'mouse' });
  receipt.journey.secondPress.afterPress2 = { btnlog: await evalValue('window.__btnlog'), mouselog: await evalValue('window.__mouselog') };
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx2, y: cy2, button: 'right', buttons: 0, clickCount: 1, pointerType: 'mouse' });
  await capture('c-second-press');
  receipt.btnlog = await evalValue('window.__btnlog');
  receipt.mouselog = await evalValue('window.__mouselog');
  receipt.clicklog = await evalValue('window.__clicklog');
  receipt.journey.secondPress.afterRelease2 = { btnlog: receipt.btnlog, mouselog: receipt.mouselog };
} catch (e) { failures.push({ id: 'drive-error', detail: e.message }); }
finally { await teardown(); }
receipt.serverLog = serverLog;
const btn = receipt.btnlog;
const mouse = receipt.mouselog;
const downs = btn.filter(e => e.type === 'pointerdown');
const ups = btn.filter(e => e.type === 'pointerup');
const menus = mouse.filter(e => e.type === 'contextmenu');
const mdowns = mouse.filter(e => e.type === 'mousedown');
const mups = mouse.filter(e => e.type === 'mouseup');
// MEASURED shape (l1 smoke 2026-11-04, chromium 155.0.8059.84, this host): on a
// secondary-button PRESS chromium dispatches pointerdown -> mousedown ->
// contextmenu (buttons still 2, defaultPrevented true after our preventDefault)
// BEFORE the release's pointerup -> mouseup; one contextmenu per right press;
// a right press never produces a click; pointermove carries button -1. The
// per-cycle interleave is witnessed by the shared monotonic page seq.
const cycleOk = (i) => downs[i] && mdowns[i] && menus[i] && ups[i] && mups[i]
  && downs[i].seq < mdowns[i].seq && mdowns[i].seq < menus[i].seq
  && menus[i].seq < ups[i].seq && ups[i].seq < mups[i].seq;
receipt.buttonHypothesis = (downs.length === 2 && ups.length === 2 && menus.length === 2 && mdowns.length === 2 && mups.length === 2
  && downs.every(e => e.button === 2 && e.buttons === 2 && e.pointerType === 'mouse' && typeof e.pointerId === 'number' && e.isTrusted === true)
  && ups.every(e => e.button === 2 && e.buttons === 0 && e.pointerType === 'mouse' && e.isTrusted === true)
  && menus.every(e => e.button === 2 && e.buttons === 2 && e.isTrusted === true && e.defaultPrevented === true)
  && mdowns.every(e => e.button === 2 && e.buttons === 2 && e.isTrusted === true)
  && mups.every(e => e.button === 2 && e.buttons === 0 && e.isTrusted === true)
  && cycleOk(0) && cycleOk(1)
  && downs[0].pointerId === downs[1].pointerId
  && receipt.clicklog.length === 0) ? 'CONFIRMED' : 'REFUTED';
receipt.predicate = receipt.buttonHypothesis === 'CONFIRMED' && receipt.nonceOnPage === nonce
  && mdowns.length === 2 && receipt.failures.length === 0 && !interrupted;
fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1));
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ schema: SCHEMA, predicate: receipt.predicate, buttonHypothesis: receipt.buttonHypothesis, btnlog: receipt.btnlog, mouselog: receipt.mouselog, clicklog: receipt.clicklog, teardown: receipt.teardown }));
process.exitCode = receipt.predicate ? 0 : 1;

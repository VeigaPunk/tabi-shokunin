#!/usr/bin/env node
// R58Sentinel dynamic probe: attack the SWALLOW TOGGLE.
// Hypothesis under attack (seat contract): "no URL/query parameter may set
// __swallowOn (a query toggle would let a replayed page desynchronize the
// receipt from the fixture)".
//
// Method: extract the r58 runner's OWN FIXTURE_HTML template, serve it from a
// loopback-only HTTP server in scratch, load it in Chromium 155 headless with
// a throwaway profile + throwaway HOME/XDG under scratch, and drive the page
// over CDP. Then load the SAME bytes with hostile query strings
// (?swallow=1, ?__swallowOn=true, ?swallowSet=Enter, #swallow=1, ...) and
// observe whether window.__swallowOn / window.__swallowSet moved, and whether
// a real keydown got preventDefault()ed WITHOUT the driver calling
// window.__setSwallow.
//
// Loopback-only: the probe server binds 127.0.0.1; the browser is launched
// with --remote-debugging-address=127.0.0.1; the CDP socket is asserted
// loopback before any command is sent. Zero-survivor closure: keyed PID-group
// kill by the launch token, a /proc sweep to zero, and a port probe.
//
// Usage: node query-toggle-attack.mjs <runner.mjs> [--keep]
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const runnerPath = process.argv[2];
const CHROMIUM = '/usr/bin/chromium';
const out = { schema: 'r58sentinel-query-toggle-attack-v1', runner: runnerPath, legs: [], findings: [] };
const add = (id, detail) => out.findings.push({ id, detail: String(detail) });

if (!runnerPath || !fs.existsSync(runnerPath)) { add('runner-missing', runnerPath); console.log(JSON.stringify(out, null, 1)); process.exit(2); }

// ---- extract the runner's own FIXTURE_HTML template ----------------------
const src = fs.readFileSync(runnerPath, 'utf8');
const lines = src.split('\n');
const fxStart = lines.findIndex((l) => /const FIXTURE_HTML/.test(l));
let fxEnd = -1;
for (let i = fxStart + 1; i < lines.length && i - fxStart < 400; i++) { if (/`;\s*$/.test(lines[i])) { fxEnd = i; break; } }
if (fxStart < 0) { add('fixture-template-not-found', 'no FIXTURE_HTML'); console.log(JSON.stringify(out, null, 1)); process.exit(2); }
const template = lines.slice(fxStart, fxEnd + 1).join('\n');
const tplMatch = template.match(/=\s*`([\s\S]*)`\s*;?\s*$/);
if (!tplMatch) { add('fixture-template-not-found', 'template literal not extracted'); console.log(JSON.stringify(out, null, 1)); process.exit(2); }
const NONCE = 'tabi-r58-0123456789ab';
const FIXTURE_HTML = tplMatch[1].split('__NONCE__').join(NONCE);
out.fixture = { startLine: fxStart + 1, endLine: fxEnd + 1, bytes: Buffer.byteLength(FIXTURE_HTML), sha256: crypto.createHash('sha256').update(FIXTURE_HTML).digest('hex') };

// ---- scratch --------------------------------------------------------------
const scratch = process.env.R58_SENTINEL_SCRATCH || '/fast/scratch/hyaku/tabi-r58/R58Sentinel/attack';
fs.mkdirSync(scratch, { recursive: true });
const token = crypto.randomBytes(6).toString('hex');
const profileDir = path.join(scratch, 'profile-' + token);
const runHome = path.join(scratch, 'home-' + token);
const runXdg = path.join(runHome, '.config');
fs.mkdirSync(profileDir, { recursive: true, mode: 0o700 });
fs.mkdirSync(runXdg, { recursive: true, mode: 0o700 });
const SWEEP_NEEDLES = [token, profileDir, path.join(runXdg, 'chromium', 'Crash Reports')];

// ---- loopback-only fixture server ----------------------------------------
const serverLog = [];
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, '') });
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(FIXTURE_HTML);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const origin = 'http://127.0.0.1:' + port;

// ---- launch chromium ------------------------------------------------------
const argv = [
  CHROMIUM, '--headless=new',
  '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1',
  '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--disable-component-update',
  '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--disable-extensions',
  '--window-size=1280,900', 'about:blank',
];
const child = spawn(argv[0], argv.slice(1), {
  stdio: ['ignore', 'ignore', 'pipe'], detached: true,
  env: { ...process.env, HOME: runHome, XDG_CONFIG_HOME: runXdg, TMPDIR: scratch },
});
let stderr = ''; child.stderr.on('data', (d) => { stderr += d.toString(); });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function sweepOnce() {
  const pids = [];
  let ents; try { ents = fs.readdirSync('/proc'); } catch { return { error: 'no /proc', pids: [] }; }
  for (const e of ents) {
    if (!/^\d+$/.test(e)) continue;
    const pid = Number(e); if (pid === process.pid) continue;
    let cmd; try { cmd = fs.readFileSync('/proc/' + e + '/cmdline', 'latin1'); } catch { continue; }
    if (SWEEP_NEEDLES.some((n) => cmd.includes(n))) pids.push(pid);
  }
  return { pids: pids.sort((a, b) => a - b) };
}
function probePort(p) {
  return new Promise((resolve) => {
    const s = net.connect({ port: p, host: '127.0.0.1' });
    let done = false;
    const fin = (v) => { if (done) return; done = true; try { s.destroy(); } catch {} resolve(v); };
    s.setTimeout(1500, () => fin('timeout'));
    s.on('connect', () => fin('open'));
    s.on('error', () => fin('closed'));
  });
}
async function sweepToZero() {
  let last = sweepOnce();
  let rounds = 0;
  for (let r = 0; r < 20 && last.pids.length; r++) {
    rounds = r + 1;
    for (const pid of last.pids) { try { process.kill(pid, 'SIGKILL'); } catch {} }
    await sleep(250); last = sweepOnce();
  }
  return { survivors: last.pids, rounds };
}

// ---- CDP client -----------------------------------------------------------
let ws = null; let msgId = 0; const pending = new Map();
function send(method, params) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params: params || {} }));
  });
}
async function evaluate(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) return { error: String(r.exceptionDetails.text || '') + ' ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || '') };
  return { value: r.result && r.result.value };
}

let cleanupDone = false;
async function cleanup() {
  if (cleanupDone) return; cleanupDone = true;
  try { if (child.pid) process.kill(-child.pid, 'SIGKILL'); } catch {}
  const sweep = await sweepToZero();
  try { server.closeAllConnections(); } catch {}
  try { server.close(); } catch {}
  out.teardown = { survivors: sweep.survivors, fixturePortProbe: await probePort(port) };
}

try {
  // devtools port from OUR throwaway profile
  const portFile = path.join(profileDir, 'DevToolsActivePort');
  let devPort = null;
  for (let i = 0; i < 100 && !devPort; i++) {
    try { const f = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim(); if (/^\d+$/.test(f)) devPort = Number(f); } catch {}
    if (!devPort) await sleep(150);
  }
  if (!devPort) { add('no-devtools-port', 'no DevToolsActivePort'); throw new Error('no dev port'); }
  const cdp = 'http://127.0.0.1:' + devPort;
  let versionInfo = null;
  for (let i = 0; i < 60 && !versionInfo; i++) {
    try { versionInfo = await (await fetch(cdp + '/json/version')).json(); } catch { versionInfo = null; }
    if (!versionInfo) await sleep(150);
  }
  const wsHost = versionInfo ? new URL(versionInfo.webSocketDebuggerUrl).host : null;
  out.cdp = { devPort, wsHost, loopback: /(^|:)127\.0\.0\.1:\d+$/.test(String(wsHost)) };
  if (!out.cdp.loopback) { add('cdp-not-loopback', String(wsHost)); throw new Error('cdp not loopback'); }

  // attach to the PAGE target (the browser target has no Page domain)
  let pageTarget = null;
  for (let i = 0; i < 100 && !pageTarget; i++) {
    try {
      const list = await (await fetch(cdp + '/json/list')).json();
      pageTarget = (Array.isArray(list) ? list : []).find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    } catch { pageTarget = null; }
    if (!pageTarget) await sleep(150);
  }
  if (!pageTarget) { add('no-page-target', 'no page target'); throw new Error('no page target'); }
  const pageWsHost = new URL(pageTarget.webSocketDebuggerUrl).host;
  out.cdp.pageWsHost = pageWsHost;
  if (!/^127\.0\.0\.1:\d+$/.test(pageWsHost)) { add('cdp-page-not-loopback', pageWsHost); throw new Error('page ws not loopback'); }

  const NodeWS = globalThis.WebSocket;
  if (!NodeWS) { add('no-websocket', 'node has no global WebSocket'); throw new Error('no WebSocket'); }
  ws = new NodeWS(pageTarget.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws error')); });
  ws.onmessage = (ev) => {
    let m; try { m = JSON.parse(ev.data); } catch { return; }
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      if (m.error) p.reject(new Error(JSON.stringify(m.error))); else p.resolve(m.result);
    }
  };
  await send('Page.enable'); await send('Runtime.enable');

  // ---- the ATTACK legs ----------------------------------------------------
  // For each hostile URL, load it, then WITHOUT calling __setSwallow, read the
  // swallow state and dispatch a real keydown; observe defaultPrevented.
  const hostileUrls = [
    '/form',
    '/form?swallow=1',
    '/form?__swallowOn=true',
    '/form?swallowOn=1&swallowSet=Enter',
    '/form?swallowSet=Backspace',
    '/form?swallow=true&keys=Enter',
    '/form?swallow=1#swallow',
    '/form?swallow%3D1',
    '/form?S=1&swallow=1',
  ];
  for (const u of hostileUrls) {
    await send('Page.navigate', { url: origin + u });
    await sleep(700);
    const state = await evaluate(`JSON.stringify({
      hasSwallowOn: typeof window.__swallowOn,
      swallowOn: window.__swallowOn === undefined ? null : window.__swallowOn,
      hasSwallowSet: typeof window.__swallowSet,
      swallowSet: window.__swallowSet === undefined ? null : window.__swallowSet,
      hasSetSwallow: typeof window.__setSwallow,
      search: (location && location.search) ? location.search : null,
      hash: (location && location.hash) ? location.hash : null,
      keys: Object.keys(window).filter(k => /swallow/i.test(k))
    })`);
    // dispatch a real keydown through CDP WITHOUT calling __setSwallow
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r' });
    await sleep(150);
    const dp = await evaluate(`JSON.stringify({
      logLen: (window.__keylogFull && window.__keylogFull.length) || (window.__keylog && window.__keylog.length) || 0,
      last: ((window.__keylogFull || window.__keylog || [])[((window.__keylogFull || window.__keylog || []).length - 1)]) || null,
      value3: (document.getElementById('field3') || {}).value || null
    })`);
    const leg = { url: u, state: state.value || state.error, afterKeydown: dp.value || dp.error };
    out.legs.push(leg);
    // THE CHECK: a query parameter moved the swallow state, or a keydown was
    // swallowed without the driver calling __setSwallow.
    let st = null;
    try { st = JSON.parse(state.value); } catch {}
    if (st && st.swallowOn === true) add('query-toggle-enabled-swallow', u + ' -> __swallowOn === true');
    if (st && Array.isArray(st.swallowSet) && st.swallowSet.length) add('query-toggle-set-swallowSet', u + ' -> __swallowSet ' + JSON.stringify(st.swallowSet));
    let dpv = null;
    try { dpv = JSON.parse(dp.value); } catch {}
    if (dpv && dpv.last && dpv.last.defaultPrevented === true) {
      add('query-toggle-swallowed-without-setSwallow', u + ' -> defaultPrevented true without a driver __setSwallow call');
    }
  }
  // control: the driver calls __setSwallow explicitly -> the swallow MUST work.
  // This is ALSO the empirical test of LISTENER REGISTRATION ORDER: the
  // recorder must observe defaultPrevented true, which is only possible if
  // the swallower was registered BEFORE the recorder on the same target/phase.
  await send('Page.navigate', { url: origin + '/form' });
  await sleep(700);
  const ctrl = await evaluate(`(function(){ if (typeof window.__setSwallow !== 'function') return 'no __setSwallow'; window.__setSwallow(true, ['Enter']); return 'set'; })()`);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r' });
  await sleep(150);
  const ctrlAfter = await evaluate(`JSON.stringify({ last: ((window.__keylogFull||window.__keylog||[]).slice(-1)[0]) || null })`);
  out.control = { setSwallowResult: ctrl.value || ctrl.error, after: ctrlAfter.value || ctrlAfter.error };
  {
    let cv = null;
    try { cv = JSON.parse(ctrlAfter.value); } catch {}
    if (ctrl.value === 'no __setSwallow') {
      add('set-swallow-api-missing', 'window.__setSwallow is not a function on the served fixture');
    } else if (!cv || !cv.last) {
      add('control-leg-no-keylog-entry', 'the control keydown produced no keylog entry: ' + JSON.stringify(ctrlAfter.value));
    } else if (cv.last.defaultPrevented !== true) {
      add('swallower-not-registered-before-recorder',
        'after __setSwallow(true,["Enter"]) the recorder saw defaultPrevented=' + JSON.stringify(cv.last.defaultPrevented)
        + ' (expected true): the swallower did not run before the recorder');
    } else {
      out.control.orderEmpiricallyConfirmed = true;
    }
  }
  out.serverLog = serverLog;
} catch (e) {
  out.error = String((e && e.message) || e);
  out.stderrTail = stderr.slice(-600);
} finally {
  await cleanup();
}
out.findingCount = out.findings.length;
out.predicate = out.findingCount === 0;
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);

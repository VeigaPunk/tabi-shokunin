#!/usr/bin/env node
// probe-capslock.mjs — tabi round 59, claim C2 CapsLock DELIVERY-BOUNDARY probe.
//
// Cited evidence for the pre-data restatement of C2: on this host's Chromium
// 155 headless surface, Input.dispatchKeyEvent DELIVERS CapsLock events (the
// page records the full delivered shape: type, key, code, keyCode 20,
// cancelable true, defaultPrevented false) while the page's
// getModifierState('CapsLock') reads FALSE on every recorded event — before,
// during and after two CapsLock press pairs and the interleaved letters. The
// differential is the detector-positive Shift chord on the same recorder:
// getModifierState('Shift') reads TRUE on every Shift/uppercase event, so the
// all-false caps record is a measured boundary, not a dead recorder.
//
// The structural half is cited from the CDP input source: GetEventModifiers
// maps only modifier bits 1/2/4/8 (Alt/Ctrl/Meta/Shift) and ignores every
// other bit, so the CDP modifier channel exposes no CapsLock state. See
// probe-source-input_handler.cc.txt and probe-src.meta.json beside the
// receipt.
//
// Usage:
//   node probe-capslock.mjs --scratch <ABS dir> --out <ABS receipt.json> \
//     [--source-meta <ABS json>] [--chromium <ABS bin>]
//
// Exit 0: the boundary measured (delivered true, caps flag false everywhere,
// Shift detector positive) and teardown clean. Exit 1: a measurement is
// inconsistent. Exit 2: usage / environment precondition.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-capslock-probe-r59';
const SELF = fileURLToPath(import.meta.url);
const DEFAULT_CHROMIUM = '/usr/bin/chromium';
const DEFAULT_PROFILE_ROOT = path.join(os.homedir(), '.config', 'chromium');
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;
const PORT_PROBE_TIMEOUT_MS = 1500;

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && i + 1 < argv.length && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
};
const usage = (msg) => {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'usage', detail: msg }));
  process.exit(2);
};
const abs = (p) => typeof p === 'string' && p.length > 0 && path.isAbsolute(p);
const norm = (p) => path.resolve(p);
const inside = (c, p) => {
  const a = norm(c);
  const b = norm(p);
  return a === b || a.startsWith(b + path.sep);
};

const scratchArg = opt('scratch');
const outArg = opt('out');
if (!abs(scratchArg)) usage('--scratch must be an ABSOLUTE path');
if (!abs(outArg)) usage('--out must be an ABSOLUTE path');
const scratchDir = norm(scratchArg);
const outReceipt = norm(outArg);
const chromiumArg = opt('chromium') || DEFAULT_CHROMIUM;
if (!abs(chromiumArg) || !fs.existsSync(chromiumArg)) usage('--chromium must be an existing ABSOLUTE path');
if (scratchDir === norm(os.homedir()) || scratchDir === path.parse(scratchDir).root) usage('--scratch must not be home or a filesystem root');
if (inside(scratchDir, DEFAULT_PROFILE_ROOT) || inside(outReceipt, DEFAULT_PROFILE_ROOT)) usage('scratch/out must not live inside the user Chromium profile');
let sourceMeta = null;
if (opt('source-meta')) {
  const sm = opt('source-meta');
  if (!abs(sm)) usage('--source-meta must be an ABSOLUTE path');
  try { sourceMeta = JSON.parse(fs.readFileSync(sm, 'utf8')); } catch (e) { usage('cannot read --source-meta: ' + String((e && e.message) || e)); }
}
fs.mkdirSync(scratchDir, { recursive: true });
fs.mkdirSync(path.dirname(outReceipt), { recursive: true });
const probeScriptSha256 = sha256(fs.readFileSync(SELF));

// --- keyed process sweep over /proc ---------------------------------------
const launchToken = crypto.randomBytes(6).toString('hex');
const profileDir = path.join(scratchDir, 'profile-' + launchToken);
const runHome = path.join(scratchDir, 'home-' + launchToken);
const runXdgConfig = path.join(runHome, '.config');
fs.mkdirSync(profileDir, { recursive: true, mode: 0o700 });
fs.mkdirSync(runXdgConfig, { recursive: true, mode: 0o700 });
const runCrashDb = path.join(runXdgConfig, 'chromium', 'Crash Reports');
const SWEEP_NEEDLES = [launchToken, profileDir, runCrashDb];
function sweepOnce() {
  const pids = [];
  let ents;
  try { ents = fs.readdirSync('/proc'); } catch { return { error: 'cannot list /proc', pids: [] }; }
  for (const ent of ents) {
    if (!/^\d+$/.test(ent)) continue;
    const pid = Number(ent);
    if (pid === process.pid) continue;
    let cmd;
    try { cmd = fs.readFileSync('/proc/' + ent + '/cmdline', 'latin1'); } catch { continue; }
    if (SWEEP_NEEDLES.some((n) => cmd.includes(n))) pids.push(pid);
  }
  return { pids: pids.sort((a, b) => a - b) };
}
async function sweepToZero() {
  let last = sweepOnce();
  for (let round = 0; round < SWEEP_MAX_ROUNDS; round++) {
    if (!last.pids.length) return { postKillSweepCount: 0, survivors: [], rounds: round };
    for (const pid of last.pids) { try { process.kill(pid, 'SIGKILL'); } catch { /* gone */ } }
    await sleep(SWEEP_WAIT_MS);
    last = sweepOnce();
  }
  return { postKillSweepCount: last.pids.length, survivors: last.pids, rounds: SWEEP_MAX_ROUNDS };
}
function probePort(port) {
  return new Promise((resolve) => {
    const s = net.connect({ port, host: '127.0.0.1' });
    let done = false;
    const fin = (v) => { if (done) return; done = true; try { s.destroy(); } catch {} resolve(v); };
    s.setTimeout(PORT_PROBE_TIMEOUT_MS, () => fin('timeout'));
    s.on('connect', () => fin('open'));
    s.on('error', () => fin('closed'));
  });
}

const preLaunch = sweepOnce();
if (preLaunch.error || preLaunch.pids.length !== 0) {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'launch-token-not-fresh', preLaunch }));
  process.exit(2);
}
const startedAt = new Date().toISOString();
const childArgv = [
  chromiumArg, '--headless=new', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1',
  '--user-data-dir=' + profileDir, '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--disable-component-update', '--disable-sync',
  '--disable-search-engine-choice-screen', '--disable-dev-shm-usage', '--disable-extensions',
  '--window-size=1280,900', 'about:blank',
];
const child = spawn(childArgv[0], childArgv.slice(1), {
  stdio: ['ignore', 'ignore', 'pipe'], detached: true,
  env: { ...process.env, HOME: runHome, XDG_CONFIG_HOME: runXdgConfig, TMPDIR: scratchDir },
});
let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

const portFile = path.join(profileDir, 'DevToolsActivePort');
let devPort = null;
for (let i = 0; i < 100 && !devPort; i++) {
  try {
    const first = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim();
    if (/^\d+$/.test(first)) devPort = Number(first);
  } catch { /* not yet */ }
  if (!devPort) await sleep(150);
}
if (!devPort) {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'no-devtools-port', stderrTail }));
  try { process.kill(-child.pid, 'SIGKILL'); } catch {}
  process.exit(2);
}
const cdpOrigin = 'http://127.0.0.1:' + devPort;
let versionInfo = null;
for (let i = 0; i < 60 && !versionInfo; i++) {
  try { versionInfo = await (await fetch(cdpOrigin + '/json/version')).json(); } catch { versionInfo = null; }
  if (!versionInfo) await sleep(150);
}
if (!versionInfo) {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'no-json-version', stderrTail }));
  try { process.kill(-child.pid, 'SIGKILL'); } catch {}
  process.exit(2);
}
const midRun = sweepOnce();
let page = null;
for (let i = 0; i < 100 && !page; i++) {
  try {
    const list = await (await fetch(cdpOrigin + '/json/list')).json();
    page = (Array.isArray(list) ? list : []).find((t) => t.type === 'page');
  } catch { page = null; }
  if (!page) await sleep(150);
}
if (!page || !page.webSocketDebuggerUrl) {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'no-page-target' }));
  try { process.kill(-child.pid, 'SIGKILL'); } catch {}
  process.exit(2);
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  const timer = setTimeout(() => rej(new Error('ws open timeout')), 20000);
  ws.addEventListener('open', () => { clearTimeout(timer); res(); }, { once: true });
  ws.addEventListener('error', () => { clearTimeout(timer); rej(new Error('ws error')); }, { once: true });
});
let msgId = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  let msg;
  try { msg = JSON.parse(ev.data); } catch { return; }
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++msgId;
  pending.set(id, res);
  ws.send(JSON.stringify({ id, method, params }));
  setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error('cdp timeout ' + method)); } }, 20000);
});
const evalValue = async (expression) => {
  const rs = await send('Runtime.evaluate', { expression, returnByValue: true });
  if (rs.error) throw new Error('evaluate: ' + JSON.stringify(rs.error).slice(0, 200));
  if (rs.result && rs.result.exceptionDetails) throw new Error('evaluate threw: ' + String(rs.result.exceptionDetails.text || '').slice(0, 200));
  return rs.result && rs.result.result ? rs.result.result.value : undefined;
};
const evalJSON = async (expression) => {
  const v = await evalValue(expression);
  return typeof v === 'string' ? JSON.parse(v) : v;
};
await send('Page.enable');
await send('Runtime.enable');

const RECORDER = `window.__ev = [];
function rec(e) {
  window.__ev.push({
    type: e.type === 'keydown' ? 'keyDown' : (e.type === 'keyup' ? 'keyUp' : e.type),
    key: e.key, code: e.code, keyCode: e.keyCode,
    cancelable: e.cancelable === true, defaultPrevented: e.defaultPrevented === true,
    capsLock: e.getModifierState('CapsLock') === true,
    shift: e.getModifierState('Shift') === true,
    ctrl: e.getModifierState('Control') === true,
    alt: e.getModifierState('Alt') === true,
    meta: e.getModifierState('Meta') === true,
    shiftKey: e.shiftKey === true, ctrlKey: e.ctrlKey === true,
    altKey: e.altKey === true, metaKey: e.metaKey === true,
    targetId: (e.target && (e.target.id || e.target.tagName)) || null,
  });
}
document.addEventListener('keydown', rec, true);
document.addEventListener('keyup', rec, true);
window.__evClear = function () { window.__ev.length = 0; };`;
await evalValue(RECORDER);
const ready = await evalValue('document.readyState');
if (ready !== 'complete') {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'page-not-ready', ready }));
  try { process.kill(-child.pid, 'SIGKILL'); } catch {}
  process.exit(2);
}

const CASES = [];
const clear = () => evalValue('window.__evClear()');
const read = () => evalJSON('JSON.stringify(window.__ev)');
const runCase = async (name, fn) => {
  await clear();
  await fn();
  const records = await read();
  CASES.push({ name, records });
  return records;
};
const kd = (p) => send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, ...p });
const ku = (p) => send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, ...p });
const letter = (text, modifiers = 0) => ({
  key: text, code: 'Key' + text.toUpperCase(), windowsVirtualKeyCode: 65 + (text.toUpperCase().charCodeAt(0) - 65),
  nativeVirtualKeyCode: 65 + (text.toUpperCase().charCodeAt(0) - 65), modifiers, text, unmodifiedText: text,
});
const caps = (modifiers = 0) => ({ key: 'CapsLock', code: 'CapsLock', windowsVirtualKeyCode: 20, nativeVirtualKeyCode: 20, modifiers });

await runCase('baseline-letter', async () => {
  await kd(letter('a'));
  await ku({ key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65 });
});
await runCase('capslock-keydown-keyup', async () => {
  await kd(caps());
  await ku(caps());
});
await runCase('capslock-then-letter', async () => {
  await kd(caps());
  await ku(caps());
  await kd(letter('a'));
  await ku({ key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65 });
});
await runCase('capslock-rawkeydown-then-letter', async () => {
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...caps() });
  await ku(caps());
  await kd(letter('a'));
  await ku({ key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65 });
});
// R1 detector-positive: the same recorder MUST see getModifierState('Shift')
// true on a real Shift chord; otherwise an all-false caps record proves nothing.
await runCase('shift-detector', async () => {
  await kd({ key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16, nativeVirtualKeyCode: 16, modifiers: 8 });
  await kd(letter('A', 8));
  await ku({ key: 'A', code: 'KeyA', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65, modifiers: 8 });
  await ku({ key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16, nativeVirtualKeyCode: 16, modifiers: 8 });
});
const BITS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];
const bitSweep = [];
for (const bit of BITS) {
  const records = await runCase('modifier-bit-' + bit, async () => {
    await kd(letter('a', bit));
    await ku({ key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65, modifiers: bit });
  });
  const down = records.find((e) => e.type === 'keyDown') || null;
  bitSweep.push({
    bit,
    mapped: down ? { alt: down.alt, ctrl: down.ctrl, meta: down.meta, shift: down.shift } : null,
    capsLock: down ? down.capsLock : null,
  });
}
const capsBitSweep = [];
for (const bit of [16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192]) {
  const records = await runCase('capslock-with-bit-' + bit, async () => {
    await kd(caps(bit));
    await ku(caps(bit));
    await kd(letter('a'));
    await ku({ key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65 });
  });
  const capsDown = records.find((e) => e.type === 'keyDown' && e.key === 'CapsLock') || null;
  capsBitSweep.push({ bit, capsLock: capsDown ? capsDown.capsLock : null });
}

// --- analysis --------------------------------------------------------------
const allRecords = CASES.flatMap((c) => c.records);
const capsEvents = allRecords.filter((e) => e && e.key === 'CapsLock');
const capsDelivered = capsEvents.length > 0 && capsEvents.every((e) =>
  (e.type === 'keyDown' || e.type === 'keyUp')
  && e.code === 'CapsLock' && e.keyCode === 20
  && e.cancelable === true && e.defaultPrevented === false);
const capsFlagAnyTrue = allRecords.some((e) => e && e.capsLock === true);
const shiftCase = CASES.find((c) => c.name === 'shift-detector');
const shiftRecords = shiftCase ? shiftCase.records.filter((e) => e && e.shiftKey === true) : [];
const shiftDetectorPositive = shiftRecords.length > 0 && shiftRecords.every((e) => e.shift === true);
const expectedFor = { 1: 'alt', 2: 'ctrl', 4: 'meta', 8: 'shift' };
const bitMappingOk = bitSweep.every((b) => {
  if (!b.mapped) return false;
  const want = expectedFor[b.bit] || null;
  return ['alt', 'ctrl', 'meta', 'shift'].every((k) => b.mapped[k] === (k === want));
});
const capsBitNoLatch = capsBitSweep.every((b) => b.capsLock === false);
const boundaryMeasured = capsDelivered && capsFlagAnyTrue === false && shiftDetectorPositive && bitMappingOk && capsBitNoLatch;

// --- teardown --------------------------------------------------------------
try { ws.close(); } catch {}
if (child.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
await sleep(600);
const swept = await sweepToZero();
let devtoolsProbe = devPort ? await probePort(devPort) : 'not-launched';
for (let i = 0; i < 10 && devtoolsProbe !== 'closed'; i++) { await sleep(200); devtoolsProbe = await probePort(devPort); }
const teardown = { preLaunchSweepCount: preLaunch.pids.length, midRunSweepCount: midRun.pids.length, postKillSweepCount: swept.postKillSweepCount, survivors: swept.survivors, portProbes: { devtools: devtoolsProbe, fixture: 'not-used' } };

const receipt = {
  schema: SCHEMA,
  probeScript: { path: '.ufo/waves/round-59/runner/probe-capslock.mjs', sha256: probeScriptSha256 },
  chromium: String(versionInfo.Browser || '').trim(),
  host: { platform: os.platform(), release: os.release(), arch: os.arch(), node: process.version },
  launched: { argv: childArgv.map((a) => String(a).replace(/\/home\/[^/\s"]+(?=\/)/g, '__USER_HOME__').replace(/(^|[=])~\//g, '$1__USER_HOME__/')), headless: true, disableExtensions: true, throwawayHome: true, throwawayXdgConfig: true },
  startedAt,
  finishedAt: new Date().toISOString(),
  claimContext: {
    capability: 'chromium-keyevent-delivery-boundary-linux',
    originalFrozenExpectation: 'CapsLock keyDown+keyUp latches getModifierState(\'CapsLock\') false -> true -> held -> false',
    measured: 'the events deliver; the page\'s CapsLock modifier state reads false on every recorded event',
    differential: 'the same recorder reads getModifierState(\'Shift\') true on every event of the Shift chord',
    structuralGround: 'the CDP modifier mapping (GetEventModifiers) carries only bits 1/2/4/8; no CapsLock channel is exposed',
  },
  cases: CASES,
  bitSweep,
  capsBitSweep,
  analysis: {
    capsEvents: capsEvents.length,
    capsDelivered,
    capsFlagAnyTrue,
    capsLatchObserved: capsFlagAnyTrue,
    capsLatchExpected: false,
    shiftDetectorEvents: shiftRecords.length,
    shiftDetectorPositive,
    bitMappingOk,
    capsBitNoLatch,
    boundaryMeasured,
  },
  sourceGround: sourceMeta,
  teardown,
};
fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({
  schema: SCHEMA,
  predicate: boundaryMeasured && teardown.postKillSweepCount === 0 && devtoolsProbe === 'closed',
  chromium: receipt.chromium,
  analysis: receipt.analysis,
  teardown,
  receipt: outReceipt,
}, null, 1));
process.exit(boundaryMeasured && teardown.postKillSweepCount === 0 && devtoolsProbe === 'closed' ? 0 : 1);

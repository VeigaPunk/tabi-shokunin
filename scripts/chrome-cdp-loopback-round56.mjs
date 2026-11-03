#!/usr/bin/env node
// chrome-cdp-loopback-round56.mjs — tabi round 56, claim C2 runner
// (capability chromium-keyevent-control-keys-linux).
//
// Drives the Linux host's Chromium 155 headless surface over raw CDP
// (loopback only, throwaway profile, node's built-in WebSocket, zero npm
// deps) against an inline loopback fixture and records a nonce-bound
// evidence receipt whose EVERY witness is page-side DOM state or
// server-side request state, never the driver's assumption:
//
//   plain typing    click #field by dispatched mouse press/release at the
//                   getBoundingClientRect centre, then one
//                   Input.dispatchKeyEvent keyDown (per-character key/code/
//                   windowsVirtualKeyCode) + keyUp per nonce character, with
//                   #field.value read back after EVERY keystroke (prefix
//                   witness).
//   End   (VK 35)   NEGATIVE EDIT WITNESS: #field.value unchanged.
//   Backspace (8)   #field.value === nonce minus its last character.
//   restore         re-type the removed character; value === nonce exactly.
//   Tab      (9)    document.activeElement.id field -> field2.
//   Enter   (13)    keyDown/keyUp from the TABBED-TO #field2: the form's
//                   implicit submission, witnessed server-side (exactly ONE
//                   /echo request carrying field === nonce and field2 === '')
//                   and client-side (the echo page renders the value back).
//                   The control-domain slice of the page's own keydown
//                   recorder window.__keylog must hold EXACTLY the four
//                   control keydowns (End, Backspace, restored char, Tab); it
//                   is read BEFORE the Enter dispatch because the submission
//                   navigates the document and the recorder dies with it.
//                   That asymmetry is DISCLOSED here, not hidden: Enter's own
//                   DOM record is not witnessed, the submission is.
//
// Process discipline (the r46/r55 keyed-teardown model, ported to Linux):
// the launch owns a unique token that appears verbatim in the throwaway
// profile path (<scratch>/profile-<token>) and therefore in the command line
// of the browser and every helper. /proc is swept for that token:
//   pre-launch  count MUST be 0 (a fresh key; refuse to start otherwise),
//   mid-run     count MUST be >= 1 (the key really binds this launch),
//   post-kill   survivors are killed BY PID (never pkill -f, never an image
//               name — the operator runs the same binary), re-swept until 0;
//               the receipt is green only when the final sweep is 0.
// The browser is spawned detached so it owns a process group and is killed as
// a GROUP (kill(-pid)) before the per-pid sweep.
//
// Profile safety (found by this runner's own usage test): Chromium SILENTLY
// FALLS BACK to the operator's default profile when --user-data-dir is not
// writable — an uncreatable scratch (/root as a plain user) made it open
// /home/vgpnk/.config/chromium. The runner therefore refuses before spawn
// unless the scratch passes a real write probe and the throwaway profile
// directory is created, verified EMPTY, mode 0700, and writable; the
// realpath of the scratch is also checked against the operator's default
// profile so a symlink cannot re-enter it. The default Chromium profile is
// never read.
//
// Usage:
//   node scripts/chrome-cdp-loopback-round56.mjs --scratch <ABS dir> --out <ABS receipt.json> [--chromium <ABS bin>]
//   node scripts/chrome-cdp-loopback-round56.mjs --path-selftest
//
// Exit: 0 predicate true; 1 predicate false (the receipt IS still written, so
// a red run is committable evidence); 2 usage / environment precondition.
// Writes: everything under --scratch (server-log.json, profile-<token>/),
// plus the receipt and the six step PNGs inside dirname(--out).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-chrome-cdp-r56';
const SELF = fileURLToPath(import.meta.url);
const DEFAULT_CHROMIUM = '/usr/bin/chromium';
const DEFAULT_PROFILE_ROOT = path.join(os.homedir(), '.config', 'chromium');
const STEP_NAMES = ['a-start', 'b-typed', 'c-end-witness', 'd-backspace', 'e-tab', 'f-enter-echo'];
const ENTER_TIMEOUT_MS = 5000; // the frozen C2 kill rule: "no submit request within 5 s"
const SWEEP_MAX_ROUNDS = 20;
const SWEEP_WAIT_MS = 250;

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// CDP key naming for every character a nonce can contain
// ('tabi-r56-' + 16 lowercase hex: a-z, 0-9, '-').
const vkFor = (ch) => (/[0-9]/.test(ch) ? 48 + Number(ch)
  : /[a-z]/.test(ch) ? 65 + (ch.charCodeAt(0) - 97)
  : ch === '-' ? 189 : null);
const codeFor = (ch) => (/[0-9]/.test(ch) ? 'Digit' + ch
  : /[a-z]/.test(ch) ? 'Key' + ch.toUpperCase()
  : ch === '-' ? 'Minus' : null);

// ---------------------------------------------------------------------------
// Path contract. These validators are shared by the selftest and the live
// path, so the selftest cannot pass on logic the run does not use.
class PathError extends Error {}
const isAbsNative = (p) => typeof p === 'string' && p.length > 0 && path.isAbsolute(p);
const norm = (p) => path.resolve(p);
const inside = (child, parent) => {
  const c = norm(child);
  const p = norm(parent);
  return c === p || c.startsWith(p + path.sep);
};

function validateScratch(given) {
  if (typeof given !== 'string' || given === '') throw new PathError('--scratch is required');
  if (!isAbsNative(given)) throw new PathError('--scratch must be an ABSOLUTE path: ' + given);
  const resolved = norm(given);
  if (resolved === norm(os.homedir())) throw new PathError('--scratch must not be the home directory: ' + resolved);
  if (resolved === path.parse(resolved).root) throw new PathError('--scratch must not be a filesystem root: ' + resolved);
  if (inside(resolved, DEFAULT_PROFILE_ROOT)) throw new PathError('--scratch must not live inside the user Chromium profile: ' + resolved);
  return resolved;
}

function validateOut(given) {
  if (typeof given !== 'string' || given === '') throw new PathError('--out is required');
  if (!isAbsNative(given)) throw new PathError('--out must be an ABSOLUTE path: ' + given);
  const resolved = norm(given);
  if (inside(resolved, DEFAULT_PROFILE_ROOT)) throw new PathError('--out must not live inside the user Chromium profile: ' + resolved);
  return resolved;
}

// The profile is a THROWAWAY directory, always <scratch>/profile-<12 hex>.
// It can never be, or live under, the operator's default Chromium profile.
function validateProfile(scratch, token, profileDir) {
  if (typeof token !== 'string' || !/^[0-9a-f]{12}$/.test(token)) throw new PathError('launch token must be 12 lowercase hex chars: ' + String(token));
  const want = path.join(scratch, 'profile-' + token);
  if (norm(profileDir) !== norm(want)) throw new PathError('profile dir must be ' + want + ', got ' + profileDir);
  if (inside(profileDir, DEFAULT_PROFILE_ROOT)) throw new PathError('profile must not be the user Chromium profile: ' + profileDir);
  if (!inside(profileDir, scratch) || norm(profileDir) === norm(scratch)) throw new PathError('profile must be a child of --scratch: ' + profileDir);
  return norm(profileDir);
}

const pngNameFor = (stepName) => {
  if (!STEP_NAMES.includes(stepName)) throw new PathError('unknown step name: ' + stepName);
  return stepName + '.png';
};

function pathSelftest() {
  const cases = [];
  const t = (name, fn) => {
    try { fn(); cases.push({ name, ok: true }); }
    catch (e) { cases.push({ name, ok: false, error: String((e && e.message) || e) }); }
  };
  const refuses = (fn, label) => {
    let threw = false;
    try { fn(); } catch (e) { threw = e instanceof PathError; }
    if (!threw) throw new PathError(label + ' was accepted');
  };
  const abs = path.join(os.tmpdir(), 'tabi-r56-selftest');
  // 1 — relative scratch refused
  t('relative-scratch-refused', () => refuses(() => validateScratch('rel/scratch'), 'relative scratch'));
  // 2 — relative out refused
  t('relative-out-refused', () => refuses(() => validateOut('out/receipt.json'), 'relative out'));
  // 3 — out inside /tmp allowed
  t('out-inside-tmp-allowed', () => {
    const r = validateOut(path.join(os.tmpdir(), 'tabi-r56-selftest', 'receipt.json'));
    if (!isAbsNative(r)) throw new PathError('tmp out not absolute: ' + r);
    if (norm(r) !== norm(path.join(os.tmpdir(), 'tabi-r56-selftest', 'receipt.json'))) throw new PathError('tmp out relocated: ' + r);
  });
  // 4 — the six PNG names, in order
  t('png-names-fixed', () => {
    const got = STEP_NAMES.map(pngNameFor);
    const want = ['a-start.png', 'b-typed.png', 'c-end-witness.png', 'd-backspace.png', 'e-tab.png', 'f-enter-echo.png'];
    if (JSON.stringify(got) !== JSON.stringify(want)) throw new PathError('png names drifted: ' + JSON.stringify(got));
    refuses(() => pngNameFor('z-unknown'), 'unknown step name');
  });
  // 5 — scratch cannot be the home directory
  t('scratch-cannot-be-home', () => {
    refuses(() => validateScratch(os.homedir()), 'home as scratch');
    refuses(() => validateScratch(path.parse(os.homedir()).root), 'filesystem root as scratch');
    if (!isAbsNative(validateScratch(abs))) throw new PathError('a real absolute scratch was rejected');
  });
  // 6 — profile cannot be the user's default Chromium profile
  t('profile-cannot-be-default-chromium-profile', () => {
    const scratch = validateScratch(abs);
    refuses(() => validateProfile(scratch, 'abcdef012345', DEFAULT_PROFILE_ROOT), 'default chromium profile as profile');
    refuses(() => validateProfile(scratch, 'abcdef012345', path.join(DEFAULT_PROFILE_ROOT, 'Default')), 'chrome profile subdir as profile');
    refuses(() => validateProfile(scratch, 'abcdef012345', path.join(scratch, 'not-the-token')), 'profile not keyed by the token');
    refuses(() => validateProfile(scratch, '../escape', path.join(scratch, 'profile-../escape')), 'malformed token');
    const good = validateProfile(scratch, 'abcdef012345', path.join(scratch, 'profile-abcdef012345'));
    if (!inside(good, scratch)) throw new PathError('throwaway profile escaped scratch');
  });
  const allPass = cases.every((c) => c.ok);
  console.log(JSON.stringify({
    schema: SCHEMA + '-path-selftest', allPass,
    cases: cases.length, pass: cases.filter((c) => c.ok).length, results: cases,
  }, null, 1));
  process.exit(allPass ? 0 : 1);
}

// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && i + 1 < argv.length && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
};
const hasFlag = (name) => argv.includes('--' + name);

if (hasFlag('path-selftest')) pathSelftest();

const usage = (msg) => {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'usage', detail: msg }));
  process.exit(2);
};

// --- environment preconditions (before anything is spawned) ----------------
const chromiumArg = opt('chromium') || DEFAULT_CHROMIUM;
if (!isAbsNative(chromiumArg)) usage('--chromium must be an ABSOLUTE path: ' + chromiumArg);
if (!fs.existsSync(chromiumArg)) usage('--chromium does not exist: ' + chromiumArg);

let scratchDir, outReceipt, outDir;
try {
  scratchDir = validateScratch(opt('scratch'));
  outReceipt = validateOut(opt('out'));
  outDir = path.dirname(outReceipt);
} catch (e) {
  if (e instanceof PathError) usage(e.message);
  throw e;
}

// realpath the scratch (when it exists) and refuse a symlink into the
// operator's default Chromium profile.
let scratchReal = null;
try { scratchReal = fs.realpathSync(scratchDir); } catch { scratchReal = null; }
let defaultReal = null;
try { defaultReal = fs.realpathSync(DEFAULT_PROFILE_ROOT); } catch { defaultReal = null; }
if (scratchReal && defaultReal && inside(scratchReal, defaultReal)) {
  usage('--scratch resolves inside the user Chromium profile: ' + scratchReal);
}

try { fs.mkdirSync(scratchDir, { recursive: true }); fs.mkdirSync(outDir, { recursive: true }); }
catch (e) { usage('cannot create --scratch/--out directory: ' + String((e && e.message) || e)); }

// A REAL write probe. Without it, a non-writable --user-data-dir makes
// Chromium fall back to the operator's default profile (observed).
const probePath = path.join(scratchDir, '.write-probe-' + crypto.randomBytes(6).toString('hex'));
try {
  fs.writeFileSync(probePath, 'probe');
  if (fs.readFileSync(probePath, 'utf8') !== 'probe') throw new Error('probe readback mismatch');
  fs.rmSync(probePath, { force: true });
} catch (e) {
  try { fs.rmSync(probePath, { force: true }); } catch {}
  usage('--scratch is not writable: ' + String((e && e.message) || e));
}
try { if (!fs.statSync(scratchDir).isDirectory()) usage('--scratch is not a directory'); }
catch (e) { usage('--scratch is not usable: ' + String((e && e.message) || e)); }
try {
  const o = fs.statSync(outDir);
  if (!o.isDirectory()) usage('dirname(--out) is not a directory: ' + outDir);
} catch (e) { usage('dirname(--out) is not usable: ' + String((e && e.message) || e)); }

const driverSha256 = sha256(fs.readFileSync(SELF));

// the browser identity, read BEFORE launch so even a red receipt carries it
const versionLine = (() => {
  const r = spawnSync(chromiumArg, ['--version'], { encoding: 'utf8', timeout: 15000 });
  return String((r.stdout || r.stderr || '')).trim();
})();

// --- the launch key --------------------------------------------------------
const launchToken = crypto.randomBytes(6).toString('hex'); // 12 lowercase hex
const profileDir = validateProfile(scratchDir, launchToken, path.join(scratchDir, 'profile-' + launchToken));
const nonce = 'tabi-r56-' + crypto.randomBytes(8).toString('hex');

// Throwaway HOME/XDG_CONFIG_HOME under the scratch (sentinel RISK 1/RISK 3):
// the Arch /usr/bin/chromium wrapper prepends the USER's
// ~/.config/chromium-flags.conf, which would load the operator's own
// extension into the fixture browser, and the crashpad handler would write
// its reports into the user's default profile. Redirecting HOME keeps the
// wrapper, the profile AND the crash database inside this run's scratch.
const runHome = path.join(scratchDir, 'home-' + launchToken);
const runXdgConfig = path.join(runHome, '.config');
try {
  fs.mkdirSync(runXdgConfig, { recursive: true, mode: 0o700 });
} catch (e) {
  usage('cannot prepare the throwaway HOME ' + runHome + ': ' + String((e && e.message) || e));
}
const runCrashDb = path.join(runXdgConfig, 'chromium', 'Crash Reports');

// throwaway profile prep: never reuse, never inherit content, always 0700
try {
  fs.rmSync(profileDir, { recursive: true, force: true });
  fs.mkdirSync(profileDir, { recursive: true, mode: 0o700 });
  fs.accessSync(profileDir, fs.constants.W_OK | fs.constants.R_OK);
  if (fs.readdirSync(profileDir).length !== 0) throw new Error('profile directory is not empty after creation');
} catch (e) {
  usage('cannot prepare the throwaway profile ' + profileDir + ': ' + String((e && e.message) || e));
}

// --- keyed process sweep over /proc ---------------------------------------
// Every process whose command line carries one of this run's identity keys:
// the launch token, the throwaway profile path, or the throwaway crash
// database (sentinel RISK 3 — the crashpad handler carries NO token and is
// re-parented outside the process group). Never an image name (the operator
// runs the same binary); never pkill -f.
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
    try { cmd = fs.readFileSync('/proc/' + ent + '/cmdline', 'latin1'); } catch { continue; } // vanished: not ours
    if (SWEEP_NEEDLES.some((n) => cmd.includes(n))) pids.push(pid);
  }
  return { pids: pids.sort((a, b) => a - b) };
}
const killPid = (pid, sig = 'SIGKILL') => { try { process.kill(pid, sig); return true; } catch { return false; } };
async function sweepToZero() {
  let last = sweepOnce();
  for (let round = 0; round < SWEEP_MAX_ROUNDS; round++) {
    if (!last.pids.length) return { postKillSweepCount: 0, survivors: [], rounds: round };
    for (const pid of last.pids) killPid(pid);
    await sleep(SWEEP_WAIT_MS);
    last = sweepOnce();
  }
  return { postKillSweepCount: last.pids.length, survivors: last.pids, rounds: SWEEP_MAX_ROUNDS };
}

const preLaunch = sweepOnce();
if (preLaunch.error || preLaunch.pids.length !== 0) {
  console.error(JSON.stringify({ schema: SCHEMA, error: 'launch-token-not-fresh', preLaunch }));
  process.exit(2); // nothing was spawned; there is no receipt to explain
}

// --- fixture: loopback form + echo ----------------------------------------
const FORM_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r56 form fixture</title>
<script>
window.__keylog = [];
document.addEventListener('keydown', function (e) {
  window.__keylog.push({ key: e.key, code: e.code, keyCode: e.keyCode,
    ctrlKey: e.ctrlKey === true, altKey: e.altKey === true,
    metaKey: e.metaKey === true, shiftKey: e.shiftKey === true,
    targetId: (e.target && (e.target.id || e.target.tagName)) || null });
}, true);
</script></head>
<body><h1 id="pg">form</h1>
<form id="f" method="GET" action="/echo">
<input id="field" name="field" value="" size="40">
<input id="field2" name="field2" value="" size="40">
<input id="field3" value="" size="40">
<button id="go" type="submit">go</button>
</form></body></html>`;

const serverLog = [];
const writeServerLog = () => {
  try { fs.writeFileSync(path.join(scratchDir, 'server-log.json'), JSON.stringify(serverLog, null, 1)); }
  catch { /* stdout still carries the log */ }
};

const fixtureServer = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://127.0.0.1');
  serverLog.push({ path: u.pathname, query: u.search.replace(/^\?/, '') });
  const html = (body) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(body);
  };
  if (u.pathname === '/form') return html(FORM_HTML);
  if (u.pathname === '/echo') {
    // the SERVER-SIDE witness: the received values are rendered back, so the
    // client DOM and the server log carry the same facts independently.
    const field = u.searchParams.get('field') || '';
    const field2 = u.searchParams.get('field2') || '';
    return html(`<!doctype html><html><head><meta charset="utf-8"><title>tabi-r56 echo</title></head>
<body><h1 id="pg">echo</h1><p id="echoed">${field}</p><p id="echoed2">${field2}</p></body></html>`);
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('not found');
});
await new Promise((resolve) => fixtureServer.listen(0, '127.0.0.1', resolve));
const fixturePort = fixtureServer.address().port;
const origin = 'http://127.0.0.1:' + fixturePort;

// --- receipt skeleton: EXACT top-level keys, fixed order -------------------
const steps = [];
const failures = [];
const fail = (id, detail) => { failures.push({ id, detail: String(detail).slice(0, 400) }); };
const receipt = {
  schema: SCHEMA,
  nonce,
  driverSha256,
  host: { chromium: versionLine, argv: [], launchToken },
  fixture: { formSha256: sha256(Buffer.from(FORM_HTML, 'utf8')), origin },
  plainTrace: { entries: [] },
  controlDomain: {
    end: { valueBefore: null, valueAfter: null, negativeWitness: false },
    backspace: { valueBefore: null, valueAfter: null, expected: null },
    restore: { valueAfter: null },
    tab: { activeBefore: null, activeAfter: null },
    enter: { submitted: false, serverSawField: null, serverSawField2: null },
  },
  keylog: { entries: [], length: 0, window: { start: null, end: null } },
  serverLog,
  field3Value: null,
  steps,
  teardown: { postKillSweepCount: -1, survivors: [] },
  predicate: false,
};

// --- launch ----------------------------------------------------------------
const childArgv = [
  chromiumArg,
  '--headless=new',
  '--remote-debugging-port=0',
  '--remote-debugging-address=127.0.0.1',
  '--user-data-dir=' + profileDir,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-networking',
  '--disable-component-update',
  '--disable-sync',
  '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--window-size=1280,900',
  'about:blank',
];
// Shape-only host state (sentinel RISK 4): the receipt never carries a path
// into the user's home — any such path is replaced with a placeholder.
receipt.host.argv = childArgv.map((a) => String(a).replace(/\/home\/[^/\s"]+(?=\/)/g, '__USER_HOME__').replace(/(^|[=])~\//g, '$1__USER_HOME__/'));
const child = spawn(childArgv[0], childArgv.slice(1), {
  stdio: ['ignore', 'ignore', 'pipe'],
  detached: true, // own process group: killed as a GROUP, not by name
  env: { ...process.env, HOME: runHome, XDG_CONFIG_HOME: runXdgConfig, TMPDIR: scratchDir },
});
let stderrTail = '';
child.on('exit', () => { /* observed by the sweep, not by an exit code */ });
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

let midRunCount = -1;
let driveRan = false;

// --- discovery: the port file inside OUR throwaway profile -----------------
const portFile = path.join(profileDir, 'DevToolsActivePort');
let devPort = null;
for (let i = 0; i < 100 && !devPort; i++) {
  try {
    const first = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim();
    if (/^\d+$/.test(first)) devPort = Number(first);
  } catch { /* not yet */ }
  if (!devPort) await sleep(150);
}
if (!devPort) fail('no-devtools-active-port', 'no DevToolsActivePort inside ' + profileDir + '; stderr tail: ' + stderrTail.slice(-300));

let versionInfo = null;
if (devPort) {
  const cdpOrigin = 'http://127.0.0.1:' + devPort;
  for (let i = 0; i < 60 && !versionInfo; i++) {
    try { versionInfo = await (await fetch(cdpOrigin + '/json/version')).json(); } catch { versionInfo = null; }
    if (!versionInfo) await sleep(150);
  }
  if (!versionInfo) fail('no-json-version', 'CDP on 127.0.0.1:' + devPort + ' never answered /json/version');
}

// loopback enforcement: the debug socket must be 127.0.0.1 on both legs
if (versionInfo) {
  const browserWsHost = (() => { try { return new URL(versionInfo.webSocketDebuggerUrl).host; } catch { return null; } })();
  if (!browserWsHost || !/^127\.0\.0\.1:\d+$/.test(browserWsHost)) {
    fail('non-loopback-debug-address', String(browserWsHost));
  }
  if (!receipt.host.chromium) receipt.host.chromium = String(versionInfo.Browser || '').trim();
}

// mid-run keyed census: the token MUST bind this live launch
if (devPort) {
  const midRun = sweepOnce();
  midRunCount = midRun.pids.length;
  if (midRun.error || midRun.pids.length < 1) fail('launch-token-unbound-mid-run', JSON.stringify(midRun));
}

// --- drive -----------------------------------------------------------------
if (devPort && versionInfo && !failures.length) {
  driveRan = true;
  const cdpOrigin = 'http://127.0.0.1:' + devPort;
  let ws = null;
  try {
    // page target — polled, because about:blank may not be listed yet
    let page = null;
    for (let i = 0; i < 100 && !page; i++) {
      try {
        const list = await (await fetch(cdpOrigin + '/json/list')).json();
        page = (Array.isArray(list) ? list : []).find((t) => t.type === 'page');
      } catch { page = null; }
      if (!page) await sleep(150);
    }
    if (!page || !page.webSocketDebuggerUrl) throw new Error('no page target');
    if (!/^ws:\/\/127\.0\.0\.1:\d+\//.test(page.webSocketDebuggerUrl)) throw new Error('page ws not loopback: ' + page.webSocketDebuggerUrl);

    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true });
      ws.addEventListener('error', () => rej(new Error('ws error')), { once: true });
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
    // by-value results arrive as JS values; only strings need parsing
    const evalJSON = async (expression) => {
      const v = await evalValue(expression);
      return typeof v === 'string' ? JSON.parse(v) : v;
    };

    const capture = async (stepName) => {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      if (!shot.result || !shot.result.data) throw new Error('captureScreenshot: ' + JSON.stringify(shot).slice(0, 200));
      const buf = Buffer.from(shot.result.data, 'base64');
      const name = pngNameFor(stepName);
      fs.writeFileSync(path.join(outDir, name), buf);
      steps.push({ name: stepName, png: name, sha256: sha256(buf), bytes: buf.length });
    };
    const waitFor = async (fn, ms, every = 100) => {
      const t0 = Date.now();
      for (;;) {
        if (await fn()) return true;
        if (Date.now() - t0 >= ms) return false;
        await sleep(every);
      }
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: origin + '/form' });
    const ready = await waitFor(async () => {
      try {
        return (await evalValue('document.readyState')) === 'complete'
          && (await evalValue('location.pathname')) === '/form'
          && (await evalValue('!!document.getElementById("field")')) === true
          && (await evalValue('Array.isArray(window.__keylog)')) === true;
      } catch { return false; }
    }, 15000);
    if (!ready) throw new Error('GET /form never reached readyState complete with #field and the recorder');
    await capture('a-start');

    // --- leg 1: click #field, then keyDown+keyUp per nonce character -------
    const centreOf = async (id) => evalJSON(`(() => { const r = document.getElementById(${JSON.stringify(id)}).getBoundingClientRect(); return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)]; })()`);
    const clickCenter = async (id) => {
      const [x, y] = await centreOf(id);
      for (const type of ['mousePressed', 'mouseReleased']) {
        await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
      }
      return [x, y];
    };
    const fieldValue = () => evalValue('document.getElementById("field").value');
    const activeId = () => evalValue('document.activeElement.id || document.activeElement.tagName');

    await clickCenter('field');
    const focusAfterClick = await activeId();
    if (focusAfterClick !== 'field') fail('focus-after-click', focusAfterClick);
    const valueBeforeFirstKey = await fieldValue();
    if (valueBeforeFirstKey !== '') fail('field-not-empty-before-typing', valueBeforeFirstKey);

    for (let i = 0; i < nonce.length; i++) {
      const ch = nonce[i];
      const vk = vkFor(ch);
      const code = codeFor(ch);
      if (vk === null || code === null) { fail('key-mapping-missing', `i=${i} ch=${JSON.stringify(ch)}`); break; }
      await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: ch, text: ch, unmodifiedText: ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
      receipt.plainTrace.entries.push({ i, char: ch, valueAfter: await fieldValue() });
    }
    if (!(receipt.plainTrace.entries.length === nonce.length
      && receipt.plainTrace.entries.every((e, i) => e.char === nonce[i] && e.valueAfter === nonce.slice(0, i + 1)))) {
      fail('plain-trace-wrong', JSON.stringify(receipt.plainTrace.entries.slice(-2)));
    }
    await capture('b-typed');

    // --- leg 2: End (VK 35) — the NEGATIVE EDIT WITNESS --------------------
    const keylogBefore = await evalValue('window.__keylog.length');
    const endBefore = await fieldValue();
    await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: 'End', code: 'End', windowsVirtualKeyCode: 35, nativeVirtualKeyCode: 35 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: 'End', code: 'End', windowsVirtualKeyCode: 35, nativeVirtualKeyCode: 35 });
    const endAfter = await fieldValue();
    receipt.controlDomain.end = { valueBefore: endBefore, valueAfter: endAfter, negativeWitness: endBefore === nonce && endAfter === endBefore };
    if (!receipt.controlDomain.end.negativeWitness) fail('control-end-witness-wrong', JSON.stringify(receipt.controlDomain.end));
    await capture('c-end-witness');

    // --- leg 3: Backspace (VK 8) -------------------------------------------
    const bsBefore = await fieldValue();
    await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8, nativeVirtualKeyCode: 8 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8, nativeVirtualKeyCode: 8 });
    const bsAfter = await fieldValue();
    receipt.controlDomain.backspace = { valueBefore: bsBefore, valueAfter: bsAfter, expected: nonce.slice(0, -1) };
    if (bsAfter !== nonce.slice(0, -1)) fail('control-backspace-witness-wrong', JSON.stringify(receipt.controlDomain.backspace));
    await capture('d-backspace');

    // --- leg 4: exact restore ----------------------------------------------
    const lastCh = nonce[nonce.length - 1];
    const rVk = vkFor(lastCh);
    const rCode = codeFor(lastCh);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: lastCh, text: lastCh, unmodifiedText: lastCh, code: rCode, windowsVirtualKeyCode: rVk, nativeVirtualKeyCode: rVk });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: lastCh, code: rCode, windowsVirtualKeyCode: rVk, nativeVirtualKeyCode: rVk });
    const restored = await fieldValue();
    receipt.controlDomain.restore = { valueAfter: restored };
    if (restored !== nonce) fail('control-restore-witness-wrong', String(restored));

    // --- leg 5: Tab (VK 9) — focus field -> field2 -------------------------
    const tabBefore = await activeId();
    await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
    const tabAfter = await activeId();
    receipt.controlDomain.tab = { activeBefore: tabBefore, activeAfter: tabAfter };
    if (tabBefore !== 'field' || tabAfter !== 'field2') fail('control-tab-focus-wrong', JSON.stringify(receipt.controlDomain.tab));
    await capture('e-tab');

    // the page's own keydown recorder: the control-domain slice, read BEFORE
    // the Enter dispatch (the submission navigates; the recorder dies with it)
    const keylogAfter = await evalValue('window.__keylog.length');
    const pageKeylog = await evalJSON('JSON.stringify(window.__keylog)');
    receipt.field3Value = await evalValue('document.getElementById("field3").value');
    if (receipt.field3Value !== '') fail('field3-not-empty', receipt.field3Value);
    const slice = (Array.isArray(pageKeylog) && Number.isInteger(keylogBefore) && Number.isInteger(keylogAfter))
      ? pageKeylog.slice(keylogBefore, keylogAfter) : [];
    receipt.keylog = { entries: slice, length: slice.length, window: { start: keylogBefore, end: keylogAfter } };
    const wantKeys = ['End', 'Backspace', lastCh, 'Tab'];
    const wantCodes = ['End', 'Backspace', rCode, 'Tab'];
    const wantVks = [35, 8, rVk, 9];
    const keylogOk = slice.length === 4 && slice.every((e, i) => e
      && e.key === wantKeys[i] && e.code === wantCodes[i] && e.keyCode === wantVks[i]
      && e.ctrlKey === false && e.altKey === false && e.metaKey === false && e.shiftKey === false
      && typeof e.targetId === 'string' && e.targetId.length > 0);
    if (!keylogOk) fail('keylog-window-wrong', JSON.stringify(slice).slice(0, 360));
    if (tabAfter !== 'field2') fail('enter-source-not-tabbed-field', String(tabAfter));

    // --- leg 6: Enter (VK 13) from #field2 — implicit submission -----------
    try {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', modifiers: 0, key: 'Enter', code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
      try { await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: 0, key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 }); }
      catch { /* the document may already be navigating; the server log is the witness */ }
    } catch (e) {
      fail('enter-dispatch', String((e && e.message) || e));
    }
    const submitted = await waitFor(() => serverLog.some((r) => r.path === '/echo'), ENTER_TIMEOUT_MS, 50);
    if (!submitted) fail('enter-implicit-submission', 'no /echo request within ' + ENTER_TIMEOUT_MS + ' ms of the Enter keyDown');
    writeServerLog();

    const echoReqs = serverLog.filter((r) => r.path === '/echo');
    const q = echoReqs.length ? new URLSearchParams(echoReqs[0].query) : new URLSearchParams('');
    receipt.controlDomain.enter = {
      submitted: submitted === true && echoReqs.length === 1,
      serverSawField: echoReqs.length ? (q.get('field') || '') : '',
      serverSawField2: echoReqs.length ? (q.get('field2') || '') : '',
    };
    if (echoReqs.length !== 1) fail('enter-echo-count', 'expected exactly 1 /echo request, saw ' + echoReqs.length + ': ' + JSON.stringify(echoReqs).slice(0, 300));
    if (receipt.controlDomain.enter.serverSawField !== nonce) fail('enter-field-value', JSON.stringify(receipt.controlDomain.enter.serverSawField));
    if (receipt.controlDomain.enter.serverSawField2 !== '') fail('enter-field2-not-empty', JSON.stringify(receipt.controlDomain.enter.serverSawField2));

    // client-side witness on the echo page
    const echoReady = await waitFor(async () => {
      try { return (await evalValue('location.pathname')) === '/echo' && (await evalValue('document.readyState')) === 'complete'; }
      catch { return false; }
    }, 5000);
    if (!echoReady) fail('echo-page-not-ready', 'location.pathname never became /echo');
    let echoed = null;
    try { echoed = await evalValue('(document.getElementById("echoed")||{}).textContent'); } catch { echoed = null; }
    if (echoed !== nonce) fail('echo-page-value', String(echoed));
    await capture('f-enter-echo');
  } catch (e) {
    fail('drive-error', String((e && e.message) || e));
  } finally {
    try { if (ws) ws.close(); } catch {}
  }
}

// --- teardown: kill the process GROUP, then sweep the token to zero --------
try { fixtureServer.close(); } catch {}
if (child.pid) { try { process.kill(-child.pid, 'SIGKILL'); } catch { /* group already gone */ } }
await sleep(600);
const swept = await sweepToZero();
receipt.teardown = { postKillSweepCount: swept.postKillSweepCount, survivors: swept.survivors };
if (swept.postKillSweepCount !== 0 || swept.survivors.length !== 0) fail('teardown-survivor', JSON.stringify(swept));
writeServerLog();

// --- predicate: every witness true, keyed sweep empty ---------------------
const cd = receipt.controlDomain;
const witness = {
  plainTrace: receipt.plainTrace.entries.length === nonce.length
    && receipt.plainTrace.entries.every((e, i) => e.char === nonce[i] && e.valueAfter === nonce.slice(0, i + 1)),
  end: cd.end.negativeWitness === true && cd.end.valueAfter === cd.end.valueBefore && cd.end.valueAfter === nonce,
  backspace: cd.backspace.valueBefore === nonce && cd.backspace.valueAfter === nonce.slice(0, -1),
  restore: cd.restore.valueAfter === nonce,
  tab: cd.tab.activeBefore === 'field' && cd.tab.activeAfter === 'field2',
  enter: cd.enter.submitted === true && cd.enter.serverSawField === nonce && cd.enter.serverSawField2 === '',
  keylog: receipt.keylog.length === 4 && receipt.keylog.window.end - receipt.keylog.window.start === 4,
  field3: receipt.field3Value === '',
  steps: steps.length === STEP_NAMES.length && steps.every((s, i) => s.name === STEP_NAMES[i]),
  serverLogEcho: serverLog.filter((r) => r.path === '/echo').length === 1,
  launchBound: midRunCount >= 1,
  teardown: receipt.teardown.postKillSweepCount === 0 && receipt.teardown.survivors.length === 0,
};
receipt.predicate = Object.values(witness).every((v) => v === true) && failures.length === 0;

fs.writeFileSync(outReceipt, JSON.stringify(receipt, null, 1));

console.log(JSON.stringify({
  schema: SCHEMA,
  predicate: receipt.predicate,
  nonce,
  chromium: receipt.host.chromium,
  launchToken,
  driveRan,
  sweeps: { preLaunch: preLaunch.pids.length, midRun: midRunCount, postKill: receipt.teardown.postKillSweepCount },
  plainTraceLength: receipt.plainTrace.entries.length,
  keylog: receipt.keylog.window,
  controlDomain: cd,
  steps: steps.map((s) => ({ name: s.name, bytes: s.bytes })),
  serverLog: serverLog.map((r) => ({ path: r.path, query: r.query.slice(0, 80) })),
  witness,
  failures,
  receipt: outReceipt,
}, null, 1));

process.exit(receipt.predicate ? 0 : 1);

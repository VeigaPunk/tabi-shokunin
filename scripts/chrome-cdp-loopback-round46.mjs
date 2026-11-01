#!/usr/bin/env node
// chrome-cdp-loopback-round46.mjs — tabi round 46, claim C1 runner (operability:
// the teardown repair routed from round 45). Drives a real Chromium-class
// browser over raw CDP on THIS Windows host against a loopback-only fixture
// and records a nonce-bound evidence receipt — same launch/discovery/drive
// discipline as rounds 44-45 — with the r45 teardown-orphan class closed:
//
//   r45 defect (lesson round-45 Mistake 5): child.kill('SIGKILL') signals ONLY
//   the main browser pid; by the time the belt-and-suspenders
//   `taskkill /PID <main> /T /F` ran, the main was already dead, so the /T
//   tree walk had nothing to walk, and re-parented Edge helpers outlived the
//   run while `chromeTerminated: true` stayed truthful about the main child
//   only. Three re-parented msedge orphan trees survived into round-close
//   hygiene.
//
//   r46 repair (carry-in: "job-object or PID-group kill keyed to the launch"):
//   a PID-GROUP KILL KEYED TO THE LAUNCH. Every process of this launch can be
//   recognized without image names (the operator's own browser shares the
//   image) because the launch owns a unique profile token — the per-run
//   profile directory basename, e.g. edge-profile-3f9a2b7c1d0e — which the
//   browser and every helper carry verbatim in their command line
//   (--user-data-dir / --database). The runner sweeps the live process table
//   (PowerShell Get-CimInstance Win32_Process, CommandLine LIKE the token,
//   own pid excluded) at three points:
//     pre-launch   count must be 0 (the key is fresh; refuse to start else);
//     mid-run      count >= 1 (the keyed group is nonempty while the browser
//                  lives — proof the token actually binds this launch);
//     post-kill    kill each surviving pid BY PID (taskkill /PID <pid> /F /T),
//                  re-sweep until 0 (bounded rounds); the receipt is ok only
//                  when the final post-kill sweep count is 0.
//   The legacy `taskkill /T` on the main pid is still recorded — with its
//   output — as structural evidence that it is a no-op once the main is dead.
//
// Declared residual (frozen before review data): the keyed group is the set of
// processes whose command line carries the launch token; a helper that rewrote
// its command line to drop the token would be outside the group (none observed
// across this round's runs — every observed helper carried it). The counter
// binds receipt shape and committed bytes; that a browser ran is re-derived by
// re-running this runner, whose fixture nonce differs per invocation (same
// residual model as rounds 44-45). No zero-egress claim is made; the DevTools
// socket and the fixture URL are the only endpoints the receipt records, both
// 127.0.0.1.
//
// Usage:
//   node scripts/chrome-cdp-loopback-round46.mjs --browser chrome|edge --out <receipt.json> --shot <shot.png> --scratch <dir>
//   node scripts/chrome-cdp-loopback-round46.mjs --browser chrome|edge --probe --scratch <dir>   (launch + /json/version + sweep census only)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TITLE = 'tabi r46 cdp loopback fixture';
const MARKER_ID = 'tabi-r46-loopback-marker-5e7a';
const MARKER_TEXT = 'tabi-r46-loopback-marker-5e7a';
const SURFACES = {
  chrome: {
    candidates: [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    ],
    profilePrefix: 'chrome-profile-',
  },
  edge: {
    candidates: [
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    ],
    profilePrefix: 'edge-profile-',
  },
};
const SWEEP_MAX_ROUNDS = 15;
const SWEEP_WAIT_MS = 400;

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-chrome-cdp-round46', error: msg }));
  process.exit(2);
}

const argv = process.argv.slice(2);
let out = null, shot = null, scratch = null, probe = false, surface = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--out') out = argv[++i];
  else if (argv[i] === '--shot') shot = argv[++i];
  else if (argv[i] === '--scratch') scratch = argv[++i];
  else if (argv[i] === '--probe') probe = true;
  else if (argv[i] === '--browser') surface = argv[++i];
}
if (surface !== 'chrome' && surface !== 'edge') die('usage: --browser chrome|edge required');
if (!scratch) die('usage: --scratch <dir> required');
if (!probe && (!out || !shot)) die('usage: --out <receipt.json> --shot <shot.png> --scratch <dir> | --probe --scratch <dir>');
fs.mkdirSync(scratch, { recursive: true });

function findBrowser() {
  for (const p of SURFACES[surface].candidates) {
    try { fs.accessSync(p); return p; } catch { }
  }
  die(`no ${surface} browser found in the declared candidate list`);
}

function waitFor(fn, ms, every = 100) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      const v = fn();
      if (v !== null || Date.now() - t0 > ms) { clearInterval(iv); resolve(v); }
    }, every);
  });
}

// --- keyed sweep (the repair) -------------------------------------------------
// Enumerate the launch's process group: every process whose command line
// carries the unique per-run profile token. Never an image name. The querying
// powershell excludes its own pid ($PID); the sync spawn means it has exited
// before the results are parsed.
function sweepOnce(token) {
  const ps = `$r = @(Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%${token}%'" | ` +
    `Where-Object { $_.ProcessId -ne $PID }); ConvertTo-Json -InputObject $r -Compress`;
  const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps],
    { windowsHide: true, timeout: 30000, maxBuffer: 8 * 1024 * 1024, encoding: 'utf8' });
  if (r.error || r.status !== 0) return { error: r.error ? String(r.error) : `exit ${r.status} stderr=${(r.stderr || '').slice(-200)}` };
  const raw = (r.stdout || '').trim();
  let procs = [];
  try { procs = JSON.parse(raw.length ? raw : '[]'); } catch (e) { return { error: `unparseable sweep output: ${String(e).slice(-120)}` }; }
  if (!Array.isArray(procs)) procs = [procs];
  return {
    count: procs.length,
    pids: procs.map((p) => p.ProcessId),
    procs: procs.map((p) => ({ pid: p.ProcessId, ppid: p.ParentProcessId, name: p.Name || null })),
  };
}

function killByPid(pid) {
  const r = spawnSync('taskkill', ['/PID', String(pid), '/F', '/T'],
    { windowsHide: true, timeout: 15000, encoding: 'utf8' });
  return { pid, exit: r.status, output: ((r.stdout || '') + (r.stderr || '')).trim().slice(-300) };
}

// Kill-until-empty loop: one sweep per round; any survivors are killed BY PID;
// repeated until the sweep reaches 0 or the round budget is spent (fail-closed:
// the receipt then records a nonzero final count and ok stays false).
function sweepToZero(token) {
  const rounds = [];
  for (let i = 1; i <= SWEEP_MAX_ROUNDS; i++) {
    const s = sweepOnce(token);
    if (s.error) { rounds.push({ round: i, error: s.error }); return { rounds, postKillSweepCount: -1, finalError: s.error }; }
    const entry = { round: i, count: s.count, pids: s.pids, procs: s.procs, killed: [] };
    if (s.count > 0) for (const pid of s.pids) entry.killed.push(killByPid(pid));
    rounds.push(entry);
    if (s.count === 0) return { rounds, postKillSweepCount: 0 };
  }
  return { rounds, postKillSweepCount: rounds[rounds.length - 1].count };
}

// --- launch key ----------------------------------------------------------------
// Unique per run: 12 hex chars of fresh randomness in the profile dir basename.
// The pre-launch sweep asserts the key is fresh (count 0) before anything is
// spawned; a collision refuses the run instead of risking a foreign process.
const launchToken = `${SURFACES[surface].profilePrefix}${crypto.randomBytes(6).toString('hex')}`;
const preLaunchSweep = sweepOnce(launchToken);
if (preLaunchSweep.error || preLaunchSweep.count !== 0) {
  die(`launch token not fresh (pre-launch sweep ${JSON.stringify(preLaunchSweep).slice(-200)})`);
}

const browserPath = findBrowser();
const profileDir = path.join(scratch, launchToken);
fs.rmSync(profileDir, { recursive: true, force: true });
fs.mkdirSync(profileDir, { recursive: true });

// --- loopback fixture server -------------------------------------------------
const fixtureNonce = crypto.randomBytes(32).toString('hex');
let fixtureUrl = null;
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url.startsWith('/?')) {
    const body = `<!doctype html><html><head><title>${TITLE}</title>` +
      `<meta name="fixture-nonce" content="${fixtureNonce}"></head>` +
      `<body><h1>${TITLE}</h1><div id="${MARKER_ID}">${MARKER_TEXT}</div></body></html>`;
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  } else {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
});
await new Promise((resolve, reject) => {
  server.on('error', reject);
  server.listen(0, '127.0.0.1', () => { fixtureUrl = `http://127.0.0.1:${server.address().port}/`; resolve(); });
});

// --- browser launch ----------------------------------------------------------
const t0Ms = Date.now();
const flags = [
  '--headless=new',
  '--remote-debugging-port=0',
  `--user-data-dir=${profileDir}`,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-extensions',
  '--disable-features=Translate,MediaRouter',
  '--metrics-recording-only', '--no-pings', '--password-store=basic',
  '--window-size=800,600',
  'about:blank',
];
const child = spawn(browserPath, flags, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
let childExit = null;
child.on('exit', (code, sig) => { childExit = { code, sig }; });
let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-2000); });

// Discovery, two legs, both bound to 127.0.0.1 before use (unchanged from r45):
//   1. the stderr "DevTools listening on ws://..." line (branded Chrome prints it);
//   2. the DevToolsActivePort file in the throwaway profile (Edge on this host
//      prints no stderr line; the file carries the ephemeral port + browser path).
// Leg 2 is accepted only together with a successful /json/version read below, so
// a stale or coincidental file cannot stand in for a live socket.
let wsHost = null, discoveryVia = null, devtoolsBrowserPath = null;
const wsEndpoint = await waitFor(() => {
  const m = stderrTail.match(/DevTools listening on (ws:\/\/(\d+\.\d+\.\d+\.\d+:\d+)\/\S+)/);
  return m ? m[1] : null;
}, 8000);
if (wsEndpoint) {
  wsHost = wsEndpoint.match(/^ws:\/\/([^/]+)\//)[1];
  discoveryVia = 'stderr';
}
if (!wsHost) {
  const found = await waitFor(() => {
    try {
      const raw = fs.readFileSync(path.join(profileDir, 'DevToolsActivePort'), 'utf8');
      const nl = raw.indexOf('\n');
      const portLine = (nl === -1 ? raw : raw.slice(0, nl)).trim();
      const bpLine = (nl === -1 ? '' : raw.slice(nl + 1).split(/\r?\n/)[0].trim());
      if (/^\d+$/.test(portLine)) return { port: Number(portLine), bp: bpLine };
    } catch { }
    return null;
  }, 22000);
  if (found) {
    wsHost = `127.0.0.1:${found.port}`;
    devtoolsBrowserPath = found.bp || null;
    discoveryVia = 'devtools-active-port';
  }
}
if (!wsHost) {
  child.kill('SIGKILL');
  const cleanup = sweepToZero(launchToken);
  server.close();
  die(`no DevTools endpoint discovered (stderr tail: ${stderrTail.slice(-200)}; no DevToolsActivePort file; keyed cleanup postKillSweepCount=${cleanup.postKillSweepCount})`);
}
if (!/^127\.0\.0\.1:\d+$/.test(wsHost)) {
  child.kill('SIGKILL');
  const cleanup = sweepToZero(launchToken);
  server.close();
  die(`devtools socket not loopback: ${wsHost} (keyed cleanup postKillSweepCount=${cleanup.postKillSweepCount})`);
}

async function jsonEndpoint(p, method = 'GET') {
  const res = await fetch(`http://${wsHost}${p}`, { method });
  if (!res.ok) throw new Error(`${p} -> ${res.status}`);
  return res.json();
}

let version = null;
try { version = await jsonEndpoint('/json/version'); } catch (e) { /* fall through */ }
if (!version) {
  child.kill('SIGKILL');
  const cleanup = sweepToZero(launchToken);
  server.close();
  die(`could not read /json/version (keyed cleanup postKillSweepCount=${cleanup.postKillSweepCount})`);
}

// Mid-run keyed census: the launch's process group, live, while the browser is
// fully up (after /json/version). This is the proof the token binds the real
// launch — the main browser and its helpers all appear.
const midRunSweep = sweepOnce(launchToken);
if (midRunSweep.error) {
  child.kill('SIGKILL');
  const cleanup = sweepToZero(launchToken);
  server.close();
  die(`mid-run sweep failed: ${midRunSweep.error} (keyed cleanup postKillSweepCount=${cleanup.postKillSweepCount})`);
}

if (probe) {
  child.kill('SIGKILL');
  const cleanup = sweepToZero(launchToken);
  server.close();
  console.log(JSON.stringify({
    schema: 'tabi-chrome-cdp-round46-probe', ok: cleanup.postKillSweepCount === 0,
    declaredSurface: surface, launchToken, preLaunchSweepCount: 0,
    browserPath, browser: version.Browser, protocolVersion: version['Protocol-Version'],
    wsHost, discoveryVia, devtoolsBrowserPath,
    midRunSweepCount: midRunSweep.count, midRunSweepProcs: midRunSweep.procs,
    postKillSweepCount: cleanup.postKillSweepCount, sweepRounds: cleanup.rounds.length,
    profileDir, flags,
  }, null, 1));
  setTimeout(() => process.exit(cleanup.postKillSweepCount === 0 ? 0 : 1), 300);
} else {
  // --- open the fixture page and drive it -------------------------------------
  const target = await jsonEndpoint(`/json/new?${encodeURIComponent(fixtureUrl)}`, 'PUT');
  const tDomMs = Date.now();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = (e) => reject(new Error('ws error')); setTimeout(() => reject(new Error('ws open timeout')), 15000); });
  let mid = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  function send(method, params = {}) {
    const id = ++mid;
    return new Promise((resolve, reject) => {
      pending.set(id, (m) => m.error ? reject(new Error(`${method}: ${JSON.stringify(m.error)}`)) : resolve(m.result));
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`${method} timeout`)); } }, 15000);
    });
  }
  await send('Runtime.enable');
  await send('Page.enable');
  // wait for the load to settle, then read the live DOM
  let dom = null;
  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const rs = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
    if (rs.result.value === 'complete') {
      const ev = await send('Runtime.evaluate', {
        expression: `JSON.stringify({title: document.title, nonce: (document.querySelector('meta[name=fixture-nonce]')||{}).content || null, markerFound: !!document.querySelector('#${MARKER_ID}'), textHead: (document.body.innerText||'').slice(0,200)})`,
        returnByValue: true,
      });
      dom = JSON.parse(ev.result.value);
      break;
    }
  }
  if (!dom) {
    try { ws.close(); } catch { }
    child.kill('SIGKILL');
    const cleanup = sweepToZero(launchToken);
    server.close();
    die(`page never reached readyState complete (keyed cleanup postKillSweepCount=${cleanup.postKillSweepCount})`);
  }
  const shotB64 = (await send('Page.captureScreenshot', { format: 'png' })).data;
  const tShotMs = Date.now();
  try { ws.close(); } catch { }
  // --- teardown (the repair) ---------------------------------------------------
  try { await fetch(`http://${wsHost}/json/close/${target.id}`); } catch { }
  const tKillMs = Date.now();
  child.kill('SIGKILL'); // signals the MAIN child only — the r45 lesson
  // Legacy tree-kill on the main pid, recorded with its output: after the main
  // is dead this is the structural no-op that let r45 helpers survive.
  const legacyTreeKill = (() => {
    const r = spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'],
      { windowsHide: true, timeout: 15000, encoding: 'utf8' });
    return { ran: true, pid: child.pid, exit: r.status, output: ((r.stdout || '') + (r.stderr || '')).trim().slice(-300) };
  })();
  // Keyed PID-group kill to zero (the repair).
  const keyedSweep = sweepToZero(launchToken);
  const exited = await new Promise((resolve) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (childExit !== null) { clearInterval(iv); resolve(true); }
      else if (Date.now() - t0 > 5000) { clearInterval(iv); resolve(false); }
    }, 100);
  });
  server.close();
  const shotBuf = Buffer.from(shotB64, 'base64');
  const tEndMs = Date.now();
  const nonce = crypto.randomBytes(32).toString('hex');
  const runnerSha256 = sha256(fs.readFileSync(fileURLToPath(import.meta.url)));
  const ok = dom.title === TITLE && dom.markerFound === true && dom.nonce === fixtureNonce
    && shotBuf.length > 0 && shotBuf[0] === 0x89 && shotBuf[1] === 0x50
    && exited === true && keyedSweep.postKillSweepCount === 0 && midRunSweep.count >= 1;
  const receipt = {
    schema: 'tabi-chrome-cdp-round46',
    declaredSurface: surface,
    nonce, runnerSha256,
    browserPath, browser: version.Browser, protocolVersion: version['Protocol-Version'],
    wsHost, discoveryVia, devtoolsBrowserPath, fixtureUrl, fixtureNonce,
    flags,
    launchKey: launchToken,
    launchPid: child.pid,
    profileDir,
    preLaunchSweepCount: 0,
    midRunSweep: { count: midRunSweep.count, pids: midRunSweep.pids, procs: midRunSweep.procs },
    dom,
    domFixtureNonce: dom.nonce,
    pageTitle: dom.title,
    markerFound: dom.markerFound,
    invocationBound: dom.nonce === fixtureNonce,
    screenshotSha256: sha256(shotBuf),
    pngByteLength: shotBuf.length,
    teardown: {
      chromeTerminated: exited,
      childExit,
      legacyTreeKill,
      keyedSweep,
      postKillSweepCount: keyedSweep.postKillSweepCount,
    },
    t0Ms, tDomMs, tShotMs, tKillMs, tEndMs,
    hostOs: `${os.type()} ${os.release()}`,
    nodeVersion: process.version,
  };
  fs.writeFileSync(shot, shotBuf);
  fs.writeFileSync(out, JSON.stringify(receipt, null, 1) + '\n');
  console.log(JSON.stringify({
    ok, declaredSurface: receipt.declaredSurface, pageTitle: receipt.pageTitle,
    invocationBound: receipt.invocationBound, screenshotSha256: receipt.screenshotSha256,
    pngByteLength: receipt.pngByteLength, browser: receipt.browser, wsHost: receipt.wsHost,
    launchKey: receipt.launchKey, midRunSweepCount: receipt.midRunSweep.count,
    postKillSweepCount: receipt.teardown.postKillSweepCount,
    legacyTreeKillExit: receipt.teardown.legacyTreeKill.exit,
  }));
  process.exit(ok ? 0 : 1);
}

#!/usr/bin/env node
// legacy-teardown-control-r46.mjs — tabi round 46, claim C1 live control.
// Launches a REAL branded browser (Edge/Chrome, declared surface) exactly in
// the r45 launch shape, tears it down with the r45 legacy teardown — SIGKILL
// the main child, then `taskkill /PID <main> /T /F` — and then observes the
// launch's keyed group (unique per-run profile token) with the round-46 sweep:
//
//   orphansAfterLegacyTeardown  the honest per-run observation: how many keyed
//                               processes outlived the legacy teardown (the
//                               r45 round-close class; 0 on a lucky run is a
//                               pass of THIS RUN, not proof of the repair —
//                               the deterministic red limb is the mechanism
//                               fixture);
//   recovery                    every observed survivor is killed BY PID and
//                               the final sweep must reach 0 (leave no trace).
//
// Nothing is left running regardless of the observation.
// Usage: node legacy-teardown-control-r46.mjs --browser edge|chrome --out <receipt.json> --scratch <dir>
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const SURFACES = {
  chrome: {
    candidates: ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'],
    profilePrefix: 'chrome-lcy-',
  },
  edge: {
    candidates: ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'],
    profilePrefix: 'edge-lcy-',
  },
};
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const die = (msg) => { console.error(JSON.stringify({ schema: 'tabi-r46-legacy-teardown-control', error: msg })); process.exit(2); };

const argv = process.argv.slice(2);
let out = null, scratch = null, surface = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--out') out = argv[++i];
  else if (argv[i] === '--scratch') scratch = argv[++i];
  else if (argv[i] === '--browser') surface = argv[++i];
}
if (!SURFACES[surface] || !scratch || !out) die('usage: --browser edge|chrome --out <receipt.json> --scratch <dir>');
fs.mkdirSync(scratch, { recursive: true });

function sweepOnce(token) {
  const ps = `$r = @(Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%${token}%'" | ` +
    `Where-Object { $_.ProcessId -ne $PID }); ConvertTo-Json -InputObject $r -Compress`;
  const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps],
    { windowsHide: true, timeout: 30000, maxBuffer: 8 * 1024 * 1024, encoding: 'utf8' });
  if (r.status !== 0) return { error: `exit ${r.status} ${(r.stderr || '').slice(-200)}` };
  let procs = [];
  try { procs = JSON.parse((r.stdout || '').trim() || '[]'); } catch (e) { return { error: `unparseable: ${String(e).slice(-120)}` }; }
  if (!Array.isArray(procs)) procs = [procs];
  return { count: procs.length, pids: procs.map((p) => p.ProcessId), procs: procs.map((p) => ({ pid: p.ProcessId, ppid: p.ParentProcessId, name: p.Name })) };
}
const killByPid = (pid) => {
  const r = spawnSync('taskkill', ['/PID', String(pid), '/F', '/T'], { windowsHide: true, timeout: 15000, encoding: 'utf8' });
  return { pid, exit: r.status };
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let browserPath = null;
for (const p of SURFACES[surface].candidates) { try { fs.accessSync(p); browserPath = p; break; } catch { } }
if (!browserPath) die(`no ${surface} browser in the declared candidate list`);

const token = `${SURFACES[surface].profilePrefix}${crypto.randomBytes(6).toString('hex')}`;
const preLaunch = sweepOnce(token);
if (preLaunch.error || preLaunch.count !== 0) die(`token not fresh: ${JSON.stringify(preLaunch).slice(-150)}`);

const profileDir = path.join(scratch, token);
fs.rmSync(profileDir, { recursive: true, force: true });
fs.mkdirSync(profileDir, { recursive: true });

const flags = [
  '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profileDir}`,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-extensions',
  '--disable-features=Translate,MediaRouter', '--metrics-recording-only', '--no-pings',
  '--password-store=basic', '--window-size=800,600', 'about:blank',
];
const child = spawn(browserPath, flags, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-2000); });

// wait for the DevTools endpoint (either r45 discovery leg) so the browser is
// fully up, then census the keyed group
async function waitEndpoint() {
  for (let i = 0; i < 300; i++) {
    const m = stderrTail.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+)\/\S+/);
    if (m) return m[1].replace('ws://', '');
    try {
      const raw = fs.readFileSync(path.join(profileDir, 'DevToolsActivePort'), 'utf8');
      const port = raw.slice(0, raw.indexOf('\n') === -1 ? raw.length : raw.indexOf('\n')).trim();
      if (/^\d+$/.test(port)) return `127.0.0.1:${port}`;
    } catch { }
    await sleep(100);
  }
  return null;
}
const wsHost = await waitEndpoint();
let version = null;
if (wsHost) { try { version = await (await fetch(`http://${wsHost}/json/version`)).json(); } catch { } }
if (!version) { try { child.kill('SIGKILL'); } catch { } sweepOnce(token).pids?.forEach(killByPid); die('endpoint never came up'); }
await sleep(500);
const midRun = sweepOnce(token);

// --- the r45 legacy teardown, verbatim in shape -------------------------------
try { child.kill('SIGKILL'); } catch { }
const legacyTreeKill = (() => {
  const r = spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, timeout: 15000, encoding: 'utf8' });
  return { ran: true, pid: child.pid, exit: r.status, output: ((r.stdout || '') + (r.stderr || '')).trim().slice(-300) };
})();
let childExitSeen = null;
for (let i = 0; i < 50 && childExitSeen === null; i++) { await sleep(100); try { process.kill(child.pid, 0); } catch { childExitSeen = true; } }
await sleep(800); // give any helper shutdown race its window — then observe
const orphans = sweepOnce(token);

// --- recovery: kill every survivor BY PID, sweep to zero ----------------------
const recovered = (orphans.pids || []).map(killByPid);
await sleep(400);
let finalSweep = sweepOnce(token);
let finalCount = finalSweep.error ? -1 : finalSweep.count;
for (let i = 0; i < 10 && finalCount > 0 && !finalSweep.error; i++) {
  finalSweep.pids.forEach(killByPid);
  await sleep(400);
  finalSweep = sweepOnce(token);
  finalCount = finalSweep.error ? -1 : finalSweep.count;
}

const receipt = {
  schema: 'tabi-r46-legacy-teardown-control',
  declaredSurface: surface, browserPath, browser: version.Browser, wsHost,
  launchToken: token, profileDir,
  preLaunchSweepCount: 0,
  midRunSweep: { count: midRun.error ? null : midRun.count, pids: midRun.error ? null : midRun.pids, procs: midRun.error ? null : midRun.procs },
  legacyTeardown: { sigkillMain: true, legacyTreeKill, mainExitObserved: childExitSeen === true },
  orphansAfterLegacyTeardown: { count: orphans.error ? null : orphans.count, pids: orphans.error ? null : orphans.pids, procs: orphans.error ? null : orphans.procs, error: orphans.error || null },
  keyedRecovery: { recovered, finalSweepCount: finalCount },
  ok: finalCount === 0,
  hostOs: `${os.type()} ${os.release()}`, nodeVersion: process.version,
};
fs.writeFileSync(out, JSON.stringify(receipt, null, 1) + '\n');
console.log(JSON.stringify({
  ok: receipt.ok, browser: receipt.browser, midRunSweepCount: receipt.midRunSweep.count,
  legacyTreeKillExit: legacyTreeKill.exit, legacyTreeKillOutput: legacyTreeKill.output.slice(-120),
  orphansAfterLegacyTeardown: receipt.orphansAfterLegacyTeardown.count,
  finalSweepCount: finalCount,
}));
process.exit(receipt.ok ? 0 : 1);

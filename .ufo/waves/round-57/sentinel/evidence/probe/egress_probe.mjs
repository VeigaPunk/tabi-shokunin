#!/usr/bin/env node
// Sentinel probe: does the r56/r57 contract-shaped Chromium launch confine its
// background-service artefacts (GCM registration state, crash database,
// extension load) to the THROWAWAY HOME, and does it egress?
//
// Mirrors the r56 runner's launch shape exactly:
//   throwaway HOME + XDG_CONFIG_HOME under the scratch, --user-data-dir under
//   the scratch, --disable-extensions, --disable-background-networking,
//   --remote-debugging-address=127.0.0.1.
//
// Writes everything under the scratch. Touches nothing outside it.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const SCRATCH = process.argv[2];
const CHROMIUM = '/usr/bin/chromium';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(SCRATCH, { recursive: true });
const token = crypto.randomBytes(6).toString('hex');
const profileDir = path.join(SCRATCH, 'profile-' + token);
const runHome = path.join(SCRATCH, 'home-' + token);
const runXdgConfig = path.join(runHome, '.config');
fs.mkdirSync(profileDir, { recursive: true, mode: 0o700 });
fs.mkdirSync(runXdgConfig, { recursive: true, mode: 0o700 });
const runCrashDb = path.join(runXdgConfig, 'chromium', 'Crash Reports');

// the operator's real default profile + flags file — READ ONLY, for comparison
const realHome = os.homedir();
const realProfile = path.join(realHome, '.config', 'chromium');
const realFlags = path.join(realHome, '.config', 'chromium-flags.conf');

const mtimesBefore = (() => {
  const m = {};
  for (const p of [path.join(realProfile, 'Crash Reports', 'settings.dat')]) {
    try { m[p] = fs.statSync(p).mtimeMs; } catch { m[p] = null; }
  }
  return m;
})();

// a loopback fixture (same shape as the runner's): serves a page with a form
const srv = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end('<!doctype html><html><body><form method="GET" action="/echo">' +
    '<input id="field" name="field" value=""><input id="field2" name="field2" value="">' +
    '<input id="field3" value=""></form></body></html>');
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const port = srv.address().port;

const argv = [
  CHROMIUM,
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
  'http://127.0.0.1:' + port + '/form',
];

const child = spawn(argv[0], argv.slice(1), {
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true,
  env: { ...process.env, HOME: runHome, XDG_CONFIG_HOME: runXdgConfig, TMPDIR: SCRATCH },
});
let stderr = '';
child.stderr.on('data', (d) => { stderr += d.toString(); });
let stdout = '';
child.stdout.on('data', (d) => { stdout += d.toString(); });

await sleep(12000);

const NEEDLES = [token, profileDir, runCrashDb];
const procs = [];
for (const ent of fs.readdirSync('/proc')) {
  if (!/^\d+$/.test(ent)) continue;
  const pid = Number(ent);
  let cmd;
  try { cmd = fs.readFileSync('/proc/' + ent + '/cmdline', 'latin1'); } catch { continue; }
  if (NEEDLES.some((n) => cmd.includes(n))) {
    procs.push({ pid, cmd: cmd.replace(/\0/g, ' ').slice(0, 300) });
  }
}

// the EFFECTIVE argv of the browser (not the requested one)
let effectiveArgv = null;
try {
  const pf = fs.readFileSync(path.join(profileDir, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim();
  const vi = await (await fetch('http://127.0.0.1:' + pf + '/json/version')).json();
  const list = await (await fetch('http://127.0.0.1:' + pf + '/json/list')).json();
  effectiveArgv = { wsHost: new URL(vi.webSocketDebuggerUrl).host, targets: list.map((t) => t.type + ' ' + (t.url || '').slice(0, 120)) };
} catch (e) { effectiveArgv = { error: String(e && e.message) }; }

// did the USER's default profile get written by this launch?
const mtimesAfter = {};
for (const p of Object.keys(mtimesBefore)) {
  try { mtimesAfter[p] = fs.statSync(p).mtimeMs; } catch { mtimesAfter[p] = null; }
}
const realProfileTouched = Object.keys(mtimesBefore).filter((p) => mtimesBefore[p] !== mtimesAfter[p]);

// what did the throwaway HOME collect?
const walk = (dir, depth = 0) => {
  const out = [];
  if (depth > 4) return out;
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, depth + 1));
    else out.push(path.relative(SCRATCH, p));
  }
  return out;
};
const homeFiles = walk(runHome);

// GCM / google / extension evidence in the browser's own stderr+stdout
const gcmLines = (stderr + stdout).split('\n').filter((l) => /gcm|googleapis|phone_registration|DEPRECATED_ENDPOINT|Authentication Failed/i.test(l));

// teardown: kill the group, then sweep by the needles
try { process.kill(-child.pid, 'SIGKILL'); } catch {}
await sleep(900);
const survivors = [];
for (const ent of fs.readdirSync('/proc')) {
  if (!/^\d+$/.test(ent)) continue;
  let cmd;
  try { cmd = fs.readFileSync('/proc/' + ent + '/cmdline', 'latin1'); } catch { continue; }
  if (NEEDLES.some((n) => cmd.includes(n))) survivors.push(Number(ent));
}
for (const p of survivors) { try { process.kill(p, 'SIGKILL'); } catch {} }
await sleep(600);
const survivors2 = [];
for (const ent of fs.readdirSync('/proc')) {
  if (!/^\d+$/.test(ent)) continue;
  let cmd;
  try { cmd = fs.readFileSync('/proc/' + ent + '/cmdline', 'latin1'); } catch { continue; }
  if (NEEDLES.some((n) => cmd.includes(n))) survivors2.push(Number(ent));
}
srv.close();

const report = {
  realFlagsExists: fs.existsSync(realFlags),
  realFlagsContent: fs.existsSync(realFlags) ? fs.readFileSync(realFlags, 'utf8').slice(0, 600) : null,
  effectiveArgv,
  liveProcsDuringRun: procs,
  gcmLines: gcmLines.slice(0, 20),
  gcmLineCount: gcmLines.length,
  realProfileTouched,
  throwawayHomeFiles: homeFiles.slice(0, 60),
  throwawayHomeFileCount: homeFiles.length,
  survivorsAfterGroupKill: survivors,
  survivorsAfterPidSweep: survivors2,
};
fs.writeFileSync(path.join(SCRATCH, 'egress-probe.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
process.exit(0);

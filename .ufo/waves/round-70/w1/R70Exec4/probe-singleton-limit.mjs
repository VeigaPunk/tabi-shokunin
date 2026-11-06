#!/usr/bin/env node
// Host-robustness probe (round 70 w1, seat R70Exec4): find the exact byte length at which
// Chromium's per-session temp dir for its process-singleton Unix socket stops working.
//
// Chromium (155.0.8059.84) creates `<TMPDIR>/org.chromium.Chromium.XXXXXX/SingletonSocket`
// and exits FATAL "Socket path too long" when that path exceeds the sun_path limit; the scored
// r69/r70 CDP drivers then poll http://127.0.0.1:<devPort>/json/list for 1600*150 ms = 240 s
// and fail with "no loopback page target".
//
// This probe isolates the variable: TMPDIR is a directory whose path is padded to EXACTLY
// --length bytes (byte length, not UTF-16 units), the profile/HOME dirs are held at a fixed
// length, and the launch argv is the pinned driver's argv (headless=new, loopback CDP, fresh
// user-data-dir).
//
// Usage: node probe-singleton-limit.mjs --scratch <ABS dir> --lengths 55,56,...,75
//          [--profile-mode short|tmpdir] [--wait-ms 4000] [--json <file>]
// Exit 0 when the probe ran (whatever it measured); 2 usage.
// Write scope: --scratch only.
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const usage = (d) => { console.error('usage: ' + d); process.exit(2); };
const scratch = opt('scratch');
if (!scratch || !path.isAbsolute(scratch)) usage('--scratch <ABS dir>');
const lengths = String(opt('lengths') || '').split(',').filter(Boolean).map(Number);
if (!lengths.length || lengths.some((n) => !Number.isInteger(n) || n < 8 || n > 200)) usage('--lengths 8..200');
const profileMode = opt('profile-mode') || 'short';
if (!['short', 'tmpdir', 'long'].includes(profileMode)) usage('--profile-mode short|tmpdir|long');
const waitMs = Number(opt('wait-ms') || 4000);
const jsonOut = opt('json');
const CHROMIUM = '/usr/bin/chromium';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(scratch, { recursive: true });
const base = fs.realpathSync(scratch);
const freePort = () => new Promise((resolve, reject) => {
  const s = net.createServer();
  s.once('error', reject);
  s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const entries = (dir) => { try { return fs.readdirSync(dir).sort(); } catch { return []; } };
const findSingleton = (root, depth = 4) => {
  const found = [];
  const walk = (d, lvl) => {
    if (lvl > depth) return;
    let es = [];
    try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of es) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, lvl + 1);
      else if (e.name === 'SingletonSocket') found.push(p);
    }
  };
  walk(root, 0);
  return found;
};

const results = [];
for (const len of lengths) {
  // The TMPDIR itself must be exactly `len` bytes: base + '/' + padding. Its parent is `base`,
  // which is fixed, so the padding width is exact.
  const padLen = len - Buffer.byteLength(base) - 1;
  if (padLen < 1) { results.push({ tmpdirLength: len, kind: 'unbuildable', detail: 'pad<=0 (base ' + Buffer.byteLength(base) + ')' }); continue; }
  const tmpdir = path.join(base, 'x'.repeat(padLen));
  if (Buffer.byteLength(tmpdir) !== len) { results.push({ tmpdirLength: len, kind: 'bad-length', detail: String(Buffer.byteLength(tmpdir)) }); continue; }
  const homeDir = path.join(base, 'home');
  const profileDir = profileMode === 'tmpdir' ? path.join(tmpdir, 'p')
    : profileMode === 'long' ? path.join(base, 'p'.repeat(180)) : path.join(base, 'prof-fixed');
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  try {
    fs.mkdirSync(tmpdir, { recursive: true });
    for (const d of [profileDir, path.join(homeDir, '.config'), path.join(homeDir, '.cache'), path.join(homeDir, '.local', 'share'), path.join(homeDir, '.local', 'state'), path.join(homeDir, 'run')]) fs.mkdirSync(d, { recursive: true });
  } catch (e) { results.push({ tmpdirLength: len, kind: 'mkdir-failed', detail: e.message }); continue; }
  const env = {
    ...process.env, HOME: homeDir,
    XDG_CONFIG_HOME: path.join(homeDir, '.config'), XDG_CACHE_HOME: path.join(homeDir, '.cache'),
    XDG_DATA_HOME: path.join(homeDir, '.local', 'share'), XDG_STATE_HOME: path.join(homeDir, '.local', 'state'),
    XDG_RUNTIME_DIR: path.join(homeDir, 'run'),
    TMPDIR: tmpdir, TMP: tmpdir, TEMP: tmpdir,
  };
  const devPort = await freePort();
  const childArgv = [CHROMIUM, '--headless=new', '--remote-debugging-port=' + devPort,
    '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
    '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
    '--force-device-scale-factor=1', '--window-size=1280,900', 'about:blank'];
  const t0 = Date.now();
  const child = spawn(childArgv[0], childArgv.slice(1), { stdio: ['ignore', 'ignore', 'pipe'], detached: true, env });
  let stderr = '';
  child.stderr.on('data', (d) => { if (stderr.length < 8192) stderr += d.toString('utf8'); });
  let exited = null;
  child.on('exit', (code, sig) => { exited = { code, sig, atMs: Date.now() - t0 }; });
  let kind = null, devtoolsMs = null, devtoolsJson = null, tmpEntries = [], socket = [];
  while (Date.now() - t0 < waitMs) {
    if (exited) break;
    try {
      const r = await fetch('http://127.0.0.1:' + devPort + '/json/version', { signal: AbortSignal.timeout(800) });
      if (r.ok) { devtoolsJson = await r.json(); devtoolsMs = Date.now() - t0; break; }
    } catch { /* not up yet */ }
    await sleep(80);
  }
  if (devtoolsMs !== null) kind = 'ok';
  else if (exited) kind = /Socket path too long/.test(stderr) ? 'fatal-socket-too-long' : 'exit-other';
  else kind = 'timeout-alive';
  if (kind === 'ok') {
    tmpEntries = entries(tmpdir);
    socket = findSingleton(tmpdir).concat(findSingleton(profileDir));
  }
  try { process.kill(-child.pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch {} }
  await sleep(150);
  const fatalLine = (stderr.split('\n').find((l) => /Socket path too long|FATAL:/.test(l)) || '').trim();
  const rec = {
    tmpdirLength: len, tmpdir, profileMode, kind, exit: exited, devtoolsMs,
    fatalLine: fatalLine.slice(0, 400),
    tmpEntries, socketPaths: socket, socketLengths: socket.map((s) => Buffer.byteLength(s)),
    socketKinds: socket.map((p) => { let st = null, link = null; try { st = fs.lstatSync(p); } catch {} try { link = fs.readlinkSync(p); } catch {}
      return { path: p, len: Buffer.byteLength(p), isSymlink: !!st && st.isSymbolicLink(), isSocket: !!st && st.isSocket(), link }; }),
    stderrFull: stderr.slice(0, 2000),
    expectedSocketLength: len + 45,
    endpoint: devtoolsJson ? { Browser: devtoolsJson.Browser } : null,
  };
  results.push(rec);
  console.log(JSON.stringify(rec));
  try { fs.rmSync(tmpdir, { recursive: true, force: true }); } catch {}
}
if (jsonOut) fs.writeFileSync(path.resolve(jsonOut), JSON.stringify(results, null, 1));
process.exitCode = 0;

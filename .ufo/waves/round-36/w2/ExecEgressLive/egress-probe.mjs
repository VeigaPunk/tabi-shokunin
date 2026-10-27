#!/usr/bin/env node
// ExecEgressLive — instrument-free live egress replication (tabi r36 w2, attack on C2 leg A5).
//
// Reproduces, WITHOUT the counter, the A5 observation the frozen counter makes:
//   variant "prefs"    : moz:firefoxOptions prefs network.dns.disabled=true, network.trr.mode=5
//                        -> expect 0 ESTABLISHED non-loopback sockets
//   variant "noprefs" : the same session with the prefs dropped
//                        -> expect >= 1 ESTABLISHED non-loopback socket
//
// Loopback / non-loopback definition copied verbatim from the frozen counter
// .ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs (lines ~417-436):
//   /proc/net/tcp   : remote addr slice(0,8) !== '0100007F' (127.0.0.1 LE) && !== '00000000' (0.0.0.0)
//   /proc/net/tcp6  : remote addr !== '0000000000000000' && !== '0000000000000001' && !== '0100000000000000'
//   ESTABLISHED only (state field f[3] === '01'), sockets owned by the session's process tree
//   (treePids + socketInodesOf, also copied from the counter).
//
// Usage: node egress-probe.mjs --variant prefs|noprefs --out <file.json> [--scratch <dir>]
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync, readlinkSync } from 'node:fs';
import { join } from 'node:path';

const GECKODRIVER = '/home/vgpnk/.local/bin/geckodriver';
const FIREFOX = '/home/vgpnk/.local/opt/firefox-158.0.1/firefox';

const argv = process.argv.slice(2);
const o = { variant: 'prefs', out: null, scratch: null, waitMs: 8000, sampleMs: 400 };
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--variant') o.variant = argv[++i];
  else if (a === '--out') o.out = argv[++i];
  else if (a === '--scratch') o.scratch = argv[++i];
  else if (a === '--wait-ms') o.waitMs = Number(argv[++i]);
  else if (a === '--sample-ms') o.sampleMs = Number(argv[++i]);
  else throw new Error(`unknown arg ${a}`);
}
if (!o.out) throw new Error('--out required');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- counter-identical sampler primitives ---------------------------------

function treePids(rootPid) {
  const out = new Set([rootPid]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const pid of readdirSync('/proc')) {
      if (!/^[0-9]+$/.test(pid)) continue;
      const p = Number(pid);
      if (out.has(p)) continue;
      try {
        const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
        const ppid = Number(stat.slice(stat.lastIndexOf(') ') + 2).split(' ')[1]);
        if (out.has(ppid)) { out.add(p); changed = true; }
      } catch { /* gone */ }
    }
  }
  return [...out];
}

const socketInodesOf = (pids) => {
  const inodes = new Set();
  for (const pid of pids) {
    let fds;
    try { fds = readdirSync(`/proc/${pid}/fd`); } catch { continue; }
    for (const fd of fds) {
      try {
        const l = readlinkSync(`/proc/${pid}/fd/${fd}`);
        const m = /^socket:\[([0-9]+)\]$/.exec(l);
        if (m) inodes.add(Number(m[1]));
      } catch { /* gone */ }
    }
  }
  return inodes;
};

function commOf(pid) {
  try { return readFileSync(`/proc/${pid}/comm`, 'utf8').trim(); } catch { return null; }
}

// Returns { count, rows } where rows are the RAW /proc/net/tcp{,6} lines counted.
// Same masks as the counter's nonLoopbackEstablished().
// `allStates` additionally reports every socket state (not just 01) so we can see
// whether an ESTABLISHED-only filter hides attempted egress.
function nonLoopbackEstablished(owned, allStates = false) {
  let count = 0;
  const rows = [];
  const byState = {};
  const parse = (file, v6) => {
    let raw;
    try { raw = readFileSync(file, 'utf8').split('\n').slice(1); } catch { return; }
    for (const row of raw) {
      const f = row.trim().split(/\s+/);
      if (f.length < 4) continue;
      if (!owned.has(Number(f[9]))) continue;
      const remote = f[2];
      const addr = v6 ? remote.split(':')[0] : remote.slice(0, 8);
      let nonLoop = false;
      if (v6) nonLoop = addr !== '0000000000000000' && addr !== '0000000000000001' && addr !== '0100000000000000';
      else nonLoop = addr !== '0100007F' && addr !== '00000000';
      if (!nonLoop) continue;
      if (allStates) {
        byState[f[3]] = (byState[f[3]] || 0) + 1;
        if (f[3] !== '01') rows.push({ file, remote, local: f[1], st: f[3], inode: f[9], nonEstablished: true });
        continue;
      }
      if (f[3] !== '01') continue; // ESTABLISHED only
      count += 1;
      rows.push({ file, remote, local: f[1], st: f[3], inode: f[9] });
    }
  };
  parse('/proc/net/tcp', false);
  parse('/proc/net/tcp6', true);
  return { count, rows, byState };
}

// ---- session --------------------------------------------------------------

async function freePort() {
  const { createServer } = await import('node:net');
  return new Promise((res, rej) => {
    const s = createServer();
    s.on('error', rej);
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
  });
}

async function main() {
  const started = new Date().toISOString();
  const scratch = o.scratch || mkdtempSync(join('/fast/scratch/hyaku/tabi-r36/ExecEgressLive', 'probe-'));
  mkdirSync(join(scratch, 'home'), { recursive: true });
  for (const d of ['.config', '.cache', '.local/share', '.local/state']) mkdirSync(join(scratch, 'home', d), { recursive: true });
  mkdirSync(join(scratch, 'tmp'), { recursive: true });
  mkdirSync(join(scratch, 'profiles'), { recursive: true });

  const port = await freePort();
  const wsPort = await freePort();
  const env = {
    PATH: process.env.PATH,
    HOME: join(scratch, 'home'),
    TMPDIR: join(scratch, 'tmp'),
    XDG_CONFIG_HOME: join(scratch, 'home', '.config'),
    XDG_CACHE_HOME: join(scratch, 'home', '.cache'),
    XDG_DATA_HOME: join(scratch, 'home', '.local/share'),
    XDG_STATE_HOME: join(scratch, 'home', '.local/state'),
    MOZ_HEADLESS: '1',
    LC_ALL: 'C.UTF-8',
  };

  const out = {
    schema: 'tabi-r36-w2-ExecEgressLive-egress-probe-v1',
    variant: o.variant,
    started,
    scratch,
    geckodriver: GECKODRIVER,
    firefox: FIREFOX,
    port,
    wsPort,
    prefs: o.variant === 'prefs' ? { 'network.dns.disabled': true, 'network.trr.mode': 5 } : null,
    waitMs: o.waitMs,
    sampleMs: o.sampleMs,
    samples: [],
    session: null,
    error: null,
  };

  const gd = spawn(GECKODRIVER, ['--port', String(port), '--websocket-port', String(wsPort), '--binary', FIREFOX, '--profile-root', join(scratch, 'profiles')], { stdio: 'ignore', env, detached: true });

  const sampler = setInterval(() => {
    try {
      const pids = treePids(gd.pid);
      const owned = socketInodesOf(pids);
      const { count, rows, byState } = nonLoopbackEstablished(owned);
      const anyState = nonLoopbackEstablished(owned, true);
      const ff = pids.filter((p) => { const c = commOf(p); return c && /firefox/i.test(c); });
      const ffOwned = socketInodesOf(ff);
      const ffHit = nonLoopbackEstablished(ffOwned);
      out.samples.push({
        t: new Date().toISOString(),
        pids: pids.length,
        firefoxPids: ff,
        socketInodes: owned.size,
        firefoxSocketInodes: ffOwned.size,
        nonLoopback: count,
        firefoxNonLoopback: ffHit.count,
        nonLoopbackByState: anyState.byState,
        nonLoopbackAnyState: Object.values(anyState.byState).reduce((a, b) => a + b, 0),
        rows,
      });
    } catch (e) { /* best effort */ }
  }, o.sampleMs);

  const killTree = () => {
    try { process.kill(-gd.pid, 'SIGKILL'); } catch { try { gd.kill('SIGKILL'); } catch {} }
  };

  try {
    // ONE session; prefs present only in the "prefs" variant.
    const alwaysMatch = {
      browserName: 'firefox',
      webSocketUrl: true,
      unhandledPromptBehavior: 'ignore',
      'moz:firefoxOptions': o.variant === 'prefs'
        ? { args: ['-headless'], prefs: { 'network.dns.disabled': true, 'network.trr.mode': 5 } }
        : { args: ['-headless'] },
    };
    let body = null;
    for (let k = 0; k < 60 && !body; k += 1) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/session`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ capabilities: { alwaysMatch } }),
        });
        body = await r.json();
      } catch { await sleep(200); }
    }
    if (!body || !body.value || !body.value.capabilities) throw new Error(`session failed: ${JSON.stringify(body).slice(0, 400)}`);
    out.session = {
      sessionId: body.value.sessionId,
      browserVersion: body.value.capabilities.browserVersion,
      geckodriverVersion: body.value.capabilities['moz:geckodriverVersion'],
      webSocketUrl: body.value.capabilities.webSocketUrl,
      capabilitiesMozFirefoxOptions: body.value.capabilities['moz:firefoxOptions'] ?? null,
      createdAt: new Date().toISOString(),
    };
    // open about:blank explicitly over plain WebDriver HTTP
    try {
      const r = await fetch(`http://127.0.0.1:${port}/session/${body.value.sessionId}/url`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: 'about:blank' }),
      });
      out.session.navigateAboutBlank = { status: r.status, ok: r.ok };
    } catch (e) { out.session.navigateAboutBlank = { error: String(e) }; }
    // wait for the session to live
    await sleep(o.waitMs);
  } catch (e) {
    out.error = String((e && e.stack) || e);
  } finally {
    clearInterval(sampler);
    // final sample immediately before teardown
    try {
      const pids = treePids(gd.pid);
      const owned = socketInodesOf(pids);
      const { count, rows } = nonLoopbackEstablished(owned);
      out.samples.push({ t: new Date().toISOString(), pids: pids.length, firefoxPids: pids.filter((p) => { const c = commOf(p); return c && /firefox/i.test(c); }), socketInodes: owned.size, nonLoopback: count, rows, final: true });
    } catch { /* gone */ }
    killTree();
    await sleep(800);
    try { spawnSync('pkill', ['-f', 'firefox-158.0.1']); } catch { /* best effort */ }
  }

  out.finished = new Date().toISOString();
  out.sampleCount = out.samples.length;
  out.totalNonLoopbackSum = out.samples.reduce((a, s) => a + (s.nonLoopback || 0), 0);
  out.maxNonLoopbackInSample = out.samples.reduce((a, s) => Math.max(a, s.nonLoopback || 0), 0);
  out.samplesWithNonLoopback = out.samples.filter((s) => (s.nonLoopback || 0) > 0).length;
  out.distinctPeers = [...new Set(out.samples.flatMap((s) => (s.rows || []).map((r) => `${r.file} ${r.remote}`)))];
  out.expectation = o.variant === 'prefs' ? 'nonLoopback == 0' : 'nonLoopback >= 1';
  out.verdict = o.variant === 'prefs'
    ? (out.maxNonLoopbackInSample === 0 ? 'PASS-prefs-zero-non-loopback' : 'FAIL-prefs-saw-non-loopback')
    : (out.maxNonLoopbackInSample >= 1 ? 'PASS-noprefs-saw-non-loopback' : 'FAIL-noprefs-no-non-loopback');

  writeFileSync(o.out, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({
    variant: out.variant,
    sampleCount: out.sampleCount,
    totalNonLoopbackSum: out.totalNonLoopbackSum,
    maxNonLoopbackInSample: out.maxNonLoopbackInSample,
    samplesWithNonLoopback: out.samplesWithNonLoopback,
    distinctPeers: out.distinctPeers,
    verdict: out.verdict,
    error: out.error,
  }, null, 2));
}

await main();

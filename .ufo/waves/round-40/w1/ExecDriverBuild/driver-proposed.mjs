#!/usr/bin/env node
// playwright-firefox-egress-round39.mjs — tabi round 39, session-bound egress driver.
// Round-38 closure routed defect 3: make the Playwright egress/survivor evidence
// session-bound — owned nonempty PID set, sampling coverage, fail-closed when
// unavailable. This driver:
//   1. launches Firefox 157.0 (playwright firefox v1555, Juggler wire) via Playwright
//      1.64.0 and takes the OWNED root pid from browser.process().pid (never a global
//      executable grep);
//   2. enumerates the full descendant tree once per sample tick from
//      `ps -eo pid=,ppid=` (ppid walk); an empty owned set ABORTS the run (fail-closed);
//   3. samples sockets owned by those pids every 100 ms across the whole session on TWO
//      independent surfaces — `ss -Htnp` pid filtering AND /proc/<pid>/fd socket-inode
//      matching against /proc/net/tcp + /proc/net/tcp6 — plus a post-close final sweep;
//      if neither surface is readable it ABORTS (fail-closed);
//   4. binds the version claim to the launched session: browser.version(), the live
//      page userAgent, and the binary spawnfile path;
//   5. keeps the round-38 binding artifact: two cold runs, identical first-screenshot
//      sha256; records per-step evidence, cleanup proof (survivors 0, port closed).
//   Round-40 (--round40) additions, all fail-closed:
//   6. per-sample timestamps stamped from one monotonic base (fields t/m/tEnd) and a
//      coverage gate that waits for BOTH >=8 samples and a >=1000 ms observed span;
//   7. the owned pid set is re-derived from `ps` on every tick (roots + descendant
//      walk) with /proc start-time identity, so processes spawned after launch are
//      observed and a recycled pid is never mistaken for a survivor;
//   8. an unavailable ss or /proc surface refuses the run at pre-flight, mid-session
//      AND at the post-close final sweep, instead of only being recorded.
//
// Usage: node scripts/playwright-firefox-egress-round39.mjs --out <receipt.json> [--runs 2]
// Writes: the receipt JSON to --out; scratch only under
// $HYAKU_SCRATCH/tabi-r39/playwright-egress/ (removed on exit).
import { firefox } from '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/index.mjs';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync, readlinkSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';

const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PLAYWRIGHT = '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright';
const PW_VERSION = JSON.parse(readFileSync(join(PLAYWRIGHT, 'package.json'), 'utf8')).version;
const FIREFOX_BIN = '/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox';
const ROUND40 = process.argv.includes('--round40');
const SCHEMA = ROUND40 ? 'tabi-pw-firefox-egress-receipt-r40' : 'tabi-pw-firefox-egress-receipt-v2';
const SAMPLE_MS = 100;
const POST_CLOSE_TAIL_MS = 600;
// Round-40 coverage floors come from the frozen counter predicate: >=8 strictly
// increasing samples whose observed first-to-last span is >=1000 ms.
const MIN_SAMPLES = 8;
const MIN_SPAN_MS = 1000;
const COVERAGE_BUDGET_MS = 8000;
// Sample wall timestamps are derived from one monotonic base, so consecutive t
// values are strictly increasing by construction and their span is real elapsed
// time rather than two reads of a clock that can step backwards.
const CLOCK0 = Date.now();
const MONO0 = process.hrtime.bigint();
const monoMs = () => Number(process.hrtime.bigint() - MONO0) / 1e6;
const nowT = () => CLOCK0 + Math.round(monoMs());
let lastSampleT = 0;
function stamp() {
  const m = monoMs();
  const t = CLOCK0 + Math.round(m);
  const ordered = t > lastSampleT;
  if (ordered) lastSampleT = t;
  return { t, m, ordered };
}

class FailClosed extends Error {}

const FIXTURE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>TABI-R39 fixture</title>
<style>html,body{margin:0;padding:0;overflow:hidden;background:#fff;color:#111;font:16px/1.5 monospace}
#frame{width:800px;height:600px;box-sizing:border-box;padding:24px}
#btn{font:inherit;padding:4px 12px}.confirm{color:#0a5}</style></head>
<body><div id="frame">
<h1>TABI-R39 playwright-firefox session-bound egress fixture</h1>
<p id="static">static paragraph never mutated</p>
<button id="btn">mutate</button>
<p>count: <span id="count">0</span></p>
<ul id="list"></ul>
<div id="confirms"></div>
<p>status: <span id="status">booting</span></p>
</div>
<script>
setTimeout(function(){document.getElementById('status').textContent='hydrated';},150);
var count=0;
document.getElementById('btn').addEventListener('click',function(){
 count=count+1;
 document.getElementById('count').textContent=String(count);
 var li=document.createElement('li');li.id='item-'+count;li.textContent='item '+count;
 document.getElementById('list').appendChild(li);
 setTimeout(function(){var d=document.createElement('div');d.className='confirm';d.id='confirm-'+count;d.textContent='confirmed '+count;document.getElementById('confirms').appendChild(d);},120);
});
<\/script></body></html>`;

const FIXTURE2 = FIXTURE.replace('TABI-R39 playwright-firefox session-bound egress fixture', 'TABI-R39 playwright-firefox session-bound egress fixture page2')
  .replace('id="status">booting', 'id="status">page2');

const FIXTURE_SHA = sha256(FIXTURE);
const sh = (c) => { try { return spawnSync('/bin/bash', ['-c', c], { encoding: 'utf8' }).stdout.trim(); } catch { return ''; } };

// --- owned process tree -----------------------------------------------------
// Playwright 1.64 no longer exposes browser.process(); the owned root is instead
// bound as: direct children of THIS node process (process.pid) whose argv names the
// Playwright-managed Firefox binary, plus their full descendant tree from
// `ps -eo pid=,ppid=`. Session-bound by construction: nothing outside this
// process's own spawn set can enter the owned set.
// null means "the process table could not be read" — never conflate that with an
// empty owned set, which is the only case that is a real launch failure.
function pidPpidTable() {
  const r = spawnSync('ps', ['-eo', 'pid=,ppid=,args=', '--no-headers'], { encoding: 'utf8', maxBuffer: 16 << 20 });
  if (r.error || r.status !== 0) return null;
  const rows = [];
  for (const line of r.stdout.split('\n')) {
    const m = line.trim().split(/\s+/);
    if (m.length >= 3 && /^\d+$/.test(m[0]) && /^\d+$/.test(m[1])) rows.push([Number(m[0]), Number(m[1]), m.slice(2).join(' ')]);
  }
  return rows;
}
// /proc/<pid>/stat field 22 (starttime) binds a pid to one process instance.
function procStartTime(pid) {
  try {
    const raw = readFileSync(`/proc/${pid}/stat`, 'utf8');
    const fields = raw.slice(raw.lastIndexOf(')') + 2).split(' ');
    const start = Number(fields[19]);
    return Number.isFinite(start) ? start : null;
  } catch { return null; }
}
const OWNED_SOURCE = 'children of this node process naming ms-playwright/firefox + ps -eo pid=,ppid= descendant walk, re-derived every sample with /proc start-time identity';
// One refresh = one fresh `ps` snapshot. The pid set is rebuilt from this node
// process outwards on every call, so a content/utility process that appears after
// launch is observed on the next tick instead of never.
function refreshOwned(nodePid, state) {
  const rows = pidPpidTable();
  if (rows === null) return { available: false, reason: 'process table unreadable (ps exited nonzero)', roots: [], tree: [] };
  const roots = rows.filter(([pid, ppid, args]) => ppid === nodePid && /ms-playwright\/firefox-\d+\//.test(args)).map(([pid, , args]) => ({ pid, argv0: args.split(' ')[0] }));
  const tree = ownedTreeFromRows(rows, roots.map((r) => r.pid));
  state.refreshes += 1;
  if (roots.length === 0 || tree.length === 0) return { available: false, reason: 'owned pid set empty on refresh', roots, tree };
  for (const pid of tree) if (!state.seen.has(pid)) state.seen.set(pid, procStartTime(pid));
  return { available: true, roots, tree };
}
function ownedTreeFromRows(rows, roots) {
  const children = new Map();
  for (const [pid, ppid] of rows) {
    if (!children.has(ppid)) children.set(ppid, []);
    children.get(ppid).push(pid);
  }
  const tree = [];
  const seen = new Set();
  const queue = [...roots];
  while (queue.length) {
    const p = queue.shift();
    if (seen.has(p)) continue;
    seen.add(p);
    tree.push(p);
    for (const c of children.get(p) || []) queue.push(c);
  }
  return tree.sort((a, b) => a - b);
}

// --- socket observation, surface 1: ss -Htnp --------------------------------
// Returns { ticks, lines, nonLoopback, byPid } for the owned pid set.
function observeSs(tree) {
  let txt;
  if (ROUND40) {
    const r = spawnSync('ss', ['-Htnp'], { encoding: 'utf8', maxBuffer: 8 << 20 });
    if (r.error || r.status !== 0) return null;
    txt = r.stdout;
  } else {
    txt = sh('ss -Htnp 2>/dev/null');
    if (!txt) return null;
  }
  const pids = tree.filter((p) => Number.isInteger(p) && p > 0);
  if (pids.length === 0) return null; // nothing owned to observe is not an observation
  const pidRe = new RegExp(`pid=(?:${pids.join('|')})[,\\)]`);
  const lines = txt.split('\n').filter((l) => l.trim() && pidRe.test(l));
  let nonLoopback = 0;
  let nonLoopbackBind = 0;
  let listeners = 0;
  for (const l of lines) {
    const f = l.trim().split(/\s+/);
    const state = f[0] || '';
    const local = f[3] || '';
    const peer = f[4] || '';
    if (state === 'LISTEN') {
      // A listening socket has no peer: ss prints 0.0.0.0:* / [::]:*. Score the bind
      // address separately so a wildcard bind stays visible without being mistaken
      // for outbound traffic — the same split observeProc makes by skipping st 0A.
      listeners += 1;
      if (!isLoopbackBind(local)) nonLoopbackBind += 1;
      continue;
    }
    if (!isLoopbackPeer(peer)) nonLoopback += 1;
  }
  return { ticks: 1, lines: lines.length, pidCount: pids.length, listeners, nonLoopback, nonLoopbackBind };
}
function isLoopbackBind(local) {
  const addr = local.replace(/:\d+$/, '');
  if (/^127\./.test(addr)) return true;
  if (/^\[::1\]$/.test(addr)) return true;
  if (/^\[0:0:0:0:0:0:0:1\]$/.test(addr)) return true;
  if (/^\[::ffff:127\./.test(addr)) return true;
  return false; // 0.0.0.0, [::], *: a wildcard or external bind
}
function isLoopbackPeer(peer) {
  // peer forms: 127.0.0.1:443, [::1]:443, [::ffff:127.0.0.1]:443, hostnames are not
  // produced by ss for IP sockets; treat anything else as non-loopback.
  if (/^127\./.test(peer)) return true;
  if (/^\[::1\]/.test(peer)) return true;
  if (/^\[0:0:0:0:0:0:0:1\]/.test(peer)) return true;
  if (/^\[::ffff:127\./.test(peer)) return true;
  return false;
}

// --- socket observation, surface 2: /proc fd inodes x /proc/net/tcp{,6} ------
function socketInodesOfPid(pid) {
  const fds = `/proc/${pid}/fd`;
  const inodes = new Set();
  let names = null;
  try { names = readdirSync(fds); } catch (e) {
    // An exited pid is not a surface failure; a denied or unreadable fd table is.
    return { gone: !!(e && (e.code === 'ENOENT' || e.code === 'ESRCH')), inodes, code: (e && e.code) || 'EIO' };
  }
  for (const fd of names) {
    try {
      const link = readlinkSync(join(fds, fd));
      const m = /^socket:\[(\d+)\]$/.exec(link);
      if (m) inodes.add(m[1]);
    } catch {}
  }
  return { gone: false, inodes };
}
function parseProcNet(path) {
  let txt = null;
  try { txt = readFileSync(path, 'utf8'); } catch { return null; }
  const rows = [];
  for (const line of txt.split('\n').slice(1)) {
    const f = line.trim().split(/\s+/);
    if (f.length < 10) continue;
    rows.push({ rem: f[2], inode: f[9], st: f[3] });
  }
  return rows;
}
// /proc/net/tcp{,6} prints addresses as little-endian 32-bit words. Decode to
// memory-order bytes so the loopback test reads like a normal address.
function decodeProcIp(ip) {
  const b = [];
  if (ip.length === 8) {
    for (let i = 3; i >= 0; i -= 1) b.push(parseInt(ip.slice(i * 2, i * 2 + 2), 16));
    return b;
  }
  if (ip.length === 32) {
    for (let w = 0; w < 4; w += 1) {
      const word = ip.slice(w * 8, w * 8 + 8);
      for (let i = 3; i >= 0; i -= 1) b.push(parseInt(word.slice(i * 2, i * 2 + 2), 16));
    }
    return b;
  }
  return null;
}
function isLoopbackHexRem(rem) {
  // rem = "0100007F:8AEF" (v4, one LE word) or 32-hex v6 ":port".
  const [ip] = rem.split(':');
  const b = decodeProcIp(ip.toUpperCase());
  if (!b) return false;
  if (b.length === 4) return b[0] === 0x7F; // 127/8
  const zeroHead = b.slice(0, 10).every((x) => x === 0);
  if (zeroHead && b[15] === 1 && b.slice(10, 15).every((x) => x === 0)) return true; // ::1
  if (zeroHead && b[10] === 0xFF && b[11] === 0xFF && b[12] === 0x7F) return true; // ::ffff:127/8
  return false;
}
// Returns { ticks, inodes, nonLoopback } or null when the surface is unavailable.
function observeProc(tree) {
  let inodes = 0;
  let nonLoopback = 0;
  const nets = [parseProcNet('/proc/net/tcp'), parseProcNet('/proc/net/tcp6')];
  if (ROUND40 && nets.some((n) => n === null)) return null;
  const anyReadable = nets.some((n) => n !== null);
  if (!anyReadable) return null;
  let denied = 0;
  let live = 0;
  for (const pid of tree) {
    const s = socketInodesOfPid(pid);
    if (s.gone) continue; // exited mid-sample
    if (s.code) { denied += 1; continue; } // fd table unreadable, not "no sockets"
    live += 1;
    for (const n of nets) {
      if (n === null) continue;
      for (const row of n) {
        if (!s.inodes.has(row.inode)) continue;
        if (row.st === '0A') continue; // LISTEN has no remote endpoint
        if (row.rem === '00000000:0000' || row.rem === '00000000000000000000000000000000:0000') continue;
        inodes += 1;
        if (!isLoopbackHexRem(row.rem)) nonLoopback += 1;
      }
    }
  }
  // Everything we still owned was unreadable and nothing was scannable: that is an
  // unavailable surface, not an empty observation.
  if (live === 0 && denied > 0) return null;
  return { ticks: 1, inodes, nonLoopback, livePids: live, denied };
}

function sampleSockets(tree) {
  const { t, m, ordered } = stamp();
  const ss = observeSs(tree);
  const pr = observeProc(tree);
  const missing = [];
  if (ss === null) missing.push('ss');
  if (pr === null) missing.push('proc');
  if (ROUND40) {
    if (missing.length) return { t, m, ordered, unavailable: true, missing, pids: tree.length };
  } else if (missing.length === 2) return { t, m, ordered, unavailable: true, missing, pids: tree.length };
  return {
    t,
    m,
    ordered,
    tEnd: nowT(),
    pids: tree.length,
    ss: ss || { ticks: 0, lines: 0, nonLoopback: 0, unavailable: true },
    proc: pr || { ticks: 0, inodes: 0, nonLoopback: 0, unavailable: true },
  };
}

async function runOnce({ runName, profileRoot, runNonce }) {
  const rec = { name: runName, cmds: [], events: [], refused: false, refuseReason: null, runNonce };
  const server = createServer((req, res) => {
    rec.events.push({ method: 'http.request', url: req.url });
    if (req.url === '/' || req.url === '/a.html') { res.end(FIXTURE); return; }
    if (req.url === '/b.html') { res.end(FIXTURE2); return; }
    res.statusCode = 404; res.end('nf');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  rec.serverPort = port;

  const profile = mkdtempSync(join(profileRoot, 'profile-'));
  const browser = await firefox.launch({ headless: true, firefoxUserPrefs: { 'network.dns.disablePrefetch': true } });
  // give the browser a moment to exec, then bind the owned set to this node process
  await sleep(400);
  const ownedState = { seen: new Map(), refreshes: 0 };
  const firstOwned = refreshOwned(process.pid, ownedState);
  rec.binary = firstOwned.available && firstOwned.roots.length ? firstOwned.roots[0].argv0 : FIREFOX_BIN;

  // session start: pre-flight observation must be possible and the owned set nonempty
  const preflight = firstOwned.available ? sampleSockets(firstOwned.tree) : { unavailable: true, missing: [firstOwned.reason] };
  if (!firstOwned.available) {
    rec.refused = true;
    rec.refuseReason = `owned process identity unavailable at launch: ${firstOwned.reason}`;
    rec.owned = { nodePid: process.pid, roots: [], tree: [], liveTree: [], refreshes: ownedState.refreshes, treeSizeBySample: [], source: OWNED_SOURCE };
    try { await browser.close(); } catch {}
    if (ROUND40) await new Promise((resolveClose) => server.close(resolveClose)); else server.close();
    return rec;
  }
  rec.owned = { nodePid: process.pid, roots: firstOwned.roots, tree: firstOwned.tree, liveTree: firstOwned.tree, refreshes: ownedState.refreshes, treeSizeBySample: [], source: OWNED_SOURCE };
  if (preflight.unavailable) {
    rec.refused = true;
    rec.refuseReason = `socket observation surface unavailable at pre-flight (${(preflight.missing || []).join(',')})`;
    try { await browser.close(); } catch {}
    if (ROUND40) await new Promise((resolveClose) => server.close(resolveClose)); else server.close();
    return rec;
  }

  rec.samples = [];
  const t0 = Date.now();
  const spanMs = () => (rec.samples.length >= 2 ? rec.samples.at(-1).t - rec.samples[0].t : 0);
  let sampleError = null;
  const sampler = setInterval(() => {
    try {
      // Re-derive the owned set from a fresh `ps` snapshot before every observation,
      // so a process spawned after launch is observed on the next tick.
      const own = refreshOwned(process.pid, ownedState);
      if (!own.available) { sampleError = new FailClosed(`owned process identity refresh failed: ${own.reason}`); clearInterval(sampler); return; }
      rec.owned.liveTree = own.tree;
      rec.owned.roots = own.roots;
      rec.owned.treeSizeBySample.push(own.tree.length);
      const s = sampleSockets(own.tree);
      if (s.unavailable) { sampleError = new FailClosed(`socket observation became unavailable mid-session (${(s.missing || []).join(',')})`); clearInterval(sampler); return; }
      if (!s.ordered) { sampleError = new FailClosed('sample timestamp did not strictly increase'); clearInterval(sampler); return; }
      rec.samples.push(s);
    } catch (e) { sampleError = e; clearInterval(sampler); }
  }, SAMPLE_MS);

  try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    rec.browserVersion = browser.version();
    rec.userAgent = await page.evaluate('navigator.userAgent');
    page.on('console', (m) => rec.events.push({ method: 'console', type: m.type(), text: m.text() }));
    page.on('request', (r) => rec.events.push({ method: 'request', url: r.url() }));
    page.on('response', (r) => rec.events.push({ method: 'response', url: r.url(), status: r.status() }));
    const step = (m, r) => rec.cmds.push({ i: rec.cmds.length + 1, method: m, result: r });

    const t1 = Date.now();
    await page.goto(`http://127.0.0.1:${port}/a.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction("document.getElementById('status').textContent === 'hydrated'", null, { timeout: 5000 });
    step('navigate.hydrated', { url: page.url(), ms: Date.now() - t1 });
    step('title', { value: await page.title() });
    step('shape', { staticText: await page.textContent('#static'), status: await page.textContent('#status'), items: await page.locator('#list li').count() });
    const shot1 = await page.screenshot({ type: 'png' });
    rec.firstShotSha256 = sha256(shot1);
    rec.firstShotBytes = shot1.length;
    step('screenshot.first', { sha256: rec.firstShotSha256, bytes: rec.firstShotBytes });
    const box = await page.locator('#btn').boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForFunction("document.getElementById('count').textContent === '1'", null, { timeout: 3000 });
    await page.waitForFunction("document.querySelector('#confirms .confirm') !== null", null, { timeout: 3000 });
    step('click.effect', { count: await page.textContent('#count'), items: await page.locator('#list li').count(), confirm: await page.textContent('#confirms .confirm') });
    const shot2 = await page.screenshot({ type: 'png' });
    step('screenshot.after-click', { sha256: sha256(shot2), bytes: shot2.length, differsFromFirst: sha256(shot2) !== rec.firstShotSha256 });
    step('evaluate', { innerWidth: await page.evaluate('window.innerWidth'), items: await page.evaluate('document.querySelectorAll("#list li").length') });
    await page.goto(`http://127.0.0.1:${port}/b.html`, { waitUntil: 'domcontentloaded' });
    await page.goBack({ waitUntil: 'domcontentloaded' });
    step('history.traverse', { pathname: await page.evaluate('location.pathname'), title: await page.title() });
    const before2 = await page.textContent('#count');
    const box2 = await page.locator('#btn').boundingBox();
    await page.mouse.click(box2.x + box2.width / 2, box2.y + box2.height / 2);
    await page.waitForFunction("document.getElementById('count').textContent === '1'", null, { timeout: 3000 });
    step('history-reset-and-click', { countBefore: before2, countAfter: await page.textContent('#count'), status: await page.textContent('#status') });
    rec.httpLog = rec.events.filter((e) => e.method === 'request' || e.method === 'response');
    step('http.witnessed', { requests: rec.httpLog.length });
    step('console.quiet', { errors: rec.events.filter((e) => e.method === 'console' && (e.type === 'error')).length });
    step('tree.size', { owned: rec.owned.liveTree.length });
    if (ROUND40) {
      const spanDeadline = Date.now() + COVERAGE_BUDGET_MS;
      // Both floors come from the frozen predicate: enough samples AND real elapsed span.
      while (!sampleError && (rec.samples.length < MIN_SAMPLES || spanMs() < MIN_SPAN_MS) && Date.now() < spanDeadline) await sleep(20);
      if (!sampleError && (rec.samples.length < MIN_SAMPLES || spanMs() < MIN_SPAN_MS)) {
        sampleError = new FailClosed(`sample coverage short: n=${rec.samples.length} span=${spanMs()}ms (need n>=${MIN_SAMPLES} and span>=${MIN_SPAN_MS}ms)`);
      }
    }
  } finally {
    // The observation window ends when shutdown starts: refreshing a live owned set
    // after browser.close() has begun would report a legitimate teardown as a failed
    // refresh. Stop sampling first, then close.
    clearInterval(sampler);
    try { await browser.close(); } catch {}
    if (ROUND40) await new Promise((resolveClose) => server.close(resolveClose));
    else server.close();
    await sleep(POST_CLOSE_TAIL_MS);
  }
  rec.coverageMs = Date.now() - t0;
  rec.sampleCount = rec.samples.length;
  rec.sampleSpanMs = spanMs();
  rec.sampleIntervalsMs = rec.samples.slice(1).map((s, i) => s.t - rec.samples[i].t);
  rec.owned.refreshes = ownedState.refreshes;
  rec.owned.union = [...ownedState.seen.keys()].sort((a, b) => a - b);
  if (rec.owned.union.length) rec.owned.tree = rec.owned.union; // counter: owned tree nonempty
  // Cleanup evidence is recorded even for a refused run, so a refusal still shows what
  // survived and whether the fixture port closed. The final sweep targets the LAST live
  // owned tree (processes spawned after launch included), sampled after close.
  rec.finalSweep = sampleSockets(rec.owned.liveTree);
  // Survivor identity is pid + /proc start time: a recycled pid is not a survivor.
  rec.survivorPids = [...ownedState.seen.entries()]
    .filter(([pid, start]) => start !== null && procStartTime(pid) === start)
    .map(([pid]) => pid);
  rec.survivors = rec.survivorPids.length;
  if (ROUND40) {
    const l = spawnSync('ss', ['-Hlt'], { encoding: 'utf8', maxBuffer: 8 << 20 });
    rec.portClosed = !l.error && l.status === 0 && !l.stdout.split('\n').some((line) => line.includes(`:${port}`));
  } else rec.portClosed = (sh(`ss -ltn 2>/dev/null | grep -c ':${port} '`) || '0') === '0';
  // Fail-closed ladder: each refusal below reports a missing or unusable observation,
  // never a favourable verdict.
  if (sampleError) {
    rec.refused = true;
    rec.refuseReason = `sampling aborted: ${sampleError.message}`;
    return rec;
  }
  if (rec.finalSweep.unavailable) {
    rec.refused = true;
    rec.refuseReason = `final sweep socket observation unavailable (${(rec.finalSweep.missing || []).join(',')})`;
    return rec;
  }
  if (ROUND40 && !(rec.finalSweep.ss.ticks > 0 && rec.finalSweep.proc.ticks > 0)) {
    rec.refused = true;
    rec.refuseReason = 'final sweep ticks nonpositive on ss and/or proc';
    return rec;
  }
  if (ROUND40 && !rec.portClosed) {
    rec.refused = true;
    rec.refuseReason = 'fixture listen-port closure unavailable or still listening';
    return rec;
  }
  const sum = (k, f) => rec.samples.reduce((a, s) => a + (s[k] ? s[k][f] : 0), 0);
  rec.sockets = {
    ss: { observations: sum('ss', 'lines'), nonLoopback: sum('ss', 'nonLoopback') },
    proc: { observations: sum('proc', 'inodes'), nonLoopback: sum('proc', 'nonLoopback') },
    finalSweep: rec.finalSweep,
  };
  rec.egressNonLoopback = rec.sockets.ss.nonLoopback + rec.sockets.proc.nonLoopback
    + (rec.finalSweep && !rec.finalSweep.unavailable ? (rec.finalSweep.ss.nonLoopback + rec.finalSweep.proc.nonLoopback) : 0);
  return rec;
}

async function main() {
  const argv = process.argv.slice(2);
  let out = null, runs = 2, scratchArg = null, nonce = null;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out') out = argv[++i];
    else if (argv[i] === '--runs') runs = Number(argv[++i]);
    else if (argv[i] === '--scratch') scratchArg = argv[++i];
    else if (argv[i] === '--nonce') nonce = argv[++i];
  }
  if (!out || (ROUND40 && (!scratchArg || !/^[0-9a-f]{64}$/.test(nonce || '') || runs !== 2 || existsSync(out)))) { console.error('usage: --out <fresh receipt.json> [--runs 2] [--round40 --scratch <dir> --nonce <64-hex one-use-token>]'); process.exit(64); }
  const scratchRoot = ROUND40 ? scratchArg : (process.env.HYAKU_SCRATCH || tmpdir());
  if (ROUND40) mkdirSync(scratchRoot, { recursive: true });
  const S = mkdtempSync(join(scratchRoot, ROUND40 ? 'tabi-r40-pwegress-' : 'tabi-r39-pwegress-'));
  const profiles = join(S, 'profiles'); mkdirSync(profiles, { recursive: true });
  process.on('exit', () => { try { rmSync(S, { recursive: true, force: true }); } catch {} });
  const receipt = {
    schema: SCHEMA,
    driver: ROUND40 ? 'scripts/playwright-firefox-egress-round39.mjs --round40' : 'scripts/playwright-firefox-egress-round39.mjs',
    measuredAt: new Date().toISOString(),
    playwrightVersion: PW_VERSION,
    fixture: { sha256: FIXTURE_SHA, bytes: FIXTURE.length },
    ...(ROUND40 ? { runNonce: nonce } : {}),
    runs: [],
  };
  let anyRefused = false;
  for (let i = 0; i < runs; i += 1) {
    const r = await runOnce({ runName: `run${i + 1}`, profileRoot: profiles, runNonce: nonce });
    receipt.runs.push(r);
    if (r.refused) anyRefused = true;
  }
  receipt.refused = anyRefused;
  if (!anyRefused) {
    const shots = receipt.runs.map((r) => r.firstShotSha256);
    receipt.binding = new Set(shots).size === 1 && shots.length === runs;
    receipt.egressNonLoopback = receipt.runs.reduce((a, r) => a + r.egressNonLoopback, 0);
    receipt.survivors = receipt.runs.reduce((a, r) => a + r.survivors, 0);
    receipt.browserVersion = receipt.runs[0].browserVersion;
    receipt.userAgent = receipt.runs[0].userAgent;
    receipt.binary = receipt.runs[0].binary;
  }
  writeFileSync(out, JSON.stringify(receipt, null, 1) + '\n', ROUND40 ? { flag: 'wx' } : undefined);
  console.log(JSON.stringify({ wrote: out, runs: receipt.runs.length, refused: receipt.refused, binding: receipt.binding, egress: receipt.egressNonLoopback, survivors: receipt.survivors, firstShot: receipt.runs.map((r) => r.firstShotSha256), runNonce: receipt.runNonce }));
  process.exit(anyRefused ? 1 : 0);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e); process.exit(1); });
export { FIXTURE, FIXTURE2, FIXTURE_SHA, runOnce, PW_VERSION, SCHEMA };

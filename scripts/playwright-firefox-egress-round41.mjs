#!/usr/bin/env node
// playwright-firefox-egress-round41.mjs — tabi round 41, hardened session-bound
// egress driver. Round-40 closure routed defects this file closes:
//   F1 zero-observation blind: every sample/final sweep records per-surface
//      OWNED socket observation counts (ssObs/procObs); the counter refuses a
//      run whose observation never saw an owned socket (ticks-only "coverage").
//   F3 stale/unrelated process tree: the owned tree is RE-DERIVED at every
//      sample tick (roots + descendants), each pid carries its /proc starttime
//      (startTicks, HZ-scaled jiffies) and exe path (readlink /proc/<pid>/exe),
//      so a stale, reused or unrelated pid is detectable post-hoc.
//   F4 env-level substitution: at startup this process reads /proc/self/environ
//      (the kernel's exec-time environment, which user-land cannot rewrite)
//      and refuses if a loader/injection variable is present; it also refuses
//      a non-empty process.execArgv (preload/loader flags survive there when
//      the shim does not erase them).
// Deltas vs round-40 driver: per-sample tree refresh with pid identity fields,
// env/proc contamination gate, owned-socket counts, run window ticks, and the
// driver nonce echo (soft binding; nonce also travels on argv).
//
// Usage: node scripts/playwright-firefox-egress-round41.mjs --out <receipt.json>
//        --scratch <dir> --nonce <64-hex> [--runs 2]
import { firefox } from '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/index.mjs';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PLAYWRIGHT = '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright';
const PW_VERSION = JSON.parse(readFileSync(join(PLAYWRIGHT, 'package.json'), 'utf8')).version;
const FIREFOX_BIN = '/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox';
const FIREFOX_DIR = '/home/vgpnk/.cache/ms-playwright/firefox-1555/';
const SCHEMA = 'tabi-pw-firefox-egress-receipt-r41';
const SAMPLE_MS = 100;
const POST_CLOSE_TAIL_MS = 600;
const HZ = Number(execFileSync('getconf', ['CLK_TCK'], { encoding: 'utf8' }).trim()) || 100;
const LOADER_ENV_RE = /^(NODE_OPTIONS|NODE_PATH|NODE_EXTRA_CA_CERTS|NODE_PENDING_DEPRECATION|LD_.*|DYLD_.*|BUN_.*|PYTHONPATH|PYTHONHOME|PYTHONSTARTUP|RUBYOPT|RUBYLIB|PERL5OPT|PERL5LIB|JAVA_TOOL_OPTIONS|_JAVA_OPTIONS|JDK_JAVA_OPTIONS)=/;

const uptimeTicks = () => Math.round(parseFloat(readFileSync('/proc/uptime', 'utf8').split(' ')[0]) * HZ);
const selfStat = () => {
  const s = readFileSync('/proc/self/stat', 'utf8');
  const end = s.lastIndexOf(')');
  const f = s.slice(end + 2).split(' ');
  return { startTicks: Number(f[19]) }; // field 22 overall
};

// exec-time environment from the kernel: /proc/self/environ cannot be edited
// by user-land (proc_pid_environ(5): "the initial environment ... via execve").
function procEnvironNames(pid = 'self') {
  try {
    const raw = readFileSync(`/proc/${pid}/environ`, 'latin1');
    return raw.split('\0').filter(Boolean).map((e) => e.split('=')[0]);
  } catch { return null; }
}

class FailClosed extends Error {}

const FIXTURE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>TABI-R41 fixture</title>
<style>html,body{margin:0;padding:0;overflow:hidden;background:#fff;color:#111;font:16px/1.5 monospace}
#frame{width:800px;height:600px;box-sizing:border-box;padding:24px}
#btn{font:inherit;padding:4px 12px}.confirm{color:#0a5}</style></head>
<body><div id="frame">
<h1>TABI-R41 playwright-firefox session-bound egress fixture</h1>
<p id="static">static paragraph never mutated</p>
<button id="btn">mutate</button>
<p>count: <span id="count">0</span></p>
<ul id="list"></ul>
<div id="confirms"></div>
<p>status: <span id="status">booting</span></p>
</div><script>
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

const FIXTURE2 = FIXTURE.replace('TABI-R41 playwright-firefox session-bound egress fixture', 'TABI-R41 playwright-firefox session-bound egress fixture page2')
  .replace('id="status">booting', 'id="status">page2');

const FIXTURE_SHA = sha256(FIXTURE);

// --- owned process tree, identity-bound --------------------------------------
// Roots = direct children of THIS node process whose argv names the Playwright
// firefox binary; the tree is their full descendant walk. Each pid records
// startTicks (/proc/<pid>/stat field 22, HZ jiffies since boot) and exe
// (/proc/<pid>/exe readlink) so a stale or reused pid is provably outside the
// run window, and a non-browser binary is provably not the firefox session.
function pidPpidTable() {
  const r = spawnSync('ps', ['-eo', 'pid=,ppid='], { encoding: 'utf8', maxBuffer: 8 << 20 });
  if (r.error || r.status !== 0) return null;
  const rows = [];
  for (const line of r.stdout.split('\n')) {
    const m = line.trim().split(/\s+/);
    if (m.length >= 2 && /^\d+$/.test(m[0]) && /^\d+$/.test(m[1])) rows.push([Number(m[0]), Number(m[1])]);
  }
  return rows;
}
function pidIdentity(pid) {
  try {
    const s = readFileSync(`/proc/${pid}/stat`, 'utf8');
    const end = s.lastIndexOf(')');
    if (end < 0) return null;
    const f = s.slice(end + 2).split(' ');
    const startTicks = Number(f[19]);
    const comm = s.slice(s.indexOf('(') + 1, end);
    let exe = null;
    try { exe = readlinkSync(`/proc/${pid}/exe`); } catch {}
    let args = null;
    try { args = readFileSync(`/proc/${pid}/cmdline`, 'latin1').split('\0').filter(Boolean).join(' '); } catch {}
    return { pid, startTicks, exe, comm, args };
  } catch { return null; }
}
function ownedRoots(nodePid) {
  const rows = pidPpidTable();
  if (rows === null) return null;
  return rows.filter(([pid, ppid]) => ppid === nodePid)
    .map(([pid]) => pidIdentity(pid))
    .filter((x) => x && /ms-playwright\/firefox-\d+\//.test(x.args || ''));
}
function ownedTreeRecords(roots) {
  const rows = pidPpidTable();
  if (rows === null) return null;
  const children = new Map();
  for (const [pid, ppid] of rows) {
    if (!children.has(ppid)) children.set(ppid, []);
    children.get(ppid).push(pid);
  }
  const seen = new Set();
  const out = [];
  const queue = roots.map((r) => r.pid);
  while (queue.length) {
    const p = queue.shift();
    if (seen.has(p)) continue;
    seen.add(p);
    const id = pidIdentity(p);
    if (id) out.push(id);
    for (const c of children.get(p) || []) queue.push(c);
  }
  return out.sort((a, b) => a.pid - b.pid);
}

// --- socket observation, surface 1: ss -Htnp --------------------------------
function isLoopbackPeer(peer) {
  if (/^127\./.test(peer)) return true;
  if (/^\[::1\]/.test(peer)) return true;
  if (/^\[0:0:0:0:0:0:0:1\]/.test(peer)) return true;
  if (/^\[::ffff:127\./.test(peer)) return true;
  return false;
}
function observeSs(tree) {
  const r = spawnSync('ss', ['-Htnp'], { encoding: 'utf8', maxBuffer: 8 << 20 });
  if (r.error || r.status !== 0) return null;
  const pidRe = new RegExp(`pid=(?:${tree.join('|')})[,\\)]`);
  const lines = r.stdout.split('\n').filter((l) => l.trim() && pidRe.test(l));
  let nonLoopback = 0;
  for (const l of lines) {
    const f = l.trim().split(/\s+/);
    const peer = f[4] || '';
    if (!isLoopbackPeer(peer)) nonLoopback += 1;
  }
  return { ticks: 1, lines: lines.length, nonLoopback };
}

// --- socket observation, surface 2: /proc fd inodes x /proc/net/tcp{,6} ------
function socketInodesOfPid(pid) {
  const fds = `/proc/${pid}/fd`;
  const inodes = new Set();
  let names = null;
  try { names = readdirSync(fds); } catch { return null; }
  for (const fd of names) {
    try {
      const link = readlinkSync(join(fds, fd));
      const m = /^socket:\[(\d+)\]$/.exec(link);
      if (m) inodes.add(m[1]);
    } catch {}
  }
  return inodes;
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
  const [ip] = rem.split(':');
  const b = decodeProcIp(ip.toUpperCase());
  if (!b) return false;
  if (b.length === 4) return b[0] === 0x7F;
  const zeroHead = b.slice(0, 10).every((x) => x === 0);
  if (zeroHead && b[15] === 1 && b.slice(10, 15).every((x) => x === 0)) return true;
  if (zeroHead && b[10] === 0xFF && b[11] === 0xFF && b[12] === 0x7F) return true;
  return false;
}
function observeProc(tree) {
  let inodes = 0;
  let nonLoopback = 0;
  const nets = [parseProcNet('/proc/net/tcp'), parseProcNet('/proc/net/tcp6')];
  if (nets.some((n) => n === null)) return null;
  for (const pid of tree) {
    const s = socketInodesOfPid(pid);
    if (s === null) continue;
    for (const n of nets) {
      if (n === null) continue;
      for (const row of n) {
        if (!s.has(row.inode)) continue;
        if (row.st === '0A') continue;
        if (row.rem === '00000000:0000' || row.rem === '00000000000000000000000000000000:0000') continue;
        inodes += 1;
        if (!isLoopbackHexRem(row.rem)) nonLoopback += 1;
      }
    }
  }
  return { ticks: 1, inodes, nonLoopback };
}

// One sample: fresh identity-bound tree + both socket surfaces + owned counts.
function sampleOnce(roots) {
  const tTicks = uptimeTicks();
  const treeRecs = ownedTreeRecords(roots);
  if (treeRecs === null) return { unavailable: true };
  const tree = treeRecs.map((r) => r.pid);
  const ss = observeSs(tree);
  const pr = observeProc(tree);
  if (ss === null || pr === null) return { unavailable: true };
  return {
    t: Date.now(),
    tTicks,
    ss: { ticks: ss.ticks, lines: ss.lines, nonLoopback: ss.nonLoopback, ssObs: ss.lines },
    proc: { ticks: pr.ticks, inodes: pr.inodes, nonLoopback: pr.nonLoopback, procObs: pr.inodes },
    treePids: treeRecs,
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
  rec.runStartTicks = uptimeTicks();

  const profile = mkdtempSync(join(profileRoot, 'profile-'));
  const browser = await firefox.launch({ headless: true, firefoxUserPrefs: { 'network.dns.disablePrefetch': true } });
  await sleep(400);
  const roots = ownedRoots(process.pid);
  if (roots === null || roots.length === 0) {
    rec.refused = true; rec.refuseReason = 'owned firefox root set empty at launch (no child of this node process names ms-playwright/firefox)';
    try { await browser.close(); } catch {}
    await new Promise((rc) => server.close(rc));
    return rec;
  }
  rec.owned = {
    nodePid: process.pid,
    selfStartTicks: selfStat().startTicks,
    roots: roots.map((r) => ({ pid: r.pid, startTicks: r.startTicks, exe: r.exe, comm: r.comm })),
    source: 'children of this node process naming ms-playwright/firefox + ps -eo pid=,ppid= descendant walk refreshed every sample',
  };

  rec.samples = [];
  const t0 = Date.now();
  let sampleError = null;
  const sampler = setInterval(() => {
    try {
      const freshRoots = ownedRoots(process.pid);
      const s = sampleOnce(freshRoots === null ? roots : freshRoots);
      if (s.unavailable) { sampleError = new FailClosed('socket observation became unavailable mid-session'); clearInterval(sampler); return; }
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
    const spanDeadline = Date.now() + 5000;
    while (!sampleError && (rec.samples.length < 2 || rec.samples.at(-1).t - rec.samples[0].t < 1000) && Date.now() < spanDeadline) await sleep(20);
    if (!sampleError && (rec.samples.length < 2 || rec.samples.at(-1).t - rec.samples[0].t < 1000)) sampleError = new FailClosed('observed sample span did not reach 1000 ms');
  } finally {
    clearInterval(sampler); // samples cover only the live session, never teardown
    try { await browser.close(); } catch {}
    await new Promise((rc) => server.close(rc));
    await sleep(POST_CLOSE_TAIL_MS);
  }
  rec.runEndTicks = uptimeTicks();
  rec.coverageMs = Date.now() - t0;
  rec.sampleCount = rec.samples.length;
  if (sampleError) {
    rec.refused = true;
    rec.refuseReason = `sampling aborted: ${sampleError.message}`;
    return rec;
  }
  // final sweep AFTER close with one last identity-bound tree
  const endRoots = ownedRoots(process.pid) || [];
  const finalTreeRecs = ownedTreeRecords(endRoots) || [];
  const finalTree = finalTreeRecs.map((x) => x.pid);
  const fss = observeSs(finalTree);
  const fpr = observeProc(finalTree);
  rec.finalSweep = {
    t: Date.now(), tTicks: rec.runEndTicks,
    ss: fss === null ? { ticks: 0, lines: 0, nonLoopback: 0, ssObs: 0, unavailable: true } : { ticks: fss.ticks, lines: fss.lines, nonLoopback: fss.nonLoopback, ssObs: fss.lines },
    proc: fpr === null ? { ticks: 0, inodes: 0, nonLoopback: 0, procObs: 0, unavailable: true } : { ticks: fpr.ticks, inodes: fpr.inodes, nonLoopback: fpr.nonLoopback, procObs: fpr.inodes },
    treePids: finalTreeRecs,
  };
  rec.survivorPids = finalTree.filter((p) => existsSync(`/proc/${p}`));
  rec.survivors = rec.survivorPids.length;
  const l = spawnSync('ss', ['-Hlt'], { encoding: 'utf8', maxBuffer: 8 << 20 });
  rec.portClosed = !l.error && l.status === 0 && !l.stdout.split('\n').some((line) => line.includes(`:${port}`));
  if (!rec.portClosed) { rec.refused = true; rec.refuseReason = 'fixture listen-port closure unavailable or still listening'; }
  const sum = (k, f) => rec.samples.reduce((a, s) => a + (s[k] ? s[k][f] : 0), 0);
  rec.sockets = {
    ss: { observations: sum('ss', 'lines'), nonLoopback: sum('ss', 'nonLoopback') },
    proc: { observations: sum('proc', 'inodes'), nonLoopback: sum('proc', 'nonLoopback') },
    finalSweep: { ss: rec.finalSweep.ss.lines, proc: rec.finalSweep.proc.inodes },
  };
  rec.egressNonLoopback = rec.sockets.ss.nonLoopback + rec.sockets.proc.nonLoopback
    + rec.finalSweep.ss.nonLoopback + rec.finalSweep.proc.nonLoopback;
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
  if (!out || !scratchArg || !/^[0-9a-f]{64}$/.test(nonce || '') || runs !== 2 || existsSync(out)) {
    console.error('usage: --out <fresh receipt.json> --scratch <dir> --nonce <64-hex one-use-token> [--runs 2]');
    process.exit(64);
  }
  // --- environment boundary self-check (F4): the kernel's exec-time environ --
  const envNames = procEnvironNames('self');
  const forbidden = envNames === null ? ['<proc-environ-unreadable>'] : envNames.filter((n) => LOADER_ENV_RE.test(`${n}=`));
  const envCheck = {
    procEnvironReadable: envNames !== null,
    nameCount: envNames === null ? null : envNames.length,
    forbiddenNames: forbidden,
    execArgv: process.execArgv,
    execArgvClean: Array.isArray(process.execArgv) && process.execArgv.length === 0,
    envNonceEcho: process.env.TABI_RUN_NONCE === nonce ? 'match' : (process.env.TABI_RUN_NONCE === undefined ? 'absent' : 'mismatch'),
  };
  if (envNames === null || forbidden.length > 0 || !envCheck.execArgvClean || envCheck.envNonceEcho !== 'match') {
    const refuse = { schema: SCHEMA, refused: true, refuseReason: 'environment-loader-contamination', envCheck, runNonce: nonce, runs: [] };
    writeFileSync(out, JSON.stringify(refuse, null, 1) + '\n', { flag: 'wx' });
    console.log(JSON.stringify({ wrote: out, refused: true, refuseReason: 'environment-loader-contamination', envCheck }));
    process.exit(2);
  }
  const scratchRoot = scratchArg;
  mkdirSync(scratchRoot, { recursive: true });
  const S = mkdtempSync(join(scratchRoot, 'tabi-r41-pwegress-'));
  const profiles = join(S, 'profiles'); mkdirSync(profiles, { recursive: true });
  process.on('exit', () => { try { rmSync(S, { recursive: true, force: true }); } catch {} });
  const receipt = {
    schema: SCHEMA,
    driver: 'scripts/playwright-firefox-egress-round41.mjs',
    measuredAt: new Date().toISOString(),
    playwrightVersion: PW_VERSION,
    fixture: { sha256: FIXTURE_SHA, bytes: FIXTURE.length },
    envCheck,
    runNonce: nonce,
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
  }
  writeFileSync(out, JSON.stringify(receipt, null, 1) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ wrote: out, runs: receipt.runs.length, refused: receipt.refused, binding: receipt.binding, egress: receipt.egressNonLoopback, survivors: receipt.survivors, firstShot: receipt.runs.map((r) => r.firstShotSha256), runNonce: receipt.runNonce }));
  process.exit(anyRefused ? 1 : 0);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e); process.exit(1); });
export { FIXTURE, FIXTURE2, FIXTURE_SHA, runOnce, PW_VERSION, SCHEMA };

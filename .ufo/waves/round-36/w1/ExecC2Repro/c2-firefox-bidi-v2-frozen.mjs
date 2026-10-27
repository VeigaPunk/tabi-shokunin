#!/usr/bin/env node
// c2-firefox-bidi-v2.mjs — tabi round 36, claim C2 (operability: the BiDi-runtime counter
// amendment carried from rounds 34-35). Frozen counter.
//
// Question: the round-35 counter admits the same Firefox evidence under four recorded
// residuals the rounds themselves routed here — M1 threshold 14 under a declared 16
// (QUALITY 98); M4 caller-named binaries accepted without a digest check (QUALITY 99);
// M3 the live leg's "loopback" claim with no socket observation (QUALITY 100); the r34
// SentinelCounters F1 gate-write-path/self-sniff family and the K1-K3 whitespace-normalised
// self-sniff residual. Does an amended counter still admit the honest round-35 evidence
// (regression leg) while refusing every fixture of the frozen attack battery B1-B5?
//
// Amendments over v1 (.ufo/waves/round-35/counters/c2-firefox-bidi.mjs), each traced to its
// routed item in the header of the matching block:
//   A1 TARGET 14 -> 16, equal to the round-35 claim's declared sentence (M1, QUALITY 98).
//   A2 the --firefox/--geckodriver binaries are sha256-pinned against the round-35 install
//      receipts before any run; a caller-named binary with the wrong digest is refused
//      (M4, QUALITY 99).
//   A3 the gate scratch write is lstat-refused through any symlink component and creates
//      its file exclusively (r34 SentinelCounters F1).
//   A4 a driver whose bytes equal this counter's bytes after whitespace normalisation is
//      refused, closing the K1-K3 self-sniff residual.
//   A5 the live leg starts Firefox with the DNS-off prefs the lane driver proved
//      (network.dns.disabled + network.trr.mode 5) and samples the firefox process tree's
//      ESTABLISHED non-loopback TCP sockets for the whole session; the reading carries
//      live.egressNonLoopback and the predicate requires 0 (M3, QUALITY 100).
//   A6 binding additionally requires the runs' and the live session's browsing-context id
//      sets to be pairwise disjoint (identical-id clones refused; rewritten-id clones stay
//      a recorded limit, as in round 35).
//
// Usage:
//   node c2-firefox-bidi-v2.mjs --rev <40-hex REV> [--repo <lane clone>] [--json]
//        [--firefox <bin>] [--geckodriver <bin>]
// Exit: 0 predicate met; 1 evaluated, predicate not met; 2 could not evaluate.
//
// Inputs: git objects of the lane at --rev and BASELINE, plus one live session this counter
// starts. scripts/check-bidi-runtime.mjs (the round-33/34 gate) is read from --rev, must equal
// GATE_SHA256 (the gate is not modified by this claim), is written to a scratch file under
// $TMPDIR (A3) and imported for its frozen FIXTURE, serveFixture, VIEWPORT, ROWS, PREDICATES,
// parseTable and recordFromTranscript only — the row predicates are the gate's, unchanged.
//
// Definitions (frozen): entry / s1-source / receipt / firefox / binding / admitted / failing
//   as v1, with these v2 deltas:
//   s1-source   the ## Gate row may sit in ANY of LESSONS (round-35 and round-36 lessons);
//               the first file carrying a matching row for the cited id wins.
//   driver      additionally refused when whitespaceNormalised(driver) ==
//               whitespaceNormalised(this counter's bytes) (A4).
//   binding     additionally: browsing-context id sets pairwise disjoint across runs and
//               the live session (A6).
//   live.egress non-loopback ESTABLISHED TCP sockets owned by the firefox processes of this
//               counter's own session, sampled every 400 ms from session start to teardown
//               (A5); 0 required.
// Predicate (frozen): no entry finding AND no receipt finding AND no binding finding AND
//   failing == 0 AND admitted >= 16 AND live.egressNonLoopback == 0.
//
// Write scope: stdout/stderr and its own mkdtemp dirs under $TMPDIR (removed on exit). The
// live leg runs geckodriver with --profile-root, HOME, TMPDIR and XDG_* inside that scratch,
// a free --websocket-port (never the 9222 default), headless, loopback FIXTURE only,
// DNS-off prefs (A5).
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, lstatSync, openSync, closeSync, fstatSync, writeSync, readdirSync, readlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, posix } from 'node:path';
import { createHash } from 'node:crypto';
import { createServer as createNetServer } from 'node:net';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCHEMA = 'tabi-r36-c2-firefox-bidi-v2';
const BASELINE = '2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684';
const GATE_PATH = 'scripts/check-bidi-runtime.mjs';
const GATE_SHA256 = '370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87';
const COUNTER_PATH = '.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs';
const ENTRY = 'corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md';
const RECEIPT = 'corpus/evidence/round-35/bidi-firefox/receipt.json';
const LESSONS = ['corpus/lessons/round-35.md', 'corpus/lessons/round-36.md'];
const SOURCES = 'corpus/SOURCES.md';
const RECEIPT_SCHEMA = 'tabi-bidi-receipt-v1';
const TARGET = 16;
const FIREFOX = '/home/vgpnk/.local/opt/firefox-158.0.1/firefox';
const GECKODRIVER = '/home/vgpnk/.local/bin/geckodriver';
// A2: install-receipt digests the round-35 measurement pinned (provenance-8de96c2.txt).
const PINNED_BINARIES = Object.freeze({
  firefox: { path: '/home/vgpnk/.local/opt/firefox-158.0.1/firefox', sha256: 'a19472941a7cd7252ab5e61b02eb616a50389a784323c21dc6873a23fd700789' },
  firefoxBin: { path: '/home/vgpnk/.local/opt/firefox-158.0.1/firefox-bin', sha256: '46e2c204ab769f1cb49fea4918e134c84829d2ab38278fb087a072f77b6e7294' },
  geckodriver: { path: '/home/vgpnk/.local/bin/geckodriver', sha256: 'f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f' },
});
const DRIVER_ALLOW = new Set(['FIXTURE', 'FIXTURE_SHA256', 'FIXTURE_HEADER', 'VIEWPORT', 'DATA_TEXT', 'serveFixture']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const WS_SESSION = /^ws:\/\/(?:127\.0\.0\.1|localhost):\d+\/session\/([0-9a-f-]+)$/;
const MEASURED = /^(yes|no)(?:\s*[—–-]\s*\S[\s\S]*)?$/i;
const HEX64 = /\b[0-9a-f]{64}\b/;

class Refusal extends Error {}
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SCRATCH_BASE = process.env.TMPDIR || tmpdir();

function git(repo, args) {
  return spawnSync('git', ['-C', repo, ...args], { encoding: 'buffer', maxBuffer: 256 * 1024 * 1024, env: { PATH: process.env.PATH, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C' } });
}
function resolveCommit(repo, rev) {
  if (!/^[0-9a-f]{40}$/.test(String(rev))) throw new Refusal(`revision must be 40-hex: ${rev}`);
  const r = git(repo, ['rev-parse', '--verify', '--quiet', `${rev}^{commit}`]);
  if (r.status !== 0) throw new Refusal(`unresolvable revision ${rev} in ${repo}`);
  return r.stdout.toString('utf8').trim();
}
function blob(repo, rev, path) {
  if (typeof path !== 'string' || !path || path.includes('..') || path.startsWith('/')) return null;
  const r = git(repo, ['show', `${rev}:${path}`]);
  return r.status === 0 ? r.stdout : null;
}
function splitRow(line) {
  const t = line.trim();
  if (!t.startsWith('|') || !t.endsWith('|')) return null;
  return t.slice(1, -1).split('|').map((c) => c.trim());
}
function parseRegistry(text) {
  const rows = new Map();
  for (const line of text.split('\n')) {
    if (!/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\|/.test(line)) continue;
    const cells = line.trim().split('|');
    if (cells.length !== 13) continue;
    const c = cells.slice(1, 12).map((x) => x.trim());
    if (!rows.has(c[0])) rows.set(c[0], { id: c[0], source: c[1], status: c[7], usedBy: c[10] });
  }
  return rows;
}
const firstHttps = (t) => { const m = /https:\/\/[^\s)<>`|"']+/.exec(String(t || '')); return m ? m[0] : null; };
const urlHost = (u) => { try { return new URL(u).hostname; } catch { return null; } };
function lessonGateRows(text) {
  const map = new Map();
  let inGate = false;
  const ls = text.split('\n');
  for (let i = 0; i < ls.length; i += 1) {
    if (/^#{1,6}\s/.test(ls[i])) { inGate = /^#{1,6}\s+Gate\s*$/.test(ls[i]); continue; }
    if (!inGate) continue;
    const cells = splitRow(ls[i]);
    if (!cells) continue;
    const id = (cells[0] || '').replace(/`/g, '').trim();
    if (!/^S\d{3,}$/.test(id)) continue;
    if (!map.has(id)) map.set(id, []);
    map.get(id).push({ line: i + 1, text: ls[i] });
  }
  return map;
}
function importSpecs(text) {
  const out = [];
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('//')) continue;
    let m = /^export\s+\*\s*(?:as\s+\w+\s*)?from\s*["']([^"']+)["']/.exec(t);
    if (m) { out.push({ kind: 're-export', spec: m[1], names: null }); continue; }
    m = /^export\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/.exec(t);
    if (m) { out.push({ kind: 're-export', spec: m[2], names: null }); continue; }
    m = /^import\s+([^;]*?)\s*from\s*["']([^"']+)["']/.exec(t);
    if (m) {
      const clause = m[1].trim();
      if (clause.startsWith('{')) out.push({ kind: 'named', spec: m[2], names: clause.replace(/^\{|\}$/g, '').split(',').map((x) => x.trim().split(/\s+as\s+/)[0]).filter(Boolean) });
      else out.push({ kind: clause.startsWith('*') ? 'namespace' : 'default', spec: m[2], names: null });
      continue;
    }
    m = /^import\s+["']([^"']+)["']/.exec(t);
    if (m) { out.push({ kind: 'side-effect', spec: m[1], names: null }); continue; }
    if (/\bimport\s*\(/.test(t) && /check-bidi-runtime|c2-firefox-bidi/.test(t)) out.push({ kind: 'dynamic', spec: t.slice(0, 80), names: null });
  }
  return out;
}
function driverFinding(text, driverPath) {
  const target = (spec, p) => {
    if (/c2-firefox-bidi/.test(spec)) return 'counter';
    if (spec.startsWith('.')) return posix.normalize(posix.join(posix.dirname(driverPath), spec)) === p ? 'gate' : null;
    return /(^|\/)check-bidi-runtime\.mjs$/.test(spec) ? 'gate' : null;
  };
  for (const s of importSpecs(text)) {
    if (s.kind === 'dynamic') return `driver has a dynamic import of the gate or this counter: ${s.spec}`;
    const t = target(s.spec, GATE_PATH);
    if (!t) continue;
    if (t === 'counter') return `driver imports this counter (${s.spec})`;
    if (s.kind === 'named' && s.names.every((n) => DRIVER_ALLOW.has(n))) continue;
    return `driver has a ${s.kind} relation to the gate beyond the allow-list (${s.spec})`;
  }
  return null;
}
function freePort() {
  return new Promise((res, rej) => { const s = createNetServer(); s.on('error', rej); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
}
const ok = (c) => c && c.response && c.response.type === 'success';
const resu = (c) => (c && c.response && c.response.result) || {};
const strVal = (rv) => (rv && rv.type === 'string' ? rv.value : undefined);

// This counter's own Firefox BiDi session over geckodriver — the gate's recipe
// (check-bidi-runtime.mjs liveRecord), engine swapped; never imported by a driver.
async function liveRecordFirefox({ gate, firefox, geckodriver, timeoutMs = 90000 }) {
  for (const b of [firefox, geckodriver]) if (spawnSync(b, ['--version'], { encoding: 'utf8' }).status !== 0) throw new Refusal(`not runnable: ${b}`);
  const scratch = mkdtempSync(join(SCRATCH_BASE, 'tabi-r36-c2-live-'));
  const home = join(scratch, 'home');
  for (const d of ['.config', '.cache', '.local/share', '.local/state', '../tmp', '../profiles']) mkdirSync(join(home, d), { recursive: true });
  const fx = await gate.serveFixture();
  const port = await freePort();
  const wsPort = await freePort();
  const env = { PATH: process.env.PATH, HOME: home, TMPDIR: join(scratch, 'tmp'), XDG_CONFIG_HOME: join(home, '.config'), XDG_CACHE_HOME: join(home, '.cache'), XDG_DATA_HOME: join(home, '.local/share'), XDG_STATE_HOME: join(home, '.local/state'), MOZ_HEADLESS: '1', LC_ALL: 'C.UTF-8' };
  const gd = spawn(geckodriver, ['--port', String(port), '--websocket-port', String(wsPort), '--binary', firefox, '--profile-root', join(scratch, 'profiles')], { stdio: 'ignore', env });
  // A5: sample this session's firefox process tree for ESTABLISHED non-loopback sockets.
  const egress = { samples: 0, nonLoopback: 0, pids: 0 };
  const sampler = setInterval(() => {
    try {
      const pids = treePids(gd.pid);
      const owned = socketInodesOf(pids);
      const n = nonLoopbackEstablished(owned);
      egress.samples += 1;
      egress.pids = pids.length;
      if (n > 0) egress.nonLoopback += n;
    } catch { /* sampling is best-effort; the predicate reads the totals */ }
  }, 400);
  const rec = { newSession: null, cmds: [], events: [], egress };
  let ws = null;
  let sessionId = null;
  const deadline = setTimeout(() => { try { ws && ws.close(); } catch {} }, timeoutMs);
  try {
    let body = null;
    for (let k = 0; k < 50 && !body; k += 1) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/session`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ capabilities: { alwaysMatch: {
          browserName: 'firefox', webSocketUrl: true, unhandledPromptBehavior: 'ignore', 'moz:firefoxOptions': { args: ['-headless'], prefs: { 'network.dns.disabled': true, 'network.trr.mode': 5 } } } } }) });
        body = await r.json();
      } catch { await sleep(200); }
    }
    if (!body || !body.value || !body.value.capabilities) throw new Refusal(`new session failed: ${JSON.stringify(body && body.value).slice(0, 200)}`);
    rec.newSession = body;
    sessionId = body.value.sessionId;
    ws = new WebSocket(body.value.capabilities.webSocketUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Refusal('websocket open failed')); });
    let pos = 0;
    let nextId = 0;
    const pending = new Map();
    const waiters = [];
    ws.onmessage = (m) => {
      const f = JSON.parse(String(m.data));
      pos += 1;
      if (f.id !== undefined && pending.has(f.id)) { const p = pending.get(f.id); pending.delete(f.id); p.cmd.response = f; p.resolve(p.cmd); }
      else if (f.method) {
        const e = { i: pos, method: f.method, params: f.params || {} };
        rec.events.push(e);
        for (const w of [...waiters]) if (w.pred(e)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(e); }
      }
    };
    const send = (method, params = {}) => new Promise((res) => {
      nextId += 1; pos += 1;
      const cmd = { i: pos, id: nextId, method, params, response: null };
      rec.cmds.push(cmd);
      pending.set(nextId, { cmd, resolve: res });
      ws.send(JSON.stringify({ id: nextId, method, params }));
    });
    const waitEvent = (pred, ms = 10000) => {
      const hit = rec.events.find(pred);
      if (hit) return Promise.resolve(hit);
      return Promise.race([new Promise((res) => waiters.push({ pred, resolve: res })), sleep(ms).then(() => null)]);
    };
    const evaluate = (expression, awaitPromise, context) => send('script.evaluate', { expression, awaitPromise, target: { context } });
    await send('session.subscribe', { events: ['browsingContext.load', 'browsingContext.userPromptOpened', 'network.beforeRequestSent', 'network.responseCompleted'] });
    const tree = await send('browsingContext.getTree', {});
    const context = resu(tree).contexts && resu(tree).contexts[0] && resu(tree).contexts[0].context;
    if (!context) throw new Refusal('no browsing context');
    await send('browsingContext.setViewport', { context, viewport: gate.VIEWPORT, devicePixelRatio: 1 });
    await send('network.addDataCollector', { dataTypes: ['response'], maxEncodedDataSize: 65536 });
    const a = `${fx.base}/a.html`;
    await send('browsingContext.navigate', { context, url: a, wait: 'complete' });
    await waitEvent((e) => e.method === 'browsingContext.load' && e.params.url === a);
    await evaluate('window.__ready', true, context);
    await evaluate('window.innerWidth', false, context);
    await send('browsingContext.captureScreenshot', { context });
    const loc = async (sel) => { const r = await send('browsingContext.locateNodes', { context, locator: { type: 'css', value: sel } }); return resu(r).nodes && resu(r).nodes[0] && resu(r).nodes[0].sharedId; };
    await loc('#h');
    const t = await loc('#t');
    const b = await loc('#b');
    const click = (sharedId) => ({ type: 'pointer', id: 'mouse', parameters: { pointerType: 'mouse' }, actions: [{ type: 'pointerMove', x: 0, y: 0, origin: { type: 'element', element: { sharedId } } }, { type: 'pointerDown', button: 0 }, { type: 'pointerUp', button: 0 }] });
    await send('input.performActions', { context, actions: [click(t)] });
    await send('input.performActions', { context, actions: [{ type: 'key', id: 'kbd', actions: [...'tabi'].flatMap((ch) => [{ type: 'keyDown', value: ch }, { type: 'keyUp', value: ch }]) }] });
    await evaluate("document.getElementById('t').value", false, context);
    await send('input.performActions', { context, actions: [click(b)] });
    await evaluate("document.getElementById('out').textContent", false, context);
    await evaluate("fetch('/data.txt').then(function(r){return r.text()})", true, context);
    const done = await waitEvent((e) => e.method === 'network.responseCompleted' && e.params.response && /\/data\.txt$/.test(e.params.response.url));
    if (done) await send('network.getData', { dataType: 'response', request: done.params.request.request });
    await send('storage.getCookies', {});
    const ic = await send('network.addIntercept', { phases: ['beforeRequestSent'], urlPatterns: [{ type: 'string', pattern: `${fx.base}/data.txt?held=1` }] });
    await evaluate("window.__held=fetch('/data.txt?held=1').then(function(r){return r.text()}),1", false, context);
    const blocked = await waitEvent((e) => e.method === 'network.beforeRequestSent' && e.params.isBlocked === true && (e.params.intercepts || []).includes(resu(ic).intercept));
    if (blocked) await send('network.continueRequest', { request: blocked.params.request.request });
    await evaluate('window.__held', true, context);
    await send('browsingContext.navigate', { context, url: `${fx.base}/b.html`, wait: 'complete' });
    await send('browsingContext.traverseHistory', { context, delta: -1 });
    await waitEvent((e) => e.method === 'browsingContext.load' && e.params.url === a && e.i > rec.cmds[rec.cmds.length - 1].i, 5000);
    for (let k = 0; k < 20; k += 1) {
      const p = await evaluate('location.pathname', false, context);
      if (strVal(resu(p).result) === '/a.html') break;
      await sleep(100);
    }
    await evaluate("setTimeout(function(){alert('tabi-alert')},0),1", false, context);
    const prompt = await waitEvent((e) => e.method === 'browsingContext.userPromptOpened' && e.params.message === 'tabi-alert');
    if (prompt) await send('browsingContext.handleUserPrompt', { context: prompt.params.context, accept: true });
    return rec;
  } finally {
    clearTimeout(deadline);
    clearInterval(sampler);
    try { ws && ws.close(); } catch {}
    if (sessionId) { try { await fetch(`http://127.0.0.1:${port}/session/${sessionId}`, { method: 'DELETE' }); } catch {} }
    gd.kill('SIGTERM');
    await fx.close();
    await sleep(500);
    rmSync(scratch, { recursive: true, force: true });
  }
}

function sessionOf(rec) {
  const v = rec.newSession && rec.newSession.value;
  if (!v || typeof v !== 'object') return { why: 'no classic new-session value' };
  const sid = v.sessionId;
  if (typeof sid !== 'string' || !UUID.test(sid)) return { why: `sessionId is not geckodriver-shaped (UUID): ${JSON.stringify(sid)}` };
  const caps = v.capabilities || {};
  if (caps.browserName !== 'firefox') return { why: `browserName ${JSON.stringify(caps.browserName)} != firefox` };
  if (typeof caps['moz:geckodriverVersion'] !== 'string' || !caps['moz:geckodriverVersion']) return { why: 'no moz:geckodriverVersion capability' };
  const m = WS_SESSION.exec(String(caps.webSocketUrl || ''));
  if (!m) return { why: `webSocketUrl is not a loopback ws session url: ${caps.webSocketUrl}` };
  if (m[1] !== sid) return { why: `webSocketUrl session segment ${m[1]} != sessionId ${sid}` };
  return { sid, gdv: caps['moz:geckodriverVersion'], bv: caps.browserVersion };
}
function contextIds(rec) {
  const ids = new Set();
  const add = (v) => { if (typeof v === 'string') ids.add(v); };
  for (const c of rec.cmds) {
    add(c.params && c.params.context);
    const t = c.params && c.params.target;
    if (t && typeof t === 'object') add(t.context);
    for (const x of Array.isArray(resu(c).contexts) ? resu(c).contexts : []) if (x && typeof x === 'object') add(x.context);
  }
  for (const e of rec.events) add(e.params && e.params.context);
  return [...ids];
}
const firstShot = (rec) => { const c = rec.cmds.find((x) => x.method === 'browsingContext.captureScreenshot' && ok(x)); return c ? sha256(Buffer.from(String(resu(c).data || ''), 'base64')) : null; };
const capsOf = (rec) => (rec && rec.newSession && rec.newSession.value && rec.newSession.value.capabilities) || {};

// A3: lstat-refused exclusive scratch write (same construction as the C1 v4 counter).
function safeWrite(dir, name, bytes) {
  const target = join(dir, name);
  let p = dir;
  const chain = [];
  while (p !== dirname(p)) { chain.push(p); p = dirname(p); }
  for (const c of chain) {
    let st;
    try { st = lstatSync(c); } catch { continue; }
    if (st.isSymbolicLink()) throw new Refusal(`refusing to write through symlink component: ${c}`);
  }
  let st;
  try { st = lstatSync(target); } catch { /* absent: good */ }
  if (st) throw new Refusal(`refusing to overwrite existing scratch file: ${target}`);
  const fd = openSync(target, 'wx');
  try {
    const fst = fstatSync(fd);
    if (!fst.isFile()) throw new Refusal(`scratch target is not a regular file: ${target}`);
    writeSync(fd, bytes);
  } finally { closeSync(fd); }
  return target;
}

// A4: whitespace normalisation for the self-sniff refusal.
const wsNorm = (s) => String(s).replace(/\s+/g, ' ').trim();

// A2: the binaries about to run must carry the install-receipt digests.
function verifyBinaries(firefox, geckodriver) {
  const check = (label, path, expected) => {
    let data;
    try { data = readFileSync(path); } catch { throw new Refusal(`pinned ${label} unreadable: ${path}`); }
    const got = sha256(data);
    if (got !== expected) throw new Refusal(`pinned ${label} sha256 ${got} != install receipt ${expected} (${path})`);
  };
  if (firefox === PINNED_BINARIES.firefox.path) check('firefox', firefox, PINNED_BINARIES.firefox.sha256);
  else if (firefox === PINNED_BINARIES.firefoxBin.path) check('firefox-bin', firefox, PINNED_BINARIES.firefoxBin.sha256);
  else throw new Refusal(`refusing unregistered firefox binary: ${firefox}`);
  check('geckodriver', geckodriver, PINNED_BINARIES.geckodriver.sha256);
}

// A5: process-tree discovery — pids of `gd` and every descendant (firefox is geckodriver's child).
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
// ESTABLISHED (st 01) non-loopback remote peers among the owned inodes.
function nonLoopbackEstablished(owned) {
  let n = 0;
  const parse = (file, v6) => {
    let rows;
    try { rows = readFileSync(file, 'utf8').split('\n').slice(1); } catch { return; }
    for (const row of rows) {
      const f = row.trim().split(/\s+/);
      if (f.length < 4 || f[3] !== '01') continue; // ESTABLISHED only
      if (!owned.has(Number(f[9]))) continue;
      const remote = f[2];
      const addr = v6 ? remote.split(':')[0] : remote.slice(0, 8);
      if (v6) { if (addr !== '0000000000000000' && addr !== '0000000000000001' && addr !== '0100000000000000') n += 1; }
      else if (addr !== '0100007F' && addr !== '00000000') n += 1; // 127.0.0.1 LE, 0.0.0.0
    }
  };
  parse('/proc/net/tcp', false);
  parse('/proc/net/tcp6', true);
  return n;
}

async function loadGate(repo, rev) {
  const src = blob(repo, rev, GATE_PATH);
  if (src === null) throw new Refusal(`${GATE_PATH} absent at ${rev}`);
  if (sha256(src) !== GATE_SHA256) throw new Refusal(`${GATE_PATH} at ${rev} sha256 ${sha256(src)} != frozen ${GATE_SHA256}`);
  const dir = mkdtempSync(join(SCRATCH_BASE, 'tabi-r36-c2-gate-'));
  try {
    const file = safeWrite(dir, 'check-bidi-runtime.mjs', src); // A3
    return { mod: await import(pathToFileURL(file).href), src };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

export async function evaluate({ repo, rev, firefox = FIREFOX, geckodriver = GECKODRIVER, liveRunner = liveRecordFirefox }) {
  const REV = resolveCommit(repo, rev);
  const base = resolveCommit(repo, BASELINE);
  verifyBinaries(firefox, geckodriver); // A2 — refuse caller-named binaries off the pinned digests
  const { mod: gate, src: gateSrc } = await loadGate(repo, REV);
  const counterSrc = readFileSync(fileURLToPath(import.meta.url));
  const out = { schema: SCHEMA, rev: REV, baseline: base, gateSha256: GATE_SHA256, counterSha256: sha256(counterSrc), entry: ENTRY, receipt: RECEIPT,
    population: 0, admitted: 0, failing: 0, unmeasured: 0, entryFinding: null, entryDetail: null, receiptFinding: null, binding: null,
    provenance: [], live: null, rows: [] };
  const entryBuf = blob(repo, REV, ENTRY);
  if (entryBuf === null) { out.entryFinding = 'e1-entry-absent'; out.predicate = false; return out; }
  const entryText = entryBuf.toString('utf8');
  const tableRows = gate.parseTable(entryText) || [];
  out.population = tableRows.filter((r) => String(r.cells[3] ?? '').trim() !== '').length;
  const idCounts = new Map();
  for (const r of tableRows) idCounts.set(r.cells[0], (idCounts.get(r.cells[0]) || 0) + 1);
  // s1
  const regNow = parseRegistry((blob(repo, REV, SOURCES) || Buffer.from('')).toString('utf8'));
  const regThen = parseRegistry((blob(repo, base, SOURCES) || Buffer.from('')).toString('utf8'));
  const srcLine = entryText.split('\n').find((l) => /^source:/i.test(l)) || '';
  const cited = [...srcLine.matchAll(/\bS\d{3,}\b/g)].map((m) => m[0]);
  const lessonGateMaps = LESSONS.map((p) => {
    const b = blob(repo, REV, p);
    return b ? lessonGateRows(b.toString('utf8')) : new Map();
  });
  const why = [];
  let witness = null;
  for (const id of cited) {
    const row = regNow.get(id);
    if (!row || row.status !== 'mined' || !row.usedBy.split(/[,;]/).map((x) => x.trim()).includes(ENTRY) || regThen.has(id)) { why.push(`${id}: registry row not mined/new/naming the entry`); continue; }
    const regHost = urlHost(firstHttps(row.source));
    let g = null;
    let gLesson = null;
    for (let li = 0; li < LESSONS.length && !g; li += 1) {
      const cand = (lessonGateMaps[li].get(id) || []).find((x) => firstHttps(x.text) && HEX64.test(x.text) && urlHost(firstHttps(x.text)) === regHost);
      if (cand) { g = cand; gLesson = LESSONS[li]; }
    }
    if (!g) { why.push(`${id}: no ${LESSONS.join(' or ')} ## Gate row with an https URL on host ${regHost} and a 64-hex sha256`); continue; }
    witness = { id, gate: `${gLesson}:${g.line}`, host: regHost };
    break;
  }
  if (!witness) { out.entryFinding = 's1-source-row'; out.entryDetail = why.join('; ') || 'no S-id on the source: line'; }
  out.sourceWitness = witness;
  // receipt
  let rf = null;
  const runs = [];
  let receipt = null;
  const rb = blob(repo, REV, RECEIPT);
  if (rb === null) rf = 'receipt absent';
  else {
    try { receipt = JSON.parse(rb.toString('utf8')); } catch { rf = 'receipt is not JSON'; }
    if (receipt) {
      if (receipt.schema !== RECEIPT_SCHEMA) rf = 'receipt schema';
      else if (receipt.fixtureSha256 !== gate.FIXTURE_SHA256) rf = "fixtureSha256 is not the gate FIXTURE's";
      else if (typeof receipt.browserVersion !== 'string' || !receipt.browserVersion) rf = 'no browserVersion';
      else if (typeof receipt.driver !== 'string' || !receipt.driver) rf = 'no driver path';
      else if (receipt.driver === GATE_PATH || receipt.driver === COUNTER_PATH) rf = 'driver is the gate or this counter';
      else {
        const drv = blob(repo, REV, receipt.driver);
        if (drv === null) rf = `driver absent: ${receipt.driver}`;
        else if (sha256(drv) !== receipt.driverSha256) rf = `driver sha256 differs: ${receipt.driver}`;
        else if (sha256(drv) === sha256(gateSrc) || sha256(drv) === sha256(counterSrc)) rf = 'driver is a byte copy of the gate or this counter';
        else if (wsNorm(drv.toString('utf8')) === wsNorm(counterSrc.toString('utf8'))) rf = 'driver is a whitespace-normalised copy of this counter (A4)';
        else rf = driverFinding(drv.toString('utf8'), receipt.driver);
      }
      if (!rf) {
        if (!Array.isArray(receipt.runs) || receipt.runs.length < 2) rf = 'fewer than two runs';
        else for (const run of receipt.runs) {
          const tb = blob(repo, REV, run.transcript);
          if (tb === null) { rf = `transcript absent: ${run.transcript}`; break; }
          if (sha256(tb) !== run.transcriptSha256) { rf = `transcript sha256 differs: ${run.transcript}`; break; }
          try { runs.push({ name: run.name, path: run.transcript, sha: sha256(tb), rec: gate.recordFromTranscript(tb.toString('utf8')) }); } catch (e) { rf = `transcript unreadable: ${e.message}`; break; }
        }
      }
      if (!rf && new Set(runs.map((r) => r.path)).size !== runs.length) rf = 'transcript path repeated across runs';
      if (!rf && new Set(runs.map((r) => r.sha)).size !== runs.length) rf = 'transcript sha256 repeated across runs';
      if (!rf) {
        const sids = [];
        for (const r of runs) {
          const s = sessionOf(r.rec);
          if (s.why) { rf = `${r.name}: ${s.why}`; break; }
          const bad = contextIds(r.rec).filter((id) => !UUID.test(id));
          if (bad.length) { rf = `${r.name}: browsing-context id not UUID-shaped: ${bad.slice(0, 3).join(', ')}`; break; }
          sids.push(s.sid);
          out.provenance.push({ name: r.name, sessionId: s.sid, geckodriverVersion: s.gdv, browserVersion: s.bv, contexts: contextIds(r.rec) });
        }
        if (!rf && new Set(sids).size !== sids.length) rf = 'sessionId repeated across runs';
      }
    }
  }
  out.receiptFinding = rf;
  // live
  let liveRec = null;
  let liveError = null;
  if (out.population && !out.entryFinding && !rf) {
    try { liveRec = await liveRunner({ gate, firefox, geckodriver }); } catch (e) { if (e instanceof Refusal) throw e; liveError = String((e && e.message) || e); }
    const lc = capsOf(liveRec);
    out.live = liveRec ? { browserName: lc.browserName, browserVersion: lc.browserVersion, geckodriverVersion: lc['moz:geckodriverVersion'], firstShotSha256: firstShot(liveRec), commands: liveRec.cmds.length, events: liveRec.events.length, egress: liveRec.egress || null } : { error: liveError };
  }
  // binding
  if (!rf && runs.length) {
    const shots = runs.map((r) => firstShot(r.rec));
    const gdvs = runs.map((r) => capsOf(r.rec)['moz:geckodriverVersion']);
    const bvs = runs.map((r) => capsOf(r.rec).browserVersion);
    if (shots.some((s) => !s) || new Set(shots).size !== 1) out.binding = 'first screenshots absent or differ between runs';
    else if (new Set(gdvs).size !== 1) out.binding = 'moz:geckodriverVersion differs between runs';
    else if (new Set(bvs).size !== 1 || bvs[0] !== receipt.browserVersion) out.binding = 'browserVersion differs between runs or from the receipt';
    else if (!liveRec) out.binding = `live session failed: ${liveError}`;
    else if (firstShot(liveRec) !== shots[0]) out.binding = "first screenshot differs from this counter's live session";
    else if (capsOf(liveRec)['moz:geckodriverVersion'] !== gdvs[0]) out.binding = "moz:geckodriverVersion differs from this counter's live session";
    else if (capsOf(liveRec).browserVersion !== bvs[0]) out.binding = "browserVersion differs from this counter's live session";
    else {
      // A6: browsing-context id sets pairwise disjoint across runs and the live session
      const sets = runs.map((r) => new Set(contextIds(r.rec)));
      const liveSet = new Set(contextIds(liveRec));
      let clash = null;
      for (let i = 0; i < sets.length && !clash; i += 1) {
        for (let k = 0; k < sets.length && !clash; k += 1) {
          if (i !== k && sets[i].size + sets[k].size !== new Set([...sets[i], ...sets[k]]).size) clash = `runs ${runs[i].name} and ${runs[k].name} share a browsing-context id`;
        }
        if (!clash && sets[i].size + liveSet.size !== new Set([...sets[i], ...liveSet]).size) clash = `run ${runs[i].name} and the live session share a browsing-context id`;
      }
      if (clash) out.binding = clash;
    }
  }
  const ctx = { browserVersion: receipt && receipt.browserVersion };
  for (const r of tableRows) {
    const id = r.cells[0];
    const cell = String(r.cells[3] ?? '').trim();
    const mv = MEASURED.exec(cell);
    const verdict = mv ? mv[1].toLowerCase() : null;
    const row = { line: r.line, id, verdict, admitted: false, reason: null, detail: null };
    if (!cell) continue;
    if (out.entryFinding) row.reason = out.entryFinding;
    else if (!mv) { row.reason = 'x4-measured-cell'; row.detail = cell.slice(0, 80); }
    else if (!Object.hasOwn(gate.ROWS, id)) row.reason = 'x1-row-unknown';
    else if ((idCounts.get(id) || 0) > 1) row.reason = 'x3-duplicate-id';
    else if (id === 'R16' && verdict === 'yes') row.reason = 'x2-no-counterpart';
    else if (verdict === 'no') { /* unmeasured */ }
    else if (rf) { row.reason = 't1-receipt'; row.detail = rf; }
    else if (out.binding) { row.reason = 't3-binding'; row.detail = out.binding; }
    else {
      for (const run of runs) { const w = gate.PREDICATES[id](run.rec, ctx); if (w) { row.reason = 't2-run'; row.detail = `${run.name}: ${w}`; break; } }
      if (!row.reason) { const w = gate.PREDICATES[id](liveRec, ctx); if (w) { row.reason = 'l1-live'; row.detail = w; } }
    }
    row.admitted = row.reason === null && verdict === 'yes';
    out.rows.push(row);
  }
  out.admitted = out.rows.filter((r) => r.admitted).length;
  out.failing = out.rows.filter((r) => r.reason !== null).length;
  out.unmeasured = out.rows.filter((r) => r.reason === null && r.verdict === 'no').length;
  out.target = TARGET;
  out.egressNonLoopback = out.live && out.live.egress ? out.live.egress.nonLoopback : null;
  out.predicate = !out.entryFinding && !out.receiptFinding && !out.binding && out.failing === 0 && out.admitted >= TARGET && out.egressNonLoopback === 0;
  return out;
}

async function main() {
  const argv = process.argv.slice(2);
  const o = { repo: resolve(dirname(fileURLToPath(import.meta.url)), '../../../..'), rev: null, json: false, firefox: FIREFOX, geckodriver: GECKODRIVER };
  try {
    for (let i = 0; i < argv.length; i += 1) {
      const a = argv[i];
      if (a === '--json') o.json = true;
      else if (['--repo', '--rev', '--firefox', '--geckodriver'].includes(a)) { const v = argv[++i]; if (v === undefined) throw new Refusal(`missing value for ${a}`); o[a.slice(2)] = v; }
      else throw new Refusal(`unknown argument ${a}`);
    }
    if (!o.rev) throw new Refusal('usage: --rev <40-hex REV> required');
    o.repo = resolve(o.repo);
    const out = await evaluate(o);
    if (o.json) console.log(JSON.stringify(out));
    else {
      for (const r of out.rows) console.log(`ROW id=${r.id} measured=${r.verdict ?? '-'} ${r.admitted ? 'admitted' : r.reason ? `reason=${r.reason}${r.detail ? ` detail=${JSON.stringify(r.detail)}` : ''}` : 'unmeasured'}`);
      console.log(`C2_FIREFOX_BIDI_V2 predicate=${out.predicate ? 'met' : 'not-met'} rev=${out.rev} population=${out.population} admitted=${out.admitted}/${out.target} failing=${out.failing} unmeasured=${out.unmeasured} egressNonLoopback=${out.egressNonLoopback} entry=${out.entryFinding ?? '-'} receipt=${out.receiptFinding ? JSON.stringify(out.receiptFinding) : '-'} binding=${out.binding ? JSON.stringify(out.binding) : '-'}`);
    }
    process.exit(out.predicate ? 0 : 1);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`C2_FIREFOX_BIDI_V2 verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
export { liveRecordFirefox, sessionOf, firstShot };

#!/usr/bin/env node
// c2-firefox-bidi.mjs — tabi round 35, claim C2 (coverage + capability acquisition,
// sourced). Frozen counter.
//
// Question: the lane's WebDriver BiDi runtime evidence (round 32) is Chromium-only — every
// admitted matrix row was observed through chromedriver, and the host census records Firefox
// as absent. On a second engine (Firefox through geckodriver), how many of the seventeen
// matrix §2 rows (corpus/knowledge/webdriver-bidi-capability-matrix.md) does the lane hold
// as runtime evidence that (a) its own committed Firefox runs satisfy and (b) this counter's
// own independent Firefox session re-satisfies live?
//
// Usage:
//   node c2-firefox-bidi.mjs --rev <40-hex REV> [--repo <lane clone>] [--json]
//        [--firefox <bin>] [--geckodriver <bin>]
// Exit: 0 predicate met; 1 evaluated, predicate not met; 2 could not evaluate.
//
// Inputs: git objects of the lane at --rev and BASELINE, plus one live session this counter
// starts. scripts/check-bidi-runtime.mjs (the round-33/34 gate) is read from --rev, must equal
// GATE_SHA256 (the gate is not modified by this claim), is written to a scratch file under
// $TMPDIR and imported for its frozen FIXTURE, serveFixture, VIEWPORT, ROWS, PREDICATES,
// parseTable and recordFromTranscript only — the row predicates are the gate's, unchanged.
//
// Definitions (frozen):
//   entry       ENTRY at --rev; population = every data row of its first Markdown table
//               whose header is `Row | Surface | BiDi method | Measured | Evidence` and whose
//               Measured cell is non-empty (gate parseTable). Measured is `yes`, `no`, or
//               `no` + dash + reason; anything else is a row finding (x4). Duplicate ids are a
//               finding on every occurrence (x3); unknown ids (x1); R16 `yes` (x2).
//   s1-source   the entry's `source:` line cites >= 1 S-id whose corpus/SOURCES.md row
//               (0-3 leading spaces, 11 cells) is `mined`, lists ENTRY in used-by, is absent
//               at BASELINE, and has a `## Gate` table row in LESSON at --rev carrying an
//               https URL whose host equals the registry row's source URL host and a 64-hex
//               sha256. Otherwise every row fails s1.
//   receipt     RECEIPT at --rev: schema tabi-bidi-receipt-v1; fixtureSha256 == the gate's
//               FIXTURE_SHA256; a browserVersion; a driver path present at --rev with the
//               recorded driverSha256, which is neither the gate (path or bytes) nor this
//               counter (path or bytes), and whose static imports reach the gate only for
//               DRIVER_ALLOW names and never reach this counter; >= 2 runs whose transcript
//               paths and transcript sha256 are pairwise distinct and present at --rev.
//   firefox     every run's classic new-session body: sessionId of geckodriver's shape
//               (UUID, lowercase), capabilities.browserName == "firefox", a
//               capabilities["moz:geckodriverVersion"], webSocketUrl
//               ws://127.0.0.1|localhost:<port>/session/<that sessionId>; sessionIds pairwise
//               distinct; every browsing-context id the run mentions is UUID-shaped
//               (Chromium's 32-uppercase-hex ids are refused).
//   binding     every run's FIRST successful captureScreenshot decodes to the same bytes, and
//               equals this counter's live session's first screenshot; moz:geckodriverVersion
//               and browserVersion are equal across runs, equal to the receipt's
//               browserVersion, and equal to the live session's.
//   admitted    a `yes` row with no entry/receipt/firefox/binding finding whose gate predicate
//               holds on every committed run AND on this counter's live session.
//   failing     rows with any finding (a `no` row is unmeasured, not failing).
// Predicate (frozen): no entry finding AND no binding finding AND failing == 0 AND
//   admitted >= 14.
//
// Write scope: stdout/stderr and its own mkdtemp dirs under $TMPDIR (removed on exit). The
// live leg runs geckodriver with --profile-root, HOME, TMPDIR and XDG_* inside that scratch,
// a free --websocket-port (never the 9222 default), headless, loopback FIXTURE only.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, posix } from 'node:path';
import { createHash } from 'node:crypto';
import { createServer as createNetServer } from 'node:net';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCHEMA = 'tabi-r35-c2-firefox-bidi';
const BASELINE = '2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684';
const GATE_PATH = 'scripts/check-bidi-runtime.mjs';
const GATE_SHA256 = '370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87';
const COUNTER_PATH = '.ufo/waves/round-35/counters/c2-firefox-bidi.mjs';
const ENTRY = 'corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md';
const RECEIPT = 'corpus/evidence/round-35/bidi-firefox/receipt.json';
const LESSON = 'corpus/lessons/round-35.md';
const SOURCES = 'corpus/SOURCES.md';
const RECEIPT_SCHEMA = 'tabi-bidi-receipt-v1';
const TARGET = 14;
const FIREFOX = '/home/vgpnk/.local/opt/firefox-158.0.1/firefox';
const GECKODRIVER = '/home/vgpnk/.local/bin/geckodriver';
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
  const scratch = mkdtempSync(join(SCRATCH_BASE, 'tabi-r35-c2-live-'));
  const home = join(scratch, 'home');
  for (const d of ['.config', '.cache', '.local/share', '.local/state', '../tmp', '../profiles']) mkdirSync(join(home, d), { recursive: true });
  const fx = await gate.serveFixture();
  const port = await freePort();
  const wsPort = await freePort();
  const env = { PATH: process.env.PATH, HOME: home, TMPDIR: join(scratch, 'tmp'), XDG_CONFIG_HOME: join(home, '.config'), XDG_CACHE_HOME: join(home, '.cache'), XDG_DATA_HOME: join(home, '.local/share'), XDG_STATE_HOME: join(home, '.local/state'), MOZ_HEADLESS: '1', LC_ALL: 'C.UTF-8' };
  const gd = spawn(geckodriver, ['--port', String(port), '--websocket-port', String(wsPort), '--binary', firefox, '--profile-root', join(scratch, 'profiles')], { stdio: 'ignore', env });
  const rec = { newSession: null, cmds: [], events: [] };
  let ws = null;
  let sessionId = null;
  const deadline = setTimeout(() => { try { ws && ws.close(); } catch {} }, timeoutMs);
  try {
    let body = null;
    for (let k = 0; k < 50 && !body; k += 1) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/session`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ capabilities: { alwaysMatch: {
          browserName: 'firefox', webSocketUrl: true, unhandledPromptBehavior: 'ignore', 'moz:firefoxOptions': { args: ['-headless'] } } } }) });
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

async function loadGate(repo, rev) {
  const src = blob(repo, rev, GATE_PATH);
  if (src === null) throw new Refusal(`${GATE_PATH} absent at ${rev}`);
  if (sha256(src) !== GATE_SHA256) throw new Refusal(`${GATE_PATH} at ${rev} sha256 ${sha256(src)} != frozen ${GATE_SHA256}`);
  const dir = mkdtempSync(join(SCRATCH_BASE, 'tabi-r35-c2-gate-'));
  const file = join(dir, 'check-bidi-runtime.mjs');
  writeFileSync(file, src);
  try { return { mod: await import(pathToFileURL(file).href), src }; } finally { rmSync(dir, { recursive: true, force: true }); }
}

export async function evaluate({ repo, rev, firefox = FIREFOX, geckodriver = GECKODRIVER, liveRunner = liveRecordFirefox }) {
  const REV = resolveCommit(repo, rev);
  const base = resolveCommit(repo, BASELINE);
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
  const lessonBuf = blob(repo, REV, LESSON);
  const gates = lessonBuf ? lessonGateRows(lessonBuf.toString('utf8')) : new Map();
  const why = [];
  let witness = null;
  for (const id of cited) {
    const row = regNow.get(id);
    if (!row || row.status !== 'mined' || !row.usedBy.split(/[,;]/).map((x) => x.trim()).includes(ENTRY) || regThen.has(id)) { why.push(`${id}: registry row not mined/new/naming the entry`); continue; }
    const regHost = urlHost(firstHttps(row.source));
    const g = (gates.get(id) || []).find((x) => firstHttps(x.text) && HEX64.test(x.text) && urlHost(firstHttps(x.text)) === regHost);
    if (!g) { why.push(`${id}: no ${LESSON} ## Gate row with an https URL on host ${regHost} and a 64-hex sha256`); continue; }
    witness = { id, gate: `${LESSON}:${g.line}`, host: regHost };
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
    out.live = liveRec ? { browserName: lc.browserName, browserVersion: lc.browserVersion, geckodriverVersion: lc['moz:geckodriverVersion'], firstShotSha256: firstShot(liveRec), commands: liveRec.cmds.length, events: liveRec.events.length } : { error: liveError };
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
  out.predicate = !out.entryFinding && !out.binding && out.failing === 0 && out.admitted >= TARGET;
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
      console.log(`C2_FIREFOX_BIDI predicate=${out.predicate ? 'met' : 'not-met'} rev=${out.rev} population=${out.population} admitted=${out.admitted} failing=${out.failing} unmeasured=${out.unmeasured} entry=${out.entryFinding ?? '-'} receipt=${out.receiptFinding ? JSON.stringify(out.receiptFinding) : '-'} binding=${out.binding ? JSON.stringify(out.binding) : '-'}`);
    }
    process.exit(out.predicate ? 0 : 1);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`C2_FIREFOX_BIDI verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
export { liveRecordFirefox, sessionOf, firstShot };

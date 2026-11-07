// Second witness round for seat R80Mut1: witnesses for the survivors the first round did not cover,
// plus the "natural witness" probes that empirically prove a survivor is SUBSUMED by another check
// (the mutant still refuses with the same id) rather than merely uncovered.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { MUTANTS } from './mutants.mjs';

const ROOT = '/fast/scratch/hyaku/tabi-r80/R80Mut1';
const LANE = path.join(ROOT, 'lane/tabi-shokunin');
const RECEIPT = path.join(LANE, 'corpus/evidence/round80/chromium-showpicker/receipt.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-80/controls/c1/prior-set.txt');
const PIN = 'cb93935c017daf1ca5ae654f0992e63ad0785042ee2566619623ae8bab4b19cc';
const arg = (n) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : null; };
const COUNTER = arg('counter');
const LABEL = arg('label') || 'unlabeled';
const OUT = arg('out') || path.join(ROOT, 'witness2-' + LABEL + '.json');
const src = fs.readFileSync(COUNTER, 'utf8');
const real = JSON.parse(fs.readFileSync(RECEIPT, 'utf8'));
const NONCE = real.nonce, FIXTURE = real.fixture.sha256;
const WDIR = path.join(ROOT, 'witness2-cases', LABEL);
fs.mkdirSync(WDIR, { recursive: true });
const realSha = crypto.createHash('sha256').update(fs.readFileSync(RECEIPT)).digest('hex');
const clone = (v) => JSON.parse(JSON.stringify(v));
const leg = (r, n) => r.legs.find((l) => l.name === n);
const evs = (r, n) => r.legs.find((l) => l.name === n).pageEvents;
const sendOf = (r, n, m, k = 0) => r.legs.find((l) => l.name === n).cdpSendLog.filter((c) => c.method === m)[k];

const counterFor = (m) => {
  const cands = m.fromVariants ? m.fromVariants : [[m.from, m.to]];
  for (const [f, t] of cands) if (src.split(f).length - 1 === 1) return src.replace(f, t);
  return null;
};
const MUT = new Map(MUTANTS.map((m) => [m.name, m]));
const cache = new Map();
const mutantPath = (name) => {
  if (cache.has(name)) return cache.get(name);
  const m = MUT.get(name);
  const text = m ? counterFor(m) : null;
  if (!text) { cache.set(name, null); return null; }
  const p = path.join(WDIR, 'counter-' + name + '.mjs');
  fs.writeFileSync(p, text);
  cache.set(name, p);
  return p;
};

const run = (counterPath, receiptPath, extraArgs = [], noExempt = false) => {
  const args = [counterPath, ...extraArgs, '--lane', LANE, '--receipt', receiptPath, '--expect-driver-sha256', PIN,
    '--expect-nonce', NONCE, '--expect-fixture-sha256', FIXTURE, '--prior-set', PRIOR_SET,
    ...(noExempt ? [] : ['--tree-exempt-sha256', realSha]), '--json'];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 30000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch { j = null; }
  return { status: r.status, verdict: j && j.verdict, ids: j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null };
};

const rewriteNonce = (r, to) => {
  const old = r.nonce;
  r.nonce = to;
  for (const l of r.legs) {
    for (const s of l.serverLog || []) if (s.run === old) s.run = to;
    for (const s of l.childServerLog || []) if (s.run === old) s.run = to;
    for (const c of l.cdpSendLog || []) {
      if (c.method === 'Page.navigate') c.params.url = c.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));
      if (c.method === 'Runtime.evaluate' && typeof c.params.expression === 'string') c.params.expression = c.params.expression.split(JSON.stringify(old)).join(JSON.stringify(to));
    }
    for (const e of l.cdpEventLog || []) if (e.method === 'Page.frameNavigated') e.params.url = e.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));
  }
  return r;
};

// replay metrics, copied from the counter's own definitions
const pairs = (r) => r.legs.flatMap((l) => (l.pageEvents || []).filter((e) => typeof e.ts === 'number' && typeof e.at === 'number').map((e) => ({ ts: e.ts, at: e.at })));
const gapsOf = (x) => { const at = x.map((e) => e.at).sort((p, q) => p - q); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= 50) g.push(at[i] - at[i - 1]); return g; };
const matchCount = (a, b, TOL = 0.05) => { const x = [...a].sort((p, q) => p - q), y = [...b].sort((p, q) => p - q); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const pairMatch = (a, b, TOL = 0.05) => { const y = b.map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of a) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };

// build a prior that breaks `breakGaps` of the receipt's gaps (upper moved by +3 ms) and shifts
// `shiftCount` further events by +1 ms, preserving the remaining gaps
const buildPrior = (r, breakGaps, shiftCount, breakMs = 3) => {
  const c = clone(r);
  for (const l of c.legs) {
    const tok = crypto.randomBytes(6).toString('hex');
    l.launchToken = tok;
    const i = (l.argv || []).findIndex((a) => typeof a === 'string' && a.startsWith('--user-data-dir='));
    if (i >= 0) l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice(16)), 'profile-' + tok);
    const bid = crypto.randomUUID();
    if (l.devtoolsListening) { l.devtoolsListening = { url: 'ws://127.0.0.1:' + c.ports.cdp + '/devtools/browser/' + bid, port: c.ports.cdp, browserId: bid }; l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url; }
  }
  const flat = c.legs.flatMap((l) => (l.pageEvents || []).map((e) => ({ l, e }))).sort((a, b) => a.e.at - b.e.at);
  const gapUppers = [];
  for (let i = 1; i < flat.length; i++) if (flat[i].e.at - flat[i - 1].e.at >= 50) gapUppers.push(flat[i]);
  const broken = new Set(gapUppers.slice(0, breakGaps));
  for (const u of broken) { u.e.ts = Math.round((u.e.ts + breakMs) * 10) / 10; u.e.at = Math.round((u.e.at + breakMs) * 10) / 10; }
  const preservedEndpoints = new Set();
  for (const u of gapUppers.slice(breakGaps)) {
    preservedEndpoints.add(u);
    const i = flat.indexOf(u);
    preservedEndpoints.add(flat[i - 1]);
  }
  const movable = flat.filter((x) => !broken.has(x) && !preservedEndpoints.has(x));
  for (const x of movable.slice(0, shiftCount)) { x.e.ts = Math.round((x.e.ts + 1) * 10) / 10; x.e.at = Math.round((x.e.at + 1) * 10) / 10; }
  return c;
};

const results = [];
const addRes = (id, mutant, expect, p, mm, note) => {
  const wantStatus = (expect === 'usage' || expect === 'prior-unreadable') ? 2 : 1;
  const pristineRefuses = p.status === wantStatus && p.ids && p.ids.includes(expect);
  const mutantMisses = !(mm.ids && mm.ids.includes(expect));
  results.push({ id, mutant, expect, note, pristine: p, mutantRun: mm, outcome: pristineRefuses && mutantMisses ? 'witness' : (pristineRefuses ? 'mutant-still-refuses' : 'pristine-did-not-refuse') });
};

// ---- 1. nonce-shape-unbounded: a nonce that is the expected one but longer than the 4..48 bound ----
{
  const longNonce = 'tabi-r80-' + 'a'.repeat(60);
  const r = rewriteNonce(clone(real), longNonce);
  const p = path.join(WDIR, 'w-nonce-shape.json');
  fs.writeFileSync(p, JSON.stringify(r));
  const extra = ['--expect-nonce', longNonce];
  const mpath = mutantPath('nonce-shape-unbounded');
  addRes('w2-nonce-shape', 'nonce-shape-unbounded', 'nonce-shape', run(COUNTER, p, extra), run(mpath, p, extra), 'nonce matches the expected value but exceeds {4,48}');
}
// ---- 2. walk-error-skipped: an unreadable directory inside the walked tree ----
{
  const locked = path.join(LANE, '.ufo/waves/round-80/locked');
  fs.rmSync(locked, { recursive: true, force: true });
  fs.mkdirSync(locked, { recursive: true });
  fs.writeFileSync(path.join(locked, 'x.txt'), 'x');
  fs.chmodSync(locked, 0o000);
  const mpath = mutantPath('walk-error-skipped');
  const p = run(COUNTER, RECEIPT, []);
  const mm = run(mpath, RECEIPT, []);
  fs.chmodSync(locked, 0o755);
  fs.rmSync(locked, { recursive: true, force: true });
  addRes('w2-walk-error', 'walk-error-skipped', 'prior-set-complete', p, mm, 'unreadable dir in .ufo/waves/round-80');
}
// ---- 3. replay-gapfrac-raised: a prior with 4 gaps and only 3 matching ----
{
  // break ONLY the last gap (move the answer leg's tail by +100 ms: no gap follows it) and break the
  // pair match with ts-only shifts (the gap rule reads `at` only, the pair rule reads ts AND at)
  const prior = clone(real);
  for (const l of prior.legs) {
    const tok = crypto.randomBytes(6).toString('hex');
    l.launchToken = tok;
    const i = (l.argv || []).findIndex((a) => typeof a === 'string' && a.startsWith('--user-data-dir='));
    if (i >= 0) l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice(16)), 'profile-' + tok);
    const bid = crypto.randomUUID();
    if (l.devtoolsListening) { l.devtoolsListening = { url: 'ws://127.0.0.1:' + prior.ports.cdp + '/devtools/browser/' + bid, port: prior.ports.cdp, browserId: bid }; l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url; }
  }
  let shifted = 0;
  for (const e of prior.legs.find((l) => l.name === 'sp80-trigger-then-answer').pageEvents) {
    if (e.type === 'input' || e.type === 'change' || e.type === 'read') { e.at = Math.round((e.at + 100) * 10) / 10; e.ts = Math.round((e.ts + 100) * 10) / 10; shifted++; }
  }
  for (const l of prior.legs) for (const e of l.pageEvents) {
    if (shifted >= 12) break;
    if (e.type === 'input' || e.type === 'change' || e.type === 'read') continue;
    e.ts = Math.round((e.ts + 1) * 10) / 10; shifted++;
  }
  const pp = path.join(WDIR, 'prior-gapfrac.json');
  fs.writeFileSync(pp, JSON.stringify(prior));
  const own = pairs(real), pr = pairs(prior);
  const metrics = { priorGaps: gapsOf(pr).length, gapMatched: matchCount(gapsOf(own), gapsOf(pr)), absMatched: pairMatch(own, pr), priorEvents: pr.length };
  const extra = ['--prior', pp];
  const mpath = mutantPath('replay-gapfrac-raised');
  addRes('w2-replay-gapfrac', 'replay-gapfrac-raised', 'replay-event-timeline', run(COUNTER, RECEIPT, extra), run(mpath, RECEIPT, extra), JSON.stringify(metrics));
}
// ---- 4..: natural-witness probes for the SUBSUMED survivors (expected: mutant still refuses) ----
const sub = [];
const S = (id, mutant, expect, apply, note) => sub.push({ id, mutant, expect, apply, note });
S('w2-answer-read-count', 'answer-read-count', 'answer-law', (r) => {
  const l = leg(r, 'sp80-trigger-then-answer');
  const rd = l.pageEvents.find((e) => e.type === 'read');
  l.pageEvents.push({ ...clone(rd), seq: l.pageEvents.length + 1 });
}, 'second read event');
S('w2-answer-svalue', 'answer-svalue-any', 'answer-law', (r) => { leg(r, 'sp80-trigger-then-answer').stateAfter.sValue = 'x'; }, 'sValue differs');
S('w2-cdp-multi-open', 'cdp-multi-open-widened', 'cdp-event-log-closed', (r) => {
  const l = leg(r, 'sp80-accept-png');
  const o = l.cdpEventLog.find((e) => e.method === 'Page.fileChooserOpened');
  l.cdpEventLog.push(clone(o)); l.cdpEventLog.push(clone(o));
}, 'three opens');
S('w2-cross-count', 'cross-count-widened', 'cross-origin-law', (r) => {
  const l = leg(r, 'sp80-cross-origin');
  const o = l.cdpEventLog.find((e) => e.method === 'Page.fileChooserOpened');
  l.cdpEventLog.push(clone(o));
}, 'two opens on the cross leg');
S('w2-deferred-count', 'deferred-count-widened', 'deferred-law', (r) => {
  const l = leg(r, 'sp80-deferred-timer');
  const o = l.cdpEventLog.find((e) => e.method === 'Page.fileChooserOpened');
  l.cdpEventLog.push(clone(o));
}, 'two opens on the deferred leg');
S('w2-event-istrusted', 'event-istrusted-any', 'event-types', (r) => { evs(r, 'sp80-accept-png')[0].isTrusted = 'yes'; }, 'isTrusted is a string');
S('w2-event-seq-num', 'event-seq-num', 'event-types', (r) => { evs(r, 'sp80-accept-png')[0].seq = 1.5; }, 'seq 1.5');
S('w2-intercept-deferred', 'intercept-deferred-ok-any', 'intercept-law', (r) => { leg(r, 'sp80-deferred-timer').deferredResult = { ok: false, name: 'NotAllowedError', message: 'x' }; }, 'deferredResult.ok false');
S('w2-leg-kind', 'leg-records-kind-dropped', 'leg-records', (r) => { leg(r, 'sp80-accept-png').kind = 'other'; }, 'leg kind changed');
S('w2-no-selection-keys', 'no-selection-keys-open', 'no-selection-law', (r) => { leg(r, 'sp80-accept-png').stateAfter.extra = 1; }, 'stateAfter extra key');
S('w2-send-min-length', 'send-min-length-lowered', 'send-log-allowlist', (r) => { leg(r, 'sp80-accept-png').cdpSendLog = leg(r, 'sp80-accept-png').cdpSendLog.slice(0, 9).map((c, i) => ({ ...c, id: i + 1 })); }, 'nine sends');
S('w2-twice-first-ok', 'twice-first-ok-dropped', 'twice-gesture-law', (r) => { leg(r, 'sp80-twice-gesture').showPicker = { ok: false, name: 'NotAllowedError', message: 'x' }; }, 'first call refuses');
S('w2-typed-files', 'typed-files-any', 'event-types', (r) => { evs(r, 'sp80-accept-png')[0].files = 'x'; }, 'files is a string');
S('w2-typed-target', 'typed-target-any', 'event-types', (r) => { evs(r, 'sp80-accept-png')[0].target = 5; }, 'target is a number');
S('w2-typed-x', 'typed-x-any', 'event-types', (r) => { evs(r, 'sp80-accept-png')[0].x = 'x'; }, 'x is a string');
for (const w of sub) {
  const mpath = mutantPath(w.mutant);
  if (!mpath) { results.push({ id: w.id, mutant: w.mutant, outcome: 'unapplied' }); continue; }
  const r = clone(real);
  w.apply(r);
  const p = path.join(WDIR, w.id + '.json');
  fs.writeFileSync(p, JSON.stringify(r));
  addRes(w.id, w.mutant, w.expect, run(COUNTER, p, []), run(mpath, p, []), w.note);
}
const ok = results.filter((r) => r.outcome === 'witness').length;
const still = results.filter((r) => r.outcome === 'mutant-still-refuses').length;
fs.writeFileSync(OUT, JSON.stringify({ label: LABEL, counter: COUNTER, probes: results.length, witnesses: ok, subsumedEvidence: still, results }, null, 1));
for (const r of results) process.stderr.write(r.id + ' ' + r.outcome + ' pristine=' + JSON.stringify(r.pristine) + ' mutant=' + JSON.stringify(r.mutantRun) + '\n');
process.stdout.write(JSON.stringify({ label: LABEL, probes: results.length, witnesses: ok, subsumedEvidence: still, detail: results.map((r) => r.id + ':' + r.outcome) }, null, 1) + '\n');

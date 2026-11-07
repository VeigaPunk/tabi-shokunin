import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import crypto from 'node:crypto';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const WAVE = LANE + '/.ufo/waves/round-73/w1/R73Review1';
const S = '/fast/scratch/hyaku/tabi-r73/R73Review1';
const COUNTER = LANE + '/scripts/check-synthpinch-r73.mjs';
const PIN = '3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4';
const NONCE = 'tabi-r73-l1-3409ab53b905';
const SMOKE_N = 9;
const PRE = ['smoke1','smoke2','smoke3','smoke4','smoke5','smoke6','smoke7','smoke8','smoke9','degenerate-dispatch-wheel','degenerate-set-scale','degenerate-skip-touch'];
const PRIORS = PRE.map(n => `${WAVE}/${n}.receipt.json`);
const A = JSON.parse(fs.readFileSync(WAVE + '/a-receipt.json', 'utf8'));
const SM1 = JSON.parse(fs.readFileSync(WAVE + '/smoke1.receipt.json', 'utf8'));
const CASES_DIR = S + '/cases';
fs.mkdirSync(CASES_DIR, { recursive: true });

const summary = (r) => ({
  schema: r.schema, nonce: r.nonce, degenerate: r.degenerate,
  driverSha256: (r.driverSha256 || '').slice(0, 8),
  launchToken: r.host?.launchToken,
  bid: (r.host?.devtoolsListening?.url || '').replace(/.*\/devtools\/browser\//, '').slice(0, 40),
  events: (r.events || []).length, legs: (r.legs || []).length,
});
console.log('A  :', JSON.stringify(summary(A)));
console.log('SM1:', JSON.stringify(summary(SM1)));

const clone = (x) => structuredClone(x);
const freshToken = () => crypto.randomBytes(6).toString('hex');
const freshBid = () => crypto.randomUUID();
const bidOf = (r) => (r.host?.devtoolsListening?.url || '').replace(/^.*\/devtools\/browser\//, '');
const setBid = (r, bid) => {
  const oldUrl = r.host.devtoolsListening.url;
  r.host.devtoolsListening.url = oldUrl.replace(/([0-9a-f-]{36})$/, bid);
  r.host.stderrHead = String(r.host.stderrHead || '').split(oldUrl).join(r.host.devtoolsListening.url);
};
const jitterEvents = (r, d) => { for (const e of r.events) { e.ts += d; e.at += d; } };
function rewriteNonce(r, oldN, newN) {
  r.nonce = newN;
  if ('nonceOnPage' in r) r.nonceOnPage = newN;
  for (const s of r.serverLog ?? []) if (s && s.run === oldN) s.run = newN;
  for (const c of r.cdpSendLog ?? []) {
    if (!c || typeof c !== 'object') continue;
    if (c.method === 'Page.navigate' && typeof c.params?.url === 'string') c.params.url = c.params.url.split(oldN).join(newN);
    if (c.method === 'Runtime.evaluate' && typeof c.params?.expression === 'string')
      c.params.expression = c.params.expression.split(JSON.stringify(oldN)).join(JSON.stringify(newN));
  }
  return r;
}
function renumber(cases) { // renumber send log ids 1..N
  cases.cdpSendLog.forEach((c, i) => { c.id = i + 1; });
}

const baseSmokeForge = () => { // smoke1 -> looks like a fresh L1 run except chosen identifiers
  const r = clone(SM1);
  rewriteNonce(r, SM1.nonce, NONCE);
  const t0 = Date.parse(r.startedAt), t1 = Date.parse(r.finishedAt);
  r.startedAt = new Date(t0 + 3600e3).toISOString(); r.finishedAt = new Date(t1 + 3600e3).toISOString();
  return r;
};

const cases = [];
const add = (name, receipt, argv, expect, klass, keep) => { const c = { name, receipt, argv: argv || [], expect, klass, keep: keep !== false }; cases.push(c); return c; };

// ---- baseline ----
add('b1-counting-command-verbatim', null, // special: verbatim committed paths
  null, 'exit0', 'baseline', false);
add('b2-list-checks', null, null, 'exit0-98', 'baseline', false);
add('b3-wave-copies-clean', clone(A), [], 'exit0', 'baseline', false);

// ---- P1 replay family: base smoke1, nonce rewritten everywhere + stamps +1h ----
add('r00-replay-verbatim', clone(SM1), [], 'refuse:nonce-expected+3replay', 'replay');
add('r01-nonce-stamps-rewritten', baseSmokeForge(), [], 'refuse:3replay-exactly', 'replay');
(() => { const r = baseSmokeForge(); r.host.launchToken = freshToken(); setBid(r, freshBid()); add('r02-timeline-alone-kept', r, [], 'refuse:replay-event-timeline', 'replay'); })();
(() => { const r = baseSmokeForge(); r.host.launchToken = freshToken(); jitterEvents(r, 0.001); add('r03-bid-alone-kept', r, [], 'refuse:replay-devtools-url', 'replay'); })();
(() => { const r = baseSmokeForge(); r.host.launchToken = freshToken(); setBid(r, freshBid()); const e = r.events[Math.floor(r.events.length / 2)]; e.ts += 1e-12; add('r05-ts-perturb-1e-12', r, [], 'accept:LIMIT', 'replay'); })();
(() => { const r = baseSmokeForge(); r.host.launchToken = freshToken(); setBid(r, freshBid()); // at +1e-12 on an event with a strict gap to its successor
  let k = -1; for (let i = 1; i < r.events.length - 1; i++) if (r.events[i + 1].at - r.events[i].at > 1e-6) { k = i; break; }
  r.events[k].at += 1e-12; add('r06-at-perturb-1e-12', r, [], 'accept:LIMIT', 'replay'); })();
(() => { const r = clone(A); const oldUrl = r.host.devtoolsListening.url; setBid(r, bidOf(r).toUpperCase()); add('r07-uuid-case-upper', r, [], 'refuse:replay-devtools-url', 'replay'); })();
(() => { const r = baseSmokeForge(); r.host.launchToken = freshToken(); setBid(r, freshBid()); jitterEvents(r, 0.001); add('r08-full-identifier-rewrite', r, [], 'accept:LIMIT-witness', 'replay'); })();
(() => { const r = baseSmokeForge(); r.host.launchToken = freshToken(); const oldUrl = r.host.devtoolsListening.url; r.host.devtoolsListening.url = oldUrl + ' '; r.host.stderrHead = String(r.host.stderrHead).split(oldUrl).join(r.host.devtoolsListening.url); jitterEvents(r, 0.001); add('r09-url-trailing-space', r, [], 'refuse:replay-devtools-url', 'replay'); })();
(() => { // law-consistent no-op touchmove inserted in slow leg
  const r = baseSmokeForge(); r.host.launchToken = freshToken(); setBid(r, freshBid());
  const tms = r.events.map((e, i) => ({ e, i })).filter(({ e }) => e.leg === 'slow' && e.type === 'touchmove');
  const mid = tms[Math.floor(tms.length / 2)];
  const prev = tms[tms.indexOf(mid) - 1].e, next = tms[tms.indexOf(mid) + 1].e;
  const ne = clone(mid.e); ne.ts = +((prev.ts + next.ts) / 2).toFixed(6); ne.at = +((prev.at + next.at) / 2).toFixed(6);
  r.events.splice(mid.i + 1, 0, ne); r.events.forEach((e, i) => { e.seq = i + 1; });
  r.legShape.slow.total += 1; r.legShape.slow.touchmoves += 1;
  add('r10-noop-touchmove-insert', r, [], 'accept:LIMIT(forged-consistent)', 'replay');
})();
(() => { // reorder two adjacent slow-leg touchmoves, seq renumbered
  const r = baseSmokeForge(); r.host.launchToken = freshToken(); setBid(r, freshBid());
  const idx = r.events.map((e, i) => ({ e, i })).filter(({ e }) => e.leg === 'slow' && e.type === 'touchmove').map(x => x.i);
  const i = idx[2]; [r.events[i], r.events[i + 1]] = [r.events[i + 1], r.events[i]];
  r.events.forEach((e, j) => { e.seq = j + 1; });
  add('r12-reorder-renumbered', r, [], 'refuse:event-leg-window', 'replay');
})();

// ---- P2 nonce binding family: base a-receipt (already clean) ----
(() => { const r = clone(A); r.nonceOnPage = 'tabi-r73-l1-deadbeef00'; add('n1-nonceonpage-mismatch', r, [], 'refuse:nonce-on-page', 'nonce'); })();
(() => { const r = clone(A); const row = r.serverLog.find(s => s.path === '/' && s.status === 200); row.run = 'tabi-r73-l1-deadbeef00'; add('n2-serverlog-run-mismatch', r, [], 'refuse:server-log-binding', 'nonce'); })();
(() => { const r = clone(A); const c = r.cdpSendLog.find(c => c.method === 'Page.navigate'); c.params.url = c.params.url.split(NONCE).join('tabi-r73-l1-deadbeef00'); add('n3-navigate-url-wrong-nonce', r, [], 'refuse:send-log-allowlist', 'nonce'); })();
(() => { const r = clone(A); const c = r.cdpSendLog.find(c => c.method === 'Runtime.evaluate' && c.params.expression.includes('readyState')); c.params.expression = c.params.expression.split(JSON.stringify(NONCE)).join(JSON.stringify('tabi-r73-l1-deadbeef00')); add('n4-readyexpr-wrong-nonce', r, [], 'refuse:send-log-allowlist', 'nonce'); })();
add('n5-dup-expect-nonce-first-wins', clone(A), ['--expect-nonce', 'tabi-r73-exec1-3409ab53b905'], 'accept:argv-first-wins', 'nonce');
add('n7-only-wrong-expect-nonce', clone(A), null, 'refuse:nonce-expected', 'nonce', false).rawOmit = { nonce: 'tabi-r73-exec1-3409ab53b905' };

// ---- P3 argv family (base a-receipt) ----
add('a1-prior-missing-value', clone(A), null, 'exit2', 'argv', false).rawArgv = (p) => ['--receipt', p, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, ...PRIORS.flatMap(x => ['--prior', x]), '--prior'];
add('a2-prior-value-json-flag', clone(A), null, 'exit2', 'argv', false).rawArgv = (p) => ['--receipt', p, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--prior', '--json'];
add('a3-dup-priors-24', clone(A), [...PRIORS, ...PRIORS].flatMap(p => ['--prior', p]), 'exit0', 'argv');
add('a4-self-prior', clone(A), ['--prior', WAVE + '/a-receipt.json'], 'refuse:3replay(self)', 'argv');
add('a5-json-flag-first', clone(A), [], 'exit0', 'argv', false).rawArgv = (p) => ['--json', '--receipt', p, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, ...PRIORS.flatMap(x => ['--prior', x])];
add('a6-priors-after-json', clone(A), null, 'exit0', 'argv', false).rawArgv = (p) => ['--json', '--receipt', p, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, ...PRIORS.flatMap(x => ['--prior', x])];
add('a7-expect-nonce-missing-value', clone(A), null, 'exit2', 'argv', false).rawArgv = (p) => ['--receipt', p, '--expect-driver-sha256', PIN, '--expect-nonce', ...PRIORS.flatMap(x => ['--prior', x])];
add('a8-receipt-dup-first-wins', null, null, 'accept:argv-first-wins', 'argv', false);
add('a9-typo-pin-flag', clone(A), null, 'exit2', 'argv', false).rawArgv = (p) => ['--receipt', p, '--expect-driver-sha25', PIN, '--expect-nonce', NONCE, ...PRIORS.flatMap(x => ['--prior', x]), '--json'];

// ---- P4 r72 FG2-FG12 re-check on r73 bytes (base a-receipt) ----
(() => { const r = clone(A); const nav = r.cdpSendLog.findIndex(c => c.method === 'Page.navigate'); r.cdpSendLog.push(r.cdpSendLog.splice(nav, 1)[0]); renumber(r); add('f2a-navigate-moved-last', r, [], 'accept:FG2-inherited', 'fg'); })();
(() => { const r = clone(A); const cr = r.cdpSendLog.findIndex(c => c.method === 'Runtime.evaluate' && c.params.expression === 'window.__closeRecord()'); const lastPinch = r.cdpSendLog.map((c, i) => [c, i]).filter(([c]) => c.method === 'Input.synthesizePinchGesture').pop()[1]; const [m] = r.cdpSendLog.splice(cr, 1); r.cdpSendLog.splice(lastPinch, 0, m); renumber(r); add('f2b-closerecord-before-last-pinch', r, [], 'accept:FG2-inherited', 'fg'); })();
(() => { const r = clone(A); const f = 0.05; for (const m of r.legMarks) m.at = +(m.at * f).toFixed(4); for (const e of r.events) e.at = +(e.at * f).toFixed(4); r.closedAt = +(r.closedAt * f).toFixed(4); add('f3a-page-clock-compressed', r, [], 'accept:FG3-inherited', 'fg'); })();
(() => { const r = clone(A); r.finishedAt = new Date(Date.parse(r.startedAt) + 9000).toISOString(); add('f3b-wall-window-9s', r, [], 'accept:FG3-inherited', 'fg'); })();
(() => { const r = clone(A); r.legs.find(l => l.name === 'in').elapsedMs = 0; add('f3c-elapsed-in-zero', r, [], 'accept:FG3-inherited', 'fg'); })();
(() => { const r = clone(A); const w = r.events.filter(e => e.leg === 'in' && e.type === 'wheel')[2]; w.ts = 1e9; add('f4-middle-ts-1e9', r, [], 'accept:FG4-inherited', 'fg'); })();
add('f5a-no-pin', clone(A), null, 'exit2:FG5-closed', 'fg', false).rawArgv = (p) => ['--receipt', p, '--expect-nonce', NONCE, ...PRIORS.flatMap(x => ['--prior', x]), '--json'];
add('f5b-no-nonce', clone(A), null, 'exit2:FG1-closed', 'fg', false).rawArgv = (p) => ['--receipt', p, '--expect-driver-sha256', PIN, ...PRIORS.flatMap(x => ['--prior', x]), '--json'];
add('f5c-no-priors', clone(A), null, 'exit2:FG1-closed', 'fg', false).rawArgv = (p) => ['--receipt', p, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--json'];
(() => { const r = clone(A); r.host.chromium = 'Chromium 99.0.0.0 Arch Linux'; add('f6-host-chromium-99', r, [], 'accept:FG6-inherited', 'fg'); })();
(() => { const r = clone(A); r.host.cdpProduct = 'Chrome/155.0.8059.84'; add('f6b-product-headed-chrome', r, [], 'accept:FG6-inherited', 'fg'); })();
(() => { const r = clone(A); r.fixture.sha256 = '0'.repeat(64); add('f7-fixture-sha-zeroed', r, [], 'accept:FG7-inherited', 'fg'); })();
(() => { const r = clone(A); r.lateAfterClose = 0; add('f8-late-claim-zeroed', r, [], 'accept:FG8-inherited', 'fg'); })();
(() => { const r = clone(A); const w = r.events.filter(e => e.leg === 'in' && e.type === 'wheel')[0]; const ne = clone(w); ne.deltaY = -1e-9; const i = r.events.indexOf(w); r.events.splice(i + 1, 0, ne); r.events.forEach((e, j) => { e.seq = j + 1; }); r.legShape.in.total += 1; r.legShape.in.wheels += 1; add('f9-noop-wheel-dup', r, [], 'accept:FG9-inherited', 'fg'); })();
(() => { const r = clone(A); const w = r.events.filter(e => e.leg === 'in' && e.type === 'wheel')[0]; w.pointerType = 'touch'; r.legShape.in.kinds = ['wheel', 'wheel(touch)']; add('f10-wheel-label-touch', r, [], 'accept:FG10-inherited', 'fg'); })();
(() => { const r = clone(A); r.cdpSendLog.splice(1, 0, { id: 0, method: 'Runtime.evaluate', params: { expression: 'window.visualViewport.scale', returnByValue: true } }); renumber(r); add('f11-extra-allowed-eval', r, [], 'accept:FG11-inherited', 'fg'); })();
(() => { const r = clone(A); for (const e of r.events) { if (e.leg === 'in' && e.type === 'wheel') { e.deltaY = +(e.deltaY * e.scale).toFixed(9); e.scale = 1; } } add('f12-scale-interior-reforged', r, [], 'accept:FG12-limit', 'fg'); })();
(() => { const r = clone(A); const i = 100; [r.events[i], r.events[i + 1]] = [r.events[i + 1], r.events[i]]; add('d18-seq-shuffle', r, [], 'refuse:seq-monotonic+event-leg-window', 'fg'); })();
(() => { const r = clone(A); const pin = r.cdpSendLog.filter(c => c.method === 'Input.synthesizePinchGesture'); const t = pin[0].params; pin[0].params = pin[1].params; pin[1].params = t; add('d06b-pinch-order-swapped', r, [], 'refuse:pinch-call-params', 'fg'); })();

// ---- runner ----
const run = (args, json) => {
  const res = spawnSync('node', [COUNTER, ...args], { encoding: 'utf8' });
  let parsed = null;
  if (json) { try { parsed = JSON.parse(res.stdout); } catch {} }
  return { exit: res.status, stdout: res.stdout, stderr: res.stderr, parsed };
};
const argvFor = (receiptPath, extra, opts = {}) => {
  let a = ['--receipt', receiptPath, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE];
  for (const p of (opts.priors ?? PRIORS)) a.push('--prior', p);
  a = a.concat(extra || []);
  if (opts.jsonFirst) a = ['--json', ...a];
  else a.push('--json');
  return a;
};

const matrix = [];
for (const c of cases) {
  let res, path = null;
  if (c.name === 'b1-counting-command-verbatim') {
    const realA = LANE + '/corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json';
    const realP = PRE.map(n => `${LANE}/.ufo/waves/round-73/controls/c1/${n}.receipt.json`);
    const a = ['--receipt', realA, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE];
    for (const p of realP) a.push('--prior', p);
    a.push('--json');
    res = run(a, true);
  } else if (c.name === 'b2-list-checks') {
    res = run(['--list-checks'], false);
    const ids = JSON.parse(res.stdout);
    matrix.push({ name: c.name, exit: res.exit, ids: ['count=' + ids.length], expect: c.expect, klass: c.klass, match: ids.length === 98 && res.exit === 0 });
    continue;
  } else if (c.name === 'a8-receipt-dup-first-wins') {
    const good = CASES_DIR + '/a8-good.json'; fs.writeFileSync(good, JSON.stringify(clone(A)));
    const badR = clone(A); badR.nonceOnPage = 'tabi-r73-l1-deadbeef00';
    const bad = CASES_DIR + '/a8-bad.json'; fs.writeFileSync(bad, JSON.stringify(badR));
    const a = ['--receipt', good, '--receipt', bad, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--json'];
    for (const p of PRIORS) a.push('--prior', p);
    res = run(a, true);
  } else {
    path = CASES_DIR + '/' + c.name + '.json';
    fs.writeFileSync(path, JSON.stringify(c.receipt));
    let args;
    if (c.rawOmit) args = ['--receipt', path, '--expect-driver-sha256', PIN, '--expect-nonce', c.rawOmit.nonce, ...PRIORS.flatMap(x => ['--prior', x]), '--json'];
    else if (c.rawArgv) args = c.rawArgv(path);
    else args = argvFor(path, c.argv);
    res = run(args, true);
  }
  const ids = res.parsed ? res.parsed.findings.map(f => f.id) : ['exit' + res.exit];
  const verdictWord = res.parsed ? res.parsed.verdict : 'n/a';
  const checkCount = res.parsed ? res.parsed.checkCount : null;
  const ok = c.expect.startsWith('exit0') ? res.exit === 0
    : c.expect.startsWith('exit2') ? res.exit === 2
    : c.expect.startsWith('accept') ? res.exit === 0
    : res.exit === 1;
  matrix.push({ name: c.name, expect: c.expect, klass: c.klass, exit: res.exit, verdict: verdictWord, checkCount, ids, match: ok, path });
}
fs.writeFileSync(S + '/matrix.json', JSON.stringify(matrix, null, 1));
for (const m of matrix) {
  console.log(`${m.match ? 'ok  ' : 'MISS'} ${m.name.padEnd(34)} exit=${m.exit} ${(m.verdict ?? 'n/a').padEnd(9)} checks=${m.checkCount ?? '-'} [${m.ids.join(',')}]  expect ${m.expect}`);
}
const misses = matrix.filter(m => !m.match);
console.log('TOTAL', matrix.length, 'MISS', misses.length);

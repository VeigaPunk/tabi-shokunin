#!/usr/bin/env node
// Negative + must-accept battery for scripts/check-showpicker-r81.mjs (tabi round 81, C1).
//
// Usage:
//   node negatives-showpicker-r81.mjs --lane <ABS lane> --real <receipt.json>
//     --expect-driver-sha256 <hex> --expect-nonce <nonce> --expect-fixture-sha256 <hex>
//     --prior-set <file> [--prior <receipt.json> ...] --work <ABS scratch dir> [--json]
//     [--first-failure]
//
// Every case mutates the real receipt (or the invocation) and runs the counter BY PATH (the counter
// beside this file). A refusal case passes only when the counter exits 1, lists the expected id and
// lists no id except those the case names in `alsoAllowed`. A must-accept case passes only when the
// counter exits 0 with no finding. Coverage: every check id the counter declares must be the
// expected id of at least one refusal case — a new check without a case fails the battery.
//
// The prior-set walk cases run on a scratch MIRROR lane (`<work>/mirror/tabi-shokunin`, the real
// lane is never written): `--lane` names the mirror so the walk reads it; the receipt's own `lane`
// field still matches the basename.
//
// Exit 0 = every case as expected and full coverage; 1 = otherwise; 2 = usage.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-showpicker-r81.mjs');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const lane = opt('lane');
const realPath = opt('real');
const pin = opt('expect-driver-sha256');
const expectNonce = opt('expect-nonce');
const expectFixture = opt('expect-fixture-sha256');
const priorSet = opt('prior-set');
const work = opt('work');
const asJson = argv.includes('--json');
const firstFailure = argv.includes('--first-failure');
const extraPriors = multi('prior');
if (!lane || !path.isAbsolute(lane)) usage('--lane must be an absolute path');
if (!realPath || !pin || !expectNonce || !expectFixture || !priorSet) usage('--real, --expect-driver-sha256, --expect-nonce, --expect-fixture-sha256 and --prior-set are required');
if (!work || !path.isAbsolute(work)) usage('--work must be an absolute path');
fs.mkdirSync(work, { recursive: true });
let real;
try { real = JSON.parse(fs.readFileSync(realPath, 'utf8')); } catch (e) { usage('real receipt unreadable: ' + e.message); }
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const clone = (v) => JSON.parse(JSON.stringify(v));
const realSha = sha256(fs.readFileSync(realPath));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const arr = (v) => (Array.isArray(v) ? v : []);
const LEG_NAMES = arr(real.legs).map((l) => l.name);
const legOf = (r, n) => arr(r.legs).find((l) => l.name === n);
const evOf = (r, leg, pred = () => true) => arr(legOf(r, leg).pageEvents).filter(pred);
const openOf = (r, leg) => arr(legOf(r, leg).cdpEventLog).find((e) => e.method === 'Page.fileChooserOpened');
const openAll = (r, leg) => arr(legOf(r, leg).cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened');

// ---- invocation ----
const runCounter = (receiptPath, laneArg, extraArgs = []) => {
  const args = [COUNTER, '--lane', laneArg, '--receipt', receiptPath, '--expect-driver-sha256', pin, '--expect-nonce', expectNonce,
    '--expect-fixture-sha256', expectFixture, '--prior-set', path.resolve(priorSet),
    ...(laneArg === lane ? ['--tree-exempt-sha256', realSha] : []),
    ...extraPriors.flatMap((p) => ['--prior', path.resolve(p)]), '--json', ...extraArgs];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 20000 });
  let j = null;
  try { j = JSON.parse(r.stdout); } catch { j = null; }
  const timedOut = r.status === null && r.signal === 'SIGTERM';
  return { status: timedOut ? 1 : r.status, json: timedOut ? { verdict: 'timeout', findings: [{ id: 'counter-timeout' }] } : j, timedOut, stderr: (r.stderr || '').slice(0, 800), stdoutHead: (r.stdout || '').slice(0, 300) };
};
const writeCase = (name, r) => { const p = path.join(work, 'cases', name + '.json'); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(r, null, 1)); return p; };

// ---- mirror lane for the walk cases ----
const mirrorLane = path.join(work, 'mirror', 'tabi-shokunin');
const mirrorTrees = ['.ufo/waves/round-81', 'corpus/evidence/round81'];
const buildMirror = () => {
  fs.rmSync(mirrorLane, { recursive: true, force: true });
  for (const t of mirrorTrees) fs.mkdirSync(path.join(mirrorLane, t), { recursive: true });
  const src = path.join(lane, '.ufo/waves/round-81/controls/c1');
  const dst = path.join(mirrorLane, '.ufo/waves/round-81/controls/c1');
  if (fs.existsSync(src)) fs.cpSync(src, dst, { recursive: true });
  return mirrorLane;
};

// ---- cases ----
const cases = [];
const add = (name, expect, mutate, alsoAllowed = [], opts = {}) => cases.push({ name, expect, mutate, alsoAllowed, accept: false, opts });
const accept = (name, mutate, opts = {}) => cases.push({ name, expect: null, mutate, alsoAllowed: [], accept: true, opts });
const rewriteNonce = (r, to) => {
  const old = r.nonce;
  r.nonce = to;
  for (const l of arr(r.legs)) {
    for (const s of arr(l.serverLog)) if (s.run === old) s.run = to;
    for (const s of arr(l.childServerLog)) if (s.run === old) s.run = to;
    for (const c of arr(l.cdpSendLog)) {
      if (c.method === 'Page.navigate') c.params.url = c.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));
      if (c.method === 'Runtime.evaluate' && typeof c.params.expression === 'string') c.params.expression = c.params.expression.split(JSON.stringify(old)).join(JSON.stringify(to));
    }
    for (const e of arr(l.cdpEventLog)) if (e.method === 'Page.frameNavigated') e.params.url = e.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));
  }
  return r;
};

// identity and run binding
add('schema', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-showpicker-r80'; });
add('lane', 'lane', (r) => { r.lane = 'other-lane'; });
add('nonce-shape', 'nonce-shape', (r) => { rewriteNonce(r, 'TABI-r81-x'); }, ['nonce-expected']);
add('nonce-expected', 'nonce-expected', (r) => { rewriteNonce(r, 'tabi-r81-some-other-nonce'); });
add('receipt-fields', 'receipt-fields', (r) => { r.extra = 1; });
add('driver-pin', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); });
add('fixture-hash', 'fixture-hash', (r) => { r.fixture.sha256 = '0'.repeat(64); });
add('host-chromium', 'host-chromium', (r) => { r.host.chromium = 'Chromium 154.0.0.0 Arch Linux'; });
add('host-node', 'host-node', (r) => { r.host.node = 'v22.1.0'; });
add('ports-declared', 'ports-declared', (r) => { r.ports.child = r.ports.http; }, ['fixture-hash', 'host-argv', 'devtools-port-binding', 'send-log-allowlist', 'cdp-event-log-closed', 'context-binding']);
add('frame-tree', 'frame-tree', (r) => { r.frameTree.mainFrameUrl = 'http://127.0.0.1:1/'; });

// plan / legs
add('plan-frozen', 'plan-frozen', (r) => { legOf(r, 'sp81-accept-answer').gesture = true; }, ['plan-calls']);
add('leg-order', 'leg-order', (r) => { r.legs.reverse(); }, ['plan-frozen', 'leg-records', 'plan-calls', 'leg-marks', 'context-binding']);
add('leg-records', 'leg-records', (r) => { delete legOf(r, 'sp81-accept-answer').stderrHead; }, ['host-argv']);
add('leg-marks', 'leg-marks', (r) => { legOf(r, 'sp81-webkitdirectory-answer').lateAfterClose = 1; });
add('context-binding', 'context-binding', (r) => { legOf(r, 'sp81-cross-origin-nonfile').contexts = legOf(r, 'sp81-cross-origin-nonfile').contexts.filter((c) => c.origin !== 'http://127.0.0.1:' + r.ports.child); }, ['send-log-allowlist', 'cdp-event-log-closed']);
add('send-log-allowlist', 'send-log-allowlist', (r) => { const l = legOf(r, 'sp81-accept-answer'); l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'DOM.getDocument', params: {} }); });
add('plan-calls', 'plan-calls', (r) => { legOf(r, 'sp81-accept-answer').cdpSendLog.find((c) => c.method === 'Page.setInterceptFileChooserDialog').params = { enabled: false }; });
add('cdp-event-log-closed', 'cdp-event-log-closed', (r) => { openOf(r, 'sp81-accept-answer').afterSendId = legOf(r, 'sp81-accept-answer').triggerSendId + 5; });
add('frame-binding', 'frame-binding', (r) => { legOf(r, 'sp81-accept-answer').frameTree.mainFrameParentId = 'X'; });
add('event-types', 'event-types', (r) => { evOf(r, 'sp81-accept-answer')[0].extra = true; });
add('event-time-quantum', 'event-time-quantum', (r) => { evOf(r, 'sp81-accept-answer')[0].ts = 1.23456; });
add('event-leg-window', 'event-leg-window', (r) => { evOf(r, 'sp81-accept-answer')[4].at = 0.1; }, ['leg-sp81-accept-answer']);
add('seq-monotonic', 'seq-monotonic', (r) => { evOf(r, 'sp81-accept-answer')[0].seq = 99; });

// per-leg frozen shapes: one case per leg
const legMutators = {
  'sp81-cross-origin-nonfile': (r) => { legOf(r, 'sp81-cross-origin-nonfile').stateAfter.sValue = 'x'; },
  'sp81-cross-origin-nonfile-disabled': (r) => { legOf(r, 'sp81-cross-origin-nonfile-disabled').stateAfter.sValue = 'x'; },
  'sp81-same-origin-nonfile-disabled': (r) => { evOf(r, 'sp81-same-origin-nonfile-disabled')[0].target = 's'; },
  'sp81-webkitdirectory-answer': (r) => { legOf(r, 'sp81-webkitdirectory-answer').stateAfter.d = []; },
  'sp81-accept-answer': (r) => { evOf(r, 'sp81-accept-answer')[5].files = [['a', 1, 'text/plain', '']]; },
  'sp81-click-while-open': (r) => { evOf(r, 'sp81-click-while-open')[7].buttons = 1; },
};
const LEG_ALSO = { 'sp81-cross-origin-nonfile': ['no-selection-law'], 'sp81-cross-origin-nonfile-disabled': ['no-selection-law'], 'sp81-same-origin-nonfile-disabled': ['no-selection-law'], 'sp81-webkitdirectory-answer': ['no-selection-law', 'webkitdirectory-answer-law'], 'sp81-accept-answer': ['no-selection-law', 'accept-answer-law'], 'sp81-click-while-open': ['no-selection-law'] };
for (const n of LEG_NAMES) add('leg-' + n, 'leg-' + n, legMutators[n] || ((r) => { legOf(r, n).stateAfter.sValue = 'x'; }), LEG_ALSO[n] || []);

// law checks
add('gesture-law', 'gesture-law', (r) => { legOf(r, 'sp81-webkitdirectory-answer').showPicker = { ok: false, name: 'NotAllowedError', message: 'x' }; }, ['intercept-law']);
add('activation-law', 'activation-law', (r) => { legOf(r, 'sp81-accept-answer').activationAfter = { isActive: true, hasBeenActive: true }; });
add('mode-law', 'mode-law', (r) => { openOf(r, 'sp81-webkitdirectory-answer').params.mode = 'selectMultiple'; }, ['leg-sp81-webkitdirectory-answer']);
add('cross-origin-nonfile-law', 'cross-origin-nonfile-law', (r) => { legOf(r, 'sp81-cross-origin-nonfile').parentCrossAccess = { contentDocument: 'object', windowDocument: 'SecurityError' }; });
add('order-law', 'order-law', (r) => { legOf(r, 'sp81-same-origin-nonfile-disabled').showPicker = { ok: false, name: 'SecurityError', message: 'x' }; }, ['gesture-law']);
add('webkitdirectory-answer-law', 'webkitdirectory-answer-law', (r) => { legOf(r, 'sp81-webkitdirectory-answer').uploadDir.files[0].sha256 = '0'.repeat(64); });
add('accept-answer-law', 'accept-answer-law', (r) => { legOf(r, 'sp81-accept-answer').pageEvents.find((e) => e.type === 'read').ret = 'hex:00'; });
add('click-while-open-law', 'click-while-open-law', (r) => { legOf(r, 'sp81-click-while-open').clickWhileOpenChoosersAfter = 1; });
add('no-selection-law', 'no-selection-law', (r) => { legOf(r, 'sp81-cross-origin-nonfile').stateAfter.s = [['a', 1, 'text/plain', '']]; }, ['leg-sp81-cross-origin-nonfile']);
add('intercept-law', 'intercept-law', (r) => { const l = legOf(r, 'sp81-cross-origin-nonfile-disabled'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child).frameId, mode: 'selectSingle', backendNodeId: 3 }, afterSendId: l.priorReleaseId }); }, ['leg-sp81-cross-origin-nonfile-disabled', 'order-law', 'plan-calls']);
add('cancel-law', 'cancel-law', (r) => { const l = legOf(r, 'sp81-accept-answer'); l.pageEvents.push({ type: 'cancel', ts: 20, isTrusted: true, act: false, target: 'k', x: null, y: null, buttons: null, files: [['cancel', 'k', []]], ret: null, seq: l.pageEvents.length + 1, leg: 'settle', at: 20 }); }, ['leg-sp81-accept-answer', 'event-leg-window', 'dismiss-law']);
add('dismiss-law', 'dismiss-law', (r) => { legOf(r, 'sp81-accept-answer').dismissResult = { ok: 1 }; });
add('order-law-message', 'order-law', (r) => { legOf(r, 'sp81-same-origin-nonfile-disabled').showPicker = { ok: false, name: 'InvalidStateError', message: 'wrong message' }; }, ['gesture-law']);
add('activation-before', 'activation-law', (r) => { legOf(r, 'sp81-accept-answer').activationBefore = { isActive: false, hasBeenActive: false }; });
add('cross-nonfile-chooser', 'cross-origin-nonfile-law', (r) => { const l = legOf(r, 'sp81-cross-origin-nonfile'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child).frameId, mode: 'selectSingle', backendNodeId: 3 }, afterSendId: l.priorReleaseId }); }, ['intercept-law', 'leg-sp81-cross-origin-nonfile', 'plan-calls', 'cdp-event-log-closed']);
add('cross-nonfile-result', 'cross-origin-nonfile-law', (r) => { legOf(r, 'sp81-cross-origin-nonfile').childResult = { ok: true, ret: 'undefined' }; }, ['intercept-law']);
add('trust-law', 'trust-law', (r) => { evOf(r, 'sp81-accept-answer')[0].isTrusted = false; }, ['leg-sp81-accept-answer']);

// host / fixture / server
add('host-argv', 'host-argv', (r) => { legOf(r, 'sp81-accept-answer').argv[7] = '--no-first-run-x'; });
add('devtools-port-binding', 'devtools-port-binding', (r) => { legOf(r, 'sp81-accept-answer').devtoolsListening.port = 1; }, ['host-argv']);
add('teardown-closure', 'teardown-closure', (r) => { legOf(r, 'sp81-accept-answer').teardown.survivors = [123]; }, ['host-argv']);
add('fixture-descriptors', 'fixture-descriptors', (r) => { r.fixtureInputs.find((d) => d.id === 's').rect.left = 101; });
add('server-log-binding', 'server-log-binding', (r) => { legOf(r, 'sp81-accept-answer').serverLog.find((s) => s.path === '/').run = 'other'; });
add('child-server-log-binding', 'child-server-log-binding', (r) => { legOf(r, 'sp81-accept-answer').childServerLog.find((s) => s.path === '/child.html').run = 'other'; });
add('run-window', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 10000).toISOString(); });

// replay
const freshPrior = (ctx, delta) => {
  const c = clone(ctx.real);
  for (const l of arr(c.legs)) {
    const tok = crypto.randomBytes(6).toString('hex');
    l.launchToken = tok;
    const i = arr(l.argv).findIndex((a) => typeof a === 'string' && a.startsWith('--user-data-dir='));
    if (i >= 0) l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice('--user-data-dir='.length)), 'profile-' + tok);
    const bid = crypto.randomUUID();
    if (isObj(l.devtoolsListening)) { l.devtoolsListening = { url: 'ws://127.0.0.1:' + c.ports.cdp + '/devtools/browser/' + bid, port: c.ports.cdp, browserId: bid }; l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url; }
    for (const e of arr(l.pageEvents)) { e.ts = Math.round((e.ts + delta) * 10) / 10; e.at = Math.round((e.at + delta) * 10) / 10; }
  }
  const p = path.join(work, 'prior-' + delta + '.json');
  fs.writeFileSync(p, JSON.stringify(c));
  return p;
};
// the forgery: a copy of a PRIOR with the identity fields rewritten to the expected values
const forgery = (ctx) => {
  const c = clone(ctx.prior);
  c.nonce = expectNonce;
  c.driverSha256 = pin;
  c.fixture.sha256 = expectFixture;
  rewriteNonce(c, expectNonce);
  for (const l of arr(c.legs)) {
    for (const s of arr(l.serverLog)) s.run = expectNonce;
    for (const s of arr(l.childServerLog)) s.run = expectNonce;
  }
  return c;
};
add('replay-event-timeline', 'replay-event-timeline', (r, ctx) => { Object.assign(r, forgery(ctx)); }, ['send-log-allowlist', 'cdp-event-log-closed', 'replay-launch-token', 'replay-devtools-url']);
add('replay-launch-token', 'replay-launch-token', (r, ctx) => { legOf(r, 'sp81-accept-answer').launchToken = arr(ctx.prior.legs)[0].launchToken; }, ['host-argv']);
add('replay-devtools-url', 'replay-devtools-url', (r, ctx) => { legOf(r, 'sp81-accept-answer').devtoolsListening = clone(arr(ctx.prior.legs)[0].devtoolsListening); }, ['host-argv', 'devtools-port-binding']);

// prior-set walk cases (invocation / mirror lane)
add('prior-set-unmatched-exempt', 'prior-set-unmatched-exempt', () => {}, []);
add('prior-set-complete', 'prior-set-complete', () => {}, []);
add('prior-set-unparsable', 'prior-set-unparsable', () => {}, []);

// must-accept: the real receipt, and a copy whose events are re-timed by a constant (the limit)
accept('accept-real', (r) => r);
accept('accept-retimed', (r, ctx) => { const c = clone(ctx.real); for (const l of arr(c.legs)) for (const e of arr(l.pageEvents)) { e.ts = Math.round((e.ts + 1) * 10) / 10; e.at = Math.round((e.at + 1) * 10) / 10; } Object.assign(r, c); });

// ---- run ----
const results = [];
let mirrorBuilt = false;
for (const c of cases) {
  const priorPaths = fs.readFileSync(path.resolve(priorSet), 'utf8').split('\n').map((t) => t.trim()).filter((t) => t && !t.startsWith('#'));
  const priorFile = priorPaths.length ? (path.isAbsolute(priorPaths[0]) ? priorPaths[0] : path.join(lane, priorPaths[0])) : null;
  const ctx = { real: clone(real), prior: priorFile ? JSON.parse(fs.readFileSync(priorFile, 'utf8')) : null };
  const r = clone(real);
  let laneArg = lane;
  let extraArgs = [];
  let receiptPath = realPath;
  try {
    if (c.name === 'prior-set-unmatched-exempt') {
      extraArgs = ['--tree-exempt-sha256', '1'.repeat(64)];
    } else if (c.name === 'prior-set-complete') {
      if (!mirrorBuilt) { buildMirror(); mirrorBuilt = true; }
      laneArg = mirrorLane;
      const p = path.join(mirrorLane, '.ufo/waves/round-81/stray-receipt.json');
      fs.writeFileSync(p, JSON.stringify(real));
      receiptPath = realPath;
    } else if (c.name === 'prior-set-unparsable') {
      if (!mirrorBuilt) { buildMirror(); mirrorBuilt = true; }
      laneArg = mirrorLane;
      fs.rmSync(path.join(mirrorLane, '.ufo/waves/round-81/stray-receipt.json'), { force: true });
      fs.writeFileSync(path.join(mirrorLane, '.ufo/waves/round-81/stray-unparsable.json'), '{"schema": "tabi-chrome-cdp-showpicker-r81", broken');
      receiptPath = realPath;
    } else {
      c.mutate(r, ctx);
      receiptPath = writeCase(c.name, r);
    }
  } catch (e) {
    results.push({ case: c.name, ok: false, detail: 'mutation threw: ' + e.message });
    if (firstFailure) break;
    continue;
  }
  const res = runCounter(receiptPath, laneArg, extraArgs);
  const ids = res.json && Array.isArray(res.json.findings) ? res.json.findings.map((f) => f.id) : [];
  let ok, detail;
  if (c.accept) {
    ok = res.status === 0 && res.json && res.json.verdict === 'clean' && ids.length === 0;
    detail = 'exit ' + res.status + ' verdict ' + (res.json ? res.json.verdict : null) + ' findings ' + JSON.stringify(ids.slice(0, 8));
  } else {
    const extra = ids.filter((id) => id !== c.expect && !c.alsoAllowed.includes(id));
    ok = res.status === 1 && ids.includes(c.expect) && extra.length === 0;
    detail = 'exit ' + res.status + ' expected ' + c.expect + ' got ' + JSON.stringify(ids.slice(0, 10)) + (extra.length ? ' extra ' + JSON.stringify(extra) : '');
  }
  results.push({ case: c.name, accept: c.accept, ok, detail });
  if (!ok && firstFailure) break;
}
const failed = results.filter((x) => !x.ok);
const covered = new Set(results.filter((x) => x.ok && !x.accept).map((x) => x.case));
const declared = (() => { const res = runCounter(realPath, lane); return res.json && res.json.checks ? Object.keys(res.json.checks) : []; })();
const uncovered = declared.filter((id) => !covered.has(id));
const out = { schema: 'tabi-r81-battery', cases: results.length, failed: failed.length, coverage: { declared: declared.length, covered: covered.size, uncovered, unknown: [...covered].filter((c) => !declared.includes(c)) }, results: results.filter((x) => !x.ok) };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ cases: out.cases, failed: out.failed, coverage: out.coverage, failures: out.results }, null, 1) + '\n');
process.exitCode = out.failed === 0 && uncovered.length === 0 ? 0 : 1;

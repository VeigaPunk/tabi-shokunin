#!/usr/bin/env node
// Negative + must-accept battery for scripts/check-showpicker-r80.mjs (tabi round 80, C1).
//
// Usage:
//   node negatives-showpicker-r80.mjs --lane <ABS lane> --real <receipt.json>
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
const COUNTER = path.join(HERE, 'check-showpicker-r80.mjs');
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
const priorSetPriors = (() => {
  const out = [];
  try {
    for (const line of fs.readFileSync(path.resolve(priorSet), 'utf8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const p = path.isAbsolute(t) ? t : path.join(lane, t);
      try { out.push(JSON.parse(fs.readFileSync(p, 'utf8'))); } catch {}
    }
  } catch {}
  return out;
})();
const legOf = (r, n) => arr(r.legs).find((l) => l.name === n);
const evOf = (r, leg, pred = () => true) => arr(legOf(r, leg).pageEvents).filter(pred);
const openOf = (r, leg) => arr(legOf(r, leg).cdpEventLog).find((e) => e.method === 'Page.fileChooserOpened');

// ---- invocation ----
const runCounter = (receiptPath, laneArg, extraArgs = []) => {
  const args = [COUNTER, '--lane', laneArg, '--receipt', receiptPath, '--expect-driver-sha256', pin, '--expect-nonce', expectNonce,
    '--expect-fixture-sha256', expectFixture, '--prior-set', path.resolve(priorSet),
    // the receipt under test lives in the walked trees once it is committed, so every run exempts it
    // by CONTENT (the content-bound interface the counter carries); the exemption is not a path
    ...(laneArg === lane ? ['--tree-exempt-sha256', realSha] : []),
    ...extraPriors.flatMap((p) => ['--prior', path.resolve(p)]), '--json', ...extraArgs];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 20000 });
  let j = null;
  try { j = JSON.parse(r.stdout); } catch { j = null; }
  // a counter that does not answer inside the envelope is a refusal of its own kind: a mutant that
  // hangs the counter is killed by the case that times out, never counted as a survivor
  const timedOut = r.status === null && r.signal === 'SIGTERM';
  return { status: timedOut ? 1 : r.status, json: timedOut ? { verdict: 'timeout', findings: [{ id: 'counter-timeout' }] } : j, timedOut, stderr: (r.stderr || '').slice(0, 800), stdoutHead: (r.stdout || '').slice(0, 300) };
};
const writeCase = (name, r) => { const p = path.join(work, 'cases', name + '.json'); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(r, null, 1)); return p; };

// ---- mirror lane for the walk cases ----
const mirrorLane = path.join(work, 'mirror', 'tabi-shokunin');
const mirrorTrees = ['.ufo/waves/round-80', 'corpus/evidence/round80'];
const buildMirror = () => {
  fs.rmSync(mirrorLane, { recursive: true, force: true });
  for (const t of mirrorTrees) fs.mkdirSync(path.join(mirrorLane, t), { recursive: true });
  const src = path.join(lane, '.ufo/waves/round-80/controls/c1');
  const dst = path.join(mirrorLane, '.ufo/waves/round-80/controls/c1');
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
add('schema', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-showpicker-r79'; });
add('lane', 'lane', (r) => { r.lane = 'other-lane'; });
add('nonce-shape', 'nonce-shape', (r) => { rewriteNonce(r, 'TABI-r80-x'); }, ['nonce-expected']);
add('nonce-expected', 'nonce-expected', (r) => { rewriteNonce(r, 'tabi-r80-some-other-nonce'); });
add('receipt-fields', 'receipt-fields', (r) => { r.extra = 1; });
add('driver-pin', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); });
add('fixture-hash', 'fixture-hash', (r) => { r.fixture.sha256 = '0'.repeat(64); });
add('host-chromium', 'host-chromium', (r) => { r.host.chromium = 'Chromium 154.0.0.0 Arch Linux'; });
add('host-node', 'host-node', (r) => { r.host.node = 'v22.1.0'; });
add('ports-declared', 'ports-declared', (r) => { r.ports.child = r.ports.http; }, ['fixture-hash', 'host-argv', 'devtools-port-binding', 'send-log-allowlist', 'cdp-event-log-closed', 'context-binding']);
add('frame-tree', 'frame-tree', (r) => { r.frameTree.mainFrameUrl = 'http://127.0.0.1:1/'; });

// plan / legs
add('plan-frozen', 'plan-frozen', (r) => { legOf(r, 'sp80-twice-gesture').gesture = false; }, ['plan-calls']);
add('leg-order', 'leg-order', (r) => { r.legs.reverse(); }, ['plan-frozen', 'leg-records', 'plan-calls', 'leg-marks', 'context-binding']);
add('leg-records', 'leg-records', (r) => { delete legOf(r, 'sp80-accept-png').stderrHead; }, ['host-argv']);
add('leg-marks', 'leg-marks', (r) => { legOf(r, 'sp80-webkitdirectory').lateAfterClose = 1; });
add('context-binding', 'context-binding', (r) => { legOf(r, 'sp80-cross-origin').contexts = legOf(r, 'sp80-cross-origin').contexts.filter((c) => c.origin !== 'http://127.0.0.1:' + r.ports.child); }, ['send-log-allowlist', 'cdp-event-log-closed']);
add('send-log-allowlist', 'send-log-allowlist', (r) => { const l = legOf(r, 'sp80-accept-png'); l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'DOM.getDocument', params: {} }); });
add('plan-calls', 'plan-calls', (r) => { legOf(r, 'sp80-accept-png').cdpSendLog.find((c) => c.method === 'Page.setInterceptFileChooserDialog').params = { enabled: false }; });
add('cdp-event-log-closed', 'cdp-event-log-closed', (r) => { openOf(r, 'sp80-accept-png').afterSendId = legOf(r, 'sp80-accept-png').triggerSendId + 5; });
add('frame-binding', 'frame-binding', (r) => { legOf(r, 'sp80-accept-png').frameTree.mainFrameParentId = 'X'; });
add('event-types', 'event-types', (r) => { evOf(r, 'sp80-accept-png')[0].extra = true; });
add('event-time-quantum', 'event-time-quantum', (r) => { evOf(r, 'sp80-accept-png')[0].ts = 1.23456; });
add('event-leg-window', 'event-leg-window', (r) => { evOf(r, 'sp80-accept-png')[4].at = 0.1; }, ['leg-sp80-accept-png']);
add('seq-monotonic', 'seq-monotonic', (r) => { evOf(r, 'sp80-accept-png')[0].seq = 99; });

// per-leg frozen shapes: one case per leg
const legMutators = {
  'sp80-webkitdirectory': (r) => { legOf(r, 'sp80-webkitdirectory').stateAfter.sValue = 'x'; },
  'sp80-accept-png': (r) => { evOf(r, 'sp80-accept-png')[0].target = 's'; },
  'sp80-twice-gesture': (r) => { legOf(r, 'sp80-twice-gesture').stateAfter.m = [['a', 1, 'text/plain']]; },
  'sp80-deferred-timer': (r) => { evOf(r, 'sp80-deferred-timer')[2].buttons = 1; },
  'sp80-cross-origin': (r) => { legOf(r, 'sp80-cross-origin').stateAfter.sValue = 'x'; },
  'sp80-cross-origin-disabled': (r) => { legOf(r, 'sp80-cross-origin-disabled').stateAfter.sValue = 'x'; },
  'sp80-trigger-then-answer': (r) => { evOf(r, 'sp80-trigger-then-answer')[5].files = [['a', 1, 'text/plain']]; },
};
const LEG_ALSO = { 'sp80-webkitdirectory': ['no-selection-law'], 'sp80-twice-gesture': ['no-selection-law'], 'sp80-cross-origin': ['no-selection-law'], 'sp80-cross-origin-disabled': ['no-selection-law'], 'sp80-trigger-then-answer': ['no-selection-law', 'answer-law'] };
for (const n of LEG_NAMES) add('leg-' + n, 'leg-' + n, legMutators[n] || ((r) => { legOf(r, n).stateAfter.sValue = 'x'; }), LEG_ALSO[n] || []);

// law checks
add('gesture-law', 'gesture-law', (r) => { legOf(r, 'sp80-webkitdirectory').showPicker = { ok: false, name: 'NotAllowedError', message: 'x' }; }, ['intercept-law']);
add('activation-law', 'activation-law', (r) => { legOf(r, 'sp80-accept-png').activationAfter = { isActive: true, hasBeenActive: true }; });
add('twice-gesture-law', 'twice-gesture-law', (r) => { legOf(r, 'sp80-twice-gesture').showPicker2 = { ok: false, name: 'NotAllowedError', message: 'x' }; }, ['gesture-law']);
add('deferred-law', 'deferred-law', (r) => { legOf(r, 'sp80-deferred-timer').deferredResult = { ok: false, name: 'NotAllowedError', message: 'x' }; }, ['intercept-law']);
add('mode-law', 'mode-law', (r) => { openOf(r, 'sp80-webkitdirectory').params.mode = 'selectMultiple'; }, ['leg-sp80-webkitdirectory']);
add('cross-origin-law', 'cross-origin-law', (r) => { legOf(r, 'sp80-cross-origin').parentCrossAccess = { contentDocument: 'object', windowDocument: 'SecurityError' }; });
add('cross-origin-disabled-law', 'cross-origin-disabled-law', (r) => { legOf(r, 'sp80-cross-origin-disabled').childResult = { ok: true, ret: 'undefined' }; }, ['intercept-law']);
add('answer-law', 'answer-law', (r) => { legOf(r, 'sp80-trigger-then-answer').pageEvents.find((e) => e.type === 'read').ret = 'hex:00'; });
add('no-selection-law', 'no-selection-law', (r) => { legOf(r, 'sp80-accept-png').stateAfter.s = [['a', 1, 'text/plain']]; }, ['leg-sp80-accept-png']);
add('intercept-law', 'intercept-law', (r) => { legOf(r, 'sp80-cross-origin-disabled').cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: legOf(r, 'sp80-cross-origin-disabled').contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child).frameId, mode: 'selectSingle', backendNodeId: 3 }, afterSendId: legOf(r, 'sp80-cross-origin-disabled').priorReleaseId }); }, ['leg-sp80-cross-origin-disabled', 'cross-origin-disabled-law', 'plan-calls']);
add('cancel-law', 'cancel-law', (r) => { const l = legOf(r, 'sp80-accept-png'); l.pageEvents.push({ type: 'cancel', ts: 20, isTrusted: true, act: false, target: 'k', x: null, y: null, buttons: null, files: [['cancel', 'k', []]], ret: null, seq: l.pageEvents.length + 1, leg: 'settle', at: 20 }); }, ['leg-sp80-accept-png', 'event-leg-window', 'dismiss-law']);
add('dismiss-law', 'dismiss-law', (r) => { legOf(r, 'sp80-accept-png').dismissResult = { ok: 1 }; });
add('trust-law', 'trust-law', (r) => { evOf(r, 'sp80-accept-png')[0].isTrusted = false; }, ['leg-sp80-accept-png']);

// host / fixture / server
add('host-argv', 'host-argv', (r) => { legOf(r, 'sp80-accept-png').argv[7] = '--no-first-run-x'; });
add('devtools-port-binding', 'devtools-port-binding', (r) => { legOf(r, 'sp80-accept-png').devtoolsListening.port = 1; }, ['host-argv']);
add('teardown-closure', 'teardown-closure', (r) => { legOf(r, 'sp80-accept-png').teardown.survivors = [123]; }, ['host-argv']);
add('fixture-descriptors', 'fixture-descriptors', (r) => { r.fixtureInputs.find((d) => d.id === 's').rect.left = 101; });
add('server-log-binding', 'server-log-binding', (r) => { legOf(r, 'sp80-accept-png').serverLog.find((s) => s.path === '/').run = 'other'; });
add('child-server-log-binding', 'child-server-log-binding', (r) => { legOf(r, 'sp80-accept-png').childServerLog.find((s) => s.path === '/child.html').run = 'other'; });
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
add('replay-event-timeline', 'replay-event-timeline', (r, ctx) => ({ args: ['--prior', freshPrior(ctx, 0)] }), []);
add('replay-launch-token', 'replay-launch-token', (r, ctx) => {
  const prior = priorSetPriors[0] || ctx.priors[0];
  const tok = arr(prior.legs).find((l) => typeof l.launchToken === 'string').launchToken;
  const l = legOf(r, 'sp80-accept-png');
  l.launchToken = tok;
  const i = l.argv.findIndex((a) => a.startsWith('--user-data-dir='));
  l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice('--user-data-dir='.length)), 'profile-' + tok);
}, ['host-argv']);
add('replay-devtools-url', 'replay-devtools-url', (r, ctx) => {
  const prior = priorSetPriors[0] || ctx.priors[0];
  const bid = arr(prior.legs).find((l) => isObj(l.devtoolsListening)).devtoolsListening.browserId;
  const l = legOf(r, 'sp80-accept-png');
  l.devtoolsListening = { url: 'ws://127.0.0.1:' + r.ports.cdp + '/devtools/browser/' + bid, port: r.ports.cdp, browserId: bid };
  l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url;
});

// prior-set walk (mirror lane)
add('prior-set-complete', 'prior-set-complete', (r, ctx) => {
  buildMirror();
  const p = path.join(mirrorLane, '.ufo/waves/round-80', 'unlisted.json');
  fs.writeFileSync(p, JSON.stringify(rewriteNonce(clone(ctx.real), 'tabi-r80-unlisted-copy')));
  return { lane: mirrorLane };
}, []);
add('prior-set-unparsable', 'prior-set-unparsable', (r, ctx) => {
  buildMirror();
  const p = path.join(mirrorLane, '.ufo/waves/round-80', 'truncated.json');
  fs.writeFileSync(p, '{"schema": "tabi-chrome-cdp-showpicker-r80", "nonce": "tabi-r80-trunc');
  return { lane: mirrorLane };
}, []);
add('prior-set-unmatched-exempt', 'prior-set-unmatched-exempt', () => ({}), [], { args: ['--tree-exempt-sha256', '1'.repeat(64)] });

// ---- cases that isolate a conjunct a broader case would otherwise mask ----
add('gesture-message-only', 'gesture-law', (r) => { legOf(r, 'sp80-deferred-timer').showPicker.message = 'x'; }, ['deferred-law']);
add('activation-before-only', 'activation-law', (r) => { legOf(r, 'sp80-webkitdirectory').activationBefore = { isActive: false, hasBeenActive: true }; });
add('twice-second-name', 'twice-gesture-law', (r) => { legOf(r, 'sp80-twice-gesture').showPicker2.ret = 'x'; });
add('twice-one-chooser', 'twice-gesture-law', (r) => { const l = legOf(r, 'sp80-twice-gesture'); l.cdpEventLog = l.cdpEventLog.filter((e) => e.method !== 'Page.fileChooserOpened' || e.afterSendId !== l.trigger2SendId); }, ['leg-sp80-twice-gesture', 'cdp-event-log-closed', 'intercept-law']);
add('deferred-direct-ok', 'deferred-law', (r) => { legOf(r, 'sp80-deferred-timer').showPicker = { ok: true, ret: 'undefined' }; }, ['gesture-law']);
add('mode-event', 'mode-law', (r) => { openOf(r, 'sp80-accept-png').params.mode = 'selectMultiple'; }, ['leg-sp80-accept-png']);
add('cross-access-only', 'cross-origin-law', (r) => { legOf(r, 'sp80-cross-origin').parentCrossAccess = { contentDocument: null, windowDocument: 'object' }; });
add('cross-child-act', 'cross-origin-law', (r) => { legOf(r, 'sp80-cross-origin').childActivationAfter = { isActive: true, hasBeenActive: true }; });
add('cross-events-trusted', 'cross-origin-law', (r) => { legOf(r, 'sp80-cross-origin').childEvents[2].isTrusted = false; }, ['leg-sp80-cross-origin']);
add('cod-no-chooser', 'cross-origin-disabled-law', (r) => { const l = legOf(r, 'sp80-cross-origin-disabled'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child).frameId, mode: 'selectSingle', backendNodeId: 3 }, afterSendId: l.priorReleaseId }); }, ['intercept-law', 'leg-sp80-cross-origin-disabled', 'cross-origin-disabled-law', 'plan-calls']);
add('answer-bytes', 'answer-law', (r) => { legOf(r, 'sp80-trigger-then-answer').upload.sha256 = '0'.repeat(64); });
add('answer-node', 'answer-law', (r) => { legOf(r, 'sp80-trigger-then-answer').answer.setParams.backendNodeId = 999; }, ['plan-calls']);
add('no-selection-input-event', 'no-selection-law', (r) => { const l = legOf(r, 'sp80-accept-png'); l.pageEvents.push({ type: 'input', ts: 20, isTrusted: true, act: true, target: 'k', x: null, y: null, buttons: null, files: [], ret: null, seq: l.pageEvents.length + 1, leg: 'settle', at: 20 }); }, ['leg-sp80-accept-png', 'event-leg-window']);
add('intercept-refused-opened', 'intercept-law', (r) => { const l = legOf(r, 'sp80-deferred-timer'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.frameTree.mainFrameId, mode: 'selectSingle', backendNodeId: 3 }, afterSendId: l.triggerSendId }); }, ['leg-sp80-deferred-timer', 'deferred-law']);
add('trust-pointer-in-showpicker', 'trust-law', (r) => { const e = evOf(r, 'sp80-accept-png', (x) => x.type === 'pointerdown')[0]; e.leg = 'show-picker'; }, ['leg-sp80-accept-png']);
add('argv-profile-name', 'host-argv', (r) => { const l = legOf(r, 'sp80-accept-png'); const i = l.argv.findIndex((a) => a.startsWith('--user-data-dir=')); l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice(16)), 'profile-000000000000'); });
add('devtools-url-prefix', 'host-argv', (r) => { const l = legOf(r, 'sp80-accept-png'); l.devtoolsListening.url = 'ws://127.0.0.1:1/devtools/browser/' + l.devtoolsListening.browserId; l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url; });
add('run-window-upper', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 700000).toISOString(); });
add('replay-token-duplicate', 'replay-launch-token', (r) => { legOf(r, 'sp80-accept-png').launchToken = legOf(r, 'sp80-twice-gesture').launchToken; }, ['host-argv']);
add('replay-gap-only-refuse', 'replay-event-timeline', (r, ctx) => {
  // the prior's every event shifted by +1 ms: no pair matches, the gap DURATIONS are preserved
  return { args: ['--prior', freshPrior(ctx, 1)] };
}, []);


// ---- isolating cases for the kill-power survivors (round-80 repair) ----
add('fixture-child-origin', 'ports-declared', (r) => { r.fixture.child.origin = 'http://127.0.0.1:1'; });
add('fixture-child-keys', 'fixture-hash', (r) => { r.fixture.child.extra = 1; });
add('ports-collide', 'ports-declared', (r) => { r.ports.child = r.ports.http; r.fixture.child.origin = 'http://127.0.0.1:' + r.ports.http; }, ['host-argv', 'devtools-port-binding', 'send-log-allowlist', 'cdp-event-log-closed', 'context-binding']);
add('leg-errors', 'leg-records', (r) => { legOf(r, 'sp80-accept-png').errors = ['x']; });
add('context-duplicate', 'context-binding', (r) => { const l = legOf(r, 'sp80-cross-origin'); l.contexts.push({ ...l.contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child) }); }, ['send-log-allowlist', 'cdp-event-log-closed']);
add('context-id-wrong', 'context-binding', (r) => { legOf(r, 'sp80-cross-origin').childContextId = 99; }, ['send-log-allowlist']);
add('send-context-dropped', 'send-log-allowlist', (r) => { const l = legOf(r, 'sp80-cross-origin'); const c = l.cdpSendLog.find((x) => x.params.contextId === l.childContextId); delete c.params.contextId; });
add('send-context-in-parent-leg', 'send-log-allowlist', (r) => { const l = legOf(r, 'sp80-accept-png'); l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'Runtime.evaluate', params: { expression: 'window.__act()', returnByValue: true, contextId: 3 } }); });
add('send-id-gap', 'send-log-allowlist', (r) => { legOf(r, 'sp80-accept-png').cdpSendLog[3].id = 99; });
add('send-expression', 'send-log-allowlist', (r) => { const l = legOf(r, 'sp80-accept-png'); l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'Runtime.evaluate', params: { expression: 'alert(1)', returnByValue: true } }); });
add('plan-answer-send-id', 'plan-calls', (r) => { legOf(r, 'sp80-trigger-then-answer').answer.setSendId = 999; });
add('cdp-open-id-zero', 'cdp-event-log-closed', (r) => { openOf(r, 'sp80-accept-png').params.backendNodeId = 0; }, ['answer-law']);
add('event-before-pre', 'event-leg-window', (r) => { const l = legOf(r, 'sp80-accept-png'); const e = l.pageEvents[0]; e.at = 0.1; }, ['leg-sp80-accept-png']);
add('cdp-event-method', 'cdp-event-log-closed', (r) => { const l = legOf(r, 'sp80-accept-png'); l.cdpEventLog.push({ method: 'Page.loadEventFired', params: { timestamp: 1 }, afterSendId: l.triggerSendId }); });
add('frame-id-shape', 'frame-binding', (r) => { legOf(r, 'sp80-accept-png').frameTree.mainFrameId = 'X'; }, ['cdp-event-log-closed']);
add('cdp-open-frame', 'cdp-event-log-closed', (r) => { openOf(r, 'sp80-accept-png').params.frameId = 'A'.repeat(32); });
add('cross-child-ret', 'cross-origin-law', (r) => { legOf(r, 'sp80-cross-origin').childResult = { ok: true, ret: 'x' }; });
add('cod-child-act', 'cross-origin-disabled-law', (r) => { legOf(r, 'sp80-cross-origin-disabled').childActivationAfter = { isActive: false, hasBeenActive: true }; });
add('answer-state', 'answer-law', (r) => { legOf(r, 'sp80-trigger-then-answer').stateAfter.s = []; }, ['leg-sp80-trigger-then-answer']);
add('teardown-child-port', 'teardown-closure', (r) => { delete legOf(r, 'sp80-accept-png').teardown.portProbes.child; }, ['host-argv']);

// exact-threshold bracket: the replay rule's abs side is bracketed on BOTH sides with the gap side
// broken (the gap's upper event moved by +3 ms), so only the pair threshold decides
const bracketPrior = (ctx, targetMatched) => {
  const c = clone(ctx.real);
  for (const l of arr(c.legs)) {
    const tok = crypto.randomBytes(6).toString('hex');
    l.launchToken = tok;
    const i = arr(l.argv).findIndex((a) => typeof a === 'string' && a.startsWith('--user-data-dir='));
    if (i >= 0) l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice('--user-data-dir='.length)), 'profile-' + tok);
    const bid = crypto.randomUUID();
    if (isObj(l.devtoolsListening)) { l.devtoolsListening = { url: 'ws://127.0.0.1:' + c.ports.cdp + '/devtools/browser/' + bid, port: c.ports.cdp, browserId: bid }; l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url; }
  }
  const flat = arr(c.legs).flatMap((l) => arr(l.pageEvents).map((e) => ({ l, e }))).sort((a, b) => a.e.at - b.e.at);
  // break EVERY gap (the receipt's gap count varies with run timing): shift each gap's upper event
  const uppers = new Set();
  for (let i = 1; i < flat.length; i++) if (flat[i].e.at - flat[i - 1].e.at >= 50) uppers.add(flat[i]);
  for (const u of uppers) { u.e.ts = Math.round((u.e.ts + 3) * 10) / 10; u.e.at = Math.round((u.e.at + 3) * 10) / 10; }
  const rest = flat.filter((x) => !uppers.has(x));
  // exactly `targetMatched` events must still match: shift the rest beyond that count
  const shiftCount = Math.max(0, rest.length - targetMatched);
  for (const x of rest.slice(0, shiftCount)) { x.e.ts = Math.round((x.e.ts + 1) * 10) / 10; x.e.at = Math.round((x.e.at + 1) * 10) / 10; }
  const p = path.join(work, 'prior-bracket-' + targetMatched + '.json');
  fs.writeFileSync(p, JSON.stringify(c));
  return p;
};
const bracketNeed = (r) => Math.ceil(0.5 * arr(r.legs).reduce((n, l) => n + arr(l.pageEvents).length, 0));
add('replay-at-threshold-refuse', 'replay-event-timeline', (r, ctx) => ({ args: ['--prior', bracketPrior(ctx, bracketNeed(r))] }), []);
accept('replay-below-threshold-accept', (r, ctx) => ({ args: ['--prior', bracketPrior(ctx, bracketNeed(r) - 1)] }));

// must-accept
accept('honest', () => {});
accept('honest-tree-exempt-sha256', (r, ctx) => {
  buildMirror();
  const copy = path.join(mirrorLane, '.ufo/waves/round-80', 'exempt-copy.json');
  const bytes = JSON.stringify(rewriteNonce(clone(ctx.real), 'tabi-r80-exempt-copy'));
  fs.writeFileSync(copy, bytes);
  return { lane: mirrorLane, args: ['--tree-exempt-sha256', sha256(Buffer.from(bytes))] };
});
accept('honest-run-window-at-bound', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 15000).toISOString(); });
accept('foreign-schema-in-walk-ignored', (r, ctx) => {
  buildMirror();
  fs.writeFileSync(path.join(mirrorLane, '.ufo/waves/round-80', 'foreign.json'), JSON.stringify({ schema: 'tabi-chrome-cdp-showpicker-r79', nonce: 'x' }));
  return { lane: mirrorLane };
});

// ---- run ----
const results = [];
let failed = 0;
for (const c of cases) {
  const r = clone(real);
  let ctxOut = {};
  try { ctxOut = c.mutate(r, { real, realPath, priors: [clone(real)] }) || {}; } catch (e) { ctxOut = { error: e.message }; }
  const laneArg = ctxOut.lane || lane;
  const casePath = writeCase(c.name, r);
  const extra = [...(ctxOut.args || []), ...(c.opts.args || [])];
  const res = runCounter(casePath, laneArg, extra);
  const ids = res.json && Array.isArray(res.json.findings) ? res.json.findings.map((f) => f.id) : [];
  let ok;
  if (c.accept) ok = res.status === 0 && ids.length === 0;
  else ok = res.status === 1 && ids.includes(c.expect) && ids.every((id) => id === c.expect || c.alsoAllowed.includes(id));
  if (!ok) failed++;
  results.push({ name: c.name, expect: c.expect, accept: c.accept, status: res.status, ids, ok, stderr: ok ? null : res.stderr, head: ok ? null : res.stdoutHead });
  if (!ok && firstFailure) break;
}

// coverage: every check id the counter declares must be a case's expected id
const clean = runCounter(realPath, lane, []);
const declared = clean.json && isObj(clean.json.checks) ? Object.keys(clean.json.checks) : [];
const covered = new Set(results.filter((x) => !x.accept).map((x) => x.expect));
const uncovered = declared.filter((id) => !covered.has(id));
const unknown = [...covered].filter((id) => !declared.includes(id));
const summary = {
  schema: 'tabi-negatives-showpicker-r80', cases: results.length, failed, cleanVerdict: clean.json ? clean.json.verdict : null,
  coverage: { declared: declared.length, covered: covered.size, uncovered, unknown },
  results,
};
if (asJson) process.stdout.write(JSON.stringify(summary, null, 1) + '\n');
else {
  for (const x of results) if (!x.ok) console.log('FAIL ' + x.name + ' expect ' + x.expect + ' status ' + x.status + ' ids ' + JSON.stringify(x.ids));
  console.log(JSON.stringify({ cases: results.length, failed, coverage: summary.coverage, clean: summary.cleanVerdict }, null, 1));
}
process.exitCode = failed === 0 && uncovered.length === 0 && unknown.length === 0 && clean.status === 0 ? 0 : 1;

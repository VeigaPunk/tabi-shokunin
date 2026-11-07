#!/usr/bin/env node
// Negative + must-accept battery for scripts/check-showpicker-r79.mjs (tabi round 79, C1).
//
// Usage:
//   node negatives-showpicker-r79.mjs --lane <ABS lane> --real <receipt.json>
//     --expect-driver-sha256 <hex> --expect-nonce <nonce> --expect-fixture-sha256 <hex>
//     --prior-set <file> [--prior <receipt.json> ...] --work <ABS scratch dir> [--json]
//     [--first-failure] [--jobs N]
//
// Every case mutates the real receipt (or the invocation) and runs the counter BY PATH (the counter
// beside this file). A refusal case passes only when the counter exits 1, lists the expected id and
// lists no id except those the case names in `alsoAllowed`. A must-accept case passes only when the
// counter exits 0 with no finding. Coverage: every check id the counter declares must be the
// expected id of at least one refusal case — a new check without a case fails the battery.
//
// Boundary brackets (QUALITY 143): the replay rule's threshold is bracketed on BOTH sides — a copy of
// a prior retimed at `absNeed - 1` events must ACCEPT, at `absNeed` events must REFUSE; the run
// window at 20000 ms accepts and 19999 ms refuses; `chooserWaitMs` at 0 and 3000 accepts, 3001
// refuses. Thresholds this battery does NOT bracket are named in `unbracketed` in the summary
// (honesty: an unbracketed threshold is a known kill-power gap, not a covered rule).
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
const COUNTER = path.join(HERE, 'check-showpicker-r79.mjs');
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
const counterSrc = fs.readFileSync(COUNTER, 'utf8').split('\n');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const clone = (v) => JSON.parse(JSON.stringify(v));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const arr = (v) => (Array.isArray(v) ? v : []);
const LEG_NAMES = arr(real.legs).map((l) => l.name);
const legOf = (r, n) => arr(r.legs).find((l) => l.name === n);
const lineOf = (id) => {
  if (typeof id !== 'string') return null;
  if (id.startsWith('leg-')) {
    const i = counterSrc.findIndex((l) => l.includes("check('leg-' + leg.name"));
    return i >= 0 ? i + 1 : null;
  }
  const i = counterSrc.findIndex((l) => l.includes(`check('${id}'`));
  return i >= 0 ? i + 1 : null;
};

// ---- invocation ----
const runCounter = (receiptPath, laneArg, extraArgs = []) => {
  // the prior set is named ABSOLUTELY: the mirror-lane cases change --lane and the counter resolves a
  // relative prior-set against it
  const args = [COUNTER, '--lane', laneArg, '--receipt', receiptPath, '--expect-driver-sha256', pin, '--expect-nonce', expectNonce,
    '--expect-fixture-sha256', expectFixture, '--prior-set', path.resolve(priorSet), ...extraPriors.flatMap((p) => ['--prior', path.resolve(p)]), '--json', ...extraArgs];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 120000 });
  let j = null;
  try { j = JSON.parse(r.stdout); } catch { j = null; }
  return { status: r.status, json: j, stderr: (r.stderr || '').slice(0, 800), stdoutLen: (r.stdout || '').length, stdoutHead: (r.stdout || '').slice(0, 300) };
};
const writeCase = (name, r) => { const p = path.join(work, 'cases', name + '.json'); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(r, null, 1)); return p; };

// ---- mirror lane for the walk cases ----
const mirrorLane = path.join(work, 'mirror', 'tabi-shokunin');
const mirrorTrees = ['.ufo/waves/round-79', 'corpus/evidence/round79'];
const buildMirror = () => {
  fs.rmSync(mirrorLane, { recursive: true, force: true });
  for (const t of mirrorTrees) fs.mkdirSync(path.join(mirrorLane, t), { recursive: true });
  // the prior-set file and the probes it names are copied so the lane-relative entries still resolve
  // (the counter resolves a relative prior-set entry against --lane)
  const src = path.join(lane, '.ufo/waves/round-79/controls/c1');
  const dst = path.join(mirrorLane, '.ufo/waves/round-79/controls/c1');
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
    for (const c of arr(l.cdpSendLog)) {
      if (c.method === 'Page.navigate') c.params.url = c.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));
      if (c.method === 'Runtime.evaluate' && typeof c.params.expression === 'string') c.params.expression = c.params.expression.split(JSON.stringify(old)).join(JSON.stringify(to));
    }
    for (const e of arr(l.cdpEventLog)) if (e.method === 'Page.frameNavigated') e.params.url = e.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));
  }
  return r;
};
const evOf = (r, leg, pred = () => true) => arr(legOf(r, leg).pageEvents).filter(pred);
const openOf = (r, leg) => arr(legOf(r, leg).cdpEventLog).find((e) => e.method === 'Page.fileChooserOpened');

// identity and run binding
add('schema', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-showpicker-r78'; });
add('lane', 'lane', (r) => { r.lane = 'other-lane'; });
add('nonce-shape', 'nonce-shape', (r) => { rewriteNonce(r, 'TABI-r79-x'); }, ['nonce-expected']);
add('nonce-expected', 'nonce-expected', (r) => { rewriteNonce(r, 'tabi-r79-some-other-nonce'); });
add('receipt-fields', 'receipt-fields', (r) => { r.extra = 1; });
add('driver-pin', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); });
add('fixture-hash', 'fixture-hash', (r) => { r.fixture.sha256 = '0'.repeat(64); });
add('host-chromium', 'host-chromium', (r) => { r.host.chromium = 'Chromium 154.0.0.0 Arch Linux'; });
add('host-node', 'host-node', (r) => { r.host.node = 'v22.1.0'; });
add('ports-declared', 'ports-declared', (r) => { r.ports.cdp = r.ports.http; }, ['host-argv', 'devtools-port-binding', 'send-log-allowlist', 'cdp-event-log-closed']);
add('frame-tree', 'frame-tree', (r) => { r.frameTree.mainFrameUrl = 'http://127.0.0.1:1/'; });

// plan / legs
add('plan-frozen', 'plan-frozen', (r) => { legOf(r, 'sp-cdp-gesture').gesture = false; }, ['plan-calls']);
add('leg-order', 'leg-order', (r) => { r.legs.reverse(); }, ['plan-frozen', 'leg-records', 'cancel-law']);
add('leg-records', 'leg-records', (r) => { delete legOf(r, 'sp-click-control').stderrHead; }, ['host-argv']);
add('leg-marks', 'leg-marks', (r) => { legOf(r, 'sp-click-then-show').lateAfterClose = 1; });
add('send-log-allowlist', 'send-log-allowlist', (r) => { legOf(r, 'sp-click-then-show').cdpSendLog.push({ id: legOf(r, 'sp-click-then-show').cdpSendLog.length + 1, method: 'DOM.getDocument', params: {} }); });
add('plan-calls', 'plan-calls', (r) => { const l = legOf(r, 'sp-click-then-show'); l.cdpSendLog.find((c) => c.method === 'Page.setInterceptFileChooserDialog').params = { enabled: false }; });
add('cdp-event-log-closed', 'cdp-event-log-closed', (r) => { const l = legOf(r, 'sp-click-then-show'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.frameTree.mainFrameId, mode: 'selectSingle', backendNodeId: 9 }, afterSendId: l.triggerSendId }); }, ['leg-sp-click-then-show', 'intercept-law', 'node-binding-law']);
add('frame-binding', 'frame-binding', (r) => { legOf(r, 'sp-click-then-show').frameTree.mainFrameId = 'A'.repeat(32); }, ['cdp-event-log-closed']);
add('event-types', 'event-types', (r) => { evOf(r, 'sp-click-then-show')[0].extra = true; });
add('event-time-quantum', 'event-time-quantum', (r) => { evOf(r, 'sp-click-then-show')[0].ts = 1.23456; });
add('event-leg-window', 'event-leg-window', (r) => { const e = evOf(r, 'sp-click-then-show')[4]; e.at = 0.1; }, ['leg-sp-click-then-show']);
add('seq-monotonic', 'seq-monotonic', (r) => { evOf(r, 'sp-click-then-show')[0].seq = 99; });

// per-leg frozen shapes: one case per leg, each moving a field the leg's shape carries
const legMutators = {
  'sp-nogesture-intercept-on': (r) => { legOf(r, 'sp-nogesture-intercept-on').stateAfter.sValue = 'x'; },
  'sp-nogesture-intercept-off': (r) => { legOf(r, 'sp-nogesture-intercept-off').stateAfter.s = [['a', 1, 'text/plain']]; },
  'sp-click-then-show': (r) => { evOf(r, 'sp-click-then-show')[0].target = 's'; },
  'sp-cdp-gesture': (r) => { legOf(r, 'sp-cdp-gesture').stateAfter.m = [['a', 1, 'text/plain']]; },
  'sp-intercept-off-click-then-show': (r) => { evOf(r, 'sp-intercept-off-click-then-show')[5].files = [['a', 1, 'text/plain']]; },
  'sp-multiple-show': (r) => { evOf(r, 'sp-multiple-show')[2].buttons = 1; },
  'sp-disabled': (r) => { evOf(r, 'sp-disabled')[1].isTrusted = false; },
  'sp-cancel-armed': (r) => { evOf(r, 'sp-cancel-armed')[5].target = 'm'; },
  'sp-show-twice': (r) => { evOf(r, 'sp-show-twice')[3].x = 0; },
  'sp-click-control': (r) => { evOf(r, 'sp-click-control')[4].target = 'f'; },
};
const LEG_ALSO = { 'sp-disabled': ['trust-law'], 'sp-nogesture-intercept-on': ['no-selection-law'], 'sp-nogesture-intercept-off': ['no-selection-law'], 'sp-cdp-gesture': ['no-selection-law'], 'sp-cancel-armed': ['cancel-law'] };
for (const n of LEG_NAMES) add('leg-' + n, 'leg-' + n, legMutators[n] || ((r) => { legOf(r, n).stateAfter.sValue = 'x'; }), LEG_ALSO[n] || []);

// law checks
add('gesture-law', 'gesture-law', (r) => { legOf(r, 'sp-nogesture-intercept-on').showPicker = { ok: true, ret: 'undefined' }; });
add('activation-law', 'activation-law', (r) => { legOf(r, 'sp-disabled').activationAfter = { isActive: false, hasBeenActive: true }; }, ['immutable-law']);
add('consumption-law', 'consumption-law', (r) => { legOf(r, 'sp-show-twice').showPicker2 = { ok: true, ret: 'undefined' }; });
add('immutable-law', 'immutable-law', (r) => { legOf(r, 'sp-disabled').showPicker.message = 'cannot be used on immutable controls.'; }, ['gesture-law']);
add('mode-law', 'mode-law', (r) => { r.fixtureInputs.find((d) => d.id === 'm').multiple = false; }, ['fixture-descriptors']);
add('node-binding-law', 'node-binding-law', (r) => { openOf(r, 'sp-click-then-show').params.backendNodeId = 0; }, ['cdp-event-log-closed']);
add('no-selection-law', 'no-selection-law', (r) => { legOf(r, 'sp-click-then-show').stateAfter.s = [['a', 1, 'text/plain']]; }, ['leg-sp-click-then-show']);
add('intercept-law', 'intercept-law', (r) => { const l = legOf(r, 'sp-intercept-off-click-then-show'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.frameTree.mainFrameId, mode: 'selectSingle', backendNodeId: 3 }, afterSendId: l.triggerSendId }); }, ['leg-sp-intercept-off-click-then-show', 'cdp-event-log-closed', 'node-binding-law']);
add('cancel-law', 'cancel-law', (r) => { const l = legOf(r, 'sp-cancel-armed'); l.pageEvents = l.pageEvents.filter((e) => e.type !== 'cancel'); }, ['leg-sp-cancel-armed']);
add('dismiss-law', 'dismiss-law', (r) => { legOf(r, 'sp-click-then-show').dismissResult = { ok: 1 }; });
add('trust-law', 'trust-law', (r) => { evOf(r, 'sp-click-then-show')[0].isTrusted = false; }, ['leg-sp-click-then-show']);

// host / fixture / server
add('host-argv', 'host-argv', (r) => { legOf(r, 'sp-click-then-show').argv[7] = '--no-first-run-x'; });
add('devtools-port-binding', 'devtools-port-binding', (r) => { legOf(r, 'sp-click-then-show').devtoolsListening.port = 1; }, ['host-argv']);
add('teardown-closure', 'teardown-closure', (r) => { legOf(r, 'sp-click-then-show').teardown.survivors = [123]; }, ['host-argv']);
add('fixture-descriptors', 'fixture-descriptors', (r) => { r.fixtureInputs.find((d) => d.id === 's').rect.left = 101; });
add('server-log-binding', 'server-log-binding', (r) => { legOf(r, 'sp-click-then-show').serverLog.find((s) => s.path === '/').run = 'other'; });
add('run-window', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 10000).toISOString(); });

// replay
add('replay-launch-token', 'replay-launch-token', (r, ctx) => {
  const prior = ctx.priors[0];
  const tok = arr(prior.legs).find((l) => typeof l.launchToken === 'string').launchToken;
  const l = legOf(r, 'sp-click-then-show');
  l.launchToken = tok;
  const i = l.argv.findIndex((a) => a.startsWith('--user-data-dir='));
  l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice('--user-data-dir='.length)), 'profile-' + tok);
}, ['host-argv']);
add('replay-devtools-url', 'replay-devtools-url', (r, ctx) => {
  const prior = ctx.priors[0];
  const bid = arr(prior.legs).find((l) => isObj(l.devtoolsListening)).devtoolsListening.browserId;
  const l = legOf(r, 'sp-click-then-show');
  l.devtoolsListening = { url: 'ws://127.0.0.1:' + r.ports.cdp + '/devtools/browser/' + bid, port: r.ports.cdp, browserId: bid };
  l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url;
});

// prior-set walk (mirror lane)
add('prior-set-complete', 'prior-set-complete', (r, ctx) => {
  buildMirror();
  const p = path.join(mirrorLane, '.ufo/waves/round-79', 'unlisted.json');
  fs.writeFileSync(p, JSON.stringify(rewriteNonce(clone(ctx.real), 'tabi-r79-unlisted-copy')));
  return { lane: mirrorLane };
}, []);
add('prior-set-unparsable', 'prior-set-unparsable', (r, ctx) => {
  buildMirror();
  const p = path.join(mirrorLane, '.ufo/waves/round-79', 'truncated.json');
  fs.writeFileSync(p, '{"schema": "tabi-chrome-cdp-showpicker-r79", "nonce": "tabi-r79-trunc');
  return { lane: mirrorLane };
}, []);
add('prior-set-unmatched-exempt', 'prior-set-unmatched-exempt', () => ({}), [], { args: ['--tree-exempt-sha256', '1'.repeat(64)] });

// ---- cases that isolate a rule a broader case would otherwise mask (kill-power survivors) ----
add('leg-records-errors', 'leg-records', (r) => { legOf(r, 'sp-click-then-show').errors = ['x']; });
add('send-expression', 'send-log-allowlist', (r) => { const l = legOf(r, 'sp-click-then-show'); l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'Runtime.evaluate', params: { expression: 'alert(1)', returnByValue: true } }); });
add('send-id-gap', 'send-log-allowlist', (r) => { legOf(r, 'sp-click-then-show').cdpSendLog[3].id = 99; });
add('plan-trigger-at-intercept', 'plan-calls', (r) => { const l = legOf(r, 'sp-click-then-show'); l.triggerSendId = l.interceptSendId; }, ['cdp-event-log-closed']);
add('cdp-event-method', 'cdp-event-log-closed', (r) => { const l = legOf(r, 'sp-click-then-show'); l.cdpEventLog.push({ method: 'Page.loadEventFired', params: { timestamp: 1 }, afterSendId: l.triggerSendId }); });
add('cdp-open-binding', 'cdp-event-log-closed', (r) => { openOf(r, 'sp-click-then-show').afterSendId = legOf(r, 'sp-click-then-show').triggerSendId + 5; });
add('cdp-open-id-zero', 'cdp-event-log-closed', (r) => { openOf(r, 'sp-click-then-show').params.backendNodeId = 0; }, ['node-binding-law']);
add('event-after-settle', 'event-leg-window', (r) => { const l = legOf(r, 'sp-click-then-show'); const e = l.pageEvents[l.pageEvents.length - 1]; e.at = Math.round((l.marks.find((m) => m.name === 'settle').at + 1) * 10) / 10; }, ['leg-sp-click-then-show']);
add('gesture-name-only', 'gesture-law', (r) => { legOf(r, 'sp-nogesture-intercept-on').showPicker.name = 'SecurityError'; });
add('gesture-message-only', 'gesture-law', (r) => { legOf(r, 'sp-nogesture-intercept-on').showPicker.message = 'requires a user gesture.'; });
add('activation-before-only', 'activation-law', (r) => { legOf(r, 'sp-click-then-show').activationBefore = { isActive: false, hasBeenActive: true }; });
add('consumption-second-name', 'consumption-law', (r) => { legOf(r, 'sp-show-twice').showPicker2.name = 'SecurityError'; });
add('consumption-second-contradictory-ok', 'consumption-law', (r) => { legOf(r, 'sp-show-twice').showPicker2 = { ok: true, ret: 'undefined', name: 'NotAllowedError', message: "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture." }; });
add('consumption-chooser-count', 'consumption-law', (r) => { const l = legOf(r, 'sp-show-twice'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.frameTree.mainFrameId, mode: 'selectSingle', backendNodeId: 3 }, afterSendId: l.triggerSendId }); }, ['leg-sp-show-twice', 'cdp-event-log-closed', 'node-binding-law', 'intercept-law']);
add('immutable-activation-only', 'immutable-law', (r) => { legOf(r, 'sp-disabled').activationAfter = { isActive: false, hasBeenActive: true }; }, ['activation-law']);
add('mode-event', 'mode-law', (r) => { openOf(r, 'sp-multiple-show').params.mode = 'selectSingle'; }, ['leg-sp-multiple-show']);
add('no-selection-input-event', 'no-selection-law', (r) => { const l = legOf(r, 'sp-click-then-show'); l.pageEvents.push({ type: 'input', ts: 20, isTrusted: true, act: true, target: 's', x: null, y: null, buttons: null, files: [], ret: null, seq: l.pageEvents.length + 1, leg: 'settle', at: 20 }); }, ['leg-sp-click-then-show', 'event-leg-window']);
add('intercept-refused-opened', 'intercept-law', (r) => { const l = legOf(r, 'sp-nogesture-intercept-on'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.frameTree.mainFrameId, mode: 'selectSingle', backendNodeId: 3 }, afterSendId: l.triggerSendId }); }, ['leg-sp-nogesture-intercept-on', 'cdp-event-log-closed', 'node-binding-law']);
add('cancel-target', 'cancel-law', (r) => { const e = evOf(r, 'sp-cancel-armed', (x) => x.type === 'cancel')[0]; e.target = 'm'; }, ['leg-sp-cancel-armed']);
add('trust-pointer-in-showpicker', 'trust-law', (r) => { const e = evOf(r, 'sp-click-then-show', (x) => x.type === 'pointerdown')[0]; e.leg = 'show-picker'; }, ['leg-sp-click-then-show']);
add('argv-profile-name', 'host-argv', (r) => { const l = legOf(r, 'sp-click-then-show'); const i = l.argv.findIndex((a) => a.startsWith('--user-data-dir=')); l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice(16)), 'profile-000000000000'); });
add('devtools-url-prefix', 'host-argv', (r) => { const l = legOf(r, 'sp-click-then-show'); l.devtoolsListening.url = 'ws://127.0.0.1:1/devtools/browser/' + l.devtoolsListening.browserId; l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url; });
add('run-window-upper', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 700000).toISOString(); });
add('replay-token-duplicate', 'replay-launch-token', (r) => { legOf(r, 'sp-click-then-show').launchToken = legOf(r, 'sp-cdp-gesture').launchToken; }, ['host-argv']);
add('replay-gap-only-refuse', 'replay-event-timeline', (r, ctx) => {
  // every event shifted by the same +1 ms: no pair matches, but the gap DURATION is preserved, so
  // the gap side alone must refuse (it isolates the gap rule from the pair rule)
  const c = copyPrior(r, ctx);
  for (const l of arr(c.legs)) for (let i = 0; i < arr(l.pageEvents).length; i++) shiftEvent(l, i, 1);
  return c;
}, ['leg-sp-click-then-show', 'leg-sp-click-control', 'leg-sp-disabled', 'leg-sp-multiple-show', 'leg-sp-cancel-armed', 'leg-sp-show-twice', 'leg-sp-cdp-gesture', 'leg-sp-intercept-off-click-then-show', 'leg-sp-nogesture-intercept-on', 'leg-sp-nogesture-intercept-off']);
accept('foreign-schema-in-walk-ignored', (r, ctx) => {
  buildMirror();
  fs.writeFileSync(path.join(mirrorLane, '.ufo/waves/round-79', 'foreign.json'), JSON.stringify({ schema: 'tabi-chrome-cdp-filechooser-r78', nonce: 'x' }));
  return { lane: mirrorLane };
});

// exact-threshold brackets: shift a known number of DISTINCT-PAIR groups so the matched count is
// exactly absNeed (refuse) or absNeed - 1 (accept) with the gap side broken — the only construction
// that isolates the abs threshold from the gap threshold
const shiftLegs = (c, names) => { for (const l of arr(c.legs)) if (names.includes(l.name)) for (let i = 0; i < arr(l.pageEvents).length; i++) shiftEvent(l, i, 1); };
const shiftLast = (c, name, n) => { const l = arr(c.legs).find((x) => x.name === name); if (!l) return; const evs = arr(l.pageEvents); for (let i = evs.length - Math.min(n, evs.length); i < evs.length; i++) shiftEvent(l, i, 1); };
const breakGap = (c) => { const up = gapUpper(c); if (up) shiftEvent(up.l, up.i, 1); };
add('replay-at-threshold-refuse', 'replay-event-timeline', (r, ctx) => {
  const c = copyPrior(r, ctx);
  shiftLegs(c, ['sp-click-then-show', 'sp-multiple-show', 'sp-disabled']);   // 15 events
  shiftLast(c, 'sp-intercept-off-click-then-show', 3);                      // +3 (the cancel event is the gap upper)
  return c;
}, ['leg-sp-click-then-show', 'leg-sp-multiple-show', 'leg-sp-disabled', 'leg-sp-intercept-off-click-then-show', 'leg-sp-cancel-armed', 'cancel-law']);
accept('replay-below-threshold-accept', (r, ctx) => {
  const c = copyPrior(r, ctx);
  shiftLegs(c, ['sp-click-then-show', 'sp-multiple-show', 'sp-disabled']);
  shiftLast(c, 'sp-intercept-off-click-then-show', 4);
  return c;
});

// must-accept
accept('honest', () => {});
accept('honest-tree-exempt-sha256', (r, ctx) => {
  buildMirror();
  const copy = path.join(mirrorLane, '.ufo/waves/round-79', 'exempt-copy.json');
  const bytes = JSON.stringify(rewriteNonce(clone(ctx.real), 'tabi-r79-exempt-copy'));
  fs.writeFileSync(copy, bytes);
  return { lane: mirrorLane, args: ['--tree-exempt-sha256', sha256(Buffer.from(bytes))] };
});
accept('honest-run-window-at-bound', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 20000).toISOString(); });
accept('honest-chooser-wait-at-bounds', (r) => { legOf(r, 'sp-click-then-show').chooserWaitMs = 0; legOf(r, 'sp-cdp-gesture').chooserWaitMs = 3000; });

// replay: a relabelled copy of a prior (fresh tokens/ids, the expected nonce and fixture hash, so
// only the timeline is copied). `shiftAll` moves every event off TOL and moves the gap's upper
// event by a different amount, so both the pair side and the gap-duration side stop matching.
const gapUpper = (r) => {
  const flat = arr(r.legs).flatMap((l) => arr(l.pageEvents).map((e, i) => ({ l, i, at: e.at }))).sort((a, b) => a.at - b.at);
  for (let i = 1; i < flat.length; i++) if (flat[i].at - flat[i - 1].at >= 50) return flat[i];
  return null;
};
function copyPrior(r, ctx) {
  const prior = clone(ctx.priors[0]);
  for (const key of Object.keys(r)) delete r[key];
  Object.assign(r, prior);
  rewriteNonce(r, expectNonce);
  r.fixture.sha256 = expectFixture;
  for (const l of arr(r.legs)) {
    const tok = crypto.randomBytes(6).toString('hex');
    l.launchToken = tok;
    const i = l.argv.findIndex((a) => a.startsWith('--user-data-dir='));
    l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice('--user-data-dir='.length)), 'profile-' + tok);
    const bid = crypto.randomUUID();
    l.devtoolsListening = { url: 'ws://127.0.0.1:' + r.ports.cdp + '/devtools/browser/' + bid, port: r.ports.cdp, browserId: bid };
    l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url;
  }
  return r;
}
const shiftEvent = (l, i, d) => { l.pageEvents[i].at = Math.round((l.pageEvents[i].at + d) * 10) / 10; };
const shiftAll = (r, delta) => {
  const up = gapUpper(r);
  for (const l of arr(r.legs)) for (let i = 0; i < arr(l.pageEvents).length; i++) {
    const isUp = up && up.l === l && up.i === i;
    shiftEvent(l, i, isUp ? delta + 1 : delta);
  }
  return r;
};
add('replay-copy-unshifted', 'replay-event-timeline', (r, ctx) => copyPrior(r, ctx), ['replay-launch-token', 'replay-devtools-url', 'leg-sp-click-then-show', 'leg-sp-click-control', 'leg-sp-disabled', 'leg-sp-multiple-show', 'leg-sp-cancel-armed', 'leg-sp-show-twice', 'leg-sp-cdp-gesture', 'leg-sp-intercept-off-click-then-show', 'leg-sp-nogesture-intercept-on', 'leg-sp-nogesture-intercept-off']);
accept('replay-copy-all-shifted', (r, ctx) => shiftAll(copyPrior(r, ctx), 1));

// replay threshold sweep: the verdict must track the counter's OWN printed counts at every k, and
// the sweep must cross from refused to accepted exactly once
cases.push({ name: 'replay-threshold-sweep', sweep: true, expect: null, accept: false, alsoAllowed: [], opts: {} });

// ---- execute ----
const priorPaths = [];
try { for (const line of fs.readFileSync(priorSet, 'utf8').split('\n')) { const t = line.trim(); if (t && !t.startsWith('#')) priorPaths.push(path.isAbsolute(t) ? t : path.join(lane, t)); } } catch (e) { usage('prior set unreadable: ' + e.message); }
const priors = [...priorPaths, ...extraPriors].map((p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }).filter(Boolean);
if (!priors.length) usage('the prior set names no readable receipt');
const priorEvents = arr(priors[0].legs).flatMap((l) => arr(l.pageEvents)).length;
const absNeed = Math.ceil(0.5 * priorEvents - 1e-9);
const ctx = { real, priors, absNeed, priorEvents };
const results = [];
let failed = 0;
for (const c of cases) {
  if (c.sweep) {
    const np = priorEvents;
    const seen = [];
    for (let k = 0; k <= np; k++) {
      const r = copyPrior(clone(real), ctx);
      // one event per k, as a suffix of each leg in turn (+1 ms keeps each leg monotonic), so the
      // absMatched sequence steps by 0 or 1 and the threshold window cannot be skipped
      const up = gapUpper(r);
      const order = arr(r.legs).flatMap((l) => arr(l.pageEvents).map((e, i) => ({ l, i })).reverse());
      for (let j = 0; j < k && j < order.length; j++) shiftEvent(order[j].l, order[j].i, 1);
      if (up) shiftEvent(up.l, up.i, 1);
      const p = writeCase(c.name + '-k' + k, r);
      const out = runCounter(p, lane, []);
      const s0 = out.json && out.json.limit && out.json.limit.perPrior[0];
      const wantRefused = s0 ? (s0.absMatched >= s0.absNeed || s0.gapMatched >= s0.gapNeed) : null;
      const gotRefused = !!(out.json && arr(out.json.findings).some((f) => f.id === 'replay-event-timeline'));
      seen.push({ k, absMatched: s0 && s0.absMatched, gapMatched: s0 && s0.gapMatched, absNeed: s0 && s0.absNeed, gapNeed: s0 && s0.gapNeed, refused: gotRefused, consistent: wantRefused === gotRefused, otherIds: out.json ? arr(out.json.findings).map((f) => f.id).filter((id) => id !== 'replay-event-timeline') : ['unparsable'] });
    }
    const inconsistent = seen.filter((x) => !x.consistent || x.otherIds.length > 0);
    const transitions = seen.filter((x, i) => i > 0 && x.refused !== seen[i - 1].refused).length;
    // the crossing point itself is the threshold: the first accepted k must be the first k whose
    // PRINTED counts are below both needs (a widened threshold crosses earlier and fails here)
    const firstAccepted = (seen.find((x) => !x.refused) || {}).k;
    const firstBelow = (seen.find((x) => x.absMatched < x.absNeed && x.gapMatched < x.gapNeed) || {}).k;
    const ok = inconsistent.length === 0 && transitions === 1 && seen[0].refused === true && seen[seen.length - 1].refused === false && firstAccepted === firstBelow;
    if (!ok) failed++;
    results.push({ case: c.name, expect: 'verdict tracks the printed counts, one refused->accepted crossing at the arithmetic threshold', ok, detail: 'inconsistent ' + JSON.stringify(inconsistent.slice(0, 4)) + ' transitions ' + transitions + ' first ' + seen[0].refused + ' last ' + seen[seen.length - 1].refused + ' firstAccepted ' + firstAccepted + ' firstBelow ' + firstBelow });
    continue;
  }
  const r = clone(real);
  let laneArg = lane;
  let args = c.opts.args || [];
  try {
    const ret = c.mutate(r, ctx);
    if (ret && typeof ret.lane === 'string' && path.isAbsolute(ret.lane)) laneArg = ret.lane;
    if (ret && Array.isArray(ret.args)) args = ret.args;
  } catch (e) { results.push({ case: c.name, ok: false, detail: 'mutate threw: ' + e.message }); failed++; continue; }
  const p = writeCase(c.name, r);
  const out = runCounter(p, laneArg, args);
  let ok = false; let detail = '';
  if (c.accept) {
    ok = out.status === 0 && out.json && out.json.verdict === 'clean';
    detail = 'exit ' + out.status + ' verdict ' + (out.json ? out.json.verdict : 'unparsable') + ' findings ' + (out.json ? JSON.stringify(arr(out.json.findings).map((f) => f.id)) : out.stderr);
  } else {
    const ids = out.json ? arr(out.json.findings).map((f) => f.id) : [];
    const extra = ids.filter((id) => id !== c.expect && !c.alsoAllowed.includes(id));
    ok = out.status === 1 && ids.includes(c.expect) && extra.length === 0;
    detail = 'exit ' + out.status + ' ids ' + JSON.stringify(ids) + (extra.length ? ' unexpected ' + JSON.stringify(extra) : '') + (ids.includes(c.expect) ? '' : ' MISSING ' + c.expect) + (out.json ? '' : ' stdoutLen ' + out.stdoutLen + ' head ' + JSON.stringify(out.stdoutHead));
  }
  if (!ok) failed++;
  results.push({ case: c.name, expect: c.expect, ok, detail });
  if (!ok && firstFailure) break;
}
// coverage: every check id the counter declares must be an expected id somewhere
const honestRun = runCounter(realPath, lane, []);
const declared = honestRun.json ? Object.keys(honestRun.json.checks || {}) : [];
const covered = new Set(cases.filter((c) => !c.accept && !c.sweep).map((c) => c.expect));
const uncovered = declared.filter((id) => !covered.has(id));
const unknown = [...covered].filter((id) => !declared.includes(id));
const summary = {
  schema: 'tabi-r79-negatives-showpicker',
  cases: cases.length, passed: cases.length - failed, failed,
  coverage: { declared: declared.length, covered: covered.size, uncovered, unknown },
  brackets: {
    replay: { priorEvents, absNeed, pairSide: 'unshifted copy refuses; all-shifted copy accepts; the k-sweep crosses once and the verdict tracks the printed absMatched/gapMatched at every k', gapSide: 'gap-intact refuses on gapMatched >= gapNeed; gap-upper shifted accepts' },
    runWindow: { acceptAt: 20000, refuseAt: 10000 },
    chooserWaitMs: { acceptAt: [0, 3000], refuseAt: 'not bracketed (3001 not exercised)' },
  },
  unbracketed: ['chooserWaitMs upper bound 3001', 'MIN_OWN_EVENTS 20 (a 19-event receipt is not constructible without breaking the leg shapes)', 'GAP_MIN 50 (the honest timeline carries 1-2 own gaps; no fixture leg produces a >= 50 ms inter-event gap to bracket)', 'the gap rule\'s INDEPENDENT kill (pair count below threshold while the gap count is at threshold): an event shift moves both sides at once, and the fixture\'s single gap cannot be retimed without moving one of its pair events, so the gap side is bracketed only by the unshifted copy (refused) and the all-shifted copy (accepted)'],
  results,
};
if (asJson) process.stdout.write(JSON.stringify(summary, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ cases: summary.cases, passed: summary.passed, failed: summary.failed, coverage: summary.coverage, failures: results.filter((r) => !r.ok) }, null, 1) + '\n');
const ok = failed === 0 && uncovered.length === 0 && unknown.length === 0 && honestRun.status === 0;
process.exitCode = ok ? 0 : 1;

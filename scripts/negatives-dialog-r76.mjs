#!/usr/bin/env node
// Negative + must-accept battery for scripts/check-dialog-r76.mjs (tabi round 76, C1).
// Usage: node negatives-dialog-r76.mjs --lane <ABS lane> --real <receipt.json> --expect-driver-sha256 <hex>
//          --expect-nonce <the real receipt's expected nonce> --prior-set <file> [--prior <receipt.json> ...]
//          --work <ABS scratch dir> --laundered <degenerate receipt.json> (x3: page-stub, eval-trigger,
//          swap-accept) [--json] [--first-failure] [--jobs N]
// Structure carried from the round-75 battery: every case mutates the real receipt and runs the
// counter BY PATH (the counter beside this file); unless the case targets legshape-consistency the
// producer's legShape is LAUNDERED (recomputed from the counter's own re-derivation) so the summary
// check cannot fire on the mutation's behalf. A refusal case passes only when the counter exits 1,
// lists the expected id and lists NO other id except those the case names in `alsoAllowed`.
// MUST-ACCEPT cases must exit 0 with no finding. Coverage: every check id the counter declares must
// be the expected id of >= 1 refusal case. The three laundered degenerate receipts are REQUIRED.
// New for r76 (round-75 routed defects):
//  - BOUNDARY BRACKETS for every carried tolerance and threshold (r74 F4/F5, R75Mut1): the pair
//    tolerance (prior moved 0.049 ms -> refuse; 0.051 ms -> accept), the 0.1 ms grid tolerance
//    (2e-5 ms off-grid -> refuse; 5e-6 ms -> accept), the abs fraction (19 of 37 events exact ->
//    refuse; 18 -> accept) and the gap fraction (5 of 6 gaps -> refuse; 4 -> accept). Each bracket
//    case verifies with an exact replica of the counter's rule that it sits where it claims, and
//    errors (fails) if it does not.
//  - the summary reports the positive run's exit and finding ids, so kill power can attribute a
//    positive refusal to the mutant counter's own finding (R75Review2).
// Exit 0 = all cases as expected and full coverage; 1 = otherwise; 2 = usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-dialog-r76.mjs');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const lane = opt('lane'); const realPath = opt('real'); const pin = opt('expect-driver-sha256'); const work = opt('work'); const expectNonce = opt('expect-nonce'); const priorSet = opt('prior-set');
const extraPriors = multi('prior');
if (!lane || !path.isAbsolute(lane) || !realPath || !pin || !work || !path.isAbsolute(work) || !expectNonce || !priorSet) usage('--lane, --real, --expect-driver-sha256, --expect-nonce, --prior-set and an absolute --work are required');
const LAUNDER_EXPECT = { 'page-stub': 'send-log-allowlist', 'eval-trigger': 'dialog-call-count', 'swap-accept': 'dialog-call-params' };
const launderedPaths = multi('laundered');
const launderedKinds = launderedPaths.map((p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')).degenerate; } catch { return null; } });
if (launderedPaths.length !== 3 || Object.keys(LAUNDER_EXPECT).some((k) => !launderedKinds.includes(k))) usage('exactly three --laundered receipts are required, one per degenerate kind: ' + Object.keys(LAUNDER_EXPECT).join(', ') + ' (got ' + JSON.stringify(launderedKinds) + ')');
let real;
try { real = JSON.parse(fs.readFileSync(realPath, 'utf8')); } catch (e) { usage('real receipt unreadable: ' + e.message); }
fs.mkdirSync(work, { recursive: true });
const counterSrc = fs.readFileSync(COUNTER, 'utf8').split('\n');
const lineOf = (id) => { const i = counterSrc.findIndex((l) => l.includes(`check('${id}'`) || (id.startsWith('leg-') && l.includes('check(`leg-${name}-' + id.split('-').slice(-1)[0] + '`'))); return i >= 0 ? i + 1 : null; };
const clone = (v) => JSON.parse(JSON.stringify(v));
const renumber = (r) => { r.events.forEach((e, i) => { e.seq = i + 1; }); return r; };
const LEGS = ['start', 'alert-accept', 'confirm-accept', 'confirm-dismiss', 'prompt-text', 'prompt-noparam', 'prompt-dismiss', 'no-dialog', 'unload-dismiss', 'unload-accept'];
const RECORDED = LEGS.slice(0, -1);
const PER = ['seq', 'trusted', 'prevented', 'xy', 'ret', 'dialog', 'error', 'nav', 'state'];
const CLICK_LEGS = ['alert-accept', 'confirm-accept', 'confirm-dismiss', 'prompt-text', 'prompt-noparam', 'prompt-dismiss'];
const LAWS = ['trust-law', 'return-value-law', 'closed-echo-law', 'blocking-law', 'no-dialog-law', 'beforeunload-law', 'coordinate-law'];
const evsOf = (r, leg, pred = () => true) => r.events.filter((e) => e.leg === leg && pred(e));
const legOf = (r, leg) => r.legs.find((l) => l.name === leg);
const markAt = (r, leg) => r.legMarks[RECORDED.indexOf(leg) + 1].at;
const nextMarkAt = (r, leg) => { const i = RECORDED.indexOf(leg) + 2; return i < r.legMarks.length ? r.legMarks[i].at : r.closedAt; };
const q = (v) => Math.round(v * 10) / 10;
const insertAt = (r, leg, ev) => {
  // insert after the last event at or before `leg`, inside that leg's page-time window, on the
  // 0.1 ms grid, with strict field types (a pointer event on button a)
  let idx = -1; const order = LEGS.indexOf(leg);
  r.events.forEach((e, i) => { if (LEGS.indexOf(e.leg) <= order) idx = i; });
  const prev = idx >= 0 ? r.events[idx] : null;
  const lo = RECORDED.includes(leg) ? markAt(r, leg) : r.closedAt;
  const at = q(Math.max(prev ? prev.at : 0, lo) + 0.1);
  if (RECORDED.includes(leg) && at > nextMarkAt(r, leg)) throw new Error('insertAt: no room in leg window ' + leg);
  r.events.splice(idx + 1, 0, { type: 'pointerdown', seq: 0, leg, ts: at, at, isTrusted: true, target: 'a', x: 150, y: 120, buttons: 1, defaultPrevented: false, kind: null, ret: null, ...ev });
  return renumber(r);
};
const cases = [];
const add = (name, expect, mutate, alsoAllowed = [], launder = true, opts = {}) => cases.push({ name, expect, mutate, alsoAllowed, launder, accept: false, opts });
const accept = (name, mutate, opts = {}) => cases.push({ name, expect: null, mutate, alsoAllowed: [], launder: true, accept: true, opts });
const pushSend = (r, method, params) => { r.cdpSendLog.push({ id: r.cdpSendLog.length + 1, method, params }); };
const perLeg = (leg) => PER.map((k) => `leg-${leg}-${k}`);
const sends = (r, m) => r.cdpSendLog.filter((c) => c.method === m);
const evType = (r, leg, type) => r.events.find((e) => e.leg === leg && e.type === type);
const cdpEv = (r, m, k = 0) => r.cdpEventLog.filter((e) => e.method === m)[k];
const reid = (r, from, delta) => {
  // after removing/inserting sends at index `from`, renumber ids and every id that points at them
  const map = new Map(); r.cdpSendLog.forEach((c, k) => { map.set(c.id, k + 1); c.id = k + 1; });
  return map;
};

// ---- identity and run binding ----
add('schema', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-dialog-r75'; });
const rewriteNonce = (r, to) => {
  const old = r.nonce; r.nonce = to; r.nonceOnPage = to; r.serverLog.forEach((s) => { if (s.run === old) { s.run = to; s.query = 'run=' + encodeURIComponent(to); } });
  for (const c of r.cdpSendLog) { if (c.method === 'Page.navigate') c.params.url = c.params.url.replace(encodeURIComponent(old), encodeURIComponent(to)); if (c.method === 'Runtime.evaluate') c.params.expression = c.params.expression.split(JSON.stringify(old)).join(JSON.stringify(to)); }
};
add('nonce-shape', 'nonce-shape', (r) => { rewriteNonce(r, 'TABI-r76-x'); }, ['nonce-expected', 'fixture-hash']);
add('nonce-on-page', 'nonce-on-page', (r) => { r.nonceOnPage = 'tabi-r76-other'; });
add('scored-run-not-degenerate', 'scored-run-not-degenerate', (r) => { r.degenerate = 'page-stub'; });
add('degenerate-field-absent', 'scored-run-not-degenerate', (r) => { delete r.degenerate; });
add('server-log-binding', 'server-log-binding', (r) => { r.serverLog.forEach((s) => { if (s.run) s.run = 'tabi-r76-other'; }); });
add('server-log-next-twice', 'server-log-binding', (r) => { r.serverLog.push(clone(r.serverLog.find((s) => s.path === '/next'))); }, ['beforeunload-law']);
// pre-freeze kill-power trial survivor M-beforeunload-next-count-loose: the law itself must refuse a second /next
add('beforeunload-next-twice', 'beforeunload-law', (r) => { r.serverLog.push(clone(r.serverLog.find((s) => s.path === '/next'))); }, ['server-log-binding']);
add('server-log-other-path', 'server-log-binding', (r) => { r.serverLog.push({ path: '/x', query: '', run: '', status: 404 }); });
add('driver-pin', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); });
add('fixture-hash', 'fixture-hash', (r) => { r.fixture.sha256 = '0'.repeat(64); });
add('fixture-hash-next', 'fixture-hash', (r) => { r.fixture.nextSha256 = '0'.repeat(64); });
add('fixture-hash-absent', 'fixture-hash', (r) => { delete r.fixture.sha256; });
// R75Review1 F1/F2: exact host pins, not shapes
add('host-chromium-other-build', 'host-chromium', (r) => { r.host.chromium = 'Chromium 154.0.8059.84 Arch Linux'; });
add('host-chromium-headless-product', 'host-chromium', (r) => { r.host.cdpProduct = 'HeadlessChrome/155.0.8059.84'; });
add('host-chromium-protocol', 'host-chromium', (r) => { r.host.cdpProtocolVersion = '1.2'; });
add('host-argv-headful', 'host-argv', (r) => { r.host.argv.splice(1, 1); r.host.argv.splice(15, 0, '--no-sandbox'); });
add('host-argv-old-headless', 'host-argv', (r) => { r.host.argv[1] = '--headless=old'; });
add('host-argv-extra-headless', 'host-argv', (r) => { r.host.argv[13] = '--headless'; });
add('host-argv-profile-unbound', 'host-argv', (r) => { const i = r.host.argv.findIndex((a) => a.startsWith('--user-data-dir=')); r.host.argv[i] = r.host.argv[i].replace('profile-', 'profile-x'); });
add('host-argv-binary', 'host-argv', (r) => { r.host.argv[0] = '/usr/bin/google-chrome'; });
// trial survivor M-argv-headless-dropped: --headless=new present but not at its frozen position
add('host-argv-reordered', 'host-argv', (r) => { [r.host.argv[1], r.host.argv[2]] = [r.host.argv[2], r.host.argv[1]]; });
add('devtools-port-binding', 'devtools-port-binding', (r) => { r.host.devtoolsListening.port += 1; });
add('devtools-stderr-absent', 'devtools-port-binding', (r) => { r.host.stderrHead = ''; });
add('run-window-short', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 2900).toISOString(); });
add('run-window-long', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 700000).toISOString(); });
add('plan-frozen', 'plan-frozen', (r) => { r.plan[4].handle.promptText = 'x'; });
add('plan-frozen-dropped-leg', 'plan-frozen', (r) => { r.plan.splice(7, 1); });
add('leg-order', 'leg-order', (r) => { r.legs.push(clone(r.legs[1])); }, ['leg-records']);
add('leg-order-swap', 'leg-order', (r) => { [r.legs[2].name, r.legs[3].name] = [r.legs[3].name, r.legs[2].name]; }, ['leg-records', ...perLeg('confirm-accept'), ...perLeg('confirm-dismiss'), 'beforeunload-law', 'closed-echo-law', 'dialog-event-binding'].filter((x) => !/-(seq|trusted|prevented|xy|ret)$/.test(x)));
// R75Review1 F5: every field of a leg record is read
add('leg-records-handleparams', 'leg-records', (r) => { legOf(r, 'confirm-dismiss').handleParams = { accept: true }; });
// trial survivor M-legrec-handleparams-dropped: record AND send rewritten consistently (only the plan disagrees)
add('leg-records-handleparams-and-send', 'leg-records', (r) => { const l = legOf(r, 'confirm-dismiss'); l.handleParams = { accept: true }; r.cdpSendLog.find((c) => c.id === l.handleSendId).params = { accept: true }; }, ['dialog-call-params']);
add('leg-records-trigger-result-extra', 'leg-records', (r) => { legOf(r, 'alert-accept').triggerResult = { cdpResult: 1 }; });
add('leg-records-nav-result-missing-loader', 'leg-records', (r) => { delete legOf(r, 'unload-accept').triggerResult.loaderId; }, ['beforeunload-law']);
add('leg-records-nav-download', 'leg-records', (r) => { legOf(r, 'unload-dismiss').triggerResult.isDownload = true; });
add('leg-records-elapsed-string', 'leg-records', (r) => { legOf(r, 'alert-accept').elapsedMs = '300'; });
add('leg-records-elapsed-short', 'leg-records', (r) => { legOf(r, 'alert-accept').elapsedMs = 20; });
add('leg-records-opened-false', 'leg-records', (r) => { legOf(r, 'prompt-text').opened = false; });
add('leg-records-extra-key', 'leg-records', (r) => { legOf(r, 'start').cdpResult = {}; });
add('leg-records-handle-send-moved', 'leg-records', (r) => { const l = legOf(r, 'alert-accept'); l.handleSendId = legOf(r, 'confirm-accept').handleSendId; }, ['leg-alert-accept-dialog', 'dialog-event-binding', 'closed-echo-law']);
add('seq-monotonic', 'seq-monotonic', (r) => { r.events[3].seq = 999; });
add('event-leg-domain', 'event-leg-domain', (r) => { r.events[r.events.length - 1].leg = 'end'; }, ['event-leg-window', 'beforeunload-law', ...perLeg('unload-dismiss').filter((x) => !/-(dialog|error|nav|state|ret)$/.test(x))]);
add('event-leg-fabricated-label', 'event-leg-domain', (r) => { r.events[0].leg = 'alert-accept2'; }, ['event-leg-window', 'coordinate-law', 'blocking-law', 'leg-alert-accept-seq', 'leg-alert-accept-trusted', 'leg-alert-accept-prevented', 'leg-alert-accept-xy']);
add('event-types-ts-string', 'event-types', (r) => { evsOf(r, 'confirm-accept')[0].ts = String(evsOf(r, 'confirm-accept')[0].ts); }, ['event-time-quantum']);
add('event-types-trusted-string', 'event-types', (r) => { evsOf(r, 'confirm-accept')[0].isTrusted = 'true'; }, ['leg-confirm-accept-trusted', 'trust-law']);
add('event-types-unknown-type', 'event-types', (r) => { evsOf(r, 'confirm-accept')[1].type = 'mouseDown'; }, ['leg-confirm-accept-seq']);
add('event-types-x-float', 'event-types', (r) => { evsOf(r, 'confirm-accept')[0].x = 300.5; }, ['leg-confirm-accept-xy', 'coordinate-law']);
add('event-types-half-null-xy', 'event-types', (r) => { evsOf(r, 'confirm-accept')[0].buttons = null; }, ['leg-confirm-accept-xy']);
add('event-types-ret-on-pointer', 'event-types', (r) => { evsOf(r, 'confirm-accept')[0].ret = 'true'; });
add('event-types-return-kind', 'event-types', (r) => { evType(r, 'confirm-accept', 'dialog-return').kind = 'beep'; }, ['leg-confirm-accept-ret', 'return-value-law']);
add('event-types-unload-xy', 'event-types', (r) => { Object.assign(evType(r, 'unload-dismiss', 'beforeunload'), { x: 1, y: 1, buttons: 0 }); }, ['leg-unload-dismiss-xy', 'coordinate-law']);
add('event-time-quantum', 'event-time-quantum', (r) => { evsOf(r, 'confirm-accept')[0].ts += 0.03; });
add('event-time-quantum-at', 'event-time-quantum', (r) => { const e = evsOf(r, 'prompt-text'); e[e.length - 1].at += 0.03; });
// grid-tolerance bracket (r74 F5: grid 1e-4 -> 0.02 survived): 2e-5 ms off-grid is refused
add('event-time-quantum-bracket-2e-5', 'event-time-quantum', (r) => { const e = evsOf(r, 'prompt-text'); e[e.length - 1].at = q(e[e.length - 1].at) + 2e-5; });
add('leg-marks-late', 'leg-marks', (r) => { r.lateAfterClose = 1; }, ['event-leg-window']);
add('leg-marks-fabricated-name', 'leg-marks', (r) => { r.legMarks[3].name = 'confirm-x'; }, ['event-leg-window']);
add('leg-marks-closed-early', 'leg-marks', (r) => { r.closedAt = r.legMarks[r.legMarks.length - 1].at - 1; }, ['event-leg-window']);
add('event-leg-window-late-label', 'event-leg-window', (r) => { const e = evsOf(r, 'alert-accept'); e[e.length - 1].at = q(markAt(r, 'confirm-accept') + 0.1); }, ['blocking-law']);
add('event-leg-window-order', 'event-leg-window', (r) => { const e = evsOf(r, 'confirm-dismiss'); e[1].at = q(e[0].at - 0.1); });
// ---- producer: real clicks, real dialogs, closed allow-list ----
const firstOf = (r, m) => r.cdpSendLog.findIndex((c) => c.method === m);
add('dialog-call-count-extra-handle', 'dialog-call-count', (r) => { pushSend(r, 'Page.handleJavaScriptDialog', { accept: true }); }, ['dialog-call-params']);
add('dialog-call-count-case-variant', 'dialog-call-count', (r) => { pushSend(r, 'input.dispatchMouseEvent', clone(sends(r, 'Input.dispatchMouseEvent')[0].params)); }, ['dialog-call-params', 'send-log-allowlist']);
add('dialog-call-count-third-navigate', 'dialog-call-count', (r) => { pushSend(r, 'Page.navigate', clone(sends(r, 'Page.navigate')[1].params)); }, ['dialog-call-params']);
add('dialog-call-count-emulate-touch', 'dialog-call-count', (r) => { pushSend(r, 'Input.emulateTouchFromMouseEvent', { type: 'mouseMoved', x: 1, y: 1, button: 'none' }); }, ['dialog-call-params', 'send-log-allowlist']);
add('dialog-call-params', 'dialog-call-params', (r) => { sends(r, 'Input.dispatchMouseEvent')[0].params.x = 151; });
add('dialog-call-params-answer', 'dialog-call-params', (r) => { const h = r.cdpSendLog.find((c) => c.id === legOf(r, 'confirm-accept').handleSendId); h.params.accept = false; }, ['leg-records']);
add('dialog-call-params-prompt-text', 'dialog-call-params', (r) => { const h = r.cdpSendLog.find((c) => c.id === legOf(r, 'prompt-noparam').handleSendId); h.params.promptText = ''; }, ['leg-records']);
add('dialog-call-params-order', 'dialog-call-params', (r) => { const a = sends(r, 'Input.dispatchMouseEvent'); const [x, y] = [a[0], a[2]]; const t = clone(x.params); x.params = clone(y.params); y.params = t; });
add('cdp-event-log-extra-key', 'cdp-event-log-closed', (r) => { r.cdpEventLog[1].ts = 1; }, ['leg-alert-accept-dialog', 'closed-echo-law']);
add('cdp-event-log-param-key', 'cdp-event-log-closed', (r) => { cdpEv(r, 'Page.javascriptDialogClosed', 0).params.extra = 1; }, ['leg-alert-accept-dialog', 'closed-echo-law']);
add('cdp-event-log-other-event', 'cdp-event-log-closed', (r) => { r.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: 'x', mode: 'selectSingle' }, afterSendId: 1 }); }, ['dialog-event-binding']);
add('cdp-event-log-extra-opening', 'cdp-event-log-closed', (r) => { r.cdpEventLog.splice(2, 0, clone(r.cdpEventLog[1])); }, ['dialog-event-binding', 'leg-alert-accept-dialog']);
add('dialog-event-binding-late-opening', 'dialog-event-binding', (r) => { cdpEv(r, 'Page.javascriptDialogOpening', 2).afterSendId += 1; }, ['leg-confirm-dismiss-dialog', 'closed-echo-law']);
add('dialog-event-binding-frame-id', 'dialog-event-binding', (r) => { cdpEv(r, 'Page.javascriptDialogClosed', 3).params.frameId = '0'.repeat(32); });
add('dialog-event-binding-nav-order', 'dialog-event-binding', (r) => { const k = r.cdpEventLog.length - 1; [r.cdpEventLog[k - 1], r.cdpEventLog[k]] = [r.cdpEventLog[k], r.cdpEventLog[k - 1]]; }, ['leg-unload-accept-dialog']);
add('dialog-event-binding-nav-not-main', 'dialog-event-binding', (r) => { cdpEv(r, 'Page.frameNavigated', 1).params.isMain = false; });
const LOOK = [
  ['stub-confirm', 'Runtime.evaluate', { expression: 'window.confirm = () => true', returnByValue: true }],
  ['script-click', 'Runtime.evaluate', { expression: 'document.getElementById("c").click()', returnByValue: true }],
  ['events-push', 'Runtime.evaluate', { expression: 'window.__events.push({type:"dialog-return"})', returnByValue: true }],
  ['call-function-on', 'Runtime.callFunctionOn', { functionDeclaration: 'function(){ confirm("x") }' }],
  ['file-chooser', 'Page.setInterceptFileChooserDialog', { enabled: true }],
  ['add-script', 'Page.addScriptToEvaluateOnNewDocument', { source: 'window.alert = () => {}' }],
  ['bypass-csp', 'Page.setBypassCSP', { enabled: true }],
  ['page-disable', 'Page.disable', {}],
];
for (const [nm, m, p] of LOOK) add('lookalike-' + nm, 'send-log-allowlist', (r) => { pushSend(r, m, p); });
add('allowlist-dmo-scale-param', 'send-log-allowlist', (r) => { r.cdpSendLog.find((x) => x.method === 'Emulation.setDeviceMetricsOverride').params.scale = 2; });
add('allowlist-eval-extra-param', 'send-log-allowlist', (r) => { r.cdpSendLog.find((x) => x.method === 'Runtime.evaluate').params.awaitPromise = true; });
add('allowlist-frame-tree-twice', 'send-log-allowlist', (r) => { pushSend(r, 'Page.getFrameTree', {}); });
add('allowlist-id-gap', 'send-log-allowlist', (r) => { r.cdpSendLog[3].id += 100; });
add('allowlist-params-absent', 'send-log-allowlist', (r) => { delete r.cdpSendLog.find((x) => x.method === 'Page.enable').params; });
add('teardown-closure', 'teardown-closure', (r) => { r.teardown.survivors = [4242]; });
add('teardown-sweep-count', 'teardown-closure', (r) => { r.teardown.postKillSweepCount = 1; });
add('teardown-port-open', 'teardown-closure', (r) => { r.teardown.portProbes.devtools = 'open'; });
add('failures-empty', 'failures-empty', (r) => { r.failures.push({ id: 'drive-error', detail: 'x' }); });
// ---- producer-verdict polarity (r62 M5): every non-(true, 'CONFIRMED') pair ----
const POL = [['false-CONFIRMED', false, 'CONFIRMED'], ['true-REFUTED', true, 'REFUTED'], ['false-REFUTED', false, 'REFUTED'], ['null-CONFIRMED', null, 'CONFIRMED'],
  ['string-true', 'true', 'CONFIRMED'], ['one', 1, 'CONFIRMED'], ['true-UNKNOWN', true, 'UNKNOWN'], ['true-lowercase', true, 'confirmed'], ['true-UNMEASURED', true, 'UNMEASURED'], ['true-null', true, null]];
for (const [nm, p, h] of POL) add('producer-verdict-' + nm, 'producer-verdict', (r) => { r.predicate = p; r.dialogHypothesis = h; });
add('producer-verdict-old-field', 'producer-verdict', (r) => { delete r.dialogHypothesis; r.dragHypothesis = 'CONFIRMED'; });
add('legshape-consistency', 'legshape-consistency', (r) => { r.legShape['prompt-text'].ret[0][1] = 'x'; }, [], false);
add('legshape-fabricated-leg', 'legshape-consistency', (r) => { r.legShape.extra = r.legShape['start']; }, [], false);
// ---- replay refusal and prior-set completeness ----
const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
const otherUuid = (u) => u.slice(0, -1) + (u.endsWith('0') ? '1' : '0');
const swapUrl = (x) => { const d = x.host.devtoolsListening; const id = d.url.split('/devtools/browser/')[1]; const nu = otherUuid(id); x.host.stderrHead = x.host.stderrHead.split(id).join(nu); d.url = d.url.replace(id, nu); if (typeof d.browserId === 'string') d.browserId = nu; };
const swapToken = (x) => { const o = x.host.launchToken; const nt = o.slice(0, -1) + (o.endsWith('0') ? '1' : '0'); x.host.launchToken = nt; x.host.argv = x.host.argv.map((a) => a.split(o).join(nt)); };
const shiftTs = (x, d) => { x.events.forEach((e) => { e.ts = q(e.ts + d); e.at = q(e.at + d); }); };
// deterministic non-uniform re-timing: event i moves by (1 + (i * 7) % 13) * 0.3 ms
const jitter = (x) => { x.events.forEach((e, i) => { const d = (1 + ((i * 7) % 13)) * 0.3; e.ts = q(e.ts + d); e.at = q(e.at + d); }); };
const priorIds = (p) => { swapToken(p); swapUrl(p); return p; };
// exact replica of the counter's timeline rule (TOL 0.05, GAP_MIN 50), used to place bracket cases
const TOL = 0.05, GAP_MIN = 50;
const pairsOf = (x) => x.events.filter((e) => typeof e.ts === 'number' && typeof e.at === 'number');
const absFrac = (a, b) => { const y = pairsOf(b).map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of pairsOf(a)) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return [n, pairsOf(a).length]; };
const gapsOf = (x) => { const at = pairsOf(x).map((e) => e.at).sort((p, q2) => p - q2); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const gapFrac = (a, b) => { const x = [...gapsOf(a)].sort((p, q2) => p - q2), y = [...gapsOf(b)].sort((p, q2) => p - q2); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return [n, x.length]; };
// A bracket names the matched count it sets on its own side; the OTHER side must stay strictly
// below its threshold (null = "below threshold"), so that only the bracketed rule decides the case.
// (Pre-freeze pass 1 required the other side to be exactly 0 and misplaced 7 of 9 smokes, where an
// alternating shift leaves 1-2 of 6 gaps unchanged: lesson-proof/prefreeze-pass1/.)
const placed = (p, wantAbs, wantGap) => {
  const [an, ad] = absFrac(real, p), [gn, gd] = gapFrac(real, p);
  const absOk = wantAbs === null ? an < absNeed : an === wantAbs, gapOk = wantGap === null ? gn < gapNeed : gn === wantGap;
  if (!absOk || !gapOk) throw new Error('bracket misplaced: abs ' + an + '/' + ad + ' gap ' + gn + '/' + gd + ' want ' + (wantAbs ?? '<' + absNeed) + ' / ' + (wantGap ?? '<' + gapNeed));
  return p;
};
const nEv = real.events.length, nGap = gapsOf(real).length;
const absNeed = Math.ceil(nEv * 0.5 - 1e-9), gapNeed = Math.ceil(nGap * 0.75 - 1e-9);
// keep `keep` events exact (even indices first), move the rest by distinct >= 0.3 ms amounts (never two neighbours together)
const keepExact = (p, keep) => { const even = p.events.map((_, i) => i).filter((i) => i % 2 === 0); const kept = new Set(even.slice(0, keep)); p.events.forEach((e, i) => { if (!kept.has(i)) { const d = 0.3 * (1 + (i % 5)); e.ts = q(e.ts + d); e.at = q(e.at + d); } }); return p; };
// whole-timeline shift by 1 ms (abs 0), then break `brk` gaps by shifting every event after each
// chosen gap boundary by a further `d` ms; the first d in the list whose result matches exactly
// `wantGap` gaps is used (a broken gap can land within 0.05 ms of another honest gap: pass 1 smoke3)
const breakGaps = (p0, brk, wantGap) => {
  for (const d of [0.3, 1.7, 7.3, 13.1, 29.9]) {
    const p = clone(p0); shiftTs(p, 1.0);
    const order = p.events.map((e, i) => [e.at, i]).sort((a, b) => a[0] - b[0]);
    const bounds = []; for (let k = 1; k < order.length; k++) if (order[k][0] - order[k - 1][0] >= GAP_MIN) bounds.push(k);
    for (const k of bounds.slice(0, brk)) for (let m = k; m < order.length; m++) { const e = p.events[order[m][1]]; e.at = q(e.at + d); e.ts = q(e.ts + d); }
    if (gapFrac(real, p)[0] === wantGap) return p;
  }
  throw new Error('breakGaps: no shift in the list yields ' + wantGap + ' matched gaps');
};
add('nonce-expected', 'nonce-expected', () => {}, ['prior-set-complete'], true, { nonce: 'tabi-r76-other' });
add('replay-byte-identical', 'replay-launch-token', () => {}, REPLAY, true, { priorReal: true });
add('replay-nonce-stamps-rewritten', 'replay-launch-token', (r) => {
  rewriteNonce(r, 'tabi-r76-replay-x');
  for (const k of ['startedAt', 'finishedAt']) r[k] = new Date(Date.parse(r[k]) + 3600000).toISOString();
}, [...REPLAY, 'fixture-hash'], true, { priorReal: true, nonce: 'tabi-r76-replay-x' });
add('replay-token-only-shared', 'replay-launch-token', () => {}, [], true, { prior: (p) => { swapUrl(p); jitter(p); return p; } });
add('replay-url-only-shared', 'replay-devtools-url', () => {}, [], true, { prior: (p) => { swapToken(p); jitter(p); return p; } });
add('replay-url-uppercase', 'replay-devtools-url', () => {}, [], true, { prior: (p) => { swapToken(p); jitter(p); p.host.devtoolsListening.url = p.host.devtoolsListening.url.toUpperCase().replace('WS://', 'ws://').replace('/DEVTOOLS/BROWSER/', '/devtools/browser/'); return p; } });
add('replay-timeline-only-shared', 'replay-event-timeline', () => {}, [], true, { prior: priorIds });
add('replay-timeline-whole-shift-1ms', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); shiftTs(p, 1.0); return p; } });
add('replay-timeline-whole-shift-100ms', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); shiftTs(p, 100); return p; } });
add('replay-timeline-prior-has-extra-event', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); p.events.splice(4, 0, clone(p.events[4])); renumber(p); return p; } });
add('replay-timeline-prior-missing-event', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); p.events.splice(4, 1); renumber(p); return p; } });
// BRACKETS (r74 F4/F5 class): each side of every carried tolerance/threshold
add('replay-timeline-tol-in-0.049', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); p.events.forEach((e, i) => { const d = i % 2 ? 0.049 : -0.049; e.ts += d; e.at += d; }); return placed(p, nEv, null); } });
add('replay-timeline-abs-at-threshold', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); keepExact(p, absNeed); return placed(p, absNeed, null); } });
add('replay-timeline-gap-at-threshold', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); return placed(breakGaps(p, nGap - gapNeed, gapNeed), 0, gapNeed); } });
add('replay-timeline-too-few-gaps', 'replay-event-timeline', (r) => { r.events = r.events.filter((e) => e.leg !== 'unload-dismiss'); renumber(r); }, ['beforeunload-law', 'leg-unload-dismiss-seq', 'leg-unload-dismiss-trusted', 'leg-unload-dismiss-prevented', 'leg-unload-dismiss-xy']);
add('replay-launch-token-shape', 'replay-launch-token', (r) => { const o = r.host.launchToken; r.host.launchToken = 'x'; r.host.argv = r.host.argv.map((a) => a.split(o).join('x')); });
// prior-set completeness (R75Review1 F6): a lane receipt of this schema outside the priors
add('prior-set-complete-omitted', 'prior-set-complete', () => {}, [], true, { dropFirstPrior: true });

// ---- cross-leg laws ----
add('trust-law', 'trust-law', (r) => { evType(r, 'confirm-accept', 'dialog-return').isTrusted = false; }, ['leg-confirm-accept-trusted']);
add('trust-law-unload', 'trust-law', (r) => { evType(r, 'unload-dismiss', 'beforeunload').isTrusted = false; }, ['leg-unload-dismiss-trusted']);
add('return-value-prompt-default', 'return-value-law', (r) => { evType(r, 'prompt-noparam', 'dialog-return').ret = 'string:tabi-default'; }, ['leg-prompt-noparam-ret']);
add('return-value-dismiss-text', 'return-value-law', (r) => { evType(r, 'prompt-dismiss', 'dialog-return').ret = 'string:tabi-ignored'; }, ['leg-prompt-dismiss-ret']);
add('return-value-confirm-flip', 'return-value-law', (r) => { evType(r, 'confirm-dismiss', 'dialog-return').ret = 'true'; }, ['leg-confirm-dismiss-ret']);
add('closed-echo-dismiss-text', 'closed-echo-law', (r) => { cdpEv(r, 'Page.javascriptDialogClosed', 5).params.userInput = ''; }, ['leg-prompt-dismiss-dialog']);
add('closed-echo-result', 'closed-echo-law', (r) => { cdpEv(r, 'Page.javascriptDialogClosed', 1).params.result = false; }, ['leg-confirm-accept-dialog']);
add('closed-echo-message', 'closed-echo-law', (r) => { cdpEv(r, 'Page.javascriptDialogOpening', 0).params.message = 'tabi-alert2'; }, ['leg-alert-accept-dialog']);
add('closed-echo-handler', 'closed-echo-law', (r) => { cdpEv(r, 'Page.javascriptDialogOpening', 6).params.hasBrowserHandler = false; }, ['leg-unload-dismiss-dialog']);
add('blocking-zero-block', 'blocking-law', (r) => { const e = evType(r, 'prompt-text', 'dialog-return'); e.at = e.ts; }, ['event-leg-window']);
add('blocking-return-after-click', 'blocking-law', (r) => { const es = evsOf(r, 'alert-accept'); const i = r.events.indexOf(es[4]); [r.events[i], r.events[i + 1]] = [r.events[i + 1], r.events[i]]; renumber(r); }, ['leg-alert-accept-seq', 'leg-alert-accept-xy', 'event-leg-window']);
// trial survivor M-block-click-order-dropped: the law itself must refuse a click recorded before the return
add('blocking-click-before-return-at', 'blocking-law', (r) => { const es = evsOf(r, 'alert-accept'); es[5].at = q(es[4].at - 0.1); }, ['event-leg-window']);
add('no-dialog-code', 'no-dialog-law', (r) => { legOf(r, 'no-dialog').handleError.code = -32000; }, ['leg-no-dialog-error']);
add('no-dialog-success', 'no-dialog-law', (r) => { const l = legOf(r, 'no-dialog'); l.handleError = null; l.handleResult = {}; }, ['leg-no-dialog-error']);
add('beforeunload-unprevented', 'beforeunload-law', (r) => { evType(r, 'unload-dismiss', 'beforeunload').defaultPrevented = false; }, ['leg-unload-dismiss-prevented']);
add('beforeunload-dismiss-navigated', 'beforeunload-law', (r) => { legOf(r, 'unload-dismiss').stateAfter.path = '/next'; }, ['leg-unload-dismiss-state']);
add('beforeunload-accept-aborted', 'beforeunload-law', (r) => { const t = legOf(r, 'unload-accept').triggerResult; delete t.loaderId; t.errorText = 'net::ERR_ABORTED'; }, ['leg-records', 'leg-unload-accept-nav']);
add('coordinate-law', 'coordinate-law', (r) => { evType(r, 'prompt-text', 'click').x += 1; }, ['leg-prompt-text-xy']);
add('coordinate-law-y', 'coordinate-law', (r) => { evType(r, 'prompt-text', 'click').y += 1; }, ['leg-prompt-text-xy']);
add('coordinate-law-target', 'coordinate-law', (r) => { evType(r, 'prompt-text', 'pointerdown').target = 'c'; }, ['leg-prompt-text-seq']);
// ---- per-leg checks ----
for (const leg of LEGS) {
  const evs = evsOf(real, leg);
  const has = evs.length > 0;
  const rl = real.legs.find((l) => l.name === leg);
  const noEv = PER.filter((k) => ['seq', 'trusted', 'prevented', 'xy'].includes(k)).map((k) => `leg-${leg}-${k}`);
  if (has) {
    add(`${leg}-seq`, `leg-${leg}-seq`, (r) => { const e = evsOf(r, leg); e[0].type = e[0].type === 'pointerdown' ? 'mousedown' : 'pointerdown'; }, ['blocking-law', 'beforeunload-law', 'event-types', 'coordinate-law', 'trust-law']);
    add(`${leg}-trusted`, `leg-${leg}-trusted`, (r) => { const e = evsOf(r, leg); e[0].isTrusted = !e[0].isTrusted; }, ['trust-law']);
    add(`${leg}-prevented`, `leg-${leg}-prevented`, (r) => { const e = evsOf(r, leg); e[0].defaultPrevented = !e[0].defaultPrevented; }, ['beforeunload-law']);
    add(`${leg}-xy`, `leg-${leg}-xy`, (r) => { const e = evsOf(r, leg).find((x) => x.x !== null); if (e) e.buttons = e.buttons === 0 ? 2 : 0; else { const b = evsOf(r, leg)[0]; Object.assign(b, { x: 0, y: 0, buttons: 0 }); } }, ['event-types', 'coordinate-law']);
  } else {
    for (const k of ['seq', 'trusted', 'prevented', 'xy']) add(`${leg}-${k}`, `leg-${leg}-${k}`, (r) => { insertAt(r, leg, {}); }, [...noEv, 'coordinate-law', 'event-leg-domain', 'event-leg-window', 'no-dialog-law', 'leg-marks']);
  }
  if (evs.some((e) => e.type === 'dialog-return')) add(`${leg}-ret`, `leg-${leg}-ret`, (r) => { evType(r, leg, 'dialog-return').ret = 'string:zz'; }, ['return-value-law']);
  else add(`${leg}-ret`, `leg-${leg}-ret`, (r) => { insertAt(r, leg, { type: 'dialog-return', x: null, y: null, buttons: null, kind: 'alert', ret: 'undefined' }); }, [...noEv, 'return-value-law', 'event-leg-domain', 'event-leg-window', 'no-dialog-law', 'leg-marks', 'blocking-law']);
  if (rl.triggerSendId !== null) add(`${leg}-dialog`, `leg-${leg}-dialog`, (r) => { const l = legOf(r, leg); const o = r.cdpEventLog.find((e) => e.method === 'Page.javascriptDialogOpening' && e.afterSendId === l.triggerSendId); o.params.url = o.params.url.replace('/?run', '/x?run').replace('/next?run', '/x?run'); });
  else add(`${leg}-dialog`, `leg-${leg}-dialog`, (r) => { legOf(r, leg).triggerSendId = legOf(r, 'alert-accept').triggerSendId; }, ['leg-records', 'leg-alert-accept-dialog']);
  if (rl.handleError) add(`${leg}-error`, `leg-${leg}-error`, (r) => { legOf(r, leg).handleError.message = 'No dialog is showing.'; }, ['no-dialog-law']);
  else add(`${leg}-error`, `leg-${leg}-error`, (r) => { const l = legOf(r, leg); l.handleError = { code: -32000, message: 'x' }; l.handleResult = null; }, ['leg-records', 'no-dialog-law']);
  if (rl.kind === 'navigate') add(`${leg}-nav`, `leg-${leg}-nav`, (r) => { const t = legOf(r, leg).triggerResult; if (t.errorText) t.errorText = 'net::ERR_FAILED'; else t.errorText = 'net::ERR_ABORTED'; }, ['leg-records', 'beforeunload-law']);
  else add(`${leg}-nav`, `leg-${leg}-nav`, (r) => { const l = legOf(r, leg); l.kind = 'navigate'; l.triggerResult = { ...(l.triggerResult || {}), errorText: 'net::ERR_ABORTED' }; }, ['leg-records']);
  add(`${leg}-state`, `leg-${leg}-state`, (r) => { const s = legOf(r, leg).stateAfter; if ('dialogs' in s) s.dialogs += 1; else s.runIsNonce = false; });
  if (leg !== 'unload-accept') add(`${leg}-state-last`, `leg-${leg}-state`, (r) => { legOf(r, leg).stateAfter.last += 'Z'; });
}

// ---- MUST-ACCEPT (exit 0, no finding) ----
accept('accept-real-key-order', (r) => { const o = {}; for (const k of Object.keys(r).reverse()) o[k] = r[k]; for (const k of Object.keys(r)) delete r[k]; Object.assign(r, o); });
accept('accept-prior-retimed-nonuniform', () => {}, { prior: (p) => { priorIds(p); jitter(p); return p; } });
accept('accept-mark-equal-event-at', (r) => { const e = evsOf(r, 'confirm-accept'); e[0].at = markAt(r, 'confirm-accept'); });
// BRACKETS, accepting side
accept('accept-grid-5e-6', (r) => { const e = evsOf(r, 'prompt-text'); e[e.length - 1].at = q(e[e.length - 1].at) + 5e-6; });
accept('accept-prior-tol-out-0.051', () => {}, { prior: (p) => { priorIds(p); p.events.forEach((e, i) => { const d = i % 2 ? 0.051 : -0.051; e.ts += d; e.at += d; }); return placed(p, 0, null); } });
accept('accept-prior-abs-below-threshold', () => {}, { prior: (p) => { priorIds(p); keepExact(p, absNeed - 1); return placed(p, absNeed - 1, null); } });
accept('accept-prior-gap-below-threshold', () => {}, { prior: (p) => { priorIds(p); return placed(breakGaps(p, nGap - gapNeed + 1, gapNeed - 1), 0, gapNeed - 1); } });

const JOBS = Math.max(1, Number(opt('jobs') || 8));
const psLines = fs.readFileSync(priorSet, 'utf8').split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
const runCounter = (file, c = null) => new Promise((resolve) => {
  const o = (c && c.opts) || {};
  const extra = [];
  let ps = priorSet;
  if (o.priorReal) extra.push('--prior', realPath);
  if (o.prior) { let pj; try { pj = o.prior(clone(real)); } catch (e) { resolve({ exit: null, findingIds: null, derived: null, error: e.message }); return; } const pf = path.join(work, 'prior-' + c.name + '.json'); fs.writeFileSync(pf, JSON.stringify(pj)); extra.push('--prior', pf); }
  if (o.dropFirstPrior) { ps = path.join(work, 'ps-' + c.name + '.txt'); fs.writeFileSync(ps, psLines.slice(1).join('\n') + '\n'); }
  const p = spawn(process.execPath, [COUNTER, '--lane', lane, '--receipt', file, '--expect-driver-sha256', pin, '--expect-nonce', o.nonce || expectNonce, '--prior-set', ps,
    ...extraPriors.flatMap((x) => ['--prior', x]), ...extra, '--json'], { stdio: ['ignore', 'pipe', 'ignore'] });
  let so = ''; p.stdout.on('data', (x) => { so += x; });
  const timer = setTimeout(() => p.kill('SIGKILL'), 60000);
  p.on('close', (code) => { clearTimeout(timer); let j = null; try { j = JSON.parse(so); } catch {} resolve({ exit: code, findingIds: j ? j.findings.map((f) => f.id) : null, derived: j ? j.derived : null }); });
});
const launderInto = async (r, f) => {
  const pre = await runCounter(f);
  if (pre.derived) { r.legShape = pre.derived; fs.writeFileSync(f, JSON.stringify(r)); }
};
const results = [];
const pos = await runCounter(realPath);
const positiveOk = pos.exit === 0 && Array.isArray(pos.findingIds) && pos.findingIds.length === 0;
const runCase = async (c) => {
  const r = clone(real);
  try { c.mutate(r); } catch (e) { return { case: c.name, class: c.accept ? 'must-accept' : 'refuse', expect: c.expect, error: 'mutation failed: ' + e.message, ok: false, isolated: false }; }
  const f = path.join(work, (c.accept ? 'acc-' : 'neg-') + c.name + '.json');
  fs.writeFileSync(f, JSON.stringify(r));
  if (c.launder) await launderInto(r, f);
  const o = await runCounter(f, c);
  if (o.error) return { case: c.name, class: c.accept ? 'must-accept' : 'refuse', expect: c.expect, error: o.error, ok: false, isolated: false };
  const ids = Array.isArray(o.findingIds) ? o.findingIds : [];
  if (c.accept) return { case: c.name, class: 'must-accept', exit: o.exit, findingIds: o.findingIds, isolated: false, ok: o.exit === 0 && Array.isArray(o.findingIds) && ids.length === 0, extra: ids };
  const extra = ids.filter((id) => id !== c.expect && !c.alsoAllowed.includes(id));
  return { case: c.name, class: 'refuse', expect: c.expect, counterLine: lineOf(c.expect), alsoAllowed: c.alsoAllowed, exit: o.exit, findingIds: o.findingIds, isolated: ids.length === 1 && ids[0] === c.expect, ok: o.exit === 1 && ids.includes(c.expect) && extra.length === 0, extra };
};
// --first-failure (kill-power mutant runs only): stop scheduling cases after the first case that is
// not as expected; the summary is then partial (stoppedEarly true) and never allOk.
const FIRST = argv.includes('--first-failure');
let stopped = FIRST && !positiveOk;
const caseResults = new Array(cases.length);
let nextCase = 0;
await Promise.all(Array.from({ length: JOBS }, async () => { while (nextCase < cases.length && !stopped) { const i = nextCase++; caseResults[i] = await runCase(cases[i]); if (FIRST && !caseResults[i].ok) stopped = true; } }));
results.push(...caseResults.filter(Boolean));
for (const lp of stopped ? [] : launderedPaths) {
  const d = JSON.parse(fs.readFileSync(lp, 'utf8'));
  const kind = d.degenerate; const expect = LAUNDER_EXPECT[kind];
  d.degenerate = null; d.predicate = true; d.dialogHypothesis = 'CONFIRMED'; d.failures = []; d.driverSha256 = pin;
  const f = path.join(work, 'laundered-' + kind + '.json');
  fs.writeFileSync(f, JSON.stringify(d));
  await launderInto(d, f);
  const o = await runCounter(f, { name: 'laundered-' + kind, opts: { nonce: d.nonce } });
  results.push({ case: 'laundered-' + kind, class: 'laundered', expect, counterLine: lineOf(expect), alsoAllowed: ['*'], exit: o.exit, findingIds: o.findingIds, isolated: false, ok: o.exit === 1 && Array.isArray(o.findingIds) && o.findingIds.includes(expect), extra: [] });
}
const listed = JSON.parse(spawnSync(process.execPath, [COUNTER, '--list-checks'], { encoding: 'utf8' }).stdout);
const covered = new Set(cases.filter((c) => !c.accept).map((c) => c.expect));
const coverageGap = listed.filter((id) => !covered.has(id));
const isolatedIds = new Set(results.filter((x) => x.class === 'refuse' && x.ok && x.isolated).map((x) => x.expect));
const failed = [...(positiveOk ? [] : ['(positive)']), ...(coverageGap.length ? ['(coverage-gap)'] : []), ...results.filter((x) => !x.ok).map((x) => x.case)];
const allOk = !stopped && results.length === cases.length + launderedPaths.length && positiveOk && failed.length === 0 && coverageGap.length === 0;
const summary = { schema: 'tabi-negatives-dialog-r76', real: realPath, positiveOk, positive: { exit: pos.exit, findingIds: pos.findingIds }, stoppedEarly: stopped, cases: results.length,
  refuseCases: results.filter((x) => x.class === 'refuse').length, mustAcceptCases: results.filter((x) => x.class === 'must-accept').length, launderedCases: results.filter((x) => x.class === 'laundered').length,
  brackets: { events: nEv, gaps: nGap, absNeed, gapNeed },
  passed: results.filter((x) => x.ok).length, isolatedCases: results.filter((x) => x.isolated).length, idsWithIsolatedCase: isolatedIds.size,
  failed, checkIds: listed.length, coverageGap, allOk, results };
console.log(argv.includes('--json') ? JSON.stringify(summary, null, 1) : `negatives ${summary.passed}/${summary.cases} (refuse ${summary.refuseCases}, must-accept ${summary.mustAcceptCases}, laundered ${summary.launderedCases}) isolated=${summary.isolatedCases} positiveOk=${positiveOk} coverageGap=${coverageGap.length} failed=${failed.join(',') || 'none'}`);
process.exit(allOk ? 0 : 1);

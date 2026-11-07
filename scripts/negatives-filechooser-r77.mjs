#!/usr/bin/env node
// Negative + must-accept battery for scripts/check-filechooser-r77.mjs (tabi round 77, C1).
// Usage: node negatives-filechooser-r77.mjs --lane <ABS lane> --real <receipt.json> --expect-driver-sha256 <hex>
//          --expect-nonce <the real receipt's expected nonce> --prior-set <file> [--prior <receipt.json> ...]
//          --work <ABS scratch dir> --laundered <degenerate receipt.json> (x3: page-stub, eval-trigger,
//          swap-files) [--json] [--first-failure] [--jobs N]
// Structure carried from the round-76 battery: every case mutates the real receipt and runs the
// counter BY PATH (the counter beside this file); unless the case targets legshape-consistency the
// producer's legShape is LAUNDERED (recomputed from the counter's own re-derivation) so the summary
// check cannot fire on the mutation's behalf. A refusal case passes only when the counter exits 1,
// lists the expected id and lists NO other id except those the case names in `alsoAllowed`.
// MUST-ACCEPT cases must exit 0 with no finding. Coverage: every check id the counter declares must
// be the expected id of >= 1 refusal case. The three laundered degenerate receipts are REQUIRED.
// Boundary brackets (r74 F4/F5, QUALITY 143), placed with an exact replica of the counter's rule and
// failing (error) when misplaced: pair tolerance 0.049 / 0.051 ms; 0.1 ms grid 2e-5 / 5e-6 ms;
// abs matched = absNeed / absNeed - 1 and gap matched = gapNeed / gapNeed - 1, both needs computed
// from the PRIOR's own counts (round-76 routed defect 1).
// New for r77 (round-76 routed defects):
//  - the R76Critic A2 escape as a case: the receipt under test ADDS two >= 50 ms gaps (its own gap
//    count 13) while a relabelled prior keeps exactly gapNeed of its 11 gaps matched; an
//    own-denominator rule (9/13 < 0.75) accepts it, the prior-denominator rule refuses it.
//  - GAP_MIN brackets (R76Review2 F1): one own inter-leg gap shrunk to 50.1 ms (still a gap: accept)
//    and to 49.9 ms (no longer a gap, own gaps 10 < 11: refuse).
//  - prior-set walk cases on a scratch MIRROR lane (the real lane is never written): an unlisted
//    receipt reachable only through a symlinked directory, one named `.JSON`, one named `.txt`, a
//    truncated schema-bearing `.json` (prior-set-unparsable), and must-accept prose naming the schema.
//  - every bracket and placement guard runs on every honest receipt the pre-freeze pass reads,
//    probes included (QUALITY 144).
// Exit 0 = all cases as expected and full coverage; 1 = otherwise; 2 = usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-filechooser-r77.mjs');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const lane = opt('lane'); const realPath = opt('real'); const pin = opt('expect-driver-sha256'); const work = opt('work'); const expectNonce = opt('expect-nonce'); const priorSet = opt('prior-set');
const extraPriors = multi('prior');
if (!lane || !path.isAbsolute(lane) || !realPath || !pin || !work || !path.isAbsolute(work) || !expectNonce || !priorSet) usage('--lane, --real, --expect-driver-sha256, --expect-nonce, --prior-set and an absolute --work are required');
const LAUNDER_EXPECT = { 'page-stub': 'send-log-allowlist', 'eval-trigger': 'chooser-call-count', 'swap-files': 'chooser-call-params' };
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
const LEGS = ['start', 'intercept-on', 'pick-single', 'pick-multiple', 'pick-same', 'pick-first-only', 'pick-missing', 'pick-empty', 'dir-mode', 'accept-ignored', 'forward-click', 'script-click', 'not-file-input', 'intercept-cancel', 'intercept-off'];
const PER = ['seq', 'trusted', 'act', 'xy', 'files', 'read', 'opened', 'error', 'state'];
const LAWS = ['trust-law', 'activation-law', 'mode-law', 'node-binding-law', 'selection-law', 'cancel-law', 'empty-list-law', 'read-law', 'not-file-input-law', 'intercept-law', 'coordinate-law'];
const evsOf = (r, leg, pred = () => true) => r.events.filter((e) => e.leg === leg && pred(e));
const legOf = (r, leg) => r.legs.find((l) => l.name === leg);
const markAt = (r, leg) => r.legMarks[LEGS.indexOf(leg) + 1].at;
const nextMarkAt = (r, leg) => { const i = LEGS.indexOf(leg) + 2; return i < r.legMarks.length ? r.legMarks[i].at : r.closedAt; };
const q = (v) => Math.round(v * 10) / 10;
const insertAt = (r, leg, ev) => {
  // insert after the last event at or before `leg`, inside that leg's page-time window, on the
  // 0.1 ms grid, with the strict field set (a trusted pointerdown on input s at its centre)
  let idx = -1; const order = LEGS.indexOf(leg);
  r.events.forEach((e, i) => { if (LEGS.indexOf(e.leg) <= order) idx = i; });
  const prev = idx >= 0 ? r.events[idx] : null;
  const at = q(Math.max(prev ? prev.at : 0, markAt(r, leg)) + 0.1);
  if (at > nextMarkAt(r, leg)) throw new Error('insertAt: no room in leg window ' + leg);
  r.events.splice(idx + 1, 0, { type: 'pointerdown', ts: at, isTrusted: true, act: true, target: 's', x: 160, y: 120, buttons: 1, files: null, ret: null, seq: 0, leg, at, ...ev });
  return renumber(r);
};
const cases = [];
const add = (name, expect, mutate, alsoAllowed = [], launder = true, opts = {}) => cases.push({ name, expect, mutate, alsoAllowed, launder, accept: false, opts });
const accept = (name, mutate, opts = {}) => cases.push({ name, expect: null, mutate, alsoAllowed: [], launder: true, accept: true, opts });
const pushSend = (r, method, params) => { r.cdpSendLog.push({ id: r.cdpSendLog.length + 1, method, params }); };
const perLeg = (leg) => PER.map((k) => `leg-${leg}-${k}`);
const sends = (r, m) => r.cdpSendLog.filter((c) => c.method === m);
const evType = (r, leg, type, target) => r.events.find((e) => e.leg === leg && e.type === type && (target === undefined || e.target === target));
const opens = (r) => r.cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened');
const openOf = (r, leg) => { const l = legOf(r, leg); return r.cdpEventLog.find((e) => e.method === 'Page.fileChooserOpened' && e.afterSendId === l.triggerSendId); };
const sendOf = (r, id) => r.cdpSendLog.find((c) => c.id === id);
const fa = ['tabi-a.txt', 11, 'text/plain'];

// ---- identity and run binding ----
add('schema', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-filechooser-r76'; });
const rewriteNonce = (r, to) => {
  const old = r.nonce; r.nonce = to; r.nonceOnPage = to; r.serverLog.forEach((s) => { if (s.run === old) { s.run = to; s.query = 'run=' + encodeURIComponent(to); } });
  for (const c of r.cdpSendLog) { if (c.method === 'Page.navigate') c.params.url = c.params.url.replace(encodeURIComponent(old), encodeURIComponent(to)); if (c.method === 'Runtime.evaluate') c.params.expression = c.params.expression.split(JSON.stringify(old)).join(JSON.stringify(to)); }
  for (const e of r.cdpEventLog) if (e.method === 'Page.frameNavigated') e.params.url = e.params.url.replace(encodeURIComponent(old), encodeURIComponent(to));
};
add('nonce-shape', 'nonce-shape', (r) => { rewriteNonce(r, 'TABI-r77-x'); }, ['nonce-expected', 'fixture-hash']);
add('nonce-on-page', 'nonce-on-page', (r) => { r.nonceOnPage = 'tabi-r77-other'; });
add('scored-run-not-degenerate', 'scored-run-not-degenerate', (r) => { r.degenerate = 'page-stub'; });
add('degenerate-field-absent', 'scored-run-not-degenerate', (r) => { delete r.degenerate; });
add('server-log-binding', 'server-log-binding', (r) => { r.serverLog.forEach((s) => { if (s.run) s.run = 'tabi-r77-other'; }); });
add('server-log-root-twice', 'server-log-binding', (r) => { r.serverLog.push(clone(r.serverLog.find((s) => s.path === '/'))); });
add('server-log-other-path', 'server-log-binding', (r) => { r.serverLog.push({ path: '/x', query: '', run: '', status: 404 }); });
add('server-log-favicon-query', 'server-log-binding', (r) => { r.serverLog.push({ path: '/favicon.ico', query: 'x=1', run: '', status: 404 }); });
add('driver-pin', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); });
add('fixture-hash', 'fixture-hash', (r) => { r.fixture.sha256 = '0'.repeat(64); });
add('fixture-hash-absent', 'fixture-hash', (r) => { delete r.fixture.sha256; });
add('fixture-extra-key', 'fixture-hash', (r) => { r.fixture.nextSha256 = '0'.repeat(64); });
add('host-chromium-other-build', 'host-chromium', (r) => { r.host.chromium = 'Chromium 154.0.8059.84 Arch Linux'; });
add('host-chromium-headless-product', 'host-chromium', (r) => { r.host.cdpProduct = 'HeadlessChrome/155.0.8059.84'; });
add('host-chromium-protocol', 'host-chromium', (r) => { r.host.cdpProtocolVersion = '1.2'; });
add('host-argv-headful', 'host-argv', (r) => { r.host.argv.splice(1, 1); r.host.argv.splice(15, 0, '--no-sandbox'); }, ['devtools-port-binding', 'upload-binding', 'leg-records', 'chooser-call-params']);
add('host-argv-old-headless', 'host-argv', (r) => { r.host.argv[1] = '--headless=old'; });
add('host-argv-extra-headless', 'host-argv', (r) => { r.host.argv[13] = '--headless'; });
add('host-argv-profile-unbound', 'host-argv', (r) => { r.host.argv[4] = r.host.argv[4].replace('profile-', 'profile-x'); }, ['upload-binding']);
add('host-argv-binary', 'host-argv', (r) => { r.host.argv[0] = '/usr/bin/google-chrome'; });
add('host-argv-reordered', 'host-argv', (r) => { [r.host.argv[1], r.host.argv[5]] = [r.host.argv[5], r.host.argv[1]]; });
add('host-argv-address-moved', 'host-argv', (r) => { [r.host.argv[3], r.host.argv[13]] = [r.host.argv[13], r.host.argv[3]]; });
add('devtools-port-binding', 'devtools-port-binding', (r) => { r.host.devtoolsListening.port += 1; });
add('devtools-stderr-absent', 'devtools-port-binding', (r) => { r.host.stderrHead = ''; });
// upload binding (dir bound to the launch token beside the profile; the frozen bytes)
const setFilesSwap = (r, f) => { for (const l of r.legs) if (l.setParams) { l.setParams.files = l.setParams.files.map(f); const s = sendOf(r, l.setSendId); s.params.files = s.params.files.map(f); } };
add('upload-dir-other-token', 'upload-binding', (r) => { const o = r.upload.dir; const nd = o.replace(/upload-[0-9a-f]{12}$/, 'upload-000000000000'); r.upload.dir = nd; setFilesSwap(r, (p) => p.replace(o, nd)); }, ['leg-records', 'chooser-call-params']);
add('upload-size', 'upload-binding', (r) => { r.upload.files['tabi-a.txt'].size = 12; });
add('upload-sha', 'upload-binding', (r) => { r.upload.files['tabi-b.bin'].sha256 = '0'.repeat(64); });
add('upload-extra-file', 'upload-binding', (r) => { r.upload.files['tabi-c.txt'] = { size: 1, sha256: '0'.repeat(64) }; });
add('upload-missing-name', 'upload-binding', (r) => { r.upload.missing = 'tabi-a.txt'; });
add('run-window-short', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 5900).toISOString(); });
add('run-window-long', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 700000).toISOString(); });
add('plan-frozen', 'plan-frozen', (r) => { r.plan[5].files = ['tabi-a.txt', 'tabi-b.bin']; });
add('plan-frozen-dropped-leg', 'plan-frozen', (r) => { r.plan.splice(7, 1); });
add('plan-frozen-intercept', 'plan-frozen', (r) => { r.plan[13].intercept.cancel = false; });
add('leg-order', 'leg-order', (r) => { r.legs.push(clone(r.legs[1])); }, ['leg-records']);
add('leg-order-swap', 'leg-order', (r) => { [r.legs[4].name, r.legs[5].name] = [r.legs[5].name, r.legs[4].name]; }, ['leg-records', ...perLeg('pick-same'), ...perLeg('pick-first-only'), ...LAWS, 'chooser-event-binding']);
// every field of a leg record is read
add('leg-records-extra-key', 'leg-records', (r) => { legOf(r, 'start').cdpResult = {}; });
add('leg-records-kind', 'leg-records', (r) => { legOf(r, 'pick-empty').kind = 'script'; });
add('leg-records-elapsed-string', 'leg-records', (r) => { legOf(r, 'pick-single').elapsedMs = '300'; });
add('leg-records-elapsed-short', 'leg-records', (r) => { legOf(r, 'pick-single').elapsedMs = 289; });
add('leg-records-intercept-result', 'leg-records', (r) => { legOf(r, 'intercept-on').interceptResult = { ok: true }; });
add('leg-records-intercept-send-params', 'leg-records', (r) => { const l = legOf(r, 'intercept-off'); sendOf(r, l.interceptSendId).params = { enabled: true }; }, ['chooser-call-params']);
add('leg-records-start-carries-trigger', 'leg-records', (r) => { legOf(r, 'start').triggerSendId = 1; });
add('leg-records-trigger-result', 'leg-records', (r) => { legOf(r, 'pick-single').triggerResult = { cdpResult: 1 }; });
add('leg-records-script-result', 'leg-records', (r) => { legOf(r, 'script-click').triggerResult.result.value = 2; });
add('leg-records-object-class', 'leg-records', (r) => { legOf(r, 'not-file-input').triggerResult.className = 'HTMLInputElement'; }, ['not-file-input-law']);
add('leg-records-object-description', 'leg-records', (r) => { legOf(r, 'not-file-input').triggerResult.description = 'input#s'; });
add('leg-records-opened-string', 'leg-records', (r) => { legOf(r, 'dir-mode').opened = 'true'; }, ['chooser-event-binding', 'activation-law', 'node-binding-law', 'mode-law']);
add('leg-records-opened-node-missing', 'leg-records', (r) => { legOf(r, 'dir-mode').openedNode = null; }, ['chooser-event-binding', 'node-binding-law']);
add('leg-records-setparams-file', 'leg-records', (r) => { legOf(r, 'pick-single').setParams.files[0] += 'x'; }, ['chooser-call-params']);
add('leg-records-setparams-and-send', 'leg-records', (r) => { const l = legOf(r, 'pick-single'); l.setParams.files[0] += 'x'; sendOf(r, l.setSendId).params.files[0] += 'x'; }, ['chooser-call-params']);
add('leg-records-set-on-unopened', 'leg-records', (r) => { const l = legOf(r, 'dir-mode'); l.setParams = { files: [], backendNodeId: l.openedNode }; });
add('leg-records-set-result', 'leg-records', (r) => { legOf(r, 'pick-multiple').setResult = { files: 2 }; });
add('leg-records-object-id-mismatch', 'leg-records', (r) => { const l = legOf(r, 'not-file-input'); l.setParams.objectId += '9'; }, ['chooser-call-params', 'not-file-input-law']);
add('leg-records-set-before-trigger', 'leg-records', (r) => { const l = legOf(r, 'pick-single'); l.setSendId = l.triggerSendId; }, ['chooser-event-binding']);
add('seq-monotonic', 'seq-monotonic', (r) => { r.events[3].seq = 999; });
add('event-leg-domain', 'event-leg-domain', (r) => { r.events[r.events.length - 1].leg = 'end'; }, ['event-leg-window', ...perLeg('intercept-off'), ...LAWS]);
add('event-types-ts-string', 'event-types', (r) => { evsOf(r, 'pick-same')[0].ts = String(evsOf(r, 'pick-same')[0].ts); }, ['event-time-quantum']);
add('event-types-trusted-string', 'event-types', (r) => { evsOf(r, 'pick-same')[0].isTrusted = 'true'; }, ['leg-pick-same-trusted', 'trust-law']);
add('event-types-unknown-type', 'event-types', (r) => { evsOf(r, 'pick-same')[1].type = 'mouseDown'; }, ['leg-pick-same-seq']);
add('event-types-x-float', 'event-types', (r) => { evsOf(r, 'pick-same')[0].x = 160.5; }, ['leg-pick-same-xy', 'coordinate-law']);
add('event-types-half-null-xy', 'event-types', (r) => { evsOf(r, 'pick-same')[0].buttons = null; }, ['leg-pick-same-xy']);
add('event-types-ret-on-pointer', 'event-types', (r) => { evsOf(r, 'pick-same')[0].ret = 'x'; });
add('event-types-extra-key', 'event-types', (r) => { evsOf(r, 'pick-same')[0].kind = null; });
add('event-types-files-on-pointer', 'event-types', (r) => { evsOf(r, 'pick-same')[0].files = []; }, ['leg-pick-same-files']);
add('event-types-act-on-read', 'event-types', (r) => { evType(r, 'pick-single', 'read').act = false; });
add('event-types-read-ts-after-at', 'event-types', (r) => { const e = evType(r, 'pick-single', 'read'); e.ts = q(e.at + 0.1); });
add('event-types-file-size-float', 'event-types', (r) => { evType(r, 'pick-single', 'change').files[0][1] = 11.5; }, ['leg-pick-single-files', 'selection-law']);
add('event-time-quantum', 'event-time-quantum', (r) => { evsOf(r, 'pick-same')[0].ts += 0.03; });
add('event-time-quantum-at', 'event-time-quantum', (r) => { const e = evsOf(r, 'pick-same'); e[e.length - 1].at += 0.03; });
add('event-time-quantum-bracket-2e-5', 'event-time-quantum', (r) => { const e = evsOf(r, 'pick-same'); e[e.length - 1].at = q(e[e.length - 1].at) + 2e-5; });
add('leg-marks-late', 'leg-marks', (r) => { r.lateAfterClose = 1; }, ['event-leg-window']);
add('leg-marks-fabricated-name', 'leg-marks', (r) => { r.legMarks[3].name = 'pick-x'; }, ['event-leg-window']);
add('leg-marks-closed-early', 'leg-marks', (r) => { r.closedAt = r.legMarks[r.legMarks.length - 1].at - 1; }, ['event-leg-window']);
add('event-leg-window-late-label', 'event-leg-window', (r) => { const e = evsOf(r, 'pick-single'); e[e.length - 1].at = q(markAt(r, 'pick-multiple') + 0.1); }, ['event-types']);
add('event-leg-window-order', 'event-leg-window', (r) => { const e = evsOf(r, 'pick-same'); e[1].at = q(e[0].at - 0.1); });
// ---- producer ----
add('chooser-call-count-extra-set', 'chooser-call-count', (r) => { pushSend(r, 'DOM.setFileInputFiles', clone(sends(r, 'DOM.setFileInputFiles')[0].params)); }, ['chooser-call-params']);
add('chooser-call-count-case-variant', 'chooser-call-count', (r) => { pushSend(r, 'input.dispatchMouseEvent', clone(sends(r, 'Input.dispatchMouseEvent')[0].params)); }, ['chooser-call-params', 'send-log-allowlist']);
add('chooser-call-count-second-navigate', 'chooser-call-count', (r) => { pushSend(r, 'Page.navigate', clone(sends(r, 'Page.navigate')[0].params)); }, ['chooser-call-params']);
add('chooser-call-count-extra-intercept', 'chooser-call-count', (r) => { pushSend(r, 'Page.setInterceptFileChooserDialog', { enabled: true }); }, ['chooser-call-params']);
add('chooser-call-count-emulate-touch', 'chooser-call-count', (r) => { pushSend(r, 'Input.emulateTouchFromMouseEvent', { type: 'mouseMoved', x: 1, y: 1, button: 'none' }); }, ['chooser-call-params', 'send-log-allowlist']);
add('chooser-call-params', 'chooser-call-params', (r) => { sends(r, 'Input.dispatchMouseEvent')[0].params.x = 161; });
add('chooser-call-params-files-order', 'chooser-call-params', (r) => { const s = sendOf(r, legOf(r, 'pick-multiple').setSendId); s.params.files.reverse(); }, ['leg-records']);
add('chooser-call-params-intercept-cancel', 'chooser-call-params', (r) => { sendOf(r, legOf(r, 'intercept-cancel').interceptSendId).params.cancel = false; }, ['leg-records']);
add('chooser-call-params-order', 'chooser-call-params', (r) => { const a = sends(r, 'Input.dispatchMouseEvent'); const [x, y] = [a[0], a[2]]; const t = clone(x.params); x.params = clone(y.params); y.params = t; });
add('cdp-event-log-extra-key', 'cdp-event-log-closed', (r) => { opens(r)[0].ts = 1; }, ['leg-pick-single-opened', 'chooser-event-binding', 'activation-law', 'mode-law']);
add('cdp-event-log-param-key', 'cdp-event-log-closed', (r) => { opens(r)[0].params.extra = 1; }, ['leg-pick-single-opened']);
add('cdp-event-log-other-event', 'cdp-event-log-closed', (r) => { r.cdpEventLog.push({ method: 'Page.javascriptDialogOpening', params: { type: 'alert' }, afterSendId: r.cdpSendLog.length }); }, ['intercept-law']);
add('cdp-event-log-extra-opening', 'cdp-event-log-closed', (r) => { const o = openOf(r, 'pick-single'); r.cdpEventLog.splice(r.cdpEventLog.indexOf(o) + 1, 0, clone(o)); }, ['leg-pick-single-opened', 'activation-law']);
add('cdp-event-log-node-dropped', 'cdp-event-log-closed', (r) => { delete openOf(r, 'dir-mode').params.backendNodeId; }, ['leg-dir-mode-opened', 'chooser-event-binding']);
add('chooser-event-binding-late-opening', 'chooser-event-binding', (r) => { openOf(r, 'dir-mode').afterSendId += 1; }, ['leg-dir-mode-opened', 'activation-law', 'mode-law']);
add('chooser-event-binding-node', 'chooser-event-binding', (r) => { openOf(r, 'dir-mode').params.backendNodeId = 99; }, ['leg-dir-mode-opened']);
add('chooser-event-binding-order', 'chooser-event-binding', (r) => { const a = openOf(r, 'pick-single'), b = openOf(r, 'pick-multiple'); const i = r.cdpEventLog.indexOf(a), j = r.cdpEventLog.indexOf(b); [r.cdpEventLog[i], r.cdpEventLog[j]] = [r.cdpEventLog[j], r.cdpEventLog[i]]; });
add('chooser-event-binding-opened-count', 'chooser-event-binding', (r) => { const l = legOf(r, 'intercept-off'); l.opened = true; l.openedNode = 5; }, ['leg-records', 'intercept-law', 'cancel-law']);
add('frame-binding-chooser-frame', 'frame-binding', (r) => { opens(r)[3].params.frameId = '0'.repeat(32); });
add('frame-binding-nav-frame', 'frame-binding', (r) => { r.cdpEventLog[0].params.frameId = 'A'.repeat(32); });
add('frame-binding-nav-url-path', 'frame-binding', (r) => { r.cdpEventLog[0].params.url = r.cdpEventLog[0].params.url.replace('/?run', '/x?run'); });
add('frame-binding-nav-url-nonce', 'frame-binding', (r) => { r.cdpEventLog[0].params.url += 'x'; });
add('frame-binding-main-id-shape', 'frame-binding', (r) => { const o = r.mainFrameId, nl = o.toLowerCase(); r.mainFrameId = nl; r.cdpEventLog.forEach((e) => { if (e.params.frameId === o) e.params.frameId = nl; }); });
add('frame-binding-nav-not-first', 'frame-binding', (r) => { const nav = r.cdpEventLog.shift(); nav.afterSendId = opens(r)[0].afterSendId; r.cdpEventLog.splice(1, 0, nav); });
const LOOK = [
  ['stub-files', 'Runtime.evaluate', { expression: 'document.getElementById("s").files = new DataTransfer().files', returnByValue: true }],
  ['script-click-gesture', 'Runtime.evaluate', { expression: 'document.getElementById("s").click(), 1', returnByValue: true, userGesture: true }],
  ['events-push', 'Runtime.evaluate', { expression: 'window.__events.push({type:"change"})', returnByValue: true }],
  ['dispatch-change', 'Runtime.evaluate', { expression: 'document.getElementById("s").dispatchEvent(new Event("change"))', returnByValue: true }],
  ['call-function-on', 'Runtime.callFunctionOn', { functionDeclaration: 'function(){ this.click() }' }],
  ['dom-enable', 'DOM.enable', {}],
  ['dom-get-document', 'DOM.getDocument', { depth: -1 }],
  ['add-script', 'Page.addScriptToEvaluateOnNewDocument', { source: 'HTMLInputElement.prototype.click = () => {}' }],
  ['drag-intercept', 'Input.setInterceptDrags', { enabled: true }],
  ['page-disable', 'Page.disable', {}],
];
for (const [nm, m, p] of LOOK) add('lookalike-' + nm, 'send-log-allowlist', (r) => { pushSend(r, m, p); }, m.startsWith('Input.') ? ['chooser-call-count', 'chooser-call-params'] : []);
add('allowlist-second-script-click', 'send-log-allowlist', (r) => { pushSend(r, 'Runtime.evaluate', { expression: 'document.getElementById("s").click(), 1', returnByValue: true }); });
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
for (const [nm, p, h] of POL) add('producer-verdict-' + nm, 'producer-verdict', (r) => { r.predicate = p; r.chooserHypothesis = h; });
add('producer-verdict-old-field', 'producer-verdict', (r) => { delete r.chooserHypothesis; r.dialogHypothesis = 'CONFIRMED'; });
add('legshape-consistency', 'legshape-consistency', (r) => { r.legShape['pick-single'].read[0][2] = 'hex:00'; }, [], false);
add('legshape-fabricated-leg', 'legshape-consistency', (r) => { r.legShape.extra = r.legShape.start; }, [], false);
// ---- replay refusal and prior-set completeness ----
const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
const otherUuid = (u) => u.slice(0, -1) + (u.endsWith('0') ? '1' : '0');
const swapUrl = (x) => { const d = x.host.devtoolsListening; const id = d.url.split('/devtools/browser/')[1]; const nu = otherUuid(id); x.host.stderrHead = x.host.stderrHead.split(id).join(nu); d.url = d.url.replace(id, nu); if (typeof d.browserId === 'string') d.browserId = nu; };
const swapToken = (x) => { const o = x.host.launchToken; const nt = o.slice(0, -1) + (o.endsWith('0') ? '1' : '0'); x.host.launchToken = nt; x.host.argv = x.host.argv.map((a) => a.split(o).join(nt)); };
const shiftTs = (x, d) => { x.events.forEach((e) => { e.ts = q(e.ts + d); e.at = q(e.at + d); }); };
// deterministic non-uniform re-timing: event i moves by (1 + (i * 7) % 13) * 0.3 ms
const jitter = (x) => { x.events.forEach((e, i) => { const d = (1 + ((i * 7) % 13)) * 0.3; e.ts = q(e.ts + d); e.at = q(e.at + d); }); };
const priorIds = (p) => { swapToken(p); swapUrl(p); return p; };
// exact replica of the counter's timeline rule (TOL 0.05, GAP_MIN 50, needs from the PRIOR's counts)
const TOL = 0.05, GAP_MIN = 50;
const pairsOf = (x) => x.events.filter((e) => typeof e.ts === 'number' && typeof e.at === 'number');
const absMatched = (a, b) => { const y = pairsOf(b).map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of pairsOf(a)) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };
const gapsOf = (x) => { const at = pairsOf(x).map((e) => e.at).sort((p, q2) => p - q2); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const gapMatched = (a, b) => { const x = [...gapsOf(a)].sort((p, q2) => p - q2), y = [...gapsOf(b)].sort((p, q2) => p - q2); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const needs = (p) => [Math.ceil(0.5 * pairsOf(p).length - 1e-9), Math.ceil(0.75 * gapsOf(p).length - 1e-9)];
// A bracket names the matched count it sets on its own side; the OTHER side must stay strictly
// below the PRIOR's need (null = "below need"), so that only the bracketed rule decides the case.
// (Pre-freeze pass 1 of r77 repeated the r76 row-2 class on the NEW gap brackets: they required the
// abs side to be exactly 0, but a 1 ms whole shift lands some events on a neighbour 1.0 ms away, so
// p2 and smoke2 misplaced 1-2 cases: lesson-proof/prefreeze-pass1/. Gap brackets now leave abs null.)
const placed = (p, wantAbs, wantGap, under = real) => {
  const [aN, gN] = needs(p); const an = absMatched(under, p), gn = gapMatched(under, p);
  const absOk = wantAbs === null ? an < aN : an === wantAbs, gapOk = wantGap === null ? gn < gN : gn === wantGap;
  if (!absOk || !gapOk) throw new Error('bracket misplaced: abs ' + an + ' (need ' + aN + ') gap ' + gn + ' (need ' + gN + ') want ' + (wantAbs ?? '<' + aN) + ' / ' + (wantGap ?? '<' + gN));
  return p;
};
const nEv = pairsOf(real).length, nGap = gapsOf(real).length;
const [absNeed, gapNeed] = needs(real);
// keep `keep` events exact (even indices first), move the rest by distinct >= 0.3 ms amounts
const keepExact = (p, keep) => { const even = p.events.map((_, i) => i).filter((i) => i % 2 === 0); const kept = new Set(even.slice(0, keep)); p.events.forEach((e, i) => { if (!kept.has(i)) { const d = 0.3 * (1 + (i % 5)); e.ts = q(e.ts + d); e.at = q(e.at + d); } }); return p; };
// whole-timeline shift by 1 ms (abs 0), then break `brk` gaps by shifting every event after each
// chosen gap boundary by a further `d` ms; the first d whose result matches exactly `wantGap` is used
const breakGaps = (p0, brk, wantGap, under = real) => {
  for (const d of [0.3, 1.7, 7.3, 13.1, 29.9]) {
    const p = clone(p0); shiftTs(p, 1.0);
    const order = p.events.map((e, i) => [e.at, i]).sort((a, b) => a[0] - b[0]);
    const bounds = []; for (let k = 1; k < order.length; k++) if (order[k][0] - order[k - 1][0] >= GAP_MIN) bounds.push(k);
    for (const k of bounds.slice(0, brk)) for (let m = k; m < order.length; m++) { const e = p.events[order[m][1]]; e.at = q(e.at + d); e.ts = q(e.ts + d); }
    if (gapMatched(under, p) === wantGap) return p;
  }
  throw new Error('breakGaps: no shift in the list yields ' + wantGap + ' matched gaps');
};
// the receipt under test gains two >= 50 ms gaps inside its last leg (click +60 ms after mouseup,
// cancel +100 ms after the click), no existing gap changed
const addTwoGaps = (r) => {
  const es = evsOf(r, 'intercept-off'); const mu = es.find((e) => e.type === 'mouseup'), ck = es.find((e) => e.type === 'click'), cc = es.find((e) => e.type === 'cancel');
  ck.at = q(mu.at + 60); ck.ts = q(mu.ts + 60); cc.at = q(ck.at + 100); cc.ts = q(ck.ts + 100);
  if (cc.at > r.closedAt) throw new Error('addTwoGaps: no room before closedAt');
  if (gapsOf(r).length !== nGap + 2) throw new Error('addTwoGaps: own gaps ' + gapsOf(r).length + ' want ' + (nGap + 2));
  return r;
};
// shrink the own gap that ends at the first event of `leg` to exactly `to` ms: every later event,
// every later mark and closedAt move earlier together (the leg mark must stay after the previous event)
const shrinkGapBefore = (r, leg, to) => {
  const first = evsOf(r, leg)[0]; const prev = r.events[r.events.indexOf(first) - 1];
  const d = q(first.at - prev.at - to);
  for (const e of r.events) if (e.at >= first.at) { e.at = q(e.at - d); e.ts = q(e.ts - d); }
  for (const m of r.legMarks) if (m.at > prev.at) m.at = q(m.at - d);
  r.closedAt = q(r.closedAt - d);
  if (markAt(r, leg) < prev.at || Math.abs((first.at - prev.at) - to) > 1e-6) throw new Error('shrinkGapBefore: misplaced');
  return r;
};
const GAP_LEG = (() => { let best = null, bd = Infinity; for (const l of LEGS.slice(3)) { const e = evsOf(real, l)[0]; if (!e) continue; const d = e.at - markAt(real, l); if (d < bd) { bd = d; best = l; } } return best; })();
add('nonce-expected', 'nonce-expected', () => {}, ['prior-set-complete'], true, { nonce: 'tabi-r77-other' });
add('replay-byte-identical', 'replay-launch-token', () => {}, REPLAY, true, { priorReal: true });
add('replay-nonce-stamps-rewritten', 'replay-launch-token', (r) => {
  rewriteNonce(r, 'tabi-r77-replay-x');
  for (const k of ['startedAt', 'finishedAt']) r[k] = new Date(Date.parse(r[k]) + 3600000).toISOString();
}, [...REPLAY, 'fixture-hash'], true, { priorReal: true, nonce: 'tabi-r77-replay-x' });
add('replay-token-only-shared', 'replay-launch-token', () => {}, [], true, { prior: (p) => { swapUrl(p); jitter(p); return p; } });
add('replay-url-only-shared', 'replay-devtools-url', () => {}, [], true, { prior: (p) => { swapToken(p); jitter(p); return p; } });
add('replay-url-uppercase', 'replay-devtools-url', () => {}, [], true, { prior: (p) => { swapToken(p); jitter(p); p.host.devtoolsListening.url = p.host.devtoolsListening.url.toUpperCase().replace('WS://', 'ws://').replace('/DEVTOOLS/BROWSER/', '/devtools/browser/'); return p; } });
add('replay-timeline-only-shared', 'replay-event-timeline', () => {}, [], true, { prior: priorIds });
add('replay-timeline-whole-shift-1ms', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); shiftTs(p, 1.0); return p; } });
add('replay-timeline-whole-shift-100ms', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); shiftTs(p, 100); return p; } });
add('replay-timeline-prior-has-extra-event', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); p.events.splice(4, 0, clone(p.events[4])); renumber(p); return p; } });
add('replay-timeline-prior-missing-event', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); p.events.splice(4, 1); renumber(p); return p; } });
// BRACKETS: each side of every carried tolerance/threshold, needs from the prior's own counts
add('replay-timeline-tol-in-0.049', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); p.events.forEach((e, i) => { const d = i % 2 ? 0.049 : -0.049; e.ts += d; e.at += d; }); return placed(p, nEv, null); } });
add('replay-timeline-abs-at-threshold', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); keepExact(p, absNeed); return placed(p, absNeed, null); } });
add('replay-timeline-gap-at-threshold', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); return placed(breakGaps(p, nGap - gapNeed, gapNeed), null, gapNeed); } });
// R76Critic A2 (round-76 routed defect 1): the receipt under test ADDS two gaps; the prior keeps
// exactly gapNeed of its own gaps matched -> refused (an own-denominator rule would accept it)
add('replay-timeline-gaps-added-own-denominator', 'replay-event-timeline', (r) => { addTwoGaps(r); }, [], true,
  { prior: (p) => { priorIds(p); const under = addTwoGaps(clone(real)); return placed(breakGaps(p, nGap - gapNeed, gapNeed, under), null, gapNeed, under); } });
// GAP_MIN brackets (R76Review2 F1): 49.9 ms is no gap (own gaps 10 < 11: refused)
add('replay-timeline-own-gap-49.9', 'replay-event-timeline', (r) => { shrinkGapBefore(r, GAP_LEG, 49.9); });
add('replay-timeline-too-few-gaps', 'replay-event-timeline', (r) => { const k = r.events.findIndex((e) => e.leg === 'intercept-off'); const d = q(r.events[k].at - r.events[k - 1].at - 10); for (let i = k; i < r.events.length; i++) { r.events[i].at = q(r.events[i].at - d); r.events[i].ts = q(r.events[i].ts - d); } }, ['event-leg-window']);
add('replay-launch-token-shape', 'replay-launch-token', (r) => { const o = r.host.launchToken; r.host.launchToken = 'x'; r.host.argv = r.host.argv.map((a) => a.split(o).join('x')); r.upload.dir = r.upload.dir.split(o).join('x'); setFilesSwap(r, (p) => p.split(o).join('x')); }, ['host-argv']);
// prior-set completeness and the walk (round-76 routed defect 2), on a scratch mirror lane
add('prior-set-complete-omitted', 'prior-set-complete', () => {}, [], true, { dropFirstPrior: true });
add('prior-set-complete-symlinked-dir', 'prior-set-complete', () => {}, [], true, { mirror: (m, w) => { const d = path.join(w, 'linked'); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, 'copy.json'), JSON.stringify({ ...clone(real), nonce: 'tabi-r77-unlisted' })); fs.symlinkSync(d, path.join(m, '.ufo/waves/round-77/zz-link')); } });
add('prior-set-complete-uppercase-ext', 'prior-set-complete', () => {}, [], true, { mirror: (m) => { fs.writeFileSync(path.join(m, '.ufo/waves/round-77/copy.JSON'), JSON.stringify({ ...clone(real), nonce: 'tabi-r77-unlisted' })); } });
add('prior-set-complete-txt-ext', 'prior-set-complete', () => {}, [], true, { mirror: (m) => { fs.writeFileSync(path.join(m, '.ufo/waves/round-77/copy.receipt.txt'), JSON.stringify({ ...clone(real), nonce: 'tabi-r77-unlisted' })); } });
add('prior-set-complete-nonce-stripped', 'prior-set-complete', () => {}, [], true, { mirror: (m) => { const c = clone(real); delete c.nonce; fs.writeFileSync(path.join(m, '.ufo/waves/round-77/stripped.json'), JSON.stringify(c)); } });
add('prior-set-unparsable-truncated', 'prior-set-unparsable', () => {}, [], true, { mirror: (m) => { fs.writeFileSync(path.join(m, '.ufo/waves/round-77/cut.json'), JSON.stringify({ ...clone(real), nonce: 'tabi-r77-unlisted' }).slice(0, 4000)); } });
add('prior-set-unparsable-brace-txt', 'prior-set-unparsable', () => {}, [], true, { mirror: (m) => { fs.writeFileSync(path.join(m, '.ufo/waves/round-77/cut.txt'), '{"schema": "tabi-chrome-cdp-filechooser-r77", "nonce": '); } });

// ---- cross-leg laws ----
add('trust-law', 'trust-law', (r) => { evType(r, 'pick-single', 'change').isTrusted = false; }, ['leg-pick-single-trusted']);
add('trust-law-third-untrusted-click', 'trust-law', (r) => { const e = evType(r, 'script-click', 'click'); r.events.splice(r.events.indexOf(e) + 1, 0, clone(e)); renumber(r); }, [...perLeg('script-click'), 'replay-event-timeline', 'activation-law']);
add('trust-law-script-click-trusted', 'trust-law', (r) => { evType(r, 'script-click', 'click').isTrusted = true; }, ['leg-script-click-trusted', 'coordinate-law']);
add('activation-law', 'activation-law', (r) => { evType(r, 'pick-single', 'click').act = false; }, ['leg-pick-single-act']);
add('activation-law-script-activated', 'activation-law', (r) => { evType(r, 'script-click', 'click').act = true; }, ['leg-script-click-act']);
add('activation-law-off-opened', 'activation-law', (r) => { const l = legOf(r, 'intercept-off'); r.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: r.mainFrameId, mode: 'selectSingle', backendNodeId: 5 }, afterSendId: l.triggerSendId }); l.opened = true; l.openedNode = 5; },
  ['leg-intercept-off-opened', 'cdp-event-log-closed', 'chooser-event-binding', 'intercept-law', 'cancel-law']);
add('mode-law', 'mode-law', (r) => { openOf(r, 'pick-multiple').params.mode = 'selectSingle'; }, ['leg-pick-multiple-opened']);
add('mode-law-directory', 'mode-law', (r) => { openOf(r, 'dir-mode').params.mode = 'selectMultiple'; }, ['leg-dir-mode-opened']);
add('node-binding-law', 'node-binding-law', (r) => { const l = legOf(r, 'pick-same'); const o = openOf(r, 'pick-same'); o.params.backendNodeId = 6; l.openedNode = 6; l.setParams.backendNodeId = 6; sendOf(r, l.setSendId).params.backendNodeId = 6; }, ['leg-pick-same-opened']);
add('node-binding-law-shared', 'node-binding-law', (r) => { const l = legOf(r, 'dir-mode'); const o = openOf(r, 'dir-mode'); o.params.backendNodeId = 5; l.openedNode = 5; }, ['leg-dir-mode-opened']);
add('selection-law-last-path', 'selection-law', (r) => { for (const e of evsOf(r, 'pick-first-only', (x) => x.files)) e.files = [fa]; evType(r, 'pick-first-only', 'read').files = [fa]; evType(r, 'pick-first-only', 'read').ret = 'hex:746162692d616c7068610a'; legOf(r, 'pick-first-only').stateAfter.s = [fa]; legOf(r, 'pick-first-only').stateAfter.sValue = 'C:\\fakepath\\tabi-a.txt'; },
  ['leg-pick-first-only-files', 'leg-pick-first-only-read', 'leg-pick-first-only-state', 'read-law']);
add('selection-law-accept-filtered', 'selection-law', (r) => { const es = evsOf(r, 'accept-ignored'); const keep = es.filter((e) => !['input', 'change', 'read'].includes(e.type)); r.events = r.events.filter((e) => e.leg !== 'accept-ignored' || keep.includes(e)); renumber(r); legOf(r, 'accept-ignored').stateAfter.k = []; },
  [...perLeg('accept-ignored'), 'read-law', 'replay-event-timeline']);
add('selection-law-missing-size', 'selection-law', (r) => { for (const e of evsOf(r, 'pick-missing', (x) => x.files)) e.files[0][1] = 1; legOf(r, 'pick-missing').stateAfter.s[0][1] = 1; }, ['leg-pick-missing-files', 'leg-pick-missing-read', 'leg-pick-missing-state', 'read-law', 'empty-list-law']);
add('cancel-law', 'cancel-law', (r) => { const e = evType(r, 'pick-same', 'cancel'); e.type = 'change'; }, ['leg-pick-same-seq', 'leg-pick-same-files']);
add('cancel-law-extra', 'cancel-law', (r) => { const e = evType(r, 'pick-single', 'change'); const c = { ...clone(e), type: 'cancel' }; r.events.splice(r.events.indexOf(e) + 1, 0, c); renumber(r); }, ['leg-pick-single-seq', 'leg-pick-single-files', 'leg-pick-single-trusted', 'leg-pick-single-act', 'leg-pick-single-xy', 'selection-law', 'replay-event-timeline']);
add('cancel-law-intercept-off-changed', 'cancel-law', (r) => { legOf(r, 'intercept-off').stateAfter.s = []; legOf(r, 'intercept-off').stateAfter.sValue = ''; }, ['leg-intercept-off-state']);
add('empty-list-law', 'empty-list-law', (r) => { legOf(r, 'pick-empty').stateAfter.s = []; legOf(r, 'pick-empty').stateAfter.sValue = ''; }, ['leg-pick-empty-state', 'selection-law']);
add('empty-list-law-cleared-events', 'empty-list-law', (r) => { const ck = evType(r, 'pick-empty', 'click'); r.events.splice(r.events.indexOf(ck) + 1, 0, { ...clone(ck), type: 'input', x: null, y: null, buttons: null, act: false, files: [] }); renumber(r); }, [...perLeg('pick-empty'), 'selection-law', 'replay-event-timeline']);
add('read-law', 'read-law', (r) => { evType(r, 'pick-single', 'read').ret = 'hex:746162692d616c7068610b'; }, ['leg-pick-single-read']);
add('read-law-missing-empty', 'read-law', (r) => { evType(r, 'pick-missing', 'read').ret = 'hex:'; }, ['leg-pick-missing-read']);
add('read-law-extra-read', 'read-law', (r) => { const e = evType(r, 'accept-ignored', 'read'); r.events.splice(r.events.indexOf(e) + 1, 0, clone(e)); renumber(r); }, ['leg-accept-ignored-seq', 'leg-accept-ignored-read', 'replay-event-timeline', 'event-leg-window']);
add('not-file-input-law', 'not-file-input-law', (r) => { legOf(r, 'not-file-input').setError.code = -32602; }, ['leg-not-file-input-error']);
add('not-file-input-law-success', 'not-file-input-law', (r) => { const l = legOf(r, 'not-file-input'); l.setError = null; l.setResult = {}; }, ['leg-not-file-input-error']);
add('intercept-law-cancel-unopened', 'intercept-law', (r) => { const l = legOf(r, 'intercept-cancel'); r.cdpEventLog.splice(r.cdpEventLog.indexOf(openOf(r, 'intercept-cancel')), 1); l.opened = false; l.openedNode = null; },
  ['leg-intercept-cancel-opened', 'cdp-event-log-closed', 'chooser-event-binding', 'activation-law', 'cancel-law']);
add('intercept-law-off-no-cancel', 'intercept-law', (r) => { const c = evType(r, 'intercept-off', 'cancel'); r.events.splice(r.events.indexOf(c), 1); renumber(r); }, [...perLeg('intercept-off'), 'cancel-law', 'replay-event-timeline']);
add('intercept-law-event-after-off', 'intercept-law', (r) => { const nav = clone(r.cdpEventLog[0]); nav.afterSendId = legOf(r, 'intercept-off').triggerSendId; r.cdpEventLog.push(nav); }, ['cdp-event-log-closed', 'frame-binding']);
add('coordinate-law', 'coordinate-law', (r) => { evType(r, 'pick-single', 'click').x += 1; }, ['leg-pick-single-xy']);
add('coordinate-law-y', 'coordinate-law', (r) => { evType(r, 'pick-single', 'click').y += 1; }, ['leg-pick-single-xy']);
add('coordinate-law-target', 'coordinate-law', (r) => { evType(r, 'pick-single', 'pointerdown').target = 'm'; }, ['leg-pick-single-seq']);
// ---- per-leg checks ----
for (const leg of LEGS) {
  const evs = evsOf(real, leg);
  const ptr = evs.filter((e) => e.type !== 'read');
  const rl = real.legs.find((l) => l.name === leg);
  const all = [...perLeg(leg), ...LAWS, 'event-types', 'event-leg-window', 'replay-event-timeline', 'leg-marks'];
  if (ptr.length > 0) {
    add(`${leg}-seq`, `leg-${leg}-seq`, (r) => { const e = evsOf(r, leg, (x) => x.type !== 'read'); e[0].type = e[0].type === 'pointerdown' ? 'mousedown' : 'pointerdown'; }, all);
    add(`${leg}-trusted`, `leg-${leg}-trusted`, (r) => { const e = evsOf(r, leg, (x) => x.type !== 'read'); e[0].isTrusted = !e[0].isTrusted; }, all);
    add(`${leg}-act`, `leg-${leg}-act`, (r) => { const e = evsOf(r, leg, (x) => x.type !== 'read'); e[0].act = !e[0].act; }, all);
    add(`${leg}-xy`, `leg-${leg}-xy`, (r) => { const e = evsOf(r, leg, (x) => x.x !== null); e[0].buttons = e[0].buttons === 0 ? 2 : 0; }, all);
  } else {
    for (const k of ['seq', 'trusted', 'act', 'xy']) add(`${leg}-${k}`, `leg-${leg}-${k}`, (r) => { insertAt(r, leg, {}); }, all);
  }
  if (ptr.some((e) => e.files !== null)) add(`${leg}-files`, `leg-${leg}-files`, (r) => { const e = evsOf(r, leg, (x) => x.type !== 'read' && x.files !== null)[0]; e.files = e.files.length ? e.files.map((f) => [f[0], f[1], f[2] + 'x']) : [fa]; }, all);
  else add(`${leg}-files`, `leg-${leg}-files`, (r) => { insertAt(r, leg, { type: 'cancel', target: 's', x: null, y: null, buttons: null, act: false, files: [] }); }, all);
  if (evs.some((e) => e.type === 'read')) add(`${leg}-read`, `leg-${leg}-read`, (r) => { evType(r, leg, 'read').ret = 'error:NotReadableError'; }, all);
  else add(`${leg}-read`, `leg-${leg}-read`, (r) => { insertAt(r, leg, { type: 'read', act: null, target: 's', x: null, y: null, buttons: null, files: [fa], ret: 'hex:746162692d616c7068610a' }); }, all);
  if (rl.opened === true) add(`${leg}-opened`, `leg-${leg}-opened`, (r) => { const o = openOf(r, leg); const l = legOf(r, leg); o.params.backendNodeId += 100; l.openedNode += 100; if (l.setParams) { l.setParams.backendNodeId += 100; sendOf(r, l.setSendId).params.backendNodeId += 100; } }, [...all, 'chooser-call-params', 'chooser-event-binding']);
  else if (rl.triggerSendId !== null) add(`${leg}-opened`, `leg-${leg}-opened`, (r) => { const l = legOf(r, leg); r.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: r.mainFrameId, mode: 'selectSingle', backendNodeId: 5 }, afterSendId: l.triggerSendId }); }, [...all, 'cdp-event-log-closed', 'chooser-event-binding', 'leg-records']);
  else add(`${leg}-opened`, `leg-${leg}-opened`, (r) => { legOf(r, leg).triggerSendId = legOf(r, 'pick-single').triggerSendId; }, [...all, 'leg-records', 'leg-pick-single-opened', 'chooser-event-binding']);
  if (rl.setError) add(`${leg}-error`, `leg-${leg}-error`, (r) => { legOf(r, leg).setError.message += '.'; }, all);
  else add(`${leg}-error`, `leg-${leg}-error`, (r) => { const l = legOf(r, leg); l.triggerError = { code: -32000, message: 'x' }; }, [...all, 'leg-records']);
  add(`${leg}-state`, `leg-${leg}-state`, (r) => { legOf(r, leg).stateAfter.sValue += 'Z'; }, all);
}

// ---- MUST-ACCEPT (exit 0, no finding) ----
accept('accept-real-key-order', (r) => { const o = {}; for (const k of Object.keys(r).reverse()) o[k] = r[k]; for (const k of Object.keys(r)) delete r[k]; Object.assign(r, o); });
accept('accept-prior-retimed-nonuniform', () => {}, { prior: (p) => { priorIds(p); jitter(p); return p; } });
accept('accept-mark-equal-event-at', (r) => { const e = evsOf(r, 'pick-same'); e[0].at = markAt(r, 'pick-same'); });
accept('accept-prose-naming-schema', () => {}, { mirror: (m) => { fs.writeFileSync(path.join(m, '.ufo/waves/round-77/notes.md'), '# notes\nreceipts of schema tabi-chrome-cdp-filechooser-r77 are listed in the prior set\n'); } });
// BRACKETS, accepting side
accept('accept-grid-5e-6', (r) => { const e = evsOf(r, 'pick-same'); e[e.length - 1].at = q(e[e.length - 1].at) + 5e-6; });
// Retimed by 0.051 ms on every event: beyond TOL from its OWN twin, so the prior is not a replay.
// The guard constrains only that (and the prior's needs): a shifted event can still land within TOL
// of a NEIGHBOUR on the receipt's 0.1 ms grid, so demanding exactly 0 matches failed honest fresh
// receipts (pre-freeze: an L1 verification receipt had 2 such neighbours, abs 2 of need 40).
accept('accept-prior-tol-out-0.051', () => {}, { prior: (p) => {
  priorIds(p);
  const orig = real.events;
  p.events.forEach((e, i) => {
    const o = orig[i], d = i % 2 ? 0.051 : -0.051; e.ts += d; e.at += d;
    const dts = e.ts - o.ts, dat = e.at - o.at;
    if (!(Math.abs(dts) > TOL && Math.abs(dat) > TOL && Math.abs(dts - dat) < 1e-9)) throw new Error('tol bracket: event ' + i + ' not retimed beyond TOL by one amount');
  });
  return placed(p, null, null);
} });
accept('accept-prior-abs-below-threshold', () => {}, { prior: (p) => { priorIds(p); keepExact(p, absNeed - 1); return placed(p, absNeed - 1, null); } });
accept('accept-prior-gap-below-threshold', () => {}, { prior: (p) => { priorIds(p); return placed(breakGaps(p, nGap - gapNeed + 1, gapNeed - 1), null, gapNeed - 1); } });
accept('accept-own-gap-50.1', (r) => { shrinkGapBefore(r, GAP_LEG, 50.1); });
accept('accept-gaps-added-prior-below', (r) => { addTwoGaps(r); }, { prior: (p) => { priorIds(p); const under = addTwoGaps(clone(real)); return placed(breakGaps(p, nGap - gapNeed + 1, gapNeed - 1, under), null, gapNeed - 1, under); } });

const JOBS = Math.max(1, Number(opt('jobs') || 8));
const psLines = fs.readFileSync(priorSet, 'utf8').split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
// a scratch mirror of the lane: scripts and every top-level entry of the two walked trees are
// symlinks to the real lane; the case adds its own files to the mirror's round-77 directory
const mkMirror = (name, fn) => {
  const m = path.join(work, 'mirror-' + name); fs.rmSync(m, { recursive: true, force: true });
  fs.mkdirSync(path.join(m, '.ufo/waves/round-77'), { recursive: true }); fs.mkdirSync(path.join(m, 'corpus/evidence'), { recursive: true });
  fs.symlinkSync(path.join(lane, 'scripts'), path.join(m, 'scripts'));
  for (const e of fs.readdirSync(path.join(lane, '.ufo/waves/round-77'))) fs.symlinkSync(path.join(lane, '.ufo/waves/round-77', e), path.join(m, '.ufo/waves/round-77', e));
  if (fs.existsSync(path.join(lane, 'corpus/evidence/round77'))) fs.symlinkSync(path.join(lane, 'corpus/evidence/round77'), path.join(m, 'corpus/evidence/round77'));
  fn(m, path.join(work, 'mirror-extra-' + name));
  return m;
};
const runCounter = (file, c = null) => new Promise((resolve) => {
  const o = (c && c.opts) || {};
  const extra = [];
  let ps = priorSet, ln = lane;
  if (o.priorReal) extra.push('--prior', realPath);
  if (o.prior) { let pj; try { pj = o.prior(clone(real)); } catch (e) { resolve({ exit: null, findingIds: null, derived: null, error: e.message }); return; } const pf = path.join(work, 'prior-' + c.name + '.json'); fs.writeFileSync(pf, JSON.stringify(pj)); extra.push('--prior', pf); }
  if (o.dropFirstPrior) { ps = path.join(work, 'ps-' + c.name + '.txt'); fs.writeFileSync(ps, psLines.slice(1).join('\n') + '\n'); }
  if (o.mirror) { try { ln = mkMirror(c.name, o.mirror); } catch (e) { resolve({ exit: null, findingIds: null, derived: null, error: 'mirror: ' + e.message }); return; } }
  const p = spawn(process.execPath, [COUNTER, '--lane', ln, '--receipt', file, '--expect-driver-sha256', pin, '--expect-nonce', o.nonce || expectNonce, '--prior-set', ps,
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
  // case receipts are written as *.case (never *.json) inside the scratch work dir
  const f = path.join(work, (c.accept ? 'acc-' : 'neg-') + c.name + '.case');
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
  d.degenerate = null; d.predicate = true; d.chooserHypothesis = 'CONFIRMED'; d.failures = []; d.driverSha256 = pin;
  const f = path.join(work, 'laundered-' + kind + '.case');
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
const summary = { schema: 'tabi-negatives-filechooser-r77', real: realPath, positiveOk, positive: { exit: pos.exit, findingIds: pos.findingIds }, stoppedEarly: stopped, cases: results.length,
  refuseCases: results.filter((x) => x.class === 'refuse').length, mustAcceptCases: results.filter((x) => x.class === 'must-accept').length, launderedCases: results.filter((x) => x.class === 'laundered').length,
  brackets: { events: nEv, gaps: nGap, absNeed, gapNeed, gapLeg: GAP_LEG },
  passed: results.filter((x) => x.ok).length, isolatedCases: results.filter((x) => x.isolated).length, idsWithIsolatedCase: isolatedIds.size,
  failed, checkIds: listed.length, coverageGap, allOk, results };
console.log(argv.includes('--json') ? JSON.stringify(summary, null, 1) : `negatives ${summary.passed}/${summary.cases} (refuse ${summary.refuseCases}, must-accept ${summary.mustAcceptCases}, laundered ${summary.launderedCases}) isolated=${summary.isolatedCases} positiveOk=${positiveOk} coverageGap=${coverageGap.length} failed=${failed.join(',') || 'none'}`);
// exitCode, not process.exit(): the --json summary (~190 KB) is written to a pipe when kill power runs
// the battery, and process.exit() cut it at the 64 KiB pipe buffer in the pre-freeze trial (41 mutants
// classified `crashed`, summary unparsable: lesson-proof/killpower-trial1-smoke1-pipe-truncation.json)
process.exitCode = allOk ? 0 : 1;
